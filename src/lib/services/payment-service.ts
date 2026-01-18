import mongoose from 'mongoose';
import { Payment, Sale, Client, Vendor, Asset } from '@/models';
import { TransactionType, PartyType } from '@/types';
import { updateAssetPaymentStatus } from '@/lib/utils/asset-payment-utils';
import { SaleService } from './sale-service';

export class PaymentService {
    /**
     * Delete a payment and reverse all its side effects
     */
    static async deletePayment(id: string, session?: mongoose.ClientSession) {
        const payment = await Payment.findById(id).session(session || null);
        if (!payment) throw new Error('Payment not found');

        const { amount, transactionType, partyId, partyType, saleId, procurementId, procurementType, assetId } = payment;

        // 1. Delete the payment document
        await Payment.findByIdAndDelete(id).session(session || null);

        // 2. Reverse effects based on transaction type
        if (transactionType === TransactionType.SALE && saleId) {
            // Revert Sale totalPaid and remainingAmount
            const sale = await Sale.findById(saleId).session(session || null);
            if (sale) {
                const oldRemaining = sale.remainingAmount;
                sale.totalPaid = Math.max(0, (sale.totalPaid || 0) - amount);
                await sale.save({ session });

                // Adjust Client balance - the reduction in payment increases outstanding balance
                if (partyId && partyType === PartyType.CLIENT) {
                    const newRemaining = sale.remainingAmount;
                    const diff = newRemaining - oldRemaining;
                    if (diff !== 0) {
                        await Client.findByIdAndUpdate(
                            partyId,
                            { $inc: { outstandingBalance: diff } },
                            { session }
                        );
                    }
                }
            }
        } else if (transactionType === TransactionType.PURCHASE) {
            if (procurementId && procurementType) {
                // Use ProcurementService to sync status (avoids circular dependency if used carefully)
                // Since this is a static call, we can import it dynamically or just use the same logic
                const { ProcurementService } = await import('./procurement-service');

                if (procurementId && procurementType) {
                    const { ProcurementService } = await import('./procurement-service');
                    await ProcurementService.syncProcurementPaymentStatus(
                        procurementId.toString(),
                        procurementType as any,
                        session
                    );
                }
            } else if (partyId && partyType === PartyType.VENDOR) {
                // Pure vendor payment not linked to procurement
                await Vendor.findByIdAndUpdate(
                    partyId,
                    { $inc: { outstandingPayable: amount } },
                    { session }
                );
            }
        }

        // 3. Handle Asset linkage
        if (assetId) {
            await updateAssetPaymentStatus(assetId.toString(), session);
        }

        return payment;
    }

    /**
     * Update a payment and handle side effects
     */
    static async updatePayment(id: string, data: any, session?: mongoose.ClientSession) {
        const originalPayment = await Payment.findById(id).session(session || null);
        if (!originalPayment) throw new Error('Payment not found');

        const amountDiff = (data.amount || originalPayment.amount) - originalPayment.amount;

        // 1. Update the payment
        const updatedPayment = await Payment.findByIdAndUpdate(
            id,
            data,
            { new: true, session }
        );

        if (!updatedPayment) throw new Error('Failed to update payment');

        // 2. Reverse effects if amount changed
        if (amountDiff !== 0) {
            const { transactionType, partyId, partyType, saleId, procurementId, procurementType, assetId } = updatedPayment;

            if (transactionType === TransactionType.SALE && saleId) {
                const sale = await Sale.findById(saleId).session(session || null);
                if (sale) {
                    const oldRemaining = sale.remainingAmount;
                    sale.totalPaid = Math.max(0, (sale.totalPaid || 0) + amountDiff);
                    await sale.save({ session });

                    if (partyId && partyType === PartyType.CLIENT) {
                        const newRemaining = sale.remainingAmount;
                        const diff = newRemaining - oldRemaining;
                        if (diff !== 0) {
                            await Client.findByIdAndUpdate(
                                partyId,
                                { $inc: { outstandingBalance: diff } },
                                { session }
                            );
                        }
                    }
                }
            } else if (transactionType === TransactionType.PURCHASE) {
                if (procurementId && procurementType) {
                    const { ProcurementService } = await import('./procurement-service');
                    await ProcurementService.syncProcurementPaymentStatus(
                        procurementId.toString(),
                        procurementType as any,
                        session
                    );
                } else if (partyId && partyType === PartyType.VENDOR) {
                    await Vendor.findByIdAndUpdate(
                        partyId,
                        { $inc: { outstandingPayable: -amountDiff } },
                        { session }
                    );
                }
            }
        }

        // 3. Handle Asset linkage
        if (updatedPayment.assetId) {
            await updateAssetPaymentStatus(updatedPayment.assetId.toString(), session);
        }

        return updatedPayment;
    }
}
