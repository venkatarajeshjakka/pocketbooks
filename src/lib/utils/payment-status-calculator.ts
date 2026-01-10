/**
 * Payment Status Calculator Utility
 * Helper functions for calculating asset payment status
 */

export interface PaymentStatusResult {
    totalPaid: number;
    remainingAmount: number;
    paymentStatus: 'unpaid' | 'partially_paid' | 'fully_paid';
}

export function calculatePaymentStatus(
    purchasePrice: number,
    totalPaid: number
): PaymentStatusResult {
    const safePurchasePrice = purchasePrice || 0;
    const safeTotalPaid = totalPaid || 0;
    const remainingAmount = Math.max(0, safePurchasePrice - safeTotalPaid);

    let paymentStatus: 'unpaid' | 'partially_paid' | 'fully_paid' = 'unpaid';
    
    if (safeTotalPaid === 0) {
        paymentStatus = 'unpaid';
    } else if (safeTotalPaid >= safePurchasePrice) {
        paymentStatus = 'fully_paid';
    } else {
        paymentStatus = 'partially_paid';
    }

    return {
        totalPaid: safeTotalPaid,
        remainingAmount: paymentStatus === 'fully_paid' ? 0 : remainingAmount,
        paymentStatus
    };
}