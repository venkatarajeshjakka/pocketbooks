
/**
 * New Sale Page
 */
import { SaleForm } from '@/components/sales/sale-form';

export const metadata = {
    title: 'New Sale | PocketBooks',
    description: 'Create a new sale transaction',
};

export default function NewSalePage() {
    return (
        <div className="flex flex-1 flex-col gap-6 md:gap-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                    New Sale
                </h1>
                <p className="text-sm font-medium text-muted-foreground/60">
                    Create a new sale invoice and record stock movement
                </p>
            </div>

            <SaleForm mode="create" />
        </div>
    );
}
