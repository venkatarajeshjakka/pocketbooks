/**
 * Raw Material Procurement Model
 *
 * Mongoose schema for Raw Material procurement transactions
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IRawMaterialProcurement, ProcurementStatus } from '@/types';

const RawMaterialProcurementSchema = new Schema<IRawMaterialProcurement>(
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
        rawMaterialId: {
          type: Schema.Types.ObjectId,
          ref: 'RawMaterial',
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
RawMaterialProcurementSchema.index({ vendorId: 1 });
RawMaterialProcurementSchema.index({ procurementDate: -1 });
RawMaterialProcurementSchema.index({ status: 1 });
RawMaterialProcurementSchema.index({ invoiceNumber: 1 });

// Calculate amounts before saving
RawMaterialProcurementSchema.pre('save', async function () {
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
const RawMaterialProcurement: Model<IRawMaterialProcurement> =
  mongoose.models.RawMaterialProcurement ||
  mongoose.model<IRawMaterialProcurement>(
    'RawMaterialProcurement',
    RawMaterialProcurementSchema
  );

export default RawMaterialProcurement;
