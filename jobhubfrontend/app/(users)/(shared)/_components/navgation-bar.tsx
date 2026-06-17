"use client";
import { SearchBar } from "@/components/web/search";
import { ThemeToggle } from "../../../../components/layout/theme-toggle";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon } from "@/components/ui/bell";
import { MessageSquareMoreIcon } from "@/components/ui/message-square-more";
import { BookmarkIcon } from "@/components/ui/bookmark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Logo from "../../_components/logo";

const NavigationBar = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-20 items-center justify-between px-6 md:px-8 max-w-350 mx-auto">
        <div className="flex items-center gap-8 flex-1">
          <Link href="/" className="flex items-center shrink-0">
            <Logo />
          </Link>

          <div className="hidden md:block w-full max-w-2xl">
            <SearchBar />
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-6 mr-2 text-sm font-semibold text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Applications
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <HoverCard>
              <HoverCardTrigger>
                <BellIcon size={22} />
              </HoverCardTrigger>
              <HoverCardContent>
                No new Notification
                <BellIcon size={64} />
              </HoverCardContent>
            </HoverCard>
            <HoverCard>
              <HoverCardTrigger>
                <MessageSquareMoreIcon size={22} />
              </HoverCardTrigger>
              <HoverCardContent>
                No new Message
                <MessageSquareMoreIcon size={64} />
              </HoverCardContent>
            </HoverCard>
            <HoverCard>
              <HoverCardTrigger>
                <BookmarkIcon size={22} />
              </HoverCardTrigger>
              <HoverCardContent>
                No Bookmark
                <BookmarkIcon size={64} />
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="flex items-center gap-4 pl-4 border-l">
            <ThemeToggle />
            {isUserLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="w-9 h-9 border cursor-pointer transition-all hover:ring-2 hover:ring-amber-500 hover:ring-offset-2 hover:ring-offset-background">
                    <AvatarImage
                      src="/placeholder-user.jpg"
                      alt="user profile"
                      className="object-cover"
                    />
                    <AvatarFallback className="font-medium text-amber-700 bg-amber-100">
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
              <div className="flex justify-center gap-2 items-center">
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
