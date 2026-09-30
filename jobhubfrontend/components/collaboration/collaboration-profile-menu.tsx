"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Eye,
  LogOut,
  Monitor,
  Moon,
  Sun,
  SunMoon,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/providers/theme-provider";
import { useCollaborationIdentity } from "@/lib/hooks/use-collaboration";
import { signOutAndClearLocalData } from "@/lib/sign-out";
import type { UserProfileResponse } from "@/types/api/user";

export type CollaborationProfile = Pick<
  UserProfileResponse,
  "name" | "email" | "imageUrl" | "title"
>;

export function CollaborationProfileMenu({
  profile,
}: {
  profile?: CollaborationProfile | null;
}) {
  const identity = useCollaborationIdentity();
  const { theme, setTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const name = profile?.name || identity.userName || "Your account";
  const image = profile?.imageUrl || identity.userImageUrl;
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOutAndClearLocalData();
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Open profile menu for ${name}`}
          className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-muted sm:px-2"
        >
          <Avatar className="size-8">
            <AvatarImage src={image || undefined} alt="" />
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown
            className="hidden size-3.5 text-muted-foreground sm:block"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={12}
        className="w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border p-1.5 shadow-lg ring-0 motion-reduce:animate-none"
      >
        <DropdownMenuLabel className="px-3 py-3">
          <span className="block truncate text-sm font-semibold text-foreground">
            {name}
          </span>
          {profile?.email && (
            <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
              {profile.email}
            </span>
          )}
          {profile?.title && (
            <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
              {profile.title}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="min-h-11 gap-3 rounded-lg px-3">
            <Link href="/candidate-profile">
              <UserRound
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />{" "}
              View profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="min-h-11 gap-3 rounded-lg px-3">
            <Link href="/candidate-profile#collaboration-visibility">
              <Eye
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />{" "}
              Collaboration visibility
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="min-h-11 gap-3 rounded-lg px-3">
              <SunMoon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />{" "}
              Appearance
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-40 rounded-xl border border-border p-1.5 ring-0 motion-reduce:animate-none">
              <DropdownMenuRadioGroup
                value={theme ?? "system"}
                onValueChange={setTheme}
              >
                {[
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <DropdownMenuRadioItem
                    key={value}
                    value={value}
                    className="min-h-11 gap-3 rounded-lg px-3 pr-8"
                  >
                    <Icon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          className="min-h-11 gap-3 rounded-lg px-3"
          onSelect={(event) => {
            event.preventDefault();
            void handleSignOut();
          }}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
