/**
 * Sale Model
 *
 * Mongoose schema for Sales transactions
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ISale, SaleStatus, InventoryItemType, PaymentStatus } from '@/types';

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

  // New pricing logic
  this.originalPrice = amountAfterDiscount; // Assuming original price is after discount but before GST for now, or should it be subtotal? 
  // Let's stick to the prompt implication: price in GST bill usually means Base + GST.
  // If originalPrice is the base amount before GST:
  this.gstAmount = (this.originalPrice * (this.gstPercentage || 0)) / 100;
  this.gstBillPrice = this.originalPrice + this.gstAmount;
  this.grandTotal = this.gstBillPrice;

  // Calculate remaining amount
  this.remainingAmount = Math.max(0, this.grandTotal - (this.totalPaid || 0));
  this.balanceAmount = this.remainingAmount; // Keep backward compatibility if needed, or deprecate balanceAmount

  // Update payment status
  if ((this.totalPaid || 0) === 0) {
    this.paymentStatus = PaymentStatus.UNPAID;
    this.status = SaleStatus.PENDING;
  } else if ((this.totalPaid || 0) >= this.grandTotal) {
    this.paymentStatus = PaymentStatus.FULLY_PAID;
    this.status = SaleStatus.COMPLETED;
    this.remainingAmount = 0;
    this.balanceAmount = 0;
  } else {
    this.paymentStatus = PaymentStatus.PARTIALLY_PAID;
    this.status = SaleStatus.PARTIALLY_PAID;
  }
});

// Prevent model recompilation
const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);

export default Sale;
