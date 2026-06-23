"use client";

import { useState } from "react";
import Link from "next/link";

import { SearchBar } from "@/components/web/search";
import { ThemeToggle } from "../../../../components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Logo from "../../_components/logo";
import { DropdownMenuProfileIcons } from "../../_components/dropdown-profile";
import NotificationCenter from "../../_components/dropdown-notification";
import MessageCenter from "../../_components/dropdown-message";
import JobTracker from "../../_components/dropdown-job-tracker";

const NavigationBar = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-20 max-w-350 items-center justify-between px-6 md:px-8">
        <div className="flex flex-1 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center">
            <Logo />
          </Link>

          <div className="hidden w-full max-w-2xl md:block">
            <SearchBar />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground lg:flex">
            <Link href="#" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Applications
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            <MessageCenter />
            <JobTracker />
            <DropdownMenuProfileIcons />
          </div>

          <div className="flex items-center gap-4 border-l pl-4">
            <ThemeToggle />
            {isUserLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-9 w-9 cursor-pointer border transition-all hover:ring-2 hover:ring-amber-500 hover:ring-offset-2 hover:ring-offset-background">
                    <AvatarImage
                      src="/placeholder-user.jpg"
                      alt="user profile"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-amber-100 font-medium text-amber-700">
                      PP
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Link
                  href="/sign-in"
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  className={buttonVariants({ variant: "default" })}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
