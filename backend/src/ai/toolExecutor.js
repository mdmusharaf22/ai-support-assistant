import { lookupOrder } from './orderTools.js';
import { investigatePayments } from './paymentTools.js';

export async function executeTools(toolCalls, customerId) {
  const results = [];
  
  for (const toolCall of toolCalls) {
    try {
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
      
      let result;
      
      switch (functionName) {
        case 'lookupOrder':
          result = await lookupOrder({
            ...args,
            customerId
          });
          break;
          
        case 'investigatePayments':
          result = await investigatePayments({
            ...args,
            customerId
          });
          break;
          
        default:
          result = {
            success: false,
            error: `Unknown tool: ${functionName}`
          };
      }
      
      results.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: functionName,
        content: JSON.stringify(result)
      });
    } catch (error) {
      console.error(`Error executing tool ${toolCall.function.name}:`, error);
      results.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: toolCall.function.name,
        content: JSON.stringify({
          success: false,
          error: error.message
        })
      });
    }
  }
  
  return results;
}
