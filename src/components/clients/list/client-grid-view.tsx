/**
 * ClientGridView Component
 * Displays clients in a card grid layout
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, IndianRupee } from "lucide-react";
import { IClient } from "@/types";
import { GradientCard } from "../ui/gradient-card";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { staggerContainer, fadeInUp } from "@/lib/utils/animation-variants";
import { cn } from "@/lib/utils";
import { ClientActionsMenu } from "./client-actions-menu";

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
    <TooltipProvider>
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
                  "group transition-all hover:shadow-xl",
                  isSelected &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background"
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
                        variant={
                          client.status === "active" ? "default" : "secondary"
                        }
                        className={cn(
                          "text-xs capitalize transition-colors duration-200",
                          client.status === "active"
                            ? "bg-success/10 text-success hover:bg-success/20 border-success/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 border-border"
                        )}
                      >
                        {client.status}
                      </Badge>
                    </div>

                    <ClientActionsMenu
                      clientId={clientId}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>

                  {/* Client Avatar and Name */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Link
                        href={`/clients/${clientId}`}
                        className="group/link mb-3 flex items-center gap-3 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold group-hover/link:text-primary truncate">
                            {client.name}
                          </h3>
                          {client.contactPerson && (
                            <p className="text-sm text-muted-foreground truncate">
                              {client.contactPerson}
                            </p>
                          )}
                        </div>
                      </Link>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" align="start">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{client.name}</h4>
                        {client.contactPerson && (
                          <p className="text-sm text-muted-foreground">
                            Contact: {client.contactPerson}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge
                            variant={
                              client.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={cn(
                              "text-xs capitalize transition-colors duration-200",
                              client.status === "active"
                                ? "bg-success/10 text-success hover:bg-success/20 border-success/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 border-border"
                            )}
                          >
                            {client.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Outstanding:
                          </span>
                          <span
                            className={cn(
                              "font-semibold",
                              client.outstandingBalance > 0
                                ? "text-warning"
                                : "text-success"
                            )}
                          >
                            ₹{client.outstandingBalance.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {client.email && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`mailto:${client.email}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send email to {client.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {client.phone && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`tel:${client.phone}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{client.phone}</span>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Call {client.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {client.address?.city && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-muted-foreground cursor-help">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {client.address.city}
                              {client.address.state &&
                                `, ${client.address.state}`}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {client.address.street &&
                              `${client.address.street}, `}
                            {client.address.city}
                            {client.address.state &&
                              `, ${client.address.state}`}
                            {client.address.postalCode &&
                              ` - ${client.address.postalCode}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Outstanding Balance */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Outstanding
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xl font-bold transition-colors duration-200",
                        client.outstandingBalance > 0
                          ? "text-warning"
                          : "text-success"
                      )}
                    >
                      ₹{client.outstandingBalance.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <p className="mt-3 text-[10px] text-muted-foreground/60">
                    Updated{" "}
                    {formatDistanceToNow(new Date(client.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </GradientCard>
            </motion.div>
          );
        })}
      </motion.div>
    </TooltipProvider>
  );
}
