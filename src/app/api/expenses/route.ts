/**
 * Expenses API Route
 *
 * When an expense is created, a corresponding payment record is also created
 * to track the cash flow in the payments section.
 */

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Expense from '@/models/Expense';
import Payment from '@/models/Payment';
import { connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { TransactionType, AccountType } from '@/types';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const MAX_LIMIT = 100;
        const requestedLimit = parseInt(searchParams.get('limit') || '10');
        const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const sortBy = searchParams.get('sortBy') || 'date';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
        const startDate = searchParams.get('startDate') || '';
        const endDate = searchParams.get('endDate') || '';

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { receiptNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) {
            query.category = category;
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            Expense.find(query)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Expense.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('API GET expenses error:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
        return errorResponse(message, 500);
    }
}

export async function POST(request: NextRequest) {
    let session: mongoose.ClientSession | null = null;

    try {
        await connectToDatabase();
        const body = await request.json();

        // Validate required fields
        if (!body.amount || !body.description || !body.category || !body.paymentMethod) {
            return errorResponse('Missing required expense fields', 400);
        }

        session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create the expense
            const [expense] = await Expense.create([body], { session });

            // Create a corresponding payment record
            const paymentData = {
                paymentDate: body.date || new Date(),
                amount: body.amount,
                paymentMethod: body.paymentMethod,
                transactionType: TransactionType.EXPENSE,
                accountType: AccountType.PAYABLE,
                expenseId: expense._id,
                notes: `Expense: ${body.description}${body.receiptNumber ? ` (Receipt: ${body.receiptNumber})` : ''}`,
            };

            const [payment] = await Payment.create([paymentData], { session });

            // Update expense with payment reference
            expense.paymentId = payment._id;
            await expense.save({ session });

            await session.commitTransaction();

            revalidatePath('/expenses');
            revalidatePath('/payments');

            return NextResponse.json({
                success: true,
                data: expense,
                message: 'Expense created successfully',
            }, { status: 201 });

        } catch (transactionError) {
            await session.abortTransaction();
            throw transactionError;
        }
    } catch (error) {
        console.error('Expense Creation Error:', error);

        if (error instanceof Error && error.name === 'ValidationError') {
            return errorResponse(error.message, 400);
        }

        const message = error instanceof Error ? error.message : 'Failed to create expense';
        return errorResponse(message, 500);
    } finally {
        if (session) {
            session.endSession();
        }
    }
}
