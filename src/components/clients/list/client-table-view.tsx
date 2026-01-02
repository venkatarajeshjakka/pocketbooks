/**
 * ClientTableView Component
 * Displays clients in a table layout with sorting and selection
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IClient } from "@/types";
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
import { TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fadeInUp, listItem } from "@/lib/utils/animation-variants";
import { cn } from "@/lib/utils";
import { ClientActionsMenu } from "./client-actions-menu";

export interface ClientTableViewProps {
  clients: IClient[];
  selectedClients: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleAll: () => void;
  isAllSelected: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ClientTableView({
  clients,
  selectedClients,
  onToggleSelection,
  onToggleAll,
  isAllSelected,
  onEdit,
  onDelete,
}: ClientTableViewProps) {
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
                    aria-label="Select all clients"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="hidden xl:table-cell">
                  Last Updated
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client, index) => {
                const clientId = client._id.toString();
                const isSelected = selectedClients.has(clientId);

                return (
                  <motion.tr
                    key={clientId}
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
                        onCheckedChange={() => onToggleSelection(clientId)}
                        aria-label={`Select ${client.name}`}
                      />
                    </TableCell>

                    {/* Name with Avatar */}
                    <TableCell>
                      <Link
                        href={`/clients/${clientId}`}
                        className="flex items-center gap-3 transition-colors hover:text-primary"
                      >
                        <div>
                          <div className="font-medium">{client.name}</div>
                          {client.contactPerson && (
                            <div className="text-sm text-muted-foreground">
                              {client.contactPerson}
                            </div>
                          )}
                        </div>
                      </Link>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="hidden md:table-cell">
                      <a
                        href={`mailto:${client.email}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {client.email}
                      </a>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="hidden lg:table-cell">
                      {client.phone ? (
                        <a
                          href={`tel:${client.phone}`}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {client.phone}
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
                    </TableCell>

                    {/* Outstanding Balance */}
                    <TableCell className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-1.5">
                            {client.outstandingBalance > 0 && (
                              <TrendingUp className="h-3.5 w-3.5 text-warning" />
                            )}
                            <span
                              className={cn(
                                "text-sm font-medium transition-colors duration-200",
                                client.outstandingBalance > 0
                                  ? "text-warning"
                                  : "text-success"
                              )}
                            >
                              ₹
                              {client.outstandingBalance.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {client.outstandingBalance > 0
                              ? `Outstanding amount to be collected`
                              : "No outstanding balance"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Last Updated */}
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(client.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <ClientActionsMenu
                        clientId={clientId}
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
