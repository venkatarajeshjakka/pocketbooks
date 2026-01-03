/**
 * Asset Model
 *
 * Mongoose schema for Asset tracking
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IAsset, AssetCategory, AssetStatus } from '@/types';

const AssetSchema = new Schema<IAsset>(
    {
        name: {
            type: String,
            required: [true, 'Asset name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: Object.values(AssetCategory),
        },
        serialNumber: {
            type: String,
            trim: true,
        },
        purchaseDate: {
            type: Date,
            required: [true, 'Purchase date is required'],
            default: Date.now,
        },
        purchasePrice: {
            type: Number,
            required: [true, 'Purchase price is required'],
            min: [0, 'Price cannot be negative'],
        },
        currentValue: {
            type: Number,
            required: [true, 'Current value is required'],
            min: [0, 'Value cannot be negative'],
        },
        location: {
            type: String,
            trim: true,
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
        },
        status: {
            type: String,
            required: [true, 'Status is required'],
            enum: Object.values(AssetStatus),
            default: AssetStatus.ACTIVE,
        },
        gstEnabled: {
            type: Boolean,
            default: false,
        },
        gstPercentage: {
            type: Number,
            min: [0, 'GST percentage cannot be negative'],
            default: 0,
        },
        gstAmount: {
            type: Number,
            min: [0, 'GST amount cannot be negative'],
            default: 0,
        },
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: 'Payment',
        },
        paymentDetails: {
            amount: Number,
            paymentMethod: String,
            paymentDate: Date,
            notes: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
AssetSchema.index({ name: 1 });
AssetSchema.index({ category: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ vendorId: 1 });

// Prevent model recompilation
const Asset: Model<IAsset> =
    mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default Asset;
