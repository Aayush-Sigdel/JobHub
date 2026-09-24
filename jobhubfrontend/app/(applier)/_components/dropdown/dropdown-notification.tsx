"use client";

import { Hint } from "@/components/ui/tooltip";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconBell,
  IconBriefcase,
  IconCircleCheck,
  IconCode,
} from "@tabler/icons-react";

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "application" | "job" | "task";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "Application reviewed",
    description:
      "TechCorp viewed your application for Senior Backend Developer.",
    time: "2h ago",
    read: false,
    type: "application",
  },
  {
    id: 2,
    title: "New match in market",
    description:
      "PixelCraft posted a Frontend Developer role matching your skills.",
    time: "1d ago",
    read: false,
    type: "job",
  },
  {
    id: 3,
    title: "Assessment ready",
    description:
      "Practical coding challenge is available for your active submission.",
    time: "2d ago",
    read: true,
    type: "task",
  },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "application":
        return (
          <IconCircleCheck
            size={16}
            stroke={1.75}
            className="text-emerald-600 dark:text-emerald-400"
          />
        );
      case "task":
        return <IconCode size={16} stroke={1.75} className="text-blue-500" />;
      case "job":
      default:
        return (
          <IconBriefcase
            size={16}
            stroke={1.75}
            className="text-foreground/80"
          />
        );
    }
  };

  return (
    <DropdownMenu>
      <Hint content="Notifications">
        <DropdownMenuTrigger asChild>
          <button
            className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-transparent hover:border-border/60"
            aria-label="Notifications"
          >
            <IconBell size={18} stroke={1.75} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
            )}
          </button>
        </DropdownMenuTrigger>
      </Hint>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 rounded-xl border border-border bg-card p-0 shadow-lg text-foreground outline-none"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 flex gap-3 transition-colors hover:bg-muted/40 ${
                !item.read ? "bg-muted/20" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-muted/60 border border-border/70 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
