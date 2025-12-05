/**
 * Raw Material Model
 *
 * Mongoose schema for Raw Material inventory
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IRawMaterial, UnitOfMeasurement } from '@/types';

const RawMaterialSchema = new Schema<IRawMaterial>(
  {
    name: {
      type: String,
      required: [true, 'Raw material name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
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
    intendedFor: {
      type: Schema.Types.ObjectId,
      ref: 'FinishedGood',
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
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
RawMaterialSchema.index({ name: 1 });
RawMaterialSchema.index({ currentStock: 1 });
RawMaterialSchema.index({ intendedFor: 1 });

// Virtual to check if stock is low
RawMaterialSchema.virtual('isLowStock').get(function () {
  return this.currentStock <= this.reorderLevel;
});

// Prevent model recompilation
const RawMaterial: Model<IRawMaterial> =
  mongoose.models.RawMaterial ||
  mongoose.model<IRawMaterial>('RawMaterial', RawMaterialSchema);

export default RawMaterial;
