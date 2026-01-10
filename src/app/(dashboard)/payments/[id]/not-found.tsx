/**
 * Payment Not Found Page
 */

import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentNotFound() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <CreditCard className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Payment Not Found</h2>
                <p className="text-muted-foreground max-w-md">
                    The payment you&apos;re looking for doesn&apos;t exist or has been deleted.
                </p>
            </div>
            <Button asChild>
                <Link href="/payments">Back to Payments</Link>
            </Button>
        </div>
    );
}
