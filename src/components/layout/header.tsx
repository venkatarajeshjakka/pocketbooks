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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/50 bg-background/60 px-4 backdrop-blur-xl sm:px-6 transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="-ml-1 h-9 w-9 text-foreground/70 hover:bg-accent hover:text-foreground transition-all duration-200" />
        <div className="h-4 w-[1px] bg-border/50" />
        <h1 className="text-lg font-bold tracking-tight text-foreground/90 sm:text-xl truncate max-w-[120px] sm:max-w-none">
          Pocket Books
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl text-foreground/70 hover:bg-accent/50 hover:text-foreground transition-all duration-200 active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="h-[1.1rem] w-[1.1rem]" />
          <span
            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-background bg-destructive ring-1 ring-destructive/20 animate-pulse"
            aria-hidden="true"
          />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl bg-accent/30 text-foreground/70 hover:bg-accent/50 hover:text-foreground transition-all duration-200 active:scale-95"
              aria-label="User menu"
            >
              <User className="h-[1.1rem] w-[1.1rem]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel className="font-semibold px-3 py-2">
              <div className="flex flex-col gap-0.5">
                <span>My Account</span>
                <span className="text-[10px] font-normal text-muted-foreground">Admin Access</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/50">
              <Link href="/profile" className="flex w-full items-center gap-2 py-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/50">
              <Link href="/settings" className="flex w-full items-center gap-2 py-2">
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

        <div className="h-4 w-[1px] bg-border/50 mx-1" />

        {/* Theme Toggle */}
        <ModeToggle />
      </div>
    </header>
  );
}
