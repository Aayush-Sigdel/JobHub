"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  isActive: boolean;
  onConfirm: (val: string) => void;
  confirmedValue: string;
};

export function InProgressTabTrigger({
  isActive,
  onConfirm,
  confirmedValue,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [pendingValue, setPendingValue] = React.useState(confirmedValue);

  const labelMap: Record<string, string> = {
    draft: "Draft",
    "clicked-apply": "Clicked apply",
  };

  function handleSelect() {
    onConfirm(pendingValue);
    setOpen(false);
  }

  function handleCancel() {
    setPendingValue(confirmedValue);
    setOpen(false);
  }

  function handleOpenChange(val: boolean) {
    if (val) setPendingValue(confirmedValue);
    setOpen(val);
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-sm transition-colors",
          "hover:bg-muted hover:text-foreground focus-visible:outline-none",
          isActive
            ? "text-foreground font-medium  border-foreground"
            : "text-muted-foreground",
        )}
      >
        {isActive ? `${labelMap[confirmedValue]} · 0` : "In Progress"}
        <ChevronDown className="w-3.5 h-3.5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>Select a type</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={pendingValue}
          onValueChange={setPendingValue}
        >
          <DropdownMenuRadioItem
            value="draft"
            onSelect={(e) => e.preventDefault()}
          >
            Draft
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="clicked-apply"
            onSelect={(e) => e.preventDefault()}
          >
            Clicked apply
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <div className="flex justify-end mt-4 gap-2 border-t pt-3 px-1">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm rounded hover:bg-muted text-muted-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-800 rounded-full hover:bg-green-900"
          >
            Select
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
