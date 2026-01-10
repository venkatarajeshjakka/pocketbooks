/**
 * Payments Not Found Page
 */

import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentsNotFound() {
    return (
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <SearchX className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Payment Not Found</h2>
                <p className="text-muted-foreground max-w-[500px]">
                    Could not find the requested payment transaction. It might have been deleted or you may have followed a broken link.
                </p>
            </div>
            <Button asChild>
                <Link href="/payments">Back to Payments</Link>
            </Button>
        </div>
    );
}
