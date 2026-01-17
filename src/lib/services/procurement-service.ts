import mongoose from 'mongoose';
import {
    RawMaterialProcurement,
    TradingGoodsProcurement,
    Vendor,
    Payment
} from '@/models';
import { ProcurementStatus, PaymentStatus, TransactionType, AccountType, PartyType } from '@/types';
import { InventoryIntegrationService } from './inventory-integration-service';

export class ProcurementService {
    /**
     * Get the appropriate model based on type
     */
    private static getModel(type: 'raw_material' | 'trading_good') {
        return type === 'raw_material' ? RawMaterialProcurement : TradingGoodsProcurement;
    }

    /**
     * Create a new procurement with optional initial payment
     */
    static async createProcurement(
        type: 'raw_material' | 'trading_good',
        data: any,
        initialPayment?: any,
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type);

        // 1. Create procurement record
        // Note: Model's pre-validate will handle pricing and initial status
        const procurement = new Model(data);
        await procurement.save({ session });

        // 2. Handle initial payment if provided
        if (initialPayment && initialPayment.amount > 0) {
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
            vendor.outstandingPayable += procurement.remainingAmount;
            await vendor.save({ session });
        }

        // 4. If status is already RECEIVED or COMPLETED, update inventory
        if (procurement.status === ProcurementStatus.RECEIVED || procurement.status === ProcurementStatus.COMPLETED) {
            console.log(`[ProcurementService] Auto-updating inventory for status: ${procurement.status}`);
            await InventoryIntegrationService.updateInventoryFromProcurement(
                procurement.items,
                type,
                procurement.receivedDate || new Date(),
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
        const Model = this.getModel(type);
        const procurement = await (Model as any).findById(id).session(session || null);
        if (!procurement) throw new Error('Procurement not found');

        const oldStatus = procurement.status;
        if (oldStatus === newStatus) return procurement;

        // Handle inventory transitions
        const isStockAffecting = (s: ProcurementStatus) =>
            s === ProcurementStatus.RECEIVED || s === ProcurementStatus.COMPLETED;

        if (isStockAffecting(newStatus) && !isStockAffecting(oldStatus)) {
            console.log(`[ProcurementService] Updating inventory: ${oldStatus} -> ${newStatus}`);
            await InventoryIntegrationService.updateInventoryFromProcurement(
                procurement.items,
                type,
                receivedDate || new Date(),
                session
            );
            procurement.receivedDate = receivedDate || new Date();
        } else if (!isStockAffecting(newStatus) && isStockAffecting(oldStatus)) {
            // Reverting from stock-affecting status
            console.log(`[ProcurementService] Reversing inventory: ${oldStatus} -> ${newStatus}`);
            await InventoryIntegrationService.reverseInventoryUpdate(
                procurement.items,
                type,
                session
            );
            procurement.receivedDate = undefined;
        }

        // Handle vendor balance if cancelled
        if (newStatus === ProcurementStatus.CANCELLED && oldStatus !== ProcurementStatus.CANCELLED) {
            const vendor = await Vendor.findById(procurement.vendorId).session(session || null);
            if (vendor) {
                vendor.outstandingPayable = Math.max(0, vendor.outstandingPayable - procurement.remainingAmount);
                await vendor.save({ session });
            }
        } else if (oldStatus === ProcurementStatus.CANCELLED && newStatus !== ProcurementStatus.CANCELLED) {
            // Reverting from CANCELLED
            const vendor = await Vendor.findById(procurement.vendorId).session(session || null);
            if (vendor) {
                vendor.outstandingPayable += procurement.remainingAmount;
                await vendor.save({ session });
            }
        }

        procurement.status = newStatus;
        await procurement.save({ session });
        return procurement;
    }

    /**
     * Delete procurement and reverse side effects
     */
    static async deleteProcurement(
        id: string,
        type: 'raw_material' | 'trading_good',
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type);
        const procurement = await (Model as any).findById(id).session(session || null);
        if (!procurement) throw new Error('Procurement not found');

        // 1. Reverse inventory updates if received
        if (procurement.status === ProcurementStatus.RECEIVED) {
            await InventoryIntegrationService.reverseInventoryUpdate(
                procurement.items,
                type,
                session
            );
        }

        // 2. Adjust vendor outstanding balance
        if (procurement.status !== ProcurementStatus.CANCELLED) {
            const vendor = await Vendor.findById(procurement.vendorId).session(session || null);
            if (vendor) {
                vendor.outstandingPayable = Math.max(0, vendor.outstandingPayable - procurement.remainingAmount);
                await vendor.save({ session });
            }
        }

        // 3. Handle associated payments (delete them)
        await Payment.deleteMany({
            procurementId: id,
            procurementType: type
        }).session(session || null);

        // 4. Delete the procurement record
        await (Model as any).findByIdAndDelete(id).session(session || null);
    }

    /**
     * Update an existing procurement and handle side effects atomically
     */
    static async updateProcurement(
        id: string,
        type: 'raw_material' | 'trading_good',
        data: any,
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type);
        const procurement = await (Model as any).findById(id).session(session || null);
        if (!procurement) throw new Error('Procurement not found');

        const oldStatus = procurement.status;
        const oldRemaining = procurement.remainingAmount || 0;
        const oldItems = JSON.parse(JSON.stringify(procurement.items)); // Deep copy old items

        // 1. Update the procurement document
        // This will trigger pre-validate to recalculate prices and payment status
        Object.assign(procurement, data);
        await procurement.save({ session });

        const newStatus = procurement.status;
        const newRemaining = procurement.remainingAmount || 0;

        // 2. Handle inventory side effects if items changed or status changed
        const isStockAffecting = (s: ProcurementStatus) =>
            s === ProcurementStatus.RECEIVED || s === ProcurementStatus.COMPLETED;

        const wasStockAffecting = isStockAffecting(oldStatus);
        const nowStockAffecting = isStockAffecting(newStatus);

        if (nowStockAffecting) {
            if (!wasStockAffecting) {
                // Newly stock affecting (Ordered -> Received)
                await InventoryIntegrationService.updateInventoryFromProcurement(
                    procurement.items,
                    type,
                    procurement.receivedDate || new Date(),
                    session
                );
            } else {
                // Still stock affecting, but items might have changed
                // Simplest way to handle item edits: reverse old items, apply new ones
                await InventoryIntegrationService.reverseInventoryUpdate(oldItems, type, session);
                await InventoryIntegrationService.updateInventoryFromProcurement(
                    procurement.items,
                    type,
                    procurement.receivedDate || new Date(),
                    session
                );
            }
        } else if (wasStockAffecting) {
            // No longer stock affecting (Received -> Cancelled/Ordered)
            await InventoryIntegrationService.reverseInventoryUpdate(oldItems, type, session);
        }

        // 3. Handle vendor balance side effects
        // If status is CANCELLED, we treat remaining as 0 for external balance
        const getEffectiveRemaining = (p: any) => p.status === ProcurementStatus.CANCELLED ? 0 : p.remainingAmount;

        const oldEffectiveRemaining = oldStatus === ProcurementStatus.CANCELLED ? 0 : oldRemaining;
        const newEffectiveRemaining = getEffectiveRemaining(procurement);

        const diff = newEffectiveRemaining - oldEffectiveRemaining;

        if (diff !== 0) {
            const vendor = await Vendor.findById(procurement.vendorId).session(session || null);
            if (vendor) {
                vendor.outstandingPayable = Math.max(0, vendor.outstandingPayable + diff);
                await vendor.save({ session });
            }
        }

        return procurement;
    }

    /**
     * Sync procurement payment status and update vendor balance
     */
    static async syncProcurementPaymentStatus(
        procurementId: string,
        type: 'raw_material' | 'trading_good',
        session?: mongoose.ClientSession
    ) {
        const Model = this.getModel(type);
        const procurement = await (Model as any).findById(procurementId).session(session || null);
        if (!procurement) return;

        const payments = await Payment.find({
            procurementId,
            procurementType: type
        }).session(session || null);

        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // Previous effective remaining amount to adjust vendor balance
        const getEffectiveRemaining = (p: any) => p.status === ProcurementStatus.CANCELLED ? 0 : p.remainingAmount;
        const oldEffectiveRemaining = getEffectiveRemaining(procurement);

        procurement.totalPaid = totalPaid;
        // This will trigger pre-validate to update remainingAmount and paymentStatus
        await procurement.save({ session });

        const newEffectiveRemaining = getEffectiveRemaining(procurement);
        const diff = newEffectiveRemaining - oldEffectiveRemaining;

        if (diff !== 0) {
            const vendor = await Vendor.findById(procurement.vendorId).session(session || null);
            if (vendor) {
                vendor.outstandingPayable = Math.max(0, vendor.outstandingPayable + diff);
                await vendor.save({ session });
            }
        }
    }
}
