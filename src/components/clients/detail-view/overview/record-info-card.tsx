'use client';

import { Clock, Calendar } from 'lucide-react';
import { IClient } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RecordInfoCardProps {
  client: IClient;
}

export function RecordInfoCard({ client }: RecordInfoCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">Record Information</h3>
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
        {/* Created */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-foreground cursor-help">
                {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true })}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              {new Date(client.createdAt).toLocaleString('en-IN', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Last Updated */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Updated</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-foreground cursor-help">
                {formatDistanceToNow(new Date(client.updatedAt), { addSuffix: true })}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              {new Date(client.updatedAt).toLocaleString('en-IN', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
