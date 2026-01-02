/**
 * RawMaterialType Model
 *
 * Mongoose schema for Raw Material Types configuration
 */

import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IRawMaterialType extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RawMaterialTypeSchema = new Schema<IRawMaterialType>(
    {
        name: {
            type: String,
            required: [true, 'Raw material type name is required'],
            unique: true,
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for name for faster lookups
RawMaterialTypeSchema.index({ name: 1 });

const RawMaterialType: Model<IRawMaterialType> =
    mongoose.models.RawMaterialType ||
    mongoose.model<IRawMaterialType>('RawMaterialType', RawMaterialTypeSchema);

export default RawMaterialType;
