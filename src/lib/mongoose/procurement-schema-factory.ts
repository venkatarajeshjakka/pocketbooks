/**
 * Procurement Schema Factory
 * 
 * Shared logic for Raw Material and Trading Goods procurement models.
 */

import { Schema, Model } from 'mongoose';
import { ProcurementStatus, PaymentStatus } from '@/types';

interface IProcurementSchemaOptions {
    itemModelRef: string;
    itemRefField: 'rawMaterialId' | 'tradingGoodId';
}

export function createProcurementSchema(options: IProcurementSchemaOptions) {
    const { itemModelRef, itemRefField } = options;

    const ProcurementSchema = new Schema(
        {
            vendorId: {
                type: Schema.Types.ObjectId,
                ref: 'Vendor',
                required: [true, 'Vendor is required'],
            },
            procurementDate: {
                type: Date,
                required: [true, 'Procurement date is required'],
                default: Date.now,
            },
            items: [
                {
                    [itemRefField]: {
                        type: Schema.Types.ObjectId,
                        ref: itemModelRef,
                        required: true,
                    },
                    quantity: {
                        type: Number,
                        required: true,
                        min: [0.01, 'Quantity must be greater than 0'],
                    },
                    unitPrice: {
                        type: Number,
                        required: true,
                        min: [0, 'Unit price cannot be negative'],
                    },
                    amount: {
                        type: Number,
                        required: true,
                        min: [0, 'Amount cannot be negative'],
                    },
                },
            ],
            totalAmount: {
                type: Number,
                required: true,
                min: [0, 'Total amount cannot be negative'],
            },
            gstAmount: {
                type: Number,
                required: true,
                default: 0,
                min: [0, 'GST amount cannot be negative'],
            },
            grandTotal: {
                type: Number,
                required: true,
                min: [0, 'Grand total cannot be negative'],
            },
            status: {
                type: String,
                enum: Object.values(ProcurementStatus),
                default: ProcurementStatus.ORDERED,
            },
            invoiceNumber: {
                type: String,
                trim: true,
            },
            notes: {
                type: String,
                trim: true,
                maxlength: [500, 'Notes cannot exceed 500 characters'],
            },
            receivedDate: {
                type: Date,
            },
            // Enhanced pricing fields
            originalPrice: {
                type: Number,
                required: true,
                default: 0,
                min: [0, 'Original price cannot be negative'],
            },
            gstBillPrice: {
                type: Number,
                required: true,
                default: 0,
                min: [0, 'GST bill price cannot be negative'],
            },
            gstPercentage: {
                type: Number,
                required: true,
                default: 0,
                min: [0, 'GST percentage cannot be negative'],
                max: [100, 'GST percentage cannot exceed 100'],
            },
            // Payment tracking fields
            paymentStatus: {
                type: String,
                enum: Object.values(PaymentStatus),
                default: PaymentStatus.UNPAID,
            },
            totalPaid: {
                type: Number,
                default: 0,
                min: [0, 'Total paid cannot be negative'],
            },
            remainingAmount: {
                type: Number,
                default: 0,
                min: [0, 'Remaining amount cannot be negative'],
            },
            paymentTerms: {
                type: String,
                trim: true,
                maxlength: [200, 'Payment terms cannot exceed 200 characters'],
            },
            expectedDeliveryDate: {
                type: Date,
            },
            actualDeliveryDate: {
                type: Date,
            },
        },
        {
            timestamps: true,
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
        }
    );

    // Virtual for consistent date access
    ProcurementSchema.virtual('date').get(function () {
        return (this as any).procurementDate;
    });

    // Indexes
    ProcurementSchema.index({ vendorId: 1 });
    ProcurementSchema.index({ procurementDate: -1 });
    ProcurementSchema.index({ status: 1 });
    // Compound index for unique invoice numbers per vendor
    ProcurementSchema.index({ vendorId: 1, invoiceNumber: 1 }, { unique: true, sparse: true });

    // Calculate amounts before validation
    ProcurementSchema.pre('validate', async function (this: any) {
        // Calculate item amounts
        if (this.items && this.items.length > 0) {
            this.items.forEach((item: any) => {
                item.amount = item.quantity * item.unitPrice;
            });

            // Calculate total amount (sum of items)
            this.totalAmount = this.items.reduce((sum: number, item: any) => sum + item.amount, 0);
        } else {
            this.totalAmount = 0;
        }

        // Enhanced pricing logic
        this.originalPrice = this.totalAmount;
        this.gstAmount = (this.originalPrice * (this.gstPercentage || 0)) / 100;
        this.gstBillPrice = this.originalPrice + this.gstAmount;
        this.grandTotal = this.gstBillPrice;

        // Calculate remaining amount
        this.remainingAmount = Math.max(0, this.grandTotal - (this.totalPaid || 0));

        // Update payment status
        if ((this.totalPaid || 0) === 0) {
            this.paymentStatus = PaymentStatus.UNPAID;
        } else if ((this.totalPaid || 0) >= this.grandTotal) {
            this.paymentStatus = PaymentStatus.FULLY_PAID;
            this.remainingAmount = 0;
        } else {
            this.paymentStatus = PaymentStatus.PARTIALLY_PAID;
        }
    });

    return ProcurementSchema;
}
