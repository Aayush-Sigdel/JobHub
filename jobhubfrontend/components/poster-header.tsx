"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  LogOut,
  Plus,
  Eye,
  Layers,
  UserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { signOutAndClearLocalData } from "@/lib/sign-out";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { cn } from "@/lib/utils";
import JobHubLogo from "@/components/brand/JobHubLogo";
import type { UserProfileResponse } from "@/types/api/user";

interface PosterHeaderProps {
  profile?: UserProfileResponse | null;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "EP";
}

export function PosterHeader({ profile }: PosterHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user;
  const userName = profile?.name || user?.name || "Employer";
  const userEmail = profile?.email || user?.email || "";
  const userImage = profile?.imageUrl || user?.image || undefined;

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Listings", href: "/manage-jobs" },
  ];

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-4 md:px-8">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 font-black text-2xl tracking-tighter text-foreground hover:opacity-90 transition-opacity"
        >
          <JobHubLogo />
          <span className="ml-2 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
            Employer
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground font-bold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick CTA, Notifications, ThemeToggle, Profile Menu */}
      <div className="flex items-center gap-3">
        {pathname !== "/manage-jobs" && pathname !== "/dashboard" && <Button
          asChild
          className="h-9.5 px-4 rounded-xl font-bold text-sm bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer gap-2 hidden sm:inline-flex"
        >
          <Link href="/manage-jobs">
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Post a Job</span>
          </Link>
        </Button>}

        <ThemeToggle />

        {/* Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Employer account menu"
              className="flex items-center gap-2 rounded-full border border-border bg-muted p-0.5 transition-all hover:border-foreground/30 focus:outline-none cursor-pointer"
            >
              <Avatar className="h-9 w-9 rounded-full border border-border/80 shadow-2xs">
                {userImage && (
                  <AvatarImage src={userImage} alt={userName} className="object-cover" />
                )}
                <AvatarFallback className="bg-primary text-black font-bold text-xs">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72 rounded-2xl border border-border p-2 shadow-lg text-foreground bg-card outline-none"
          >
            {/* User Info Header */}
            <div className="flex items-center gap-3 border-b border-border/70 px-3 py-3 mb-1.5">
              <Avatar className="h-10 w-10 rounded-xl border border-border shadow-2xs shrink-0">
                {userImage && (
                  <AvatarImage src={userImage} alt={userName} className="object-cover" />
                )}
                <AvatarFallback className="bg-primary text-black font-bold text-sm">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-foreground">
                    {userName}
                  </p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-black">
                    Employer
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground mt-0.5">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Menu Items */}
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <UserRound className="w-4 h-4 text-muted-foreground" />
              <span>My Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
              <span>Employer Dashboard</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/preview/me")}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span>Public Profile Preview</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/manage-jobs")}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span>Manage Job Listings</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/post-task")}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span>Assessment Tasks</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/setting")}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Account Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1.5 bg-border/70 h-px" />

            <DropdownMenuItem
              onClick={() => signOutAndClearLocalData()}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="w-4 h-4 text-destructive" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
