"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, addDays, startOfDay } from "date-fns";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import "react-day-picker/style.css";

export default function DeadlinePicker({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | undefined>();
  const selected =
    value && !Number.isNaN(Date.parse(value)) ? new Date(value) : undefined;
  const today = startOfDay(new Date());
  function selectDate(date: Date | undefined) {
    if (!date) return;
    const next = new Date(date);
    next.setHours(draft?.getHours() ?? 23, draft?.getMinutes() ?? 59, 0, 0);
    setDraft(next);
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(selected);
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          id="deadline"
          disabled={disabled}
          variant="outline"
          className="h-11 w-full justify-start rounded-lg px-3 text-left font-normal"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "deadline-error" : undefined}
        >
          <IconCalendar className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selected ? format(selected, "MMM d, yyyy · HH:mm") : "No deadline"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto max-w-[calc(100vw-2rem)] rounded-xl p-0"
      >
        <div className="flex flex-wrap gap-2 border-b border-border p-3">
          {[7, 14, 30].map((days) => (
            <Button
              key={days}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => selectDate(addDays(today, days))}
            >
              {days} days
            </Button>
          ))}
        </div>
        <DayPicker
          className="job-deadline-calendar p-3"
          mode="single"
          selected={draft}
          onSelect={selectDate}
          defaultMonth={selected || today}
          captionLayout="dropdown"
          navLayout="after"
          startMonth={today}
          endMonth={new Date(today.getFullYear() + 5, 11)}
          disabled={{ before: today }}
          showOutsideDays
        />
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="deadline-hour"
              className="flex items-center gap-2 text-sm"
            >
              <IconClock className="size-4 text-muted-foreground" />
              Closing time
            </label>
            <div className="flex items-center gap-1">
              <select
                id="deadline-hour"
                aria-label="Closing hour"
                disabled={!draft}
                value={draft?.getHours() ?? 23}
                onChange={(e) => {
                  if (draft) {
                    const next = new Date(draft);
                    next.setHours(Number(e.target.value));
                    setDraft(next);
                  }
                }}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span>:</span>
              <select
                aria-label="Closing minute"
                disabled={!draft}
                value={draft?.getMinutes() ?? 59}
                onChange={(e) => {
                  if (draft) {
                    const next = new Date(draft);
                    next.setMinutes(Number(e.target.value));
                    setDraft(next);
                  }
                }}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              >
                {Array.from({ length: 60 }, (_, minute) => (
                  <option key={minute} value={minute}>
                    {String(minute).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {Intl.DateTimeFormat().resolvedOptions().timeZone} (local time)
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-border p-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            No deadline
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!draft}
            onClick={() => {
              if (draft) onChange(format(draft, "yyyy-MM-dd'T'HH:mm"));
              setOpen(false);
            }}
          >
            Set deadline
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
