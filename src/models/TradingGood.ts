/**
 * Trading Good Model
 *
 * Mongoose schema for Trading Good inventory
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ITradingGood, UnitOfMeasurement } from '@/types';

const TradingGoodSchema = new Schema<ITradingGood>(
  {
    name: {
      type: String,
      required: [true, 'Trading good name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      enum: Object.values(UnitOfMeasurement),
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    lastProcurementDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
TradingGoodSchema.index({ name: 1 });
TradingGoodSchema.index({ currentStock: 1 });

// Virtual to check if stock is low
TradingGoodSchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.reorderLevel;
});

// Virtual for profit margin
TradingGoodSchema.virtual('profitMargin').get(function () {
  if (this.costPrice === 0) return 0;
  return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
});

// Validation: selling price should be greater than cost price
TradingGoodSchema.pre('save', async function () {
  if (this.sellingPrice < this.costPrice) {
    throw new Error('Selling price must be greater than or equal to cost price');
  }
});

// Prevent model recompilation
const TradingGood: Model<ITradingGood> =
  mongoose.models.TradingGood ||
  mongoose.model<ITradingGood>('TradingGood', TradingGoodSchema);

export default TradingGood;
