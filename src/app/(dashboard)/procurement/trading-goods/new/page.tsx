import { ProcurementForm } from '@/components/procurement/procurement-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewTradingGoodProcurementPage() {
    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto py-6">
            <div className="flex items-center gap-4">
                <Link href="/procurement/trading-goods">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Trading Good Order</h1>
                    <p className="text-muted-foreground">
                        Create a new procurement order for trading goods.
                    </p>
                </div>
            </div>

            <ProcurementForm type="trading_good" mode="create" />
        </div>
    );
}
