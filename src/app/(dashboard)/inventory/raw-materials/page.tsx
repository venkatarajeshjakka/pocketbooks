/**
 * Raw Materials Inventory Page
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default async function RawMaterialsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Raw Materials</h2>
          <p className="text-muted-foreground">
            Track raw materials inventory and stock levels
          </p>
        </div>
        <Button asChild>
          <Link href="/inventory/raw-materials/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Raw Material
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raw Materials Inventory</CardTitle>
          <CardDescription>Monitor stock levels and reorder points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Connect to MongoDB to view inventory data.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
