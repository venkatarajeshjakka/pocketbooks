/**
 * Payments API Route
 */

import { NextRequest } from 'next/server';
import Payment from '@/models/Payment';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGetAll(request, Payment, []);
}

export async function POST(request: NextRequest) {
  return handleCreate(request, Payment);
}
