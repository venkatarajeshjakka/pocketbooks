/**
 * Expenses API Route
 */

import { NextRequest } from 'next/server';
import Expense from '@/models/Expense';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGetAll(request, Expense, ['description']);
}

export async function POST(request: NextRequest) {
  return handleCreate(request, Expense);
}
