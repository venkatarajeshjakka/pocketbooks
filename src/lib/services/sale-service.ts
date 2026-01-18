/**
 * Sale Service
 *
 * Centralized business logic for sales operations.
 * Follows the same architecture pattern as ProcurementService for consistency.
 */

import mongoose, { Model } from 'mongoose';
import {
    Sale,
    Client,
    Payment,
    RawMaterial,
    TradingGood,
    FinishedGood
} from '@/models';
import {
    SaleStatus,
    PaymentStatus,
    TransactionType,
    AccountType,
    PartyType,
    InventoryItemType,
    ISale,
    ISaleInput,
    ISaleItem,
    PaymentMethod
} from '@/types';

export class SaleService {
    /**
     * Get the appropriate inventory model based on item type
     */
    private static getInventoryModel(itemType: InventoryItemType) {
        switch (itemType) {
            case InventoryItemType.RAW_MATERIAL:
                return RawMaterial;
            case InventoryItemType.TRADING_GOOD:
                return TradingGood;
            case InventoryItemType.FINISHED_GOOD:
                return FinishedGood;
            default:
                throw new Error(`Unknown inventory item type: ${itemType}`);
        }
    }

    /**
     * Validate stock availability for sale items
     */
    static async validateStockAvailability(
        items: Array<{ itemId: string; itemType: InventoryItemType; quantity: number }>,
        session?: mongoose.ClientSession
    ): Promise<void> {
        for (const item of items) {
            const Model = this.getInventoryModel(item.itemType) as any;
            const dbItem = await Model.findById(item.itemId).session(session || null);

            if (!dbItem) {
                throw new Error(`${item.itemType} not found: ${item.itemId}`);
            }

            if (dbItem.currentStock < item.quantity) {
                throw new Error(
                    `Insufficient stock for ${dbItem.name}. Available: ${dbItem.currentStock}, Requested: ${item.quantity}`
                );
            }
        }
    }

    /**
     * Deduct inventory for sale items
     */
    static async deductInventory(
        items: Array<{ itemId: string; itemType: InventoryItemType; quantity: number }>,
        session?: mongoose.ClientSession
    ): Promise<void> {
        for (const item of items) {
            const Model = this.getInventoryModel(item.itemType) as any;
            await Model.findByIdAndUpdate(
                item.itemId,
                { $inc: { currentStock: -item.quantity } },
                { session }
            );
        }
    }

    /**
     * Restore inventory for sale items (on cancellation or deletion)
     */
    static async restoreInventory(
        items: Array<{ itemId: string; itemType: InventoryItemType; quantity: number }>,
        session?: mongoose.ClientSession
    ): Promise<void> {
        for (const item of items) {
            const Model = this.getInventoryModel(item.itemType) as any;
            await Model.findByIdAndUpdate(
                item.itemId,
                { $inc: { currentStock: item.quantity } },
                { session }
            );
        }
    }

    /**
     * Create a new sale with optional initial payment
     */
    static async createSale(
        data: ISaleInput,
        initialPayment?: {
            amount: number;
            paymentMethod: PaymentMethod;
            paymentDate?: Date;
            notes?: string;
        },
        session?: mongoose.ClientSession
    ) {
        // 0. Validate invoice uniqueness
        const existingSale = await Sale.findOne({ invoiceNumber: data.invoiceNumber }).session(session || null);
        if (existingSale) {
            throw new Error(`Invoice number ${data.invoiceNumber} already exists`);
        }

        // 1. Validate stock availability
        await this.validateStockAvailability(data.items, session);

        // 2. Deduct inventory
        await this.deductInventory(data.items, session);

        // 3. Create sale record
        const sale = new Sale(data);
        await sale.save({ session });

        // 4. Handle initial payment if provided
        if (initialPayment && initialPayment.amount > 0) {
            const payment = new Payment({
                paymentDate: initialPayment.paymentDate || new Date(),
                amount: initialPayment.amount,
                paymentMethod: initialPayment.paymentMethod,
                transactionType: TransactionType.SALE,
                accountType: AccountType.RECEIVABLE,
                partyId: data.clientId,
                partyType: PartyType.CLIENT,
                saleId: sale._id,
                notes: initialPayment.notes || `Initial payment for sale: ${sale.invoiceNumber}`,
            });
            await payment.save({ session });

            // Update sale with payment info
            sale.totalPaid = initialPayment.amount;
            await sale.save({ session });
        }

        // 5. Update client outstanding balance
        const client = await Client.findById(data.clientId).session(session || null);
        if (client) {
            client.outstandingBalance += sale.remainingAmount;
            await client.save({ session });
        }

        // 6. Log the action
        const { AuditService } = await import('./audit-service');
        const { AuditAction } = await import('@/models/AuditLog');
        await AuditService.log({
            action: AuditAction.CREATE,
            entityType: 'Sale',
            entityId: sale._id.toString(),
            details: `Sale created with invoice ${sale.invoiceNumber}`,
            newValue: sale.toObject()
        }, session);

        return sale;
    }

    /**
     * Update an existing sale and handle side effects atomically
     */
    static async updateSale(
        id: string,
        data: Partial<ISaleInput>,
        session?: mongoose.ClientSession
    ) {
        const sale = await Sale.findById(id).session(session || null);
        if (!sale) throw new Error('Sale not found');

        const originalClientId = sale.clientId.toString();
        const oldItems = JSON.parse(JSON.stringify(sale.items));
        const oldRemainingAmount = sale.remainingAmount || (sale.grandTotal - (sale.totalPaid || 0));

        // 1. Restore inventory from old items
        const restoreItems = oldItems.map((item: any) => ({
            itemId: item.itemId.toString(),
            itemType: item.itemType,
            quantity: item.quantity
        }));
        await this.restoreInventory(restoreItems, session);

        // 2. Revert client balance from original client
        await Client.findByIdAndUpdate(
            originalClientId,
            { $inc: { outstandingBalance: -oldRemainingAmount } },
            { session }
        );

        // 3. Update sale fields
        const newItems = data.items || sale.items;

        // 4. Validate and deduct inventory for new items
        const validateItems = newItems.map((item: any) => ({
            itemId: item.itemId.toString(),
            itemType: item.itemType,
            quantity: item.quantity
        }));
        await this.validateStockAvailability(validateItems, session);
        await this.deductInventory(validateItems, session);

        // 5. Apply updates to sale
        if (data.items) {
            sale.items = data.items as ISaleItem[];
        }
        if (data.gstPercentage !== undefined) sale.gstPercentage = data.gstPercentage;
        if (data.discount !== undefined) sale.discount = data.discount;
        if (data.clientId) sale.clientId = data.clientId;
        if (data.paymentTerms) sale.paymentTerms = data.paymentTerms;
        if (data.notes) sale.notes = data.notes;
        if (data.saleDate) sale.saleDate = data.saleDate;
        if (data.deliveryDate) sale.deliveryDate = data.deliveryDate;
        if (data.expectedDeliveryDate) sale.expectedDeliveryDate = data.expectedDeliveryDate;
        if (data.actualDeliveryDate) sale.actualDeliveryDate = data.actualDeliveryDate;

        await sale.save({ session });

        // 6. Update client balance for potentially new client
        const newClientId = sale.clientId.toString();
        await Client.findByIdAndUpdate(
            newClientId,
            { $inc: { outstandingBalance: sale.remainingAmount } },
            { session }
        );

        // 7. If client changed, update payments to reference the new client
        if (newClientId !== originalClientId) {
            await Payment.updateMany(
                { saleId: id },
                { $set: { partyId: newClientId } },
                { session }
            );
        }

        return sale;
    }

    /**
     * Delete a sale and reverse all side effects
     */
    static async deleteSale(
        id: string,
        session?: mongoose.ClientSession
    ) {
        const sale = await Sale.findById(id).session(session || null);
        if (!sale) throw new Error('Sale not found');

        // 1. Restore inventory
        const restoreItems = sale.items.map((item: any) => ({
            itemId: item.itemId.toString(),
            itemType: item.itemType,
            quantity: item.quantity
        }));
        await this.restoreInventory(restoreItems, session);

        // 2. Revert client balance (only remaining amount, not grand total)
        const balanceToRevert = sale.remainingAmount || (sale.grandTotal - (sale.totalPaid || 0));
        await Client.findByIdAndUpdate(
            sale.clientId,
            { $inc: { outstandingBalance: -balanceToRevert } },
            { session }
        );

        // 3. Delete associated payments
        await Payment.deleteMany({ saleId: id }).session(session || null);

        // 4. Delete the sale
        await Sale.findByIdAndDelete(id).session(session || null);
    }

    /**
     * Update sale status and handle side effects
     */
    static async updateSaleStatus(
        id: string,
        newStatus: SaleStatus,
        session?: mongoose.ClientSession
    ) {
        const sale = await Sale.findById(id).session(session || null);
        if (!sale) throw new Error('Sale not found');

        const oldStatus = sale.status;
        if (oldStatus === newStatus) return sale;

        // Handle cancellation
        if (newStatus === SaleStatus.CANCELLED && oldStatus !== SaleStatus.CANCELLED) {
            // Restore inventory when cancelling
            const restoreItems = sale.items.map((item: any) => ({
                itemId: item.itemId.toString(),
                itemType: item.itemType,
                quantity: item.quantity
            }));
            await this.restoreInventory(restoreItems, session);

            // Adjust client balance - remove remaining balance
            const client = await Client.findById(sale.clientId).session(session || null);
            if (client) {
                client.outstandingBalance = Math.max(0, client.outstandingBalance - sale.remainingAmount);
                await client.save({ session });
            }
        } else if (oldStatus === SaleStatus.CANCELLED && newStatus !== SaleStatus.CANCELLED) {
            // Reactivating a cancelled sale
            const validateItems = sale.items.map((item: any) => ({
                itemId: item.itemId.toString(),
                itemType: item.itemType,
                quantity: item.quantity
            }));
            await this.validateStockAvailability(validateItems, session);
            await this.deductInventory(validateItems, session);

            // Restore client balance
            const client = await Client.findById(sale.clientId).session(session || null);
            if (client) {
                client.outstandingBalance += sale.remainingAmount;
                await client.save({ session });
            }
        }

        sale.status = newStatus;
        await sale.save({ session });
        return sale;
    }

    /**
     * Sync sale payment status from payments collection
     */
    static async syncSalePaymentStatus(
        saleId: string,
        session?: mongoose.ClientSession
    ) {
        const sale = await Sale.findById(saleId).session(session || null);
        if (!sale) return;

        const payments = await Payment.find({ saleId }).session(session || null);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // Get previous remaining for balance adjustment
        const oldRemaining = sale.remainingAmount || (sale.grandTotal - (sale.totalPaid || 0));

        sale.totalPaid = totalPaid;
        await sale.save({ session });

        // Adjust client balance by the difference
        const newRemaining = sale.remainingAmount || 0;
        const diff = newRemaining - oldRemaining;

        if (diff !== 0) {
            await Client.findByIdAndUpdate(
                sale.clientId,
                { $inc: { outstandingBalance: diff } },
                { session }
            );
        }
    }

    /**
     * Add a payment to a sale
     */
    static async addPayment(
        saleId: string,
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
        const sale = await Sale.findById(saleId).session(session || null);
        if (!sale) throw new Error('Sale not found');

        // Validate payment amount
        if (paymentData.amount > sale.remainingAmount) {
            throw new Error(
                `Payment amount (${paymentData.amount}) exceeds remaining balance (${sale.remainingAmount})`
            );
        }

        // Create payment record
        const payment = new Payment({
            paymentDate: paymentData.paymentDate || new Date(),
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            transactionType: TransactionType.SALE,
            accountType: AccountType.RECEIVABLE,
            partyId: sale.clientId,
            partyType: PartyType.CLIENT,
            saleId: sale._id,
            notes: paymentData.notes || `Payment for sale: ${sale.invoiceNumber}`,
            trancheNumber: paymentData.trancheNumber,
            totalTranches: paymentData.totalTranches,
        });
        await payment.save({ session });

        // Update sale payment status
        await this.syncSalePaymentStatus(saleId, session);

        return payment;
    }
}
