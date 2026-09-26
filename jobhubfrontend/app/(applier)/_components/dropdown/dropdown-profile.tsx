"use client";

import { Hint } from "@/components/ui/tooltip";

import {
  IconUser,
  IconUsers,
  IconSettings,
  IconHelpCircle,
  IconLogout,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutAndClearLocalData } from "@/lib/sign-out";

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
  const userImage = profile?.imageUrl || user?.imageUrl || user?.image;

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <Hint content="Profile and settings">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Candidate profile menu"
            className="flex items-center gap-2 rounded-full border border-border bg-muted p-0.5 transition-opacity hover:opacity-85 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {userImage ? (
              <Image
                unoptimized
                width={36}
                height={36}
                src={userImage}
                alt={userName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-foreground">
                {getInitials(userName)}
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
      </Hint>

      <DropdownMenuContent
        align="end"
        asChild
        className="w-72 rounded-xl border border-border p-0 shadow-lg text-foreground bg-card outline-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="rounded-xl border border-border bg-card p-2"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 border-b border-border px-3 py-3 mb-1">
            <div className="shrink-0">
              {userImage ? (
                <Image
                  unoptimized
                  width={36}
                  height={36}
                  src={userImage}
                  alt={userName}
                  className="h-9 w-9 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-foreground">
                  {getInitials(userName)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {userName}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </div>

          <DropdownMenuItem
            asChild
            className="rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted"
          >
            <Link
              href="/candidate-profile"
              className="flex items-center gap-2.5 w-full"
            >
              <IconUser
                size={16}
                stroke={1.75}
                className="text-muted-foreground"
              />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/find-job")}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted"
          >
            <IconUsers
              size={16}
              stroke={1.75}
              className="text-muted-foreground"
            />
            <span>Community & Network</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push("/setting")}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted"
          >
            <IconSettings
              size={16}
              stroke={1.75}
              className="text-muted-foreground"
            />
            <span className="flex-1">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-border h-px" />

          <DropdownMenuItem
            onClick={() => router.push("/help")}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors focus:bg-muted"
          >
            <IconHelpCircle
              size={16}
              stroke={1.75}
              className="text-muted-foreground"
            />
            <span>Help center</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-border h-px" />

          <DropdownMenuItem
            onClick={() => signOutAndClearLocalData()}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive"
          >
            <IconLogout size={16} stroke={1.75} />
            <span>Sign out</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { DropdownMenuIcons as DropdownMenuProfileIcons };
