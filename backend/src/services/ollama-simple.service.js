import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

/**
 * Simplified Ollama service without tool calling
 * Uses text prompting instead
 */
export async function createChatCompletion({ model, messages, tools }) {
  try {
    console.log('Ollama simple request - no tool calling');
    
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const systemMessage = messages.find(m => m.role === 'system');
    
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }
    
    // Check if this is a tool result scenario
    const toolMessages = messages.filter(m => m.role === 'tool');
    if (toolMessages.length > 0) {
      // Second call - after tool execution
      // Format: System + User complaint + Tool results
      const toolResultsText = toolMessages.map(tm => {
        const result = JSON.parse(tm.content);
        return `Tool: ${tm.name}\nResult: ${JSON.stringify(result, null, 2)}`;
      }).join('\n\n');
      
      const prompt = `${systemMessage?.content || ''}\n\nCustomer Issue:\n${lastUserMessage.content}\n\nInvestigation Results:\n${toolResultsText}\n\nBased on the investigation results above, provide a helpful explanation and recommendation for the support agent.`;
      
      const response = await ollama.chat({
        model: model || 'llama3.2',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 300
        }
      });
      
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: response.message.content,
            tool_calls: null
          }
        }]
      };
    }
    
    // First call - decide which tool to use
    const complaintText = lastUserMessage.content.toLowerCase();
    let toolCall = null;
    
    // Extract order number from message (check for "Order Number:" line first, then pattern match)
    let orderNumber = null;
    const orderLineMatch = lastUserMessage.content.match(/Order Number:\s*(ORD-\d+)/i);
    if (orderLineMatch) {
      orderNumber = orderLineMatch[1];
    } else {
      const orderMatch = lastUserMessage.content.match(/ORD-\d+/i);
      orderNumber = orderMatch ? orderMatch[0] : null;
    }
    
    // Check issue type from message
    const issueTypeMatch = lastUserMessage.content.match(/Issue type:\s*(\w+)/i);
    const issueType = issueTypeMatch ? issueTypeMatch[1].toLowerCase() : null;
    
    console.log('Issue Type detected:', issueType);
    console.log('Order Number detected:', orderNumber);
    
    // Determine tool based on issue type FIRST, then keywords
    if (issueType === 'payment_issue' || 
        complaintText.includes('payment') || 
        complaintText.includes('charge') || 
        complaintText.includes('refund') ||
        complaintText.includes('transaction') ||
        complaintText.includes('duplicate')) {
      
      if (!orderNumber) {
        return {
          choices: [{
            message: {
              role: 'assistant',
              content: 'Unable to investigate payment: No order number provided in the ticket. Please ask the customer for their order number.',
              tool_calls: null
            }
          }]
        };
      }
      
      toolCall = {
        id: `call_${Date.now()}`,
        type: 'function',
        function: {
          name: 'investigatePayments',
          arguments: JSON.stringify({ orderNumber })
        }
      };
    } else if (issueType === 'order_issue' ||
               complaintText.includes('order') || 
               complaintText.includes('delivery') || 
               complaintText.includes('tracking') ||
               complaintText.includes('shipped') ||
               complaintText.includes('arrive')) {
      
      if (!orderNumber) {
        return {
          choices: [{
            message: {
              role: 'assistant',
              content: 'Unable to investigate order: No order number provided in the ticket. Please ask the customer for their order number.',
              tool_calls: null
            }
          }]
        };
      }
      
      toolCall = {
        id: `call_${Date.now()}`,
        type: 'function',
        function: {
          name: 'lookupOrder',
          arguments: JSON.stringify({ orderNumber })
        }
      };
    }
    
    console.log('Tool call decision:', toolCall);
    
    if (toolCall) {
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: null,
            tool_calls: [toolCall]
          }
        }]
      };
    }
    
    // Fallback: no tool needed
    const response = await ollama.chat({
      model: model || 'llama3.2',
      messages: [
        { role: 'system', content: systemMessage?.content || 'You are a helpful customer support AI.' },
        { role: 'user', content: lastUserMessage.content }
      ],
      stream: false
    });
    
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: response.message.content,
          tool_calls: null
        }
      }]
    };
    
  } catch (error) {
    console.error('Ollama simple error:', error);
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

export const ollamaSimpleService = {
  createChatCompletion
};
