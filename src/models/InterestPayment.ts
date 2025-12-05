/**
 * Interest Payment Model
 *
 * Mongoose schema for Interest Payment tracking
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IInterestPayment, PaymentMethod } from '@/types';

const InterestPaymentSchema = new Schema<IInterestPayment>(
  {
    date: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters'],
    },
    loanAccountNumber: {
      type: String,
      required: [true, 'Loan account number is required'],
      trim: true,
    },
    principalAmount: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: [0, 'Principal amount cannot be negative'],
    },
    interestAmount: {
      type: Number,
      required: [true, 'Interest amount is required'],
      min: [0.01, 'Interest amount must be greater than 0'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0.01, 'Total amount must be greater than 0'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: Object.values(PaymentMethod),
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
InterestPaymentSchema.index({ date: -1 });
InterestPaymentSchema.index({ bankName: 1 });
InterestPaymentSchema.index({ loanAccountNumber: 1 });

// Calculate total amount before saving
InterestPaymentSchema.pre('save', async function () {
  this.totalAmount = this.principalAmount + this.interestAmount;
});

// Prevent model recompilation
const InterestPayment: Model<IInterestPayment> =
  mongoose.models.InterestPayment ||
  mongoose.model<IInterestPayment>('InterestPayment', InterestPaymentSchema);

export default InterestPayment;
