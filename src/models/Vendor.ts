/**
 * Vendor Model
 *
 * Mongoose schema for Vendor entity
 */

import mongoose, { Schema, Model } from 'mongoose';
import { IVendor, EntityStatus } from '@/types';

const VendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
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
    specialty: {
      type: String,
      trim: true,
      maxlength: [200, 'Specialty cannot exceed 200 characters'],
    },
    rawMaterialTypes: {
      type: [String],
      default: [],
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
    outstandingPayable: {
      type: Number,
      default: 0,
      min: [0, 'Outstanding payable cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
// Note: email index is already created by unique: true
VendorSchema.index({ name: 1 });
VendorSchema.index({ status: 1 });
VendorSchema.index({ specialty: 1 });

// Virtual for raw material procurements
VendorSchema.virtual('rawMaterialProcurements', {
  ref: 'RawMaterialProcurement',
  localField: '_id',
  foreignField: 'vendorId',
});

// Virtual for trading goods procurements
VendorSchema.virtual('tradingGoodsProcurements', {
  ref: 'TradingGoodsProcurement',
  localField: '_id',
  foreignField: 'vendorId',
});

// DEPRECATED: Use rawMaterialProcurements or tradingGoodsProcurements instead
// Kept for backward compatibility - only references RawMaterialProcurement
VendorSchema.virtual('procurements', {
  ref: 'RawMaterialProcurement',
  localField: '_id',
  foreignField: 'vendorId',
});

// Pre-delete middleware to prevent deleting vendors with procurements
VendorSchema.pre('findOneAndDelete', async function (this: any) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    // Check for related raw material procurements
    const rmCount = await mongoose.model('RawMaterialProcurement').countDocuments({ vendorId: doc._id });
    if (rmCount > 0) {
      throw new Error(`Cannot delete vendor "${doc.name}" because they have ${rmCount} raw material procurements. Please delete the procurements first.`);
    }

    // Check for related trading goods procurements
    const tgCount = await mongoose.model('TradingGoodsProcurement').countDocuments({ vendorId: doc._id });
    if (tgCount > 0) {
      throw new Error(`Cannot delete vendor "${doc.name}" because they have ${tgCount} trading goods procurements. Please delete the procurements first.`);
    }
  }
});

// Prevent model recompilation in development
const Vendor: Model<IVendor> =
  mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

export default Vendor;
