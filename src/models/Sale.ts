/**
 * Sale Model
 *
 * Mongoose schema for Sales transactions
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ISale, SaleStatus, InventoryItemType } from '@/types';

const SaleSchema = new Schema<ISale>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
    },
    saleDate: {
      type: Date,
      required: [true, 'Sale date is required'],
      default: Date.now,
    },
    items: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          required: true,
          refPath: 'items.itemType',
        },
        itemType: {
          type: String,
          required: true,
          enum: Object.values(InventoryItemType),
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
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
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
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: [0, 'Balance amount cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(SaleStatus),
      default: SaleStatus.PENDING,
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
    },
    deliveryDate: {
      type: Date,
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
SaleSchema.index({ clientId: 1 });
SaleSchema.index({ saleDate: -1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ invoiceNumber: 1 });
SaleSchema.index({ balanceAmount: 1 });

// Virtual to check if payment is complete
SaleSchema.virtual('isFullyPaid').get(function () {
  return this.balanceAmount === 0;
});

// Calculate amounts before saving
SaleSchema.pre('save', async function () {
  // Calculate item amounts
  this.items.forEach((item) => {
    item.amount = item.quantity * item.unitPrice;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);

  // Calculate grand total
  const amountAfterDiscount = this.subtotal - this.discount;
  this.grandTotal = amountAfterDiscount + this.gstAmount;

  // Calculate balance amount
  this.balanceAmount = this.grandTotal - this.paidAmount;

  // Update status based on payment
  if (this.paidAmount === 0) {
    this.status = SaleStatus.PENDING;
  } else if (this.balanceAmount === 0) {
    this.status = SaleStatus.COMPLETED;
  } else {
    this.status = SaleStatus.PARTIALLY_PAID;
  }
});

// Prevent model recompilation
const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);

export default Sale;
