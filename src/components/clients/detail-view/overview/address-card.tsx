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
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">Address</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-md hover:bg-muted transition-colors duration-200"
            >
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>Copy address</TooltipContent>
        </Tooltip>
      </div>

      <address className="not-italic text-sm text-foreground leading-relaxed space-y-1">
        {client.address?.street && <p>{client.address.street}</p>}
        <p>
          {[client.address?.city, client.address?.state]
            .filter(Boolean)
            .join(", ")}
          {client.address?.postalCode && ` - ${client.address.postalCode}`}
        </p>
        <p className="text-muted-foreground">
          {client.address?.country || "India"}
        </p>
      </address>
    </div>
  );
}
