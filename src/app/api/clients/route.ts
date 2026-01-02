/**
 * Clients API Route
 */

import { NextRequest } from 'next/server';
import Client from '@/models/Client';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGetAll(request, Client, ['name', 'email', 'contactPerson']);
}

export async function POST(request: NextRequest) {
  return handleCreate(request, Client, 'email');
}
