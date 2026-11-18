import { paymentRepository } from '../repositories/payment.repository.js';

export async function investigatePayments({ orderNumber, customerId }) {
  // Verify customer has access to this order's payments
  const hasAccess = await paymentRepository.verifyOwnership(orderNumber, customerId);
  
  if (!hasAccess) {
    return {
      success: false,
      error: 'Payment records not found or access denied',
      orderNumber
    };
  }
  
  // Retrieve all transactions for this order
  const transactions = await paymentRepository.findByOrderNumber(orderNumber);
  
  if (!transactions || transactions.length === 0) {
    return {
      success: false,
      error: 'No payment records found',
      orderNumber
    };
  }
  
  // Detect possible duplicates
  const duplicateAnalysis = detectDuplicates(transactions);
  
  return {
    success: true,
    orderNumber,
    transactionsFound: transactions.length,
    transactions: transactions.map(t => ({
      transactionReference: t.transaction_reference,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      createdAt: t.created_at
    })),
    ...duplicateAnalysis
  };
}

function detectDuplicates(transactions) {
  // Rules for detecting possible duplicates:
  // 1. Same amount
  // 2. Same currency
  // 3. Both successful
  // 4. Created within a short time window (e.g., 5 minutes)
  
  const successfulTransactions = transactions.filter(t => t.status === 'success');
  
  if (successfulTransactions.length < 2) {
    return {
      possibleDuplicate: false,
      requiresHumanReview: false,
      reason: 'Only one successful transaction found'
    };
  }
  
  // Check for duplicate patterns
  for (let i = 0; i < successfulTransactions.length - 1; i++) {
    for (let j = i + 1; j < successfulTransactions.length; j++) {
      const t1 = successfulTransactions[i];
      const t2 = successfulTransactions[j];
      
      const sameAmount = parseFloat(t1.amount) === parseFloat(t2.amount);
      const sameCurrency = t1.currency === t2.currency;
      
      // Calculate time difference in milliseconds
      const timeDiff = Math.abs(
        new Date(t1.created_at) - new Date(t2.created_at)
      );
      const fiveMinutesInMs = 5 * 60 * 1000;
      const withinTimeWindow = timeDiff <= fiveMinutesInMs;
      
      if (sameAmount && sameCurrency && withinTimeWindow) {
        return {
          possibleDuplicate: true,
          requiresHumanReview: true,
          reason: 'Multiple successful transactions with same amount detected within 5 minutes',
          suspiciousTransactions: [
            t1.transaction_reference,
            t2.transaction_reference
          ],
          timeDifferenceSeconds: Math.floor(timeDiff / 1000)
        };
      }
    }
  }
  
  return {
    possibleDuplicate: false,
    requiresHumanReview: false,
    reason: 'No duplicate patterns detected'
  };
}
