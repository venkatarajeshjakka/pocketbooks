/**
 * Trading Goods Procurement Model
 *
 * Mongoose schema for Trading Goods procurement transactions
 */

import mongoose, { Model } from 'mongoose';
import { ITradingGoodsProcurement } from '@/types';
import { createProcurementSchema } from '@/lib/mongoose/procurement-schema-factory';

const TradingGoodsProcurementSchema = createProcurementSchema({
  itemModelRef: 'TradingGood',
  itemRefField: 'tradingGoodId',
});

// Prevent model recompilation
const TradingGoodsProcurement: Model<ITradingGoodsProcurement> =
  mongoose.models.TradingGoodsProcurement ||
  mongoose.model<ITradingGoodsProcurement>(
    'TradingGoodsProcurement',
    TradingGoodsProcurementSchema
  );

export default TradingGoodsProcurement;
