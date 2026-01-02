/**
 * Raw Materials API Route
 */

import { NextRequest } from 'next/server';
import RawMaterial from '@/models/RawMaterial';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGetAll(request, RawMaterial, ['name']);
}

export async function POST(request: NextRequest) {
  return handleCreate(request, RawMaterial);
}
