/**
 * Asset Not Found Page
 *
 * Displayed when an asset cannot be found
 */

import Link from 'next/link';
import { Monitor, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AssetNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/20">
        <Monitor className="h-10 w-10 text-indigo-500" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Asset Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The asset you are looking for does not exist or may have been deleted.
        </p>
      </div>

      <Button asChild>
        <Link href="/assets">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Link>
      </Button>
    </div>
  );
}
