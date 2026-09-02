"use client";

import {
  CreditCardIcon,
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  UserCircleIcon,
  UsersIcon,
} from "lucide-react";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface DropdownMenuIconsProps {
  profile?: {
    id?: string;
    name?: string;
    email?: string;
    imageUrl?: string;
    title?: string;
  } | null;
}

export function DropdownMenuIcons({ profile }: DropdownMenuIconsProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user;
  const userName = profile?.name || user?.name || "Candidate";
  const userEmail = profile?.email || user?.email || "";
  const userImage =
    profile?.imageUrl || (user as any)?.imageUrl || (user as any)?.image;

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <div className="flex items-center gap-2.5">
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2.5">
            <div className="p-[2px] rounded-full border border-border bg-muted cursor-pointer transition-transform hover:scale-105">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {getInitials(userName)}
                </div>
              )}
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          asChild
          className="w-72 rounded-2xl border border-border p-0 shadow-lg text-foreground bg-background outline-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
            className="p-2 bg-background rounded-2xl border border-border"
          >
            {/* User Info Header */}
            <div className="px-3 py-3 border-b border-border mb-1.5 flex items-center gap-3">
              <div className="p-[2px] rounded-full border border-border bg-muted shrink-0">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {getInitials(userName)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
            </div>

            <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted">
              <Link
                href="/candidate-profile"
                className="flex items-center gap-2.5 w-full"
              >
                <UserCircleIcon size={16} strokeWidth={2} />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted">
              <UsersIcon size={16} strokeWidth={2} />
              <span>Community</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted">
              <CreditCardIcon size={16} strokeWidth={2} />
              <span className="flex-1">Subscription</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/setting")}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted"
            >
              <SettingsIcon size={16} strokeWidth={2} />
              <span className="flex-1">Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-border h-px" />

            <DropdownMenuItem className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted">
              <HelpCircleIcon size={16} strokeWidth={2} />
              <span>Help center</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-border h-px" />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOutIcon size={16} strokeWidth={2} />
              <span>Sign out</span>
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}

export { DropdownMenuIcons as DropdownMenuProfileIcons };
