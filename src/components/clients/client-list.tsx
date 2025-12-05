/**
 * Client List Component
 *
 * Server component that displays the list of clients in a table
 */

import Link from 'next/link';
import { fetchClients } from '@/lib/api/clients';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientListActions } from '@/components/clients/client-list-actions';
import { ClientPagination } from '@/components/clients/client-pagination';
import { EntityStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ClientListProps {
  page: number;
  search: string;
  status: string;
}

export async function ClientList({ page, search, status }: ClientListProps) {
  try {
    const response = await fetchClients({
      page,
      limit: 10,
      search,
      status,
    });

    const { data: clients, pagination } = response;

    if (clients.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium text-muted-foreground">
              No clients found
            </p>
            <p className="text-sm text-muted-foreground">
              {search || status
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first client'}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {pagination.total} Client{pagination.total !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client._id.toString()}>
                      <TableCell>
                        <Link
                          href={`/clients/${client._id}`}
                          className="font-medium hover:underline"
                        >
                          {client.name}
                        </Link>
                        {client.contactPerson && (
                          <p className="text-sm text-muted-foreground">
                            {client.contactPerson}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            client.status === EntityStatus.ACTIVE
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {client.outstandingBalance > 0 ? (
                          <span className="font-medium text-orange-600">
                            ₹{client.outstandingBalance.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">₹0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(client.updatedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <ClientListActions client={client} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {pagination.totalPages > 1 && <ClientPagination pagination={pagination} />}
      </div>
    );
  } catch (error) {
    console.error('Error fetching clients:', error);
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-destructive">
            Failed to load clients
          </p>
          <p className="text-sm text-muted-foreground">
            Please try again later or contact support
          </p>
        </CardContent>
      </Card>
    );
  }
}
