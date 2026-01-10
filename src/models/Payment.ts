/**
 * Payment Model
 *
 * Mongoose schema for Payment transactions
 */

import mongoose, { Schema, Model } from 'mongoose';
import {
  IPayment,
  PaymentMethod,
  TransactionType,
  AccountType,
  PartyType,
} from '@/types';

// Use the enum value directly for conditional validation
const EXPENSE_TRANSACTION_TYPE = TransactionType.EXPENSE;

const PaymentSchema = new Schema<IPayment>(
  {
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
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
    transactionType: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: Object.values(TransactionType),
    },
    transactionId: {
      type: String,
      trim: true,
    },
    accountType: {
      type: String,
      required: [true, 'Account type is required'],
      enum: Object.values(AccountType),
    },
    partyId: {
      type: Schema.Types.ObjectId,
      // Optional - validated conditionally in pre-save hook
    },
    partyType: {
      type: String,
      enum: [...Object.values(PartyType), null, undefined],
      // Optional - validated conditionally in pre-save hook
    },
    saleId: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
    },
    procurementId: {
      type: Schema.Types.ObjectId,
    },
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
    },
    expenseId: {
      type: Schema.Types.ObjectId,
      ref: 'Expense',
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

// Pre-validate hook for conditional required fields
PaymentSchema.pre('validate', async function () {
  // For non-expense transactions, partyId and partyType are required
  if (this.transactionType !== EXPENSE_TRANSACTION_TYPE) {
    if (!this.partyId) {
      this.invalidate('partyId', 'Party is required for non-expense transactions');
    }
    if (!this.partyType) {
      this.invalidate('partyType', 'Party type is required for non-expense transactions');
    }
  }
});

// Indexes
PaymentSchema.index({ paymentDate: -1 });
PaymentSchema.index({ partyId: 1, partyType: 1 }); // Compound index for queries by party
PaymentSchema.index({ assetId: 1 }); // Missing index for asset lookups
PaymentSchema.index({ saleId: 1 });
PaymentSchema.index({ expenseId: 1 }); // For expense lookups
PaymentSchema.index({ transactionType: 1 });
PaymentSchema.index({ createdAt: -1 }); // Useful for default sort

// Prevent model recompilation in production
// In development, you may need to restart the server for schema changes
const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
