/**
 * Enhanced Client Details Component
 *
 * Professional display of comprehensive client information with:
 * - Large avatar with client initials
 * - Tabbed interface for different information sections
 * - Interactive elements (tooltips, hover cards, copy buttons)
 * - Modern shadcn/ui components with animations
 * - Quick action buttons
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IClient, EntityStatus } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  DollarSign,
  User,
  ExternalLink,
  TrendingUp,
  Clock,
  Activity,
  Building2,
  CreditCard,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/utils/animation-variants';
import { toast } from 'sonner';
import { CopyButton } from './ui/copy-button';

interface ClientDetailsProps {
  client: IClient;
}

// Helper functions matching list view patterns
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-accent',
    'bg-primary/80',
    'bg-secondary/80',
    'bg-accent/80',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export function ClientDetailsEnhanced({ client }: ClientDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard', {
        description: `${field} has been copied`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy', {
        description: 'Could not copy to clipboard',
      });
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header Card with Avatar */}
        <motion.div variants={fadeInUp}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                {/* Left: Avatar and Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                    <AvatarFallback
                      className={cn('text-white text-2xl font-bold', getAvatarColor(client.name))}
                    >
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{client.name}</h2>
                      <Badge
                        variant={client.status === EntityStatus.ACTIVE ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {client.status}
                      </Badge>
                    </div>
                    {client.contactPerson && (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {client.contactPerson}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Client since {new Date(client.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${client.email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send email to {client.name}</p>
                    </TooltipContent>
                  </Tooltip>

                  {client.phone && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${client.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Call {client.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Outstanding Balance Banner */}
              {client.outstandingBalance > 0 && (
                <div className="mt-6">
                  <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-warning/20 p-2">
                          <TrendingUp className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Outstanding Balance
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Amount pending from client
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-warning">
                          ₹{client.outstandingBalance.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabbed Content */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Contact Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {/* Email */}
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="flex items-center justify-between">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <a
                              href={`mailto:${client.email}`}
                              className="flex items-center gap-2 text-sm hover:underline"
                            >
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {client.email}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-sm">Click to send email to {client.name}</p>
                          </HoverCardContent>
                        </HoverCard>
                        <CopyButton
                          text={client.email}
                          field="Email"
                          isCopied={copiedField === 'Email'}
                          onCopy={copyToClipboard}
                        />
                      </dd>
                    </div>

                    {/* Phone */}
                    {client.phone && (
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                        <dd className="flex items-center justify-between">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <a
                                href={`tel:${client.phone}`}
                                className="flex items-center gap-2 text-sm hover:underline"
                              >
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                +91 {client.phone}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">Click to call {client.name}</p>
                            </HoverCardContent>
                          </HoverCard>
                          <CopyButton
                            text={client.phone}
                            field="Phone"
                            isCopied={copiedField === 'Phone'}
                            onCopy={copyToClipboard}
                          />
                        </dd>
                      </div>
                    )}

                    {/* Contact Person */}
                    {client.contactPerson && (
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-muted-foreground">Contact Person</dt>
                        <dd className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {client.contactPerson}
                        </dd>
                      </div>
                    )}

                    {/* GST Number */}
                    {client.gstNumber && (
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-muted-foreground">GST Number</dt>
                        <dd className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-mono text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {client.gstNumber}
                          </span>
                          <CopyButton
                            text={client.gstNumber}
                            field="GST Number"
                            isCopied={copiedField === 'GST Number'}
                            onCopy={copyToClipboard}
                          />
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              {/* Address */}
              {(client.address?.street ||
                client.address?.city ||
                client.address?.state ||
                client.address?.postalCode) && (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <address className="not-italic text-sm">
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
                      <CopyButton
                        text={`${client.address.street || ''}, ${client.address.city || ''}, ${client.address.state || ''} ${client.address.postalCode || ''}, ${client.address.country || 'India'}`}
                        field="Address"
                        isCopied={copiedField === 'Address'}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Record Information */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Record Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                      <dd className="text-sm">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDistanceToNow(new Date(client.createdAt), {
                                addSuffix: true,
                              })}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{new Date(client.createdAt).toLocaleString('en-IN')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </dd>
                    </div>

                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                      <dd className="text-sm">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-help">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDistanceToNow(new Date(client.updatedAt), {
                                addSuffix: true,
                              })}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{new Date(client.updatedAt).toLocaleString('en-IN')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-4">
              {/* Financial Summary */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>Outstanding balance and payment overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Outstanding Balance Card */}
                    <div className="rounded-lg border p-4 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "rounded-full p-3",
                            client.outstandingBalance > 0
                              ? "bg-warning/10"
                              : "bg-success/10"
                          )}>
                            <DollarSign className={cn(
                              "h-6 w-6",
                              client.outstandingBalance > 0
                                ? "text-warning"
                                : "text-success"
                            )} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Outstanding Balance</p>
                            <p className="text-xs text-muted-foreground">
                              {client.outstandingBalance > 0
                                ? 'Amount pending from client'
                                : 'All payments settled'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-3xl font-bold",
                            client.outstandingBalance > 0
                              ? "text-warning"
                              : "text-success"
                          )}>
                            ₹{client.outstandingBalance.toLocaleString('en-IN')}
                          </p>
                          {client.outstandingBalance > 0 && (
                            <Badge variant="outline" className="mt-1 text-warning border-warning/30">
                              Payment pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Placeholder for future features */}
                    <div className="rounded-lg border border-dashed p-6 text-center">
                      <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-sm font-medium">Payment History</p>
                      <p className="text-xs text-muted-foreground">
                        Payment history and transaction details will be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              {/* Sales History */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Sales History</CardTitle>
                  <CardDescription>Recent transactions with this client</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm font-medium">No sales history yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sales transactions will appear here once the sales feature is implemented
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Log */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent changes and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Creation event */}
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-colors duration-200">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Client created</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(client.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Update event */}
                    {client.updatedAt !== client.createdAt && (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-colors duration-200">
                          <Clock className="h-4 w-4 text-secondary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Last updated</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(client.updatedAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
