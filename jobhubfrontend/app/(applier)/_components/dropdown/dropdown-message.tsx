"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconMessageDots,
  IconCheck,
  IconBuilding,
  IconArrowRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  company: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  href: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    company: "Stripe",
    sender: "Sarah Lin · Tech Recruiting",
    subject: "Interview invitation: Senior Frontend Engineer",
    preview: "We reviewed your portfolio and would like to schedule a 45-minute technical discussion.",
    time: "1h ago",
    unread: true,
    href: "/job-tracker",
  },
  {
    id: 2,
    company: "Acme Cloud",
    sender: "David Miller · Engineering Lead",
    subject: "Application update: Full Stack Developer",
    preview: "Your assessment scores were in the top 5%. When are you available for a brief catch-up?",
    time: "4h ago",
    unread: true,
    href: "/job-tracker",
  },
  {
    id: 3,
    company: "Linear",
    sender: "Talent Operations",
    subject: "Take-home challenge received",
    preview: "Thank you for completing the frontend component challenge. Our team is reviewing it today.",
    time: "1d ago",
    unread: false,
    href: "/job-tracker",
  },
];

export default function MessageCenter() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = messages.filter((m) => m.unread).length;
  const filteredMessages = filter === "unread" ? messages.filter((m) => m.unread) : messages;

  const markAllAsRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, unread: false })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Messages"
          className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <IconMessageDots size={18} stroke={1.75} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        asChild
        className="w-[360px] sm:w-[400px] rounded-xl border border-border p-0 shadow-lg text-foreground bg-card outline-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Messages</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <IconCheck size={14} stroke={1.75} />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Filter segment */}
          <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-3 py-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer",
                filter === "all"
                  ? "bg-background text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer",
                filter === "unread"
                  ? "bg-background text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Messages list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {filteredMessages.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No {filter === "unread" ? "unread " : ""}messages at this time
              </div>
            ) : (
              filteredMessages.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start gap-3 p-3.5 hover:bg-muted/50 transition-colors text-left group block"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                    <IconBuilding size={16} stroke={1.75} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {item.company}
                        </span>
                        {item.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-foreground truncate">
                      {item.subject}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {item.preview}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-muted/20 px-4 py-2.5">
            <Link
              href="/job-tracker"
              className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>View all conversations in Tracker</span>
              <IconArrowRight size={13} stroke={1.75} />
            </Link>
          </div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
