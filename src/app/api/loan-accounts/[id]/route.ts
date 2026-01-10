/**
 * Loan Account Individual Resource API Route
 */

import { NextRequest } from 'next/server';
import { LoanAccount, InterestPayment } from '@/models';
import { handleGetById, handleUpdate, handleDelete, errorResponse, connectToDatabase } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleGetById(id, LoanAccount);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleUpdate(id, request, LoanAccount, 'accountNumber');
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await connectToDatabase();

        // Check for associated interest payments
        const hasPayments = await InterestPayment.exists({ loanAccountId: id });
        if (hasPayments) {
            return errorResponse('Cannot delete loan account with existing interest payments. Delete payments first.', 400);
        }

        return handleDelete(id, LoanAccount);
    } catch (error: any) {
        return errorResponse(error.message || 'Failed to delete loan account', 500);
    }
}
