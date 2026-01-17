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
      sparse: true,
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
      required: true,
      default: 0,
      min: [0, 'Reorder level cannot be negative'],
    },
    bom: [
      {
        rawMaterialId: {
          type: Schema.Types.ObjectId,
          ref: 'RawMaterial',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [0, 'Quantity cannot be negative'],
        },
      },
    ],
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
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

// No validation needed for sellingPrice vs cost since cost is calculated from BOM

// Prevent model recompilation
const FinishedGood: Model<IFinishedGood> =
  mongoose.models.FinishedGood ||
  mongoose.model<IFinishedGood>('FinishedGood', FinishedGoodSchema);

export default FinishedGood;
