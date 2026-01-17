"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

import { ModeToggle } from "./mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground" />
        <div className="hidden h-4 w-px bg-border/50 sm:block" />
        <span className="hidden text-sm font-semibold text-foreground sm:inline-block">
          Pocket Books
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive"
            aria-hidden="true"
          />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="User menu"
            >
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">My Account</span>
                <span className="text-xs text-muted-foreground">Admin Access</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile" className="flex w-full items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings" className="flex w-full items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden h-4 w-px bg-border/50 sm:block" />

        {/* Theme Toggle */}
        <ModeToggle />
      </div>
    </header>
  );
}
