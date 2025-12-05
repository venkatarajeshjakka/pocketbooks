/**
 * Client Details Component
 *
 * Displays comprehensive client information
 */

import { IClient, EntityStatus } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  DollarSign,
  User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ClientDetailsProps {
  client: IClient;
}

export function ClientDetails({ client }: ClientDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{client.name}</CardTitle>
              <CardDescription>
                Client since {new Date(client.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge
              variant={
                client.status === EntityStatus.ACTIVE ? 'default' : 'secondary'
              }
            >
              {client.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <dt className="text-sm font-medium">Email</dt>
                <dd className="text-sm text-muted-foreground">
                  <a
                    href={`mailto:${client.email}`}
                    className="hover:underline"
                  >
                    {client.email}
                  </a>
                </dd>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <dt className="text-sm font-medium">Phone</dt>
                <dd className="text-sm text-muted-foreground">
                  {client.phone ? (
                    <a href={`tel:${client.phone}`} className="hover:underline">
                      {client.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
            </div>

            {/* Contact Person */}
            {client.contactPerson && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <dt className="text-sm font-medium">Contact Person</dt>
                  <dd className="text-sm text-muted-foreground">
                    {client.contactPerson}
                  </dd>
                </div>
              </div>
            )}

            {/* GST Number */}
            {client.gstNumber && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <dt className="text-sm font-medium">GST Number</dt>
                  <dd className="text-sm text-muted-foreground font-mono">
                    {client.gstNumber}
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Address Card */}
      {(client.address?.street ||
        client.address?.city ||
        client.address?.state ||
        client.address?.postalCode) && (
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <address className="not-italic text-sm text-muted-foreground">
                {client.address.street && (
                  <>
                    {client.address.street}
                    <br />
                  </>
                )}
                {client.address.city && `${client.address.city}, `}
                {client.address.state && `${client.address.state} `}
                {client.address.postalCode && client.address.postalCode}
                <br />
                {client.address.country || 'India'}
              </address>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Outstanding balance and transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                  <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Outstanding Balance</p>
                  <p className="text-xs text-muted-foreground">
                    Amount pending from client
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ₹{client.outstandingBalance.toLocaleString('en-IN')}
                </p>
                {client.outstandingBalance > 0 && (
                  <p className="text-xs text-orange-600">Payment pending</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <dt className="text-sm font-medium">Created</dt>
                <dd className="text-sm text-muted-foreground">
                  {new Date(client.createdAt).toLocaleString()} (
                  {formatDistanceToNow(new Date(client.createdAt), {
                    addSuffix: true,
                  })}
                  )
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <dt className="text-sm font-medium">Last Updated</dt>
                <dd className="text-sm text-muted-foreground">
                  {new Date(client.updatedAt).toLocaleString()} (
                  {formatDistanceToNow(new Date(client.updatedAt), {
                    addSuffix: true,
                  })}
                  )
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Sales History - Placeholder for future implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>Recent transactions with this client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Sales history will be displayed here once the sales feature is
              implemented.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
