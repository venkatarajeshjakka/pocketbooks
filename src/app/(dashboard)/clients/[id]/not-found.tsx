/**
 * Client Not Found Page
 *
 * Displayed when a client ID doesn't exist
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

export default function ClientNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Client Not Found</h1>
          <p className="mt-2 text-center text-muted-foreground">
            The client you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button asChild className="mt-6">
            <Link href="/clients">Back to Clients</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
