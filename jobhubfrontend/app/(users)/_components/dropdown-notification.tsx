"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Bell, Lightbulb, ChartColumn, Wrench } from "lucide-react";

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
    <div className="flex gap-3 py-4 border-b border-gray-200 last:border-none">
      <div className="w-10 h-10 rounded-full border flex items-center justify-center text-gray-600">
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm text-gray-900">
            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2" />
            {title}
          </h3>

          <span className="text-xs text-gray-400">{time}</span>
        </div>

        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer">
          <Bell size={20} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-100 rounded-2xl border  p-1.5 shadow-2xl shadow-black/40 text-gray-900 bg-white"
      >
        <div className=" rounded-3xl shadow-xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-5 text-gray-900 text-md font-semibold">
            <h2 className="text-lg font-semibold">Notification Center</h2>

            <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
              See All
            </button>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-5 text-gray-900 text-md font-semibold">
            <button className="flex-1 bg-white rounded-lg py-2 text-sm font-medium shadow-sm">
              Today
            </button>

            <button className="flex-1 py-2 text-sm text-gray-500">
              This Week
            </button>

            <button className="flex-1 py-2 text-sm text-gray-500">
              Earlier
            </button>
          </div>

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
