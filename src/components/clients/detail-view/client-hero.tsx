'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Pencil, Mail,Phone } from 'lucide-react';
import { IClient, EntityStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DeleteClientDialog } from '../delete-client-dialog';
import { fadeInUp } from '@/lib/utils/animation-variants';
import { cn } from '@/lib/utils';

interface ClientHeroProps {
  client: IClient;
}

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
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export function ClientHero({ client }: ClientHeroProps) {
  return (
    <motion.div variants={fadeInUp} className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/clients"
          className="flex items-center gap-1 text-[var(--saas-muted)] hover:text-[var(--saas-heading)] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Clients
        </Link>
        <span className="text-[var(--saas-subtle)]">/</span>
        <span className="text-[var(--saas-heading)] font-medium">{client.name}</span>
      </div>

      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Avatar + Name + Badge */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-[var(--saas-border)] shadow-sm">
            <AvatarFallback
              className={cn('text-white text-xl font-semibold', getAvatarColor(client.name))}
            >
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--saas-heading)]">
                {client.name}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium',
                  client.status === EntityStatus.ACTIVE
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                )}
              >
                {client.status}
              </span>
            </div>
            {client.contactPerson && (
              <p className="text-sm text-[var(--saas-muted)]">{client.contactPerson}</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Email button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
                asChild
              >
                <a href={`mailto:${client.email}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send email</TooltipContent>
          </Tooltip>
          {client.phone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  asChild
                >
                  <a href={`tel:${client.phone}`}>
                    <Phone className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Call client</TooltipContent>
            </Tooltip>
          )}

          {/* Edit button */}
          <Tooltip>
             <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
            asChild
          >
            <Link href={`/clients/${String(client._id)}/edit`}>
              <Pencil className="h-4 w-4" />
             
            </Link>
          </Button>
          </TooltipTrigger>
           <TooltipContent>Edit client</TooltipContent>
          </Tooltip>

          {/* Delete button */}
          <DeleteClientDialog clientId={String(client._id)} clientName={client.name} />
        </div>
      </div>
    </motion.div>
  );
}
