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
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="h-5 w-5 text-[var(--saas-muted)]" />
        <h3 className="text-base font-semibold text-[var(--saas-heading)]">Record Information</h3>
      </div>

      <div className="flex flex-col justify-between justify-items-center gap-8">
        {/* Created */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-[var(--saas-muted)]" />
            <p className="text-xs font-medium text-[var(--saas-muted)] uppercase tracking-wide">Created</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-[var(--saas-body)] cursor-help">
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
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-[var(--saas-muted)]" />
            <p className="text-xs font-medium text-[var(--saas-muted)] uppercase tracking-wide">Last Updated</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-[var(--saas-body)] cursor-help">
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
