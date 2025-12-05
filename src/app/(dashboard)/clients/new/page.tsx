/**
 * New Client Page
 *
 * Form to create a new client
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
import { ArrowLeft } from 'lucide-react';

export default function NewClientPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Client</h2>
          <p className="text-muted-foreground">
            Enter client details to create a new record
          </p>
        </div>
      </div>

      {/* Client Form */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>
            Fill in the details below to add a new client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Client form component will be implemented here.</p>
            <p className="text-sm mt-2">
              This will include fields for name, email, phone, address, GST number, etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
