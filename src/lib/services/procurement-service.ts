import mongoose from 'mongoose';
import {
    RawMaterialProcurement,
    TradingGoodsProcurement,
    Vendor,
    Payment
} from '@/models';
import {
    ProcurementStatus,
    PaymentStatus,
    TransactionType,
    AccountType,
    PartyType,
    PaymentMethod,
    IRawMaterialProcurementInput,
    ITradingGoodsProcurementInput,
    IPaymentInput
} from '@/types';
import { InventoryIntegrationService } from './inventory-integration-service';

export class ProcurementService {
    /**
     * Get the appropriate model based on type
     */
    public static getModel(type: 'raw_material' | 'trading_good') {
        return type === 'raw_material' ? RawMaterialProcurement : TradingGoodsProcurement;
    }

    /**
     * Create a new procurement with optional initial payment
     */
    static async createProcurement(
        type: 'raw_material' | 'trading_good',
        data: IRawMaterialProcurementInput | ITradingGoodsProcurementInput,
        initialPayment?: Partial<IPaymentInput> & { totalTranches?: number },
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type);

        // 1. Create procurement record
        // Note: Model's pre-validate will handle pricing and initial status
        const procurement = new Model(data);
        await procurement.save({ session });

        // 2. Handle initial payment if provided
        if (initialPayment && initialPayment.amount !== undefined && initialPayment.amount > 0) {
            const payment = new Payment({
                paymentDate: initialPayment.paymentDate || new Date(),
                amount: initialPayment.amount,
                paymentMethod: initialPayment.paymentMethod,
                transactionType: TransactionType.PURCHASE,
                accountType: AccountType.PAYABLE,
                partyId: data.vendorId,
                partyType: PartyType.VENDOR,
                procurementId: procurement._id,
                procurementType: type,
                notes: initialPayment.notes || `Initial payment for ${type} procurement: ${procurement._id}`,
                trancheNumber: 1,
                totalTranches: initialPayment.totalTranches || 1
            });
            await payment.save({ session });

            // Update procurement with initial payment info
            procurement.totalPaid = initialPayment.amount;
            // Re-trigger validation to update paymentStatus and remainingAmount
            await procurement.save({ session });
        }

        // 3. Update vendor outstanding balance
        const vendor = await Vendor.findById(data.vendorId).session(session || null);
        if (vendor) {
            vendor.outstandingPayable += (procurement as any).remainingAmount;
            await vendor.save({ session });
        }

        // 4. If status is already RECEIVED or COMPLETED, update inventory
        if (procurement.status === ProcurementStatus.RECEIVED || procurement.status === ProcurementStatus.COMPLETED) {
            console.log(`[ProcurementService] Auto-updating inventory for status: ${procurement.status}`);
            await InventoryIntegrationService.updateInventoryFromProcurement(
                (procurement as any).items,
                type,
                (procurement as any).receivedDate || new Date(),
                session
            );
        }

        return procurement;
    }

    /**
     * Update procurement status and handle inventory/vendor balance side effects
     */
    static async updateProcurementStatus(
        id: string,
        type: 'raw_material' | 'trading_good',
        newStatus: ProcurementStatus,
        receivedDate?: Date,
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type) as any;
        const procurement = await Model.findById(id).session(session || null);
        if (!procurement) throw new Error('Procurement not found');

        const oldStatus = procurement.status;
        if (oldStatus === newStatus) return procurement;

        // Handle inventory transitions
        const isStockAffecting = (s: ProcurementStatus) =>
            s === ProcurementStatus.RECEIVED || s === ProcurementStatus.COMPLETED;

        // If transitioning TO received/completed, increase inventory
        if (!isStockAffecting(oldStatus) && isStockAffecting(newStatus)) {
            console.log(`[ProcurementService] Increasing inventory: ${oldStatus} -> ${newStatus}`);
            await InventoryIntegrationService.updateInventoryFromProcurement(
                procurement.items,
                type,
                receivedDate || new Date(),
                session
            );
        }
        // If transitioning FROM received/completed TO something else (like cancelled or ordered), decrease inventory
        else if (isStockAffecting(oldStatus) && !isStockAffecting(newStatus)) {
            console.log(`[ProcurementService] Decreasing inventory (reversal): ${oldStatus} -> ${newStatus}`);
            // Note: Reversal logic would need -quantity. 
            // InventoryIntegrationService should handle negative updates or we handle it here.
            const reversalItems = procurement.items.map((item: any) => ({
                ...item,
                quantity: -item.quantity
            }));

            await InventoryIntegrationService.updateInventoryFromProcurement(
                reversalItems,
                type,
                new Date(),
                session
            );
        }

        // Handle vendor balance transitions on cancellation
        if (newStatus === ProcurementStatus.CANCELLED && oldStatus !== ProcurementStatus.CANCELLED) {
            const vendor = await Vendor.findById(procurement.vendorId).session(session || null);
            if (vendor) {
                // If cancelling, remove the remaining debt from vendor balance
                vendor.outstandingPayable = Math.max(0, vendor.outstandingPayable - procurement.remainingAmount);
                await vendor.save({ session });
            }
        } else if (oldStatus === ProcurementStatus.CANCELLED && newStatus !== ProcurementStatus.CANCELLED) {
            const vendor = await Vendor.findById(procurement.vendorId).session(session || null);
            if (vendor) {
                // If re-activating from cancelled, add back the balance
                vendor.outstandingPayable += procurement.remainingAmount;
                await vendor.save({ session });
            }
        }

        procurement.status = newStatus;
        if (receivedDate) procurement.receivedDate = receivedDate;

        await procurement.save({ session });
        return procurement;
    }

    /**
     * Update procurement details and handle all side effects
     */
    static async updateProcurement(
        id: string,
        type: 'raw_material' | 'trading_good',
        data: any,
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type) as any;
        const procurement = await Model.findById(id).session(session || null);
        if (!procurement) throw new Error('Procurement not found');

        const oldStatus = procurement.status;
        const oldRemaining = procurement.remainingAmount;
        const oldVendorId = procurement.vendorId.toString();

        // 1. Update the document
        // This will trigger pre-validate hooks for pricing/status
        Object.assign(procurement, data);
        await procurement.save({ session });

        // 2. Handle Status/Inventory transitions
        if (data.status && data.status !== oldStatus) {
            await this.updateProcurementStatus(id, type, data.status, data.receivedDate, session);
        }

        // 3. Handle Vendor Balance change
        const newRemaining = procurement.remainingAmount;
        const newVendorId = procurement.vendorId.toString();

        if (oldVendorId === newVendorId) {
            const diff = newRemaining - oldRemaining;
            if (diff !== 0) {
                await Vendor.findByIdAndUpdate(
                    oldVendorId,
                    { $inc: { outstandingPayable: diff } },
                    { session }
                );
            }
        } else {
            // Vendor changed: Revert old, apply new
            await Vendor.findByIdAndUpdate(
                oldVendorId,
                { $inc: { outstandingPayable: -oldRemaining } },
                { session }
            );
            await Vendor.findByIdAndUpdate(
                newVendorId,
                { $inc: { outstandingPayable: newRemaining } },
                { session }
            );
        }

        return procurement;
    }

    /**
     * Sync procurement totalPaid from all associated payments
     */
    static async syncProcurementPaymentStatus(
        procurementId: string,
        type: 'raw_material' | 'trading_good',
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type) as any;
        const procurement = await Model.findById(procurementId).session(session || null);
        if (!procurement) return;

        const payments = await Payment.find({
            procurementId,
            procurementType: type
        }).session(session || null);

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        const oldRemaining = procurement.remainingAmount;
        procurement.totalPaid = totalPaid;
        await procurement.save({ session });

        const newRemaining = procurement.remainingAmount;
        const diff = newRemaining - oldRemaining;

        if (diff !== 0) {
            await Vendor.findByIdAndUpdate(
                procurement.vendorId,
                { $inc: { outstandingPayable: diff } },
                { session }
            );
        }
    }

    /**
     * Delete a procurement and reverse all side effects
     */
    static async deleteProcurement(
        id: string,
        type: 'raw_material' | 'trading_good',
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type) as any;
        const procurement = await Model.findById(id).session(session || null);
        if (!procurement) throw new Error('Procurement not found');

        // 1. Reverse inventory if it was received
        const isStockAffecting = (s: ProcurementStatus) =>
            s === ProcurementStatus.RECEIVED || s === ProcurementStatus.COMPLETED;

        if (isStockAffecting(procurement.status)) {
            const reversalItems = procurement.items.map((item: any) => ({
                ...item,
                quantity: -item.quantity
            }));

            await InventoryIntegrationService.updateInventoryFromProcurement(
                reversalItems,
                type,
                new Date(),
                session
            );
        }

        // 2. Revert vendor balance (only remaining debt)
        const vendor = await Vendor.findById(procurement.vendorId).session(session || null);
        if (vendor) {
            vendor.outstandingPayable = Math.max(0, vendor.outstandingPayable - procurement.remainingAmount);
            await vendor.save({ session });
        }

        // 3. Delete associated payments
        await Payment.deleteMany({ procurementId: id, procurementType: type }).session(session || null);

        // 4. Delete the procurement
        await Model.findByIdAndDelete(id).session(session || null);
    }

    /**
     * Add a payment to a procurement and sync status
     */
    static async addPayment(
        procurementId: string,
        type: 'raw_material' | 'trading_good',
        paymentData: {
            amount: number;
            paymentMethod: PaymentMethod;
            paymentDate?: Date;
            notes?: string;
            trancheNumber?: number;
            totalTranches?: number;
        },
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type) as any;
        const procurement = await Model.findById(procurementId).session(session || null);
        if (!procurement) throw new Error('Procurement not found');

        // 1. Create payment record
        const payment = new Payment({
            paymentDate: paymentData.paymentDate || new Date(),
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            transactionType: TransactionType.PURCHASE,
            accountType: AccountType.PAYABLE,
            partyId: procurement.vendorId,
            partyType: PartyType.VENDOR,
            procurementId: procurement._id,
            procurementType: type,
            notes: paymentData.notes || `Payment for ${type} procurement: ${procurement._id}`,
            trancheNumber: paymentData.trancheNumber,
            totalTranches: paymentData.totalTranches
        });
        await payment.save({ session });

        // 2. Sync procurement payment status
        const oldRemaining = procurement.remainingAmount;
        procurement.totalPaid += paymentData.amount;
        // save() triggers pre-validate which updates remainingAmount and paymentStatus
        await procurement.save({ session });

        // 3. Adjust vendor balance by difference
        const newRemaining = procurement.remainingAmount;
        const diff = newRemaining - oldRemaining;

        if (diff !== 0) {
            const vendor = await Vendor.findById(procurement.vendorId).session(session || null);
            if (vendor) {
                vendor.outstandingPayable += diff;
                await vendor.save({ session });
            }
        }

        return payment;
    }
}
