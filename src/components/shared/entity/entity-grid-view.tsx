/**
 * EntityGridView Component
 * Generic grid view for displaying entities (clients/vendors) in a card layout
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, IndianRupee } from "lucide-react";
import { IClient, IVendor } from "@/types";
import { GradientCard } from "@/components/shared/ui/gradient-card";
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
import { EntityActionsMenu } from "./entity-actions-menu";

export type EntityType = IClient | IVendor;

export interface EntityGridViewProps<T extends EntityType> {
  entities: T[];
  entityType: 'client' | 'vendor';
  selectedEntities: Set<string>;
  onToggleSelection: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  basePath: string;
}

// Type guard to check if entity is a client
function isClient(entity: EntityType): entity is IClient {
  return 'outstandingBalance' in entity;
}

// Type guard to check if entity is a vendor
function isVendor(entity: EntityType): entity is IVendor {
  return 'outstandingPayable' in entity;
}

export function EntityGridView<T extends EntityType>({
  entities,
  entityType,
  selectedEntities,
  onToggleSelection,
  onEdit,
  onDelete,
  basePath,
}: EntityGridViewProps<T>) {
  const balanceLabel = entityType === 'client' ? 'Outstanding' : 'Payable';

  return (
    <TooltipProvider>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {entities.map((entity) => {
          const entityId = entity._id.toString();
          const isSelected = selectedEntities.has(entityId);
          const balance = isClient(entity)
            ? entity.outstandingBalance
            : isVendor(entity)
              ? entity.outstandingPayable
              : 0;

          return (
            <motion.div key={entityId} variants={fadeInUp} className="relative">
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
                        onCheckedChange={() => onToggleSelection(entityId)}
                        aria-label={`Select ${entity.name}`}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Badge
                        variant={
                          entity.status === "active" ? "default" : "secondary"
                        }
                        className={cn(
                          "text-xs capitalize transition-colors duration-200",
                          entity.status === "active"
                            ? "bg-success/10 text-success hover:bg-success/20 border-success/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 border-border"
                        )}
                      >
                        {entity.status}
                      </Badge>
                    </div>

                    <EntityActionsMenu
                      entityId={entityId}
                      entityType={entityType}
                      basePath={basePath}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>

                  {/* Entity Name and Info */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Link
                        href={`${basePath}/${entityId}`}
                        className="group/link mb-3 flex items-center gap-3 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold group-hover/link:text-primary truncate">
                            {entity.name}
                          </h3>
                          {entity.contactPerson && (
                            <p className="text-sm text-muted-foreground truncate">
                              {entity.contactPerson}
                            </p>
                          )}
                        </div>
                      </Link>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" align="start">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">{entity.name}</h4>
                        {entity.contactPerson && (
                          <p className="text-sm text-muted-foreground">
                            Contact: {entity.contactPerson}
                          </p>
                        )}
                        {isVendor(entity) && entity.specialty && (
                          <p className="text-sm text-muted-foreground">
                            Specialty: {entity.specialty}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge
                            variant={
                              entity.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={cn(
                              "text-xs capitalize transition-colors duration-200",
                              entity.status === "active"
                                ? "bg-success/10 text-success hover:bg-success/20 border-success/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 border-border"
                            )}
                          >
                            {entity.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {balanceLabel}:
                          </span>
                          <span
                            className={cn(
                              "font-semibold",
                              balance > 0
                                ? entityType === 'client' ? "text-warning" : "text-destructive"
                                : "text-success"
                            )}
                          >
                            ₹{balance.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    {entity.email && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`mailto:${entity.email}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{entity.email}</span>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send email to {entity.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {entity.phone && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={`tel:${entity.phone}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{entity.phone}</span>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Call {entity.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {entity.address?.city && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-muted-foreground cursor-help">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {entity.address.city}
                              {entity.address.state &&
                                `, ${entity.address.state}`}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {entity.address.street &&
                              `${entity.address.street}, `}
                            {entity.address.city}
                            {entity.address.state &&
                              `, ${entity.address.state}`}
                            {entity.address.postalCode &&
                              ` - ${entity.address.postalCode}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Balance */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {balanceLabel}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xl font-bold transition-colors duration-200",
                        balance > 0
                          ? entityType === 'client' ? "text-warning" : "text-destructive"
                          : "text-success"
                      )}
                    >
                      {'\u20B9'}{balance.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <p className="mt-3 text-[10px] text-muted-foreground/60">
                    Updated{" "}
                    {formatDistanceToNow(new Date(entity.updatedAt), {
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
