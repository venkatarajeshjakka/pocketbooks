/**
 * Settings Page
 * 
 * Main page for managing application settings
 */

import { Metadata } from 'next';
import { RawMaterialTypesManager } from '@/components/settings/raw-material-types-manager';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Settings | PocketBooks',
    description: 'Manage application configuration and master data',
};

export default function SettingsPage() {
    return (
        <div className="flex flex-1 flex-col space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage application configuration and master data
                </p>
            </div>

            <div className="grid gap-6">
                <RawMaterialTypesManager />
            </div>
        </div>
    );
}
