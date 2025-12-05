/**
 * Vendors List Page
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default async function VendorsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
          <p className="text-muted-foreground">
            Manage your vendor relationships and procurement
          </p>
        </div>
        <Button asChild>
          <Link href="/vendors/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vendor
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>View and manage all your business vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Connect to MongoDB to view vendors data.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
