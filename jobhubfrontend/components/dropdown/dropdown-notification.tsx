"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Lightbulb, Wrench } from "lucide-react";
import { ChartColumnIcon as ChartColumn } from "@animateicons/react/lucide";
import { BellIcon } from "@/components/ui/bell";

const notifications = [
  {
    id: 1,
    title: "Your AI Just Got Smarter",
    description:
      "Adaptive learning speed increased by 27%. New feature: AI-driven trend forecasting",
    time: "1h ago",
    icon: <Lightbulb size={18} />,
  },
  {
    id: 2,
    title: "Data Analysis Completed",
    description:
      "Your AI has processed 10,000+ records and identified key trends.",
    time: "3h ago",
    icon: <ChartColumn size={18} />,
  },
  {
    id: 3,
    title: "System Maintenance",
    description:
      "Performance tuning & security updates will be applied at 2:00 AM UTC",
    time: "5h ago",
    icon: <Wrench size={18} />,
  },
];

function NotificationCard({
  title,
  description,
  time,
  icon,
}: {
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-none">
      <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground">
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm text-foreground">
            <span className="inline-block w-2 h-2 bg-tomato-500 rounded-full mr-2" />
            {title}
          </h3>

          <span className="text-xs text-muted-foreground">{time}</span>
        </div>

        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <BellIcon size={20} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        asChild
        className="w-100 rounded-2xl border border-border p-0 shadow-lg text-foreground bg-background outline-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
        >
          <div className="rounded-xl p-6 bg-background">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 text-foreground text-md font-semibold">
              <h2 className="text-lg font-semibold">Notification Center</h2>

              {/* <button className="px-3 py-1 text-sm bg-muted rounded-lg hover:bg-muted/80">
              See All
            </button> */}
            </div>

            {/* <div className="flex bg-muted rounded-xl p-1 mb-5 text-foreground text-md font-medium border border-border">
              <button className="flex-1 bg-background rounded-lg py-2 text-sm font-medium border border-border">
                Today
              </button>

              <button className="flex-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                This Week
              </button>

              <button className="flex-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Earlier
              </button>
            </div> */}

            {/* Notifications */}
            <div>
              {notifications.map((item) => (
                <NotificationCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  time={item.time}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
