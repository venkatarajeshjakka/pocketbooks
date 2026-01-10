/**
 * Loan Accounts API Route
 */

import { NextRequest } from 'next/server';
import { LoanAccount } from '@/models';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return handleGetAll(request, LoanAccount, ['bankName', 'accountNumber', 'loanType']);
}

export async function POST(request: NextRequest) {
    return handleCreate(request, LoanAccount, 'accountNumber');
}
