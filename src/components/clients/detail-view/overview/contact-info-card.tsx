'use client';

import { useState } from 'react';
import { Mail, Phone,User, FileText,ExternalLink,Copy, Check } from 'lucide-react';
import { IClient } from '@/types';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ContactInfoCardProps {
  client: IClient;
}

export function ContactInfoCard({ client }: ContactInfoCardProps) {
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
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <Mail className="h-5 w-5 text-gray" />
        <h3 className="text-base font-semibold text-gray">Contact Information</h3>
      </div>

      <div className="space-y-6">
        {/* Email */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-gray" />
              <p className="text-xs font-medium text-[var(--saas-muted)] uppercase tracking-wide">Email</p>
            </div>
            <a
              href={`mailto:${client.email}`}
              className="text-sm text-[var(--saas-body)] hover:text-[var(--saas-accent)] transition-colors block truncate"
            >
              {client.email}
            </a>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => copyToClipboard(client.email, 'Email')}
                className="p-1.5 rounded-md hover:bg-[var(--saas-canvas)] transition-colors mt-5"
              >
                {copiedField === 'Email' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-[var(--saas-muted)]" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>Copy email</TooltipContent>
          </Tooltip>
        </div>
         {/* Phone */}
        {client.phone && (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="saas-label mb-1">Phone</p>
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-2 text-sm text-[var(--saas-body)] hover:text-[var(--saas-accent)] transition-colors group"
              >
                <Phone className="h-4 w-4 text-[var(--saas-muted)] group-hover:text-[var(--saas-accent)]" />
                <span>+91 {client.phone}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyToClipboard(client.phone!, 'Phone')}
                  className="p-1.5 rounded-md hover:bg-[var(--saas-canvas)] transition-colors"
                >
                  {copiedField === 'Phone' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-[var(--saas-muted)]" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Copy phone</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Contact Person */}
        {client.contactPerson && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-[var(--saas-muted)]" />
              <p className="text-xs font-medium text-[var(--saas-muted)] uppercase tracking-wide">Contact Person</p>
            </div>
            <p className="text-sm text-[var(--saas-body)]">{client.contactPerson}</p>
          </div>
        )}
         {/* GST Number */}
        {client.gstNumber && (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="saas-label mb-1">GST Number</p>
              <div className="flex items-center gap-2 text-sm font-mono text-[var(--saas-body)]">
                <FileText className="h-4 w-4 text-[var(--saas-muted)]" />
                <span>{client.gstNumber}</span>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyToClipboard(client.gstNumber!, 'GST Number')}
                  className="p-1.5 rounded-md hover:bg-[var(--saas-canvas)] transition-colors"
                >
                  {copiedField === 'GST Number' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-[var(--saas-muted)]" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Copy GST number</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
