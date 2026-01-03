/**
 * New Payment Page
 * Page for recording a new payment
 */

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PaymentForm } from '@/components/payments/payment-form';

export const metadata = {
    title: 'Record Payment | PocketBooks',
    description: 'Record a new payment transaction',
};

export default function NewPaymentPage() {
    return (
        <div className="flex-1 saas-canvas p-6 md:p-10 min-h-screen">
            {/* Page Header */}
            <div className="mx-auto w-full max-w-4xl mb-10">
                <Link
                    href="/payments"
                    className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-300 mb-6"
                >
                    <div className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                    Back to Payments
                </Link>
                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 sm:text-5xl">
                        Record Payment
                    </h1>
                    <p className="text-base text-muted-foreground mt-3 font-medium max-w-2xl leading-relaxed">
                        Record a new payment for sales, purchases, or expenses. All payment details will be tracked automatically.
                    </p>
                </div>
            </div>

            {/* Payment Form */}
            <div className="mx-auto w-full max-w-4xl">
                <PaymentForm mode="create" />
            </div>
        </div>
    );
}
