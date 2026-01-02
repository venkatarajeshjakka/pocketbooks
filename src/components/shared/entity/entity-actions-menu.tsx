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
  entityType: 'client' | 'vendor' | 'asset';
  basePath: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  variant?: "ghost" | "default";
}

export function EntityActionsMenu({
  entityId,
  entityType,
  basePath,
  onEdit,
  onDelete,
  variant = "ghost",
}: EntityActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link
            href={`${basePath}/${entityId}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(entityId)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(entityId)}
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
