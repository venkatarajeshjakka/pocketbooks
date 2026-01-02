/**
 * Trading Goods API Route
 */

import { NextRequest } from 'next/server';
import TradingGood from '@/models/TradingGood';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGetAll(request, TradingGood, ['name', 'sku']);
}

export async function POST(request: NextRequest) {
  return handleCreate(request, TradingGood, 'sku');
}
