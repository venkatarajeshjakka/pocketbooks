/**
 * ClientGridView Component
 * Displays clients in a card grid layout
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Phone, MapPin, IndianRupee, MoreVertical } from 'lucide-react';
import { IClient } from '@/types';
import { GradientCard } from '../ui/gradient-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { staggerContainer, fadeInUp } from '@/lib/utils/animation-variants';
import { cn } from '@/lib/utils';

export interface ClientGridViewProps {
  clients: IClient[];
  selectedClients: Set<string>;
  onToggleSelection: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ClientGridView({
  clients,
  selectedClients,
  onToggleSelection,
  onEdit,
  onDelete,
}: ClientGridViewProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {clients.map((client) => {
        const clientId = client._id.toString();
        const isSelected = selectedClients.has(clientId);

        return (
          <motion.div key={clientId} variants={fadeInUp} className="relative">
            <GradientCard
              className={cn(
                'group transition-all',
                isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              )}
            >
              <div className="p-5">
                {/* Header with selection and actions */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelection(clientId)}
                      aria-label={`Select ${client.name}`}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Badge
                      variant={client.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {client.status}
                    </Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/clients/${clientId}`}>View details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(clientId)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(clientId)}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Client Name */}
                <Link
                  href={`/clients/${clientId}`}
                  className="group/link mb-2 block transition-colors"
                >
                  <h3 className="text-lg font-semibold group-hover/link:text-primary">
                    {client.name}
                  </h3>
                  {client.contactPerson && (
                    <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
                  )}
                </Link>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  {client.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address?.city && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {client.address.city}
                        {client.address.state && `, ${client.address.state}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Outstanding Balance */}
                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Outstanding</span>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      client.outstandingBalance > 0
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-muted-foreground'
                    )}
                  >
                    ₹{client.outstandingBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Last Updated */}
                <p className="mt-2 text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(client.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </GradientCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
