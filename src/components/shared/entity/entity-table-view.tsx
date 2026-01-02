/**
 * EntityTableView Component
 * Generic table view for displaying entities (clients/vendors) with sorting and selection
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IClient, IVendor, IAsset } from "@/types";
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

export type EntityType = IClient | IVendor | IAsset;

export interface EntityTableViewProps<T extends EntityType> {
  entities: T[];
  entityType: 'client' | 'vendor' | 'asset';
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
        className="overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  {onToggleAll && (
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={onToggleAll}
                      aria-label={`Select all ${entityType}s`}
                    />
                  )}
                </TableHead>
                {columns ? (
                  columns.map((col, i) => (
                    <TableHead key={i} className={i === columns.length - 1 ? "text-right" : ""}>{col.header}</TableHead>
                  ))
                ) : (
                  <>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">{balanceLabel}</TableHead>
                  </>
                )}
                {onEdit && <TableHead className="hidden xl:table-cell">Last Updated</TableHead>}
                <TableHead className="w-12"></TableHead>
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
                      "group border-b border-border/50 transition-colors hover:bg-muted/30",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    {/* Selection Checkbox */}
                    <TableCell>
                      {onToggleSelection && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelection(entityId)}
                          aria-label={`Select ${entity.name}`}
                        />
                      )}
                    </TableCell>

                    {columns ? (
                      columns.map((col, i) => (
                        <TableCell key={i} className={i === columns.length - 1 ? "text-right" : ""}>
                          {col.cell ? col.cell(entity) : (entity as any)[col.accessorKey || ""]}
                        </TableCell>
                      ))
                    ) : (
                      <>
                        {/* Default view */}
                        <TableCell>
                          <Link
                            href={`${basePath}/${entityId}`}
                            className="flex items-center gap-3 transition-colors hover:text-primary"
                          >
                            <div>
                              <div className="font-medium">{entity.name}</div>
                              {(entity as any).contactPerson && (
                                <div className="text-sm text-muted-foreground">
                                  {(entity as any).contactPerson}
                                </div>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{(entity as any).email || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{(entity as any).phone || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={entity.status === "active" ? "default" : "secondary"}
                            className={cn(
                              "text-xs capitalize transition-colors duration-200",
                              entity.status === "active"
                                ? "bg-success/10 text-success hover:bg-success/20 border-success/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 border-border"
                            )}
                          >
                            {entity.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{balance.toLocaleString("en-IN")}</TableCell>
                      </>
                    )}

                    {/* Last Updated */}
                    {onEdit && (
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(entity.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </TableCell>
                    )}

                    {/* Actions */}
                    <TableCell>
                      {onEdit && onDelete && (
                        <EntityActionsMenu
                          entityId={entityId}
                          entityType={entityType}
                          basePath={basePath}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      )}
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
