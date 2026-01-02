/**
 * New Asset Purchase Page
 */

import { AssetProcurementForm } from '@/components/assets/asset-procurement-form';

export const metadata = {
    title: 'Purchase Asset | PocketBooks',
    description: 'Record a new asset purchase and payment',
};

export default function NewAssetPurchasePage() {
    return (
        <div className="p-6">
            <AssetProcurementForm />
        </div>
    );
}
