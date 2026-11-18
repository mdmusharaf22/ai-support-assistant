export const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'lookupOrder',
      description: 'Retrieve order status and delivery information for a customer. Use this when the customer asks about order delivery, tracking, or status.',
      parameters: {
        type: 'object',
        properties: {
          orderNumber: {
            type: 'string',
            description: 'The order number (e.g., ORD-1001)'
          }
        },
        required: ['orderNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'investigatePayments',
      description: 'Investigate payment transactions for an order and detect possible duplicate charges. Use this when the customer reports duplicate charges or payment issues.',
      parameters: {
        type: 'object',
        properties: {
          orderNumber: {
            type: 'string',
            description: 'The order number to investigate payments for (e.g., ORD-1003)'
          }
        },
        required: ['orderNumber']
      }
    }
  }
];
