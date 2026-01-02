/**
 * Interest Payments API Route
 */

import { NextRequest } from 'next/server';
import InterestPayment from '@/models/InterestPayment';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGetAll(request, InterestPayment, ['bankName', 'loanAccountNumber']);
}

export async function POST(request: NextRequest) {
  return handleCreate(request, InterestPayment);
}
