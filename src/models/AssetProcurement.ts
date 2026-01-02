/**
 * Asset Procurement Model
 *
 * Mongoose schema for Asset procurement transactions
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IAssetProcurement, ProcurementStatus, AssetCategory } from '@/types';

const AssetProcurementSchema = new Schema<IAssetProcurement>(
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
                assetName: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                },
                category: {
                    type: String,
                    required: true,
                    enum: Object.values(AssetCategory),
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Quantity must be at least 1'],
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
            default: ProcurementStatus.RECEIVED,
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
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
AssetProcurementSchema.index({ vendorId: 1 });
AssetProcurementSchema.index({ procurementDate: -1 });

// Calculate amounts before validation
AssetProcurementSchema.pre('validate', async function () {
    // Calculate item amounts
    this.items.forEach((item) => {
        item.amount = item.quantity * item.unitPrice;
    });

    // Calculate total amount
    this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);

    // Calculate grand total
    this.grandTotal = this.totalAmount + this.gstAmount;
});

// Prevent model recompilation
const AssetProcurement: Model<IAssetProcurement> =
    mongoose.models.AssetProcurement ||
    mongoose.model<IAssetProcurement>('AssetProcurement', AssetProcurementSchema);

export default AssetProcurement;
