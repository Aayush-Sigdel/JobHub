"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ArchivedProps = {
  title: string;
  company: string;
  location: string;
  posted: string;
  logo?: string;
  connections?: number;
  easyApply?: boolean;
};
import Image from "next/image";
import logo from "../navigation/logo";

export default function Archived({
  title,
  company,
  location,
  posted,
  logo,
  connections,
  easyApply,
}: ArchivedProps) {
  return (
    <div className="grid grid-cols-[1fr_120px_160px_120px] items-center gap-2 px-4 py-3 border-b border-border hover:bg-muted/40">
      {/* Job info */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md border border-border flex items-center justify-center overflow-hidden shrink-0">
          {logo ? (
            <img
              src={logo}
              alt={company}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-sm font-semibold">{company[0]}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium cursor-pointer">{title}</p>
          <p className="text-xs text-muted-foreground">
            {company} · {location}
          </p>
          <p className="text-xs text-muted-foreground">Posted {posted}</p>
        </div>
      </div>

      {/* Connections */}
      <div className="flex items-center">
        {connections ? (
          <span className="text-xs text-muted-foreground">+{connections}</span>
        ) : null}
      </div>

      {/* Note */}
      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        + Add note
      </button>

      {/* Apply */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 text-xs font-medium border border-blue-500 text-blue-600 rounded-full px-3 py-1 hover:bg-blue-50">
          {easyApply && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-1 rounded-sm"></span>
          )}
          {easyApply ? "Easy apply" : "Apply"}
        </button>
      </div>
    </div>
  );
}
