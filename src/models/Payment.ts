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
      required: [true, 'Party is required'],
      refPath: 'partyType',
    },
    partyType: {
      type: String,
      required: [true, 'Party type is required'],
      enum: Object.values(PartyType),
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
PaymentSchema.index({ paymentDate: -1 });
PaymentSchema.index({ partyId: 1 });
PaymentSchema.index({ partyType: 1 });
PaymentSchema.index({ accountType: 1 });
PaymentSchema.index({ saleId: 1 });
PaymentSchema.index({ transactionType: 1 });

// Prevent model recompilation
const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
