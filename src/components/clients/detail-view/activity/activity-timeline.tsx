'use client';

import { Clock, Edit, Plus } from 'lucide-react';
import { IClient } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTabProps {
  client: IClient;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'sale' | 'payment';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

export function ActivityTimeline({ client }: ActivityTabProps) {
  // Build timeline events from client data
  const events: TimelineEvent[] = [
    {
      id: 'created',
      type: 'created',
      title: 'Client created',
      description: `${client.name} was added to the system`,
      timestamp: new Date(client.createdAt),
      icon: Plus,
      iconBg: 'bg-green-100 dark:bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  ];

  // Add update event if different from creation
  if (new Date(client.updatedAt).getTime() !== new Date(client.createdAt).getTime()) {
    events.unshift({
      id: 'updated',
      type: 'updated',
      title: 'Client updated',
      description: 'Client information was modified',
      timestamp: new Date(client.updatedAt),
      icon: Edit,
      iconBg: 'bg-blue-100 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    });
  }

  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-3 sm:gap-4 pb-6 last:pb-0">
          {/* Connecting Line */}
          {index < events.length - 1 && (
            <div className="absolute left-4 top-10 bottom-0 w-px bg-border" />
          )}

          {/* Icon */}
          <div
            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${event.iconBg}`}
          >
            <event.icon className={`h-4 w-4 ${event.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium text-foreground">
              {event.title}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {event.description}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(event.timestamp, { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
