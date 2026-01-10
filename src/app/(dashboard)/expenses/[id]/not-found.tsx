/**
 * Expense Not Found Page
 */

import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExpenseNotFound() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Receipt className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Expense Not Found</h2>
                <p className="text-muted-foreground max-w-md">
                    The expense you&apos;re looking for doesn&apos;t exist or has been deleted.
                </p>
            </div>
            <Button asChild>
                <Link href="/expenses">Back to Expenses</Link>
            </Button>
        </div>
    );
}
