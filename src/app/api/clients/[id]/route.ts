/**
 * Individual Client API Route
 *
 * Handles operations for a specific client by ID
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Client from '@/models/Client';
import { IClientInput, ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/clients/[id]
 * Fetch a single client by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      data: client,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`GET /api/clients/${(await params).id} error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/[id]
 * Update a client by ID
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body: IClientInput = await request.json();

    // Check if email is being changed and if it already exists
    if (body.email) {
      const existingClient = await Client.findOne({
        email: body.email,
        _id: { $ne: id },
      });
      if (existingClient) {
        return NextResponse.json(
          { success: false, error: 'Client with this email already exists' },
          { status: 409 }
        );
      }
    }

    const client = await Client.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      data: client,
      message: 'Client updated successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`PUT /api/clients/${(await params).id} error:`, error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[id]
 * Delete a client by ID
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      message: 'Client deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`DELETE /api/clients/${(await params).id} error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete client' },
      { status: 500 }
    );
  }
}
