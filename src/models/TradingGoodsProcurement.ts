/**
 * Trading Goods Procurement Model
 *
 * Mongoose schema for Trading Goods procurement transactions
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ITradingGoodsProcurement, ProcurementStatus } from '@/types';

const TradingGoodsProcurementSchema = new Schema<ITradingGoodsProcurement>(
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
        tradingGoodId: {
          type: Schema.Types.ObjectId,
          ref: 'TradingGood',
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
TradingGoodsProcurementSchema.index({ vendorId: 1 });
TradingGoodsProcurementSchema.index({ procurementDate: -1 });
TradingGoodsProcurementSchema.index({ status: 1 });
TradingGoodsProcurementSchema.index({ invoiceNumber: 1 });

// Calculate amounts before saving
TradingGoodsProcurementSchema.pre('save', async function () {
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
const TradingGoodsProcurement: Model<ITradingGoodsProcurement> =
  mongoose.models.TradingGoodsProcurement ||
  mongoose.model<ITradingGoodsProcurement>(
    'TradingGoodsProcurement',
    TradingGoodsProcurementSchema
  );

export default TradingGoodsProcurement;
