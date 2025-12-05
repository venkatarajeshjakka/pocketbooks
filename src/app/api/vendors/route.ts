/**
 * Vendors API Route
 */

import { NextRequest } from 'next/server';
import Vendor from '@/models/Vendor';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGetAll(request, Vendor, ['name', 'email', 'contactPerson']);
}

export async function POST(request: NextRequest) {
  return handleCreate(request, Vendor, 'email');
}
