// import OpenAI from 'openai';
// import { ollamaService } from './ollama.service.js';
import { ollamaSimpleService } from './ollama-simple.service.js';
// import { mockAiService } from './mock-ai.service.js';
import { config } from '../config/env.js';
import { toolDefinitions } from '../ai/toolDefinitions.js';
import { executeTools } from '../ai/toolExecutor.js';
import { systemPrompt } from '../ai/prompts.js';
import { query } from '../config/database.js';

// Choose your AI provider:
// 1. Mock AI (for testing, no external dependency)
// const aiProvider = mockAiService;

// 2. Ollama Simple (FREE local AI, keyword-based tool selection) ✅ NOW ACTIVE
const aiProvider = ollamaSimpleService;

// 3. Ollama with native tool calling (if model supports it)
// const aiProvider = ollamaService;

// 4. OpenAI (paid API - uncomment when you have credits)
// const openai = new OpenAI({ apiKey: config.openai.apiKey });
// const aiProvider = { createChatCompletion: (opts) => openai.chat.completions.create(opts) };

export const aiService = {
  async investigateTicket(ticketId, customerId) {
    // Get ticket details
    const ticketResult = await query(
      'SELECT * FROM tickets WHERE id = $1',
      [ticketId]
    );
    
    const ticket = ticketResult.rows[0];
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    // Build user message with order number if available
    let userMessage = `Customer issue: ${ticket.subject}\n\nDetails: ${ticket.description}\n\nIssue type: ${ticket.issue_type}`;
    
    // If ticket has order_number, add it explicitly
    if (ticket.order_number) {
      userMessage += `\n\nOrder Number: ${ticket.order_number}`;
    }
    
    // Build conversation messages
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userMessage
      }
    ];
    
    // Use configured AI provider (Ollama = FREE!)
    let response = await aiProvider.createChatCompletion({
      model: 'llama3.2',
      messages,
      tools: toolDefinitions
    });
    
    let assistantMessage = response.choices[0].message;
    messages.push(assistantMessage);
    
    // Handle tool calls
    const toolsUsed = [];
    const toolResults = [];
    
    let maxIterations = 5; // Prevent infinite loops
    
    while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && maxIterations > 0) {
      maxIterations--;
      
      // Execute tools
      const results = await executeTools(assistantMessage.tool_calls, customerId);
      
      // Store tool usage
      for (const toolCall of assistantMessage.tool_calls) {
        toolsUsed.push({
          name: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments)
        });
      }
      
      // Store results
      toolResults.push(...results);
      
      // Add tool results to messages
      messages.push(...results);
      
      // Get next response from Ollama
      response = await aiProvider.createChatCompletion({
        model: 'llama3.2',
        messages,
        tools: toolDefinitions
      });
      
      assistantMessage = response.choices[0].message;
      messages.push(assistantMessage);
    }
    
    // Store investigation in database
    if (toolsUsed.length > 0) {
      for (const tool of toolsUsed) {
        const toolResult = toolResults.find(
          r => r.name === tool.name
        );
        
        if (toolResult) {
          await query(
            `INSERT INTO ai_investigations (
              ticket_id,
              tool_name,
              tool_result,
              recommendation,
              model_name
            )
            VALUES ($1, $2, $3, $4, $5)`,
            [
              ticketId,
              tool.name,
              JSON.parse(toolResult.content),
              assistantMessage.content || 'No recommendation provided',
              'llama3.2' // Using Ollama llama3.2 model
            ]
          );
        }
      }
    }
    
    return {
      response: assistantMessage.content || 'Investigation completed. Please review the tool results.',
      toolsUsed,
      toolResults: toolResults.map(r => ({
        name: r.name,
        result: JSON.parse(r.content)
      }))
    };
  }
};
