/**
 * Raw Material Procurement Model
 *
 * Mongoose schema for Raw Material procurement transactions
 */

import mongoose, { Model } from 'mongoose';
import { IRawMaterialProcurement } from '@/types';
import { createProcurementSchema } from '@/lib/mongoose/procurement-schema-factory';

const RawMaterialProcurementSchema = createProcurementSchema({
  itemModelRef: 'RawMaterial',
  itemRefField: 'rawMaterialId',
});

// Prevent model recompilation
const RawMaterialProcurement: Model<IRawMaterialProcurement> =
  mongoose.models.RawMaterialProcurement ||
  mongoose.model<IRawMaterialProcurement>(
    'RawMaterialProcurement',
    RawMaterialProcurementSchema
  );

export default RawMaterialProcurement;
