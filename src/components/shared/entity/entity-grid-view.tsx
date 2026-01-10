/**
 * EntityGridView Component
 * Generic grid view for displaying entities (clients/vendors) in a card layout
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, IndianRupee } from "lucide-react";
import { IClient, IVendor, IAsset, IPayment, IExpense, ILoanAccount, IInterestPayment } from "@/types";
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

export type EntityType = IClient | IVendor | IAsset | IPayment | IExpense | ILoanAccount | IInterestPayment;

export interface EntityGridViewProps<T extends EntityType> {
  entities: T[];
  entityType: 'client' | 'vendor' | 'asset' | 'payment' | 'expense' | 'loan' | 'interest-payment';
  selectedEntities?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  basePath?: string;
  renderCardContent?: (entity: T) => React.ReactNode;
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
  selectedEntities = new Set(),
  onToggleSelection,
  onEdit,
  onDelete,
  basePath = "",
  renderCardContent,
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

          let balance = 0;
          if (isClient(entity)) balance = entity.outstandingBalance;
          else if (isVendor(entity)) balance = entity.outstandingPayable;

          return (
            <motion.div key={entityId} variants={fadeInUp} className="relative">
              <GradientCard
                className={cn(
                  "group h-full transition-all duration-300",
                  isSelected &&
                  "ring-2 ring-primary ring-offset-4 ring-offset-background"
                )}
              >
                <div className="p-6">
                  {/* Header with selection and actions */}
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {onToggleSelection && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelection(entityId)}
                          aria-label={`Select ${(entity as any).name || (entity as any).notes || 'Payment'}`}
                          className="h-5 w-5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200"
                        />
                      )}
                      {!renderCardContent && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300",
                            (entity as any).status === "active"
                              ? "bg-success/10 text-success border-success/20 group-hover:bg-success/20"
                              : "bg-muted/50 text-muted-foreground border-border/50"
                          )}
                        >
                          {(entity as any).status}
                        </Badge>
                      )}
                    </div>

                    {onDelete && (
                      <EntityActionsMenu
                        entityId={entityId}
                        entityType={entityType}
                        basePath={basePath}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    )}
                  </div>

                  {renderCardContent ? (
                    renderCardContent(entity)
                  ) : (
                    <>
                      {/* Entity Name and Info */}
                      <Link
                        href={`${basePath}/${entityId}`}
                        className="group/link block mb-4"
                      >
                        <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover/link:text-primary mb-1">
                          {(entity as any).name || (entity as any).notes || 'Payment'}
                        </h3>
                        {(entity as any).contactPerson && (
                          <p className="text-xs font-medium text-muted-foreground/60 transition-colors group-hover/link:text-muted-foreground">
                            {(entity as any).contactPerson}
                          </p>
                        )}
                      </Link>

                      <div className="space-y-3 mb-6">
                        {(entity as any).email && (
                          <div className="flex items-center gap-2.5 text-muted-foreground/70">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/50">
                              <Mail className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-semibold truncate">{(entity as any).email}</span>
                          </div>
                        )}
                      </div>

                      {/* Balance section for Client/Vendor */}
                      {(isClient(entity) || isVendor(entity)) && (
                        <div className="mt-auto flex items-end justify-between border-t border-border/10 pt-5">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                              {balanceLabel}
                            </span>
                            <div className="flex items-center text-foreground/90">
                              <span className="text-sm font-bold opacity-60 mr-0.5">{'\u20B9'}</span>
                              <span className={cn(
                                "text-lg font-black tracking-tight",
                                balance > 0
                                  ? entityType === 'client' ? "text-warning" : "text-destructive"
                                  : "text-success"
                              )}>
                                {balance.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          <div className="h-2 w-2 rounded-full bg-primary/20" />
                        </div>
                      )}
                    </>
                  )}

                  {/* Last Updated */}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                      Sync {formatDistanceToNow(new Date(entity.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </GradientCard>
            </motion.div>
          );
        })}
      </motion.div>
    </TooltipProvider>
  );
}
