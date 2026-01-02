"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  User,
  FileText,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { IClient } from "@/types";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContactInfoCardProps {
  client: IClient;
}

export function ContactInfoCard({ client }: ContactInfoCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard", {
        description: `${field} has been copied`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">
          Contact Information
        </h3>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Email */}
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Email
              </p>
            </div>
            <a
              href={`mailto:${client.email}`}
              className="text-sm text-foreground hover:text-primary transition-colors block truncate"
            >
              {client.email}
            </a>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => copyToClipboard(client.email, "Email")}
                className="p-1.5 rounded-md hover:bg-muted transition-colors duration-200 mt-4"
              >
                {copiedField === "Email" ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>Copy email</TooltipContent>
          </Tooltip>
        </div>

        {/* Phone */}
        {client.phone && (
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Phone
                </p>
              </div>
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group"
              >
                <span>+91 {client.phone}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyToClipboard(client.phone!, "Phone")}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors duration-200"
                >
                  {copiedField === "Phone" ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
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
            <div className="flex items-center gap-2 mb-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Contact Person
              </p>
            </div>
            <p className="text-sm text-foreground">{client.contactPerson}</p>
          </div>
        )}

        {/* GST Number */}
        {client.gstNumber && (
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  GST Number
                </p>
              </div>
              <p className="text-sm font-mono text-foreground">
                {client.gstNumber}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() =>
                    copyToClipboard(client.gstNumber!, "GST Number")
                  }
                  className="p-1.5 rounded-md hover:bg-muted transition-colors duration-200"
                >
                  {copiedField === "GST Number" ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
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
