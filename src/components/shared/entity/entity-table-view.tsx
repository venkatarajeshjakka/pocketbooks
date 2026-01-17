/**
 * EntityTableView Component
 * Generic table view for displaying entities (clients/vendors) with sorting and selection
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IClient, IVendor, IAsset, IPayment, IExpense, ILoanAccount, IInterestPayment, IRawMaterialProcurement, ITradingGoodsProcurement, IRawMaterial, ITradingGood, IFinishedGood } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fadeInUp, listItem } from "@/lib/utils/animation-variants";
import { cn } from "@/lib/utils";
import { EntityActionsMenu } from "./entity-actions-menu";

export type EntityType = IClient | IVendor | IAsset | IPayment | IExpense | ILoanAccount | IInterestPayment | IRawMaterialProcurement | ITradingGoodsProcurement | IRawMaterial | ITradingGood | IFinishedGood;

export interface EntityTableViewProps<T extends EntityType> {
  entities: T[];
  entityType: 'client' | 'vendor' | 'asset' | 'payment' | 'expense' | 'loan' | 'interest-payment' | 'procurement' | 'trading_good_procurement' | 'raw-material' | 'trading-good' | 'finished-good';
  selectedEntities?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onToggleAll?: () => void;
  isAllSelected?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  basePath?: string;
  columns?: Array<{
    header: string;
    accessorKey?: string;
    cell?: (entity: T) => React.ReactNode;
  }>;
}

// Type guard to check if entity is a client
function isClient(entity: EntityType): entity is IClient {
  return 'outstandingBalance' in entity;
}

// Type guard to check if entity is a vendor
function isVendor(entity: EntityType): entity is IVendor {
  return 'outstandingPayable' in entity;
}

export function EntityTableView<T extends EntityType>({
  entities,
  entityType,
  selectedEntities = new Set(),
  onToggleSelection,
  onToggleAll,
  isAllSelected = false,
  onEdit,
  onDelete,
  basePath = "",
  columns,
}: EntityTableViewProps<T>) {
  const balanceLabel = entityType === 'client' ? 'Outstanding' : 'Payable';

  return (
    <TooltipProvider>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-xl shadow-foreground/5"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/20 bg-muted/20">
                <TableHead className="w-12 px-6">
                  {onToggleAll && (
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={onToggleAll}
                      className="rounded-md border-muted-foreground/30"
                    />
                  )}
                </TableHead>
                {columns ? (
                  columns.map((col, i) => (
                    <TableHead key={i} className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 py-5", i === columns.length - 1 ? "text-right" : "")}>
                      {col.header}
                    </TableHead>
                  ))
                ) : (
                  <>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 py-5">Name</TableHead>
                    <TableHead className="hidden md:table-cell text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 py-5">Contact Details</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 py-5">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 py-5 px-6">{balanceLabel}</TableHead>
                  </>
                )}
                <TableHead className="w-12 px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map((entity, index) => {
                const entityId = entity._id.toString();
                const isSelected = selectedEntities.has(entityId);

                let balance = 0;
                if (isClient(entity)) balance = entity.outstandingBalance;
                else if (isVendor(entity)) balance = entity.outstandingPayable;

                return (
                  <motion.tr
                    key={entityId}
                    variants={listItem}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      "group border-b border-border/10 transition-all duration-300 hover:bg-muted/30",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <TableCell className="px-6">
                      {onToggleSelection && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelection(entityId)}
                          className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary"
                        />
                      )}
                    </TableCell>

                    {columns ? (
                      columns.map((col, i) => (
                        <TableCell key={i} className={cn("py-4", i === columns.length - 1 ? "text-right" : "")}>
                          {col.cell ? col.cell(entity) : (entity as any)[col.accessorKey || ""]}
                        </TableCell>
                      ))
                    ) : (
                      <>
                        <TableCell className="py-4">
                          <Link
                            href={`${basePath}/${entityId}`}
                            className="flex items-center gap-3 transition-colors hover:text-primary group/link"
                          >
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20 group-hover/link:scale-110 transition-transform">
                              {((entity as any).name?.[0] || 'E').toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold tracking-tight text-foreground/90">{(entity as any).name || (entity as any).notes || 'Payment'}</div>
                              {(entity as any).contactPerson && (
                                <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-0.5">
                                  {(entity as any).contactPerson}
                                </div>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-muted-foreground/80">{(entity as any).email || "-"}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/40">{(entity as any).phone || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
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
                        </TableCell>
                        <TableCell className="text-right py-4 px-6">
                          <div className="flex flex-col items-end">
                            <span className={cn(
                              "text-base font-black tracking-tighter",
                              balance > 0 ? "text-foreground" : "text-success"
                            )}>
                              ₹{balance.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-tight">Current</span>
                          </div>
                        </TableCell>
                      </>
                    )}

                    <TableCell className="px-6">
                      <EntityActionsMenu
                        entityId={entityId}
                        entityType={entityType}
                        basePath={basePath}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
