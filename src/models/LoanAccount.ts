/**
 * Loan Account Model
 *
 * Mongoose schema for Loan Account tracking
 */

import mongoose, { Schema, Model } from 'mongoose';
import { ILoanAccount, LoanAccountStatus } from '@/types';

const LoanAccountSchema = new Schema<ILoanAccount>(
  {
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters'],
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
      unique: true,
    },
    loanType: {
      type: String,
      required: [true, 'Loan type is required'],
      trim: true,
      maxlength: [50, 'Loan type cannot exceed 50 characters'],
    },
    principalAmount: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: [0.01, 'Principal amount must be greater than 0'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    emiAmount: {
      type: Number,
      min: [0, 'EMI amount cannot be negative'],
    },
    totalInterestPaid: {
      type: Number,
      default: 0,
      min: [0, 'Total interest paid cannot be negative'],
    },
    totalPrincipalPaid: {
      type: Number,
      default: 0,
      min: [0, 'Total principal paid cannot be negative'],
    },
    outstandingAmount: {
      type: Number,
      required: true,
      min: [0, 'Outstanding amount cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: Object.values(LoanAccountStatus),
      default: LoanAccountStatus.ACTIVE,
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
LoanAccountSchema.index({ bankName: 1 });
LoanAccountSchema.index({ accountNumber: 1 });
LoanAccountSchema.index({ status: 1 });
LoanAccountSchema.index({ startDate: -1 });

// Set outstanding amount to principal amount on new loan creation
LoanAccountSchema.pre('validate', async function () {
  if (this.isNew && !this.outstandingAmount) {
    this.outstandingAmount = this.principalAmount;
  }
});

// Prevent model recompilation
const LoanAccount: Model<ILoanAccount> =
  mongoose.models.LoanAccount ||
  mongoose.model<ILoanAccount>('LoanAccount', LoanAccountSchema);

export default LoanAccount;
