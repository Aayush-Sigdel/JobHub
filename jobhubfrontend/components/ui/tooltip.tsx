"use client";

import type { ReactElement } from "react";
import { CircleHelp } from "lucide-react";
import { Tooltip as TooltipPrimitive } from "radix-ui";

/** Adds a hover/focus description without replacing a control's accessible name. */
export function Hint({
  content,
  children,
}: {
  content: string;
  children: ReactElement;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={350}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={8}
            collisionPadding={12}
            className="z-[100] max-w-64 rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground shadow-md"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-popover" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export function FieldHint({
  label,
  content,
}: {
  label: string;
  content: string;
}) {
  return (
    <Hint content={content}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <CircleHelp className="size-4" aria-hidden="true" />
      </button>
    </Hint>
  );
}
