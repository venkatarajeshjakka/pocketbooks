"use client";

import { useState } from "react";
import { MapPin, Copy, Check } from "lucide-react";
import { IClient } from "@/types";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddressCardProps {
  client: IClient;
}

export function AddressCard({ client }: AddressCardProps) {
  const [copied, setCopied] = useState(false);

  const fullAddress = [
    client.address?.street,
    client.address?.city,
    client.address?.state,
    client.address?.postalCode,
    client.address?.country || "India",
  ]
    .filter(Boolean)
    .join(", ");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[var(--saas-muted)]" />
          <h3 className="text-base font-semibold text-[var(--saas-heading)]">Address</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-md hover:bg-[var(--saas-canvas)] transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-[var(--saas-muted)]" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>Copy address</TooltipContent>
        </Tooltip>
      </div>

      <address className="not-italic text-sm text-[var(--saas-body)] leading-relaxed">
        {client.address?.street && <p>{client.address.street}</p>}
        <p>
          {[client.address?.city, client.address?.state]
            .filter(Boolean)
            .join(", ")}
          {client.address?.postalCode && ` - ${client.address.postalCode}`}
        </p>
        <p className="text-[var(--saas-muted)] mt-1">
          {client.address?.country || "India"}
        </p>
      </address>
    </div>
  );
}
