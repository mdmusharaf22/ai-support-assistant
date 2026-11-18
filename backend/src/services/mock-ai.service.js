/**
 * Mock AI Service for Development/Testing
 * Use this when Ollama or OpenAI are not available
 */

export async function createChatCompletion({ model, messages, tools }) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  const userContent = lastMessage.content.toLowerCase();
  
  // Determine which tool to use based on keywords
  let toolCall = null;
  
  if (userContent.includes('order') || userContent.includes('delivery') || 
      userContent.includes('tracking') || userContent.includes('shipped')) {
    // Extract order number (ORD-XXXX pattern)
    const orderMatch = lastMessage.content.match(/ORD-\d+/i);
    const orderNumber = orderMatch ? orderMatch[0] : 'ORD-1002';
    
    toolCall = {
      id: `call_mock_${Date.now()}`,
      type: 'function',
      function: {
        name: 'lookupOrder',
        arguments: JSON.stringify({ orderNumber })
      }
    };
  } else if (userContent.includes('payment') || userContent.includes('charge') || 
             userContent.includes('refund') || userContent.includes('transaction')) {
    // Extract order number
    const orderMatch = lastMessage.content.match(/ORD-\d+/i);
    const orderNumber = orderMatch ? orderMatch[0] : 'ORD-1002';
    
    toolCall = {
      id: `call_mock_${Date.now()}`,
      type: 'function',
      function: {
        name: 'investigatePayments',
        arguments: JSON.stringify({ orderNumber })
      }
    };
  }
  
  // First response with tool call
  if (toolCall && !messages.some(m => m.role === 'tool')) {
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
  
  // Second response after tool execution (generate recommendation)
  const toolResults = messages.filter(m => m.role === 'tool');
  
  if (toolResults.length > 0) {
    const toolResult = JSON.parse(toolResults[0].content);
    let response = '';
    
    if (toolResults[0].name === 'lookupOrder') {
      if (toolResult.success) {
        response = `I've checked order ${toolResult.orderNumber}. `;
        
        if (toolResult.status === 'delayed') {
          response += `The order is currently delayed and ${toolResult.trackingStatus}. `;
          response += `The expected delivery date is ${new Date(toolResult.expectedDelivery).toLocaleDateString()}. `;
          response += `I recommend contacting the customer to apologize for the delay and provide the updated tracking information.`;
        } else if (toolResult.status === 'delivered') {
          response += `The order has been successfully delivered on ${new Date(toolResult.actualDelivery).toLocaleDateString()}. `;
          response += `If the customer reports they haven't received it, please check with the delivery team for proof of delivery.`;
        } else {
          response += `The order status is: ${toolResult.status}. `;
          response += `Tracking: ${toolResult.trackingStatus}.`;
        }
      } else {
        response = `I couldn't retrieve order information. Error: ${toolResult.error}`;
      }
    } else if (toolResults[0].name === 'investigatePayments') {
      if (toolResult.success) {
        response = `I've analyzed the payment transactions for order ${toolResult.orderNumber}. `;
        response += `Found ${toolResult.transactionsFound} transaction(s). `;
        
        if (toolResult.possibleDuplicate) {
          response += `⚠️ A possible duplicate charge has been detected. `;
          response += `${toolResult.requiresHumanReview ? 'Human review is required before processing any refund.' : 'Please verify with the payment processor.'} `;
          response += `Total amount involved: ${toolResult.transactions[0].currency} ${toolResult.transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)}.`;
        } else {
          response += `No duplicate charges detected. All transactions appear to be legitimate.`;
        }
      } else {
        response = `I couldn't retrieve payment information. Error: ${toolResult.error}`;
      }
    }
    
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: response
        }
      }]
    };
  }
  
  // Fallback response
  return {
    choices: [{
      message: {
        role: 'assistant',
        content: 'I understand your concern. Let me investigate this issue for you.'
      }
    }]
  };
}

export const mockAiService = {
  createChatCompletion
};
