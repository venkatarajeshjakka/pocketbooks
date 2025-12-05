/**
 * Expense Model
 *
 * Mongoose schema for Expense tracking
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IExpense, ExpenseCategory, PaymentMethod } from '@/types';

const ExpenseSchema = new Schema<IExpense>(
  {
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: Object.values(ExpenseCategory),
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: Object.values(PaymentMethod),
    },
    receiptNumber: {
      type: String,
      trim: true,
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
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ paymentMethod: 1 });

// Prevent model recompilation
const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
