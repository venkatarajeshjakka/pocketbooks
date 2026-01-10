/**
 * Interest Payment Model
 *
 * Mongoose schema for Interest Payment tracking
 * Links to LoanAccount, Expense, and Payment for integration
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IInterestPayment, PaymentMethod } from '@/types';

const InterestPaymentSchema = new Schema<IInterestPayment>(
  {
    loanAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'LoanAccount',
      required: [true, 'Loan account is required'],
    },
    date: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
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
    expenseId: {
      type: Schema.Types.ObjectId,
      ref: 'Expense',
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
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
InterestPaymentSchema.index({ loanAccountId: 1 });
InterestPaymentSchema.index({ expenseId: 1 });
InterestPaymentSchema.index({ paymentId: 1 });

// Calculate total amount before validation
InterestPaymentSchema.pre('validate', async function () {
  this.totalAmount = this.principalAmount + this.interestAmount;
});

// Prevent model recompilation
const InterestPayment: Model<IInterestPayment> =
  mongoose.models.InterestPayment ||
  mongoose.model<IInterestPayment>('InterestPayment', InterestPaymentSchema);

export default InterestPayment;
