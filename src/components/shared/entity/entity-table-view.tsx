/**
 * EntityTableView Component
 * Generic table view for displaying entities (clients/vendors) with sorting and selection
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IClient, IVendor } from "@/types";
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

export type EntityType = IClient | IVendor;

export interface EntityTableViewProps<T extends EntityType> {
  entities: T[];
  entityType: 'client' | 'vendor';
  selectedEntities: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  isAllSelected: boolean;
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

export function EntityTableView<T extends EntityType>({
  entities,
  entityType,
  selectedEntities,
  onToggleSelection,
  onToggleAll,
  isAllSelected,
  onEdit,
  onDelete,
  basePath,
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
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onToggleAll}
                    aria-label={`Select all ${entityType}s`}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">{balanceLabel}</TableHead>
                <TableHead className="hidden xl:table-cell">
                  Last Updated
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map((entity, index) => {
                const entityId = entity._id.toString();
                const isSelected = selectedEntities.has(entityId);
                const balance = isClient(entity)
                  ? entity.outstandingBalance
                  : isVendor(entity)
                    ? entity.outstandingPayable
                    : 0;

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
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection(entityId)}
                        aria-label={`Select ${entity.name}`}
                      />
                    </TableCell>

                    {/* Name with Contact Person */}
                    <TableCell>
                      <Link
                        href={`${basePath}/${entityId}`}
                        className="flex items-center gap-3 transition-colors hover:text-primary"
                      >
                        <div>
                          <div className="font-medium">{entity.name}</div>
                          {entity.contactPerson && (
                            <div className="text-sm text-muted-foreground">
                              {entity.contactPerson}
                            </div>
                          )}
                        </div>
                      </Link>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="hidden md:table-cell">
                      <a
                        href={`mailto:${entity.email}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {entity.email}
                      </a>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="hidden lg:table-cell">
                      {entity.phone ? (
                        <a
                          href={`tel:${entity.phone}`}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {entity.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground/40">
                          -
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
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
                    </TableCell>

                    {/* Outstanding Balance / Payable */}
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-1.5">
                            {balance > 0 && (
                              entityType === 'client'
                                ? <TrendingUp className="h-3.5 w-3.5 text-warning" />
                                : <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                            )}
                            <span
                              className={cn(
                                "text-sm font-medium transition-colors duration-200",
                                balance > 0
                                  ? entityType === 'client' ? "text-warning" : "text-destructive"
                                  : "text-success"
                              )}
                            >
                              {'\u20B9'}
                              {balance.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {balance > 0
                              ? entityType === 'client'
                                ? `Outstanding amount to be collected`
                                : `Amount payable to vendor`
                              : `No outstanding ${entityType === 'client' ? 'balance' : 'payable'}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Last Updated */}
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(entity.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
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
