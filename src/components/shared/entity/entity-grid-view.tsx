/**
 * EntityGridView Component
 * Generic grid view for displaying entities (clients/vendors) in a card layout
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, IndianRupee } from "lucide-react";
import { IClient, IVendor, IAsset, IPayment, IExpense, ILoanAccount, IInterestPayment, IRawMaterialProcurement, ITradingGoodsProcurement, IRawMaterial, ITradingGood, IFinishedGood, ISale } from "@/types";
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

export type EntityType = IClient | IVendor | IAsset | IPayment | IExpense | ILoanAccount | IInterestPayment | IRawMaterialProcurement | ITradingGoodsProcurement | IRawMaterial | ITradingGood | IFinishedGood | ISale;

export interface EntityGridViewProps<T extends EntityType> {
  entities: T[];
  entityType: 'client' | 'vendor' | 'asset' | 'payment' | 'expense' | 'loan' | 'interest-payment' | 'procurement' | 'trading_good_procurement' | 'raw-material' | 'trading-good' | 'finished-good' | 'sale';
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
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                interactive
                className={cn(
                  "group h-full border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5",
                  isSelected && "ring-2 ring-primary ring-offset-4 ring-offset-background"
                )}
              >
                <div className="p-6">
                  {/* Header with selection and actions */}
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {onToggleSelection && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelection(entityId)}
                          className="h-5 w-5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary transition-all duration-300"
                        />
                      )}
                      {!renderCardContent && (
                        <Badge
                          className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border-0",
                            (entity as any).status === "active"
                              ? "bg-success/10 text-success shadow-[0_0_12px_-2px_rgba(34,197,94,0.3)]"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {(entity as any).status}
                        </Badge>
                      )}
                    </div>

                    <EntityActionsMenu
                      entityId={entityId}
                      entityType={entityType}
                      basePath={basePath}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>

                  {renderCardContent ? (
                    renderCardContent(entity)
                  ) : (
                    <>
                      {/* Name and Basic Info */}
                      <Link
                        href={`${basePath}/${entityId}`}
                        className="group/link block mb-5"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20 group-hover/link:scale-110 transition-transform">
                            {((entity as any).name?.[0] || 'E').toUpperCase()}
                          </div>
                          <h3 className="text-lg font-bold tracking-tight text-foreground transition-all duration-300 group-hover/link:text-primary">
                            {(entity as any).name || (entity as any).notes || 'Payment'}
                          </h3>
                        </div>
                        {(entity as any).contactPerson && (
                          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.1em] ml-13">
                            {(entity as any).contactPerson}
                          </p>
                        )}
                      </Link>

                      {/* Contact Channels */}
                      <div className="space-y-3 mb-8">
                        {(entity as any).email && (
                          <div className="flex items-center gap-3 text-muted-foreground/80 group-hover:text-foreground/90 transition-colors">
                            <Mail className="h-3.5 w-3.5 text-primary/40" />
                            <span className="text-xs font-medium truncate">{(entity as any).email}</span>
                          </div>
                        )}
                        {(entity as any).phone && (
                          <div className="flex items-center gap-3 text-muted-foreground/80 group-hover:text-foreground/90 transition-colors">
                            <Phone className="h-3.5 w-3.5 text-primary/40" />
                            <span className="text-xs font-medium truncate">{(entity as any).phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Financial Status */}
                      {(isClient(entity) || isVendor(entity)) && (
                        <div className="mt-auto pt-5 border-t border-border/10">
                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                                {balanceLabel}
                              </span>
                              <div className="flex items-baseline text-foreground">
                                <span className="text-xs font-black opacity-40 mr-1">₹</span>
                                <span className={cn(
                                  "text-2xl font-black tracking-tighter",
                                  balance > 0
                                    ? entityType === 'client' ? "text-warning" : "text-destructive"
                                    : "text-success"
                                )}>
                                  {balance.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full animate-pulse",
                              balance > 0 ? "bg-warning" : "bg-success"
                            )} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer Sync Status */}
                <div className="px-6 py-3 bg-muted/20 border-t border-border/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
                    Sync • {formatDistanceToNow(new Date(entity.updatedAt), { addSuffix: true })}
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
