/**
 * Finished Goods API Route
 */

import { NextRequest } from 'next/server';
import FinishedGood from '@/models/FinishedGood';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGetAll(request, FinishedGood, ['name', 'sku'], ['bom.rawMaterialId']);
}

export async function POST(request: NextRequest) {
  return handleCreate(request, FinishedGood, 'sku');
}
