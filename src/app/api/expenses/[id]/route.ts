/**
 * Individual Expense API Route
 *
 * Handles GET, PUT, DELETE for individual expenses
 * Updates and deletes corresponding payment records as needed
 */

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Expense from '@/models/Expense';
import Payment from '@/models/Payment';
import { connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { TransactionType, AccountType } from '@/types';
import { revalidatePath } from 'next/cache';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const expense = await Expense.findById(id).populate('paymentId');

        if (!expense) {
            return errorResponse('Expense not found', 404);
        }

        return NextResponse.json({
            success: true,
            data: expense,
        });
    } catch (error) {
        console.error('API GET expense error:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch expense';
        return errorResponse(message, 500);
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    let session: mongoose.ClientSession | null = null;

    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        // Find existing expense
        const existingExpense = await Expense.findById(id);
        if (!existingExpense) {
            return errorResponse('Expense not found', 404);
        }

        session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update the expense
            const updatedExpense = await Expense.findByIdAndUpdate(
                id,
                body,
                { new: true, runValidators: true, session }
            );

            if (!updatedExpense) {
                throw new Error('Failed to update expense');
            }

            // Update the corresponding payment record
            if (existingExpense.paymentId) {
                const paymentUpdate = {
                    paymentDate: body.date || updatedExpense.date,
                    amount: body.amount || updatedExpense.amount,
                    paymentMethod: body.paymentMethod || updatedExpense.paymentMethod,
                    notes: `Expense: ${updatedExpense.description}${updatedExpense.receiptNumber ? ` (Receipt: ${updatedExpense.receiptNumber})` : ''}`,
                };

                await Payment.findByIdAndUpdate(
                    existingExpense.paymentId,
                    paymentUpdate,
                    { session }
                );
            } else {
                // If no payment exists, create one
                const paymentData = {
                    paymentDate: updatedExpense.date,
                    amount: updatedExpense.amount,
                    paymentMethod: updatedExpense.paymentMethod,
                    transactionType: TransactionType.EXPENSE,
                    accountType: AccountType.PAYABLE,
                    expenseId: updatedExpense._id,
                    notes: `Expense: ${updatedExpense.description}${updatedExpense.receiptNumber ? ` (Receipt: ${updatedExpense.receiptNumber})` : ''}`,
                };

                const [payment] = await Payment.create([paymentData], { session });
                updatedExpense.paymentId = payment._id;
                await updatedExpense.save({ session });
            }

            await session.commitTransaction();

            revalidatePath('/expenses');
            revalidatePath('/payments');

            return NextResponse.json({
                success: true,
                data: updatedExpense,
                message: 'Expense updated successfully',
            });

        } catch (transactionError) {
            await session.abortTransaction();
            throw transactionError;
        }
    } catch (error) {
        console.error('Expense Update Error:', error);

        if (error instanceof Error && error.name === 'ValidationError') {
            return errorResponse(error.message, 400);
        }

        const message = error instanceof Error ? error.message : 'Failed to update expense';
        return errorResponse(message, 500);
    } finally {
        if (session) {
            session.endSession();
        }
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    let session: mongoose.ClientSession | null = null;

    try {
        await connectToDatabase();
        const { id } = await params;

        // Find existing expense
        const existingExpense = await Expense.findById(id);
        if (!existingExpense) {
            return errorResponse('Expense not found', 404);
        }

        session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Delete the corresponding payment record
            if (existingExpense.paymentId) {
                await Payment.findByIdAndDelete(existingExpense.paymentId, { session });
            }

            // Delete the expense
            await Expense.findByIdAndDelete(id, { session });

            await session.commitTransaction();

            revalidatePath('/expenses');
            revalidatePath('/payments');

            return NextResponse.json({
                success: true,
                message: 'Expense deleted successfully',
            });

        } catch (transactionError) {
            await session.abortTransaction();
            throw transactionError;
        }
    } catch (error) {
        console.error('Expense Delete Error:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete expense';
        return errorResponse(message, 500);
    } finally {
        if (session) {
            session.endSession();
        }
    }
}
