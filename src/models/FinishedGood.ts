/**
 * Finished Good Model
 *
 * Mongoose schema for Finished Good inventory
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IFinishedGood, UnitOfMeasurement } from '@/types';

const FinishedGoodSchema = new Schema<IFinishedGood>(
  {
    name: {
      type: String,
      required: [true, 'Finished good name is required'],
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
    rawMaterialsUsed: [
      {
        rawMaterialId: {
          type: Schema.Types.ObjectId,
          ref: 'RawMaterial',
          required: true,
        },
        quantityRequired: {
          type: Number,
          required: true,
          min: [0, 'Quantity required cannot be negative'],
        },
      },
    ],
    manufacturingCost: {
      type: Number,
      required: [true, 'Manufacturing cost is required'],
      min: [0, 'Manufacturing cost cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    lastManufactureDate: {
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
FinishedGoodSchema.index({ name: 1 });
FinishedGoodSchema.index({ currentStock: 1 });

// Virtual for profit margin
FinishedGoodSchema.virtual('profitMargin').get(function () {
  if (this.manufacturingCost === 0) return 0;
  return ((this.sellingPrice - this.manufacturingCost) / this.manufacturingCost) * 100;
});

// Validation: selling price should be greater than manufacturing cost
FinishedGoodSchema.pre('save', async function () {
  if (this.sellingPrice < this.manufacturingCost) {
    throw new Error('Selling price must be greater than or equal to manufacturing cost');
  }
});

// Prevent model recompilation
const FinishedGood: Model<IFinishedGood> =
  mongoose.models.FinishedGood ||
  mongoose.model<IFinishedGood>('FinishedGood', FinishedGoodSchema);

export default FinishedGood;
