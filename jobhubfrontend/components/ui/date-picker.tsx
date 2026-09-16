"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import "react-day-picker/style.css";

/** Date-only picker using the same calendar and popover as the job deadline field. */
export function DatePicker({
  value,
  onChange,
  label,
  disabled = false,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseISO(value) : undefined;
  const currentYear = new Date().getFullYear();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={label}
          aria-invalid={Boolean(error)}
          className="h-10 w-full justify-start rounded-xl border-border bg-background px-3 text-left text-sm font-medium"
        >
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className={selected ? "" : "text-muted-foreground"}>
            {selected ? format(selected, "MMM d, yyyy") : `Select ${label.toLowerCase()}`}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] rounded-xl p-0">
        <DayPicker
          className="job-deadline-calendar p-3"
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          defaultMonth={selected || new Date()}
          captionLayout="dropdown"
          navLayout="after"
          startMonth={new Date(1950, 0)}
          endMonth={new Date(currentYear + 10, 11)}
          showOutsideDays
        />
        {value && (
          <div className="border-t border-border p-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => {
              onChange("");
              setOpen(false);
            }}>
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
