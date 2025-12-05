/**
 * Clients List Page
 *
 * Displays all clients with search, filter, and CRUD operations
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default async function ClientsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client database and relationships
          </p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            View and manage all your business clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Connect to MongoDB to view clients data.</p>
            <p className="text-sm mt-2">
              Configure your .env file with MONGODB_URI to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
