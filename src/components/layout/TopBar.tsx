import { useState } from "react";
import { Search, Plus, Command, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { currentUser, mockNotifications } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onToggleMobileSidebar?: () => void;
}

export function TopBar({ onOpenCommandPalette, onToggleMobileSidebar }: TopBarProps) {
  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 lg:px-6 bg-background/80 backdrop-blur-xl border-b border-border">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleMobileSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <button
          onClick={onOpenCommandPalette}
          className={cn(
            "hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg",
            "bg-muted/50 hover:bg-muted text-muted-foreground",
            "transition-colors duration-200 cursor-pointer",
            "border border-transparent hover:border-border"
          )}
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-1 ml-8 px-1.5 py-0.5 text-xs font-medium bg-background rounded border border-border">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>

        {/* Mobile search icon */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={onOpenCommandPalette}
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Create button */}
        <Button size="sm" className="orbit-gradient text-white border-0 gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-medium rounded-full bg-primary text-primary-foreground">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary" className="text-xs">
                {unreadNotifications} new
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockNotifications.slice(0, 4).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 py-3 cursor-pointer",
                  !notification.read && "bg-muted/50"
                )}
              >
                <span className="font-medium text-sm">{notification.title}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {notification.message}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{currentUser.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {currentUser.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Account settings</DropdownMenuItem>
            <DropdownMenuItem>Workspace settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
