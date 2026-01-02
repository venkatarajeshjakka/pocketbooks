/**
 * ClientActionsMenu Component
 * Reusable dropdown menu for client actions
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

interface ClientActionsMenuProps {
  clientId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  variant?: "ghost" | "default";
  showLabel?: boolean;
}

export function ClientActionsMenu({
  clientId,
  onEdit,
  onDelete,
  variant = "ghost",
  showLabel = false,
}: ClientActionsMenuProps) {
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
            href={`/clients/${clientId}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            View details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(clientId)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(clientId)}
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
