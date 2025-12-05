/**
 * Client Model
 *
 * Mongoose schema for Client entity
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IClient, EntityStatus } from '@/types';

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    contactPerson: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact person name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'India' },
    },
    status: {
      type: String,
      enum: Object.values(EntityStatus),
      default: EntityStatus.ACTIVE,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        'Please provide a valid GST number',
      ],
    },
    outstandingBalance: {
      type: Number,
      default: 0,
      min: [0, 'Outstanding balance cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
ClientSchema.index({ email: 1 });
ClientSchema.index({ name: 1 });
ClientSchema.index({ status: 1 });
ClientSchema.index({ outstandingBalance: 1 });

// Virtual for sales
ClientSchema.virtual('sales', {
  ref: 'Sale',
  localField: '_id',
  foreignField: 'clientId',
});

// Pre-save middleware (if needed in the future)
// ClientSchema.pre('save', async function () {
//   // Add pre-save logic here
// });

// Prevent model recompilation in development
const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;
