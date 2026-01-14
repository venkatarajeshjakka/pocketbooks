/**
 * EntityActionsMenu Component
 * Reusable dropdown menu for entity actions (clients/vendors)
 */

"use client";

import Link from "next/link";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EntityActionsMenuProps {
  entityId: string;
  entityType: 'client' | 'vendor' | 'asset' | 'payment' | 'expense' | 'loan' | 'interest-payment' | 'procurement' | 'trading_good_procurement' | 'raw-material' | 'trading-good' | 'finished-good';
  entityName?: string;
  basePath: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  variant?: "ghost" | "default";
}

export function EntityActionsMenu({
  entityId,
  entityType,
  entityName,
  basePath,
  onEdit,
  onDelete,
  variant = "ghost",
}: EntityActionsMenuProps) {
  const entityLabel = entityName ? `${entityType}: ${entityName}` : entityType;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          aria-label={`Actions for ${entityLabel}`}
          aria-haspopup="menu"
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" aria-label={`${entityType} actions menu`}>
        <DropdownMenuItem asChild>
          <Link
            href={`${basePath}/${entityId}`}
            className="flex items-center gap-2 cursor-pointer"
            aria-label={`View ${entityLabel} details`}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            View details
          </Link>
        </DropdownMenuItem>

        {onEdit && (
          <DropdownMenuItem
            onClick={() => onEdit(entityId)}
            className="flex items-center gap-2 cursor-pointer"
            aria-label={`Edit ${entityLabel}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(entityId)}
            className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            aria-label={`Delete ${entityLabel}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
