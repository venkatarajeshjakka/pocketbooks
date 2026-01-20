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
import { AuditService } from './audit-service';
import { AuditAction } from '@/models/AuditLog';

export class SaleService {
    /**
     * Get the appropriate inventory model based on item type
     */
    private static getInventoryModel(itemType: string) {
        // Handle both PascalCase (new) and snake_case (legacy) values
        const normalizedType = itemType.toLowerCase();

        // Check for specific variations or use broad matching
        if (normalizedType === 'rawmaterial' || normalizedType === 'raw_material') {
            return RawMaterial;
        } else if (normalizedType === 'tradinggood' || normalizedType === 'trading_good') {
            return TradingGood;
        } else if (normalizedType === 'finishedgood' || normalizedType === 'finished_good') {
            return FinishedGood;
        }

        throw new Error(`Unknown inventory item type: ${itemType}`);
    }

    /**
     * Validate stock availability for sale items
     * Also enforces business rule: Raw materials cannot be sold directly
     */
    static async validateStockAvailability(
        items: Array<{ itemId: string; itemType: InventoryItemType | string; quantity: number }>,
        session?: mongoose.ClientSession
    ): Promise<void> {
        for (const item of items) {
            // Business Rule: Raw materials are for internal use/production, not direct sales
            const normalizedType = item.itemType.toString().toLowerCase();
            if (normalizedType === 'raw_material' || normalizedType === 'rawmaterial') {
                throw new Error(
                    'Raw materials cannot be sold directly. They are intended for internal use or production. Please use Finished Goods or Trading Goods for sales.'
                );
            }

            const Model = this.getInventoryModel(item.itemType as string) as any;
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
        items: Array<{ itemId: string; itemType: InventoryItemType | string; quantity: number }>,
        session?: mongoose.ClientSession
    ): Promise<void> {
        const sessionOption = session ? { session } : {};
        for (const item of items) {
            const Model = this.getInventoryModel(item.itemType as string) as any;
            await Model.findByIdAndUpdate(
                item.itemId,
                { $inc: { currentStock: -item.quantity } },
                sessionOption
            );
        }
    }

    /**
     * Restore inventory for sale items (on cancellation or deletion)
     */
    static async restoreInventory(
        items: Array<{ itemId: string; itemType: InventoryItemType | string; quantity: number }>,
        session?: mongoose.ClientSession
    ): Promise<void> {
        const sessionOption = session ? { session } : {};
        for (const item of items) {
            const Model = this.getInventoryModel(item.itemType as string) as any;
            await Model.findByIdAndUpdate(
                item.itemId,
                { $inc: { currentStock: item.quantity } },
                sessionOption
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
        const sessionOption = session ? { session } : {};

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
        await sale.save(sessionOption);

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
            await payment.save(sessionOption);

            // Update sale with payment info
            sale.totalPaid = initialPayment.amount;
            await sale.save(sessionOption);
        }

        // 5. Update client outstanding balance
        const client = await Client.findById(data.clientId).session(session || null);
        if (client) {
            client.outstandingBalance += sale.remainingAmount;
            await client.save(sessionOption);
        }

        // 6. Log the action
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
        const sessionOption = session ? { session } : {};
        const sale = await Sale.findById(id).session(session || null);
        if (!sale) throw new Error('Sale not found');

        // Store old values for audit log
        const oldValue = sale.toObject();
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
            sessionOption
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

        await sale.save(sessionOption);

        // 6. Update client balance for potentially new client
        const newClientId = sale.clientId.toString();
        await Client.findByIdAndUpdate(
            newClientId,
            { $inc: { outstandingBalance: sale.remainingAmount } },
            sessionOption
        );

        // 7. If client changed, update payments to reference the new client
        if (newClientId !== originalClientId) {
            await Payment.updateMany(
                { saleId: id },
                { $set: { partyId: newClientId } },
                sessionOption
            );
        }

        // 8. Log the update action
        await AuditService.log({
            action: AuditAction.UPDATE,
            entityType: 'Sale',
            entityId: id,
            details: `Sale updated: ${sale.invoiceNumber}`,
            oldValue,
            newValue: sale.toObject()
        }, session);

        return sale;
    }

    /**
     * Delete a sale and reverse all side effects
     */
    static async deleteSale(
        id: string,
        session?: mongoose.ClientSession
    ) {
        const sessionOption = session ? { session } : {};
        const sale = await Sale.findById(id).session(session || null);
        if (!sale) throw new Error('Sale not found');

        // Store for audit log before deletion
        const oldValue = sale.toObject();

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
            sessionOption
        );

        // 3. Delete associated payments
        await Payment.deleteMany({ saleId: id }).session(session || null);

        // 4. Delete the sale
        await Sale.findByIdAndDelete(id).session(session || null);

        // 5. Log the deletion
        await AuditService.log({
            action: AuditAction.DELETE,
            entityType: 'Sale',
            entityId: id,
            details: `Sale deleted: ${sale.invoiceNumber}`,
            oldValue
        }, session);
    }

    /**
     * Update sale status and handle side effects
     */
    static async updateSaleStatus(
        id: string,
        newStatus: SaleStatus,
        session?: mongoose.ClientSession
    ) {
        const sessionOption = session ? { session } : {};
        const sale = await Sale.findById(id).session(session || null);
        if (!sale) throw new Error('Sale not found');

        const oldStatus = sale.status;
        if (oldStatus === newStatus) return sale;

        // Log status change
        await AuditService.log({
            action: AuditAction.STATUS_CHANGE,
            entityType: 'Sale',
            entityId: id,
            details: `Sale status changed from ${oldStatus} to ${newStatus}`,
            oldValue: { status: oldStatus },
            newValue: { status: newStatus }
        }, session);

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
                await client.save(sessionOption);
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
                await client.save(sessionOption);
            }
        }

        sale.status = newStatus;
        await sale.save(sessionOption);
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
     * Add a payment to a sale with overpayment protection
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

        // Validate payment amount is positive
        if (!paymentData.amount || paymentData.amount <= 0) {
            throw new Error('Payment amount must be greater than 0');
        }

        // Check if sale is already fully paid
        if (sale.remainingAmount <= 0) {
            throw new Error(
                `Sale ${sale.invoiceNumber} is already fully paid. No further payments can be accepted.`
            );
        }

        // Validate payment doesn't exceed remaining balance (overpayment protection)
        if (paymentData.amount > sale.remainingAmount) {
            throw new Error(
                `Payment amount (₹${paymentData.amount.toLocaleString('en-IN')}) exceeds remaining balance (₹${sale.remainingAmount.toLocaleString('en-IN')}). Maximum allowed: ₹${sale.remainingAmount.toLocaleString('en-IN')}`
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
