import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

/**
 * Chat completion with tool calling support for Ollama
 */
export async function createChatCompletion({ model, messages, tools }) {
  try {
    console.log('Ollama request:', {
      model: model || 'llama3.2',
      messageCount: messages.length,
      toolsCount: tools?.length
    });

    // Convert tools to Ollama format if provided
    const ollamaTools = tools?.map(tool => ({
      type: 'function',
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters
      }
    }));

    console.log('Ollama tools:', JSON.stringify(ollamaTools, null, 2));

    // Make request to Ollama
    const response = await ollama.chat({
      model: model || 'llama3.2',
      messages: messages,
      tools: ollamaTools,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 512
      }
    });

    console.log('Ollama response:', JSON.stringify(response, null, 2));

    // Convert Ollama response to OpenAI-compatible format
    return {
      choices: [{
        message: {
          role: response.message.role,
          content: response.message.content,
          tool_calls: response.message.tool_calls?.map((tc, idx) => ({
            id: `call_${Date.now()}_${idx}`,
            type: 'function',
            function: {
              name: tc.function.name,
              arguments: typeof tc.function.arguments === 'string' 
                ? tc.function.arguments 
                : JSON.stringify(tc.function.arguments)
            }
          }))
        }
      }]
    };
  } catch (error) {
    console.error('Ollama error details:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Ollama API error: ${error.message}`);
  }
}

export const ollamaService = {
  createChatCompletion
};
