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
    <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-3 border-b border-border bg-background px-3 sm:px-4 md:px-6 transition-colors duration-200">
      <SidebarTrigger className="-ml-1 text-foreground/80 hover:text-foreground transition-colors duration-200" />

      <h1 className="flex-1 text-base sm:text-lg md:text-xl font-semibold ml-1 sm:ml-2 text-foreground truncate transition-colors duration-200">
        Pocket Books
      </h1>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 sm:h-9 sm:w-9 text-foreground/80 hover:text-foreground transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        <span
          className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse"
          aria-hidden="true"
        />
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 text-foreground/80 hover:text-foreground transition-colors duration-200"
            aria-label="User menu"
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex cursor-pointer items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex cursor-pointer items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      <ModeToggle />
    </header>
  );
}
