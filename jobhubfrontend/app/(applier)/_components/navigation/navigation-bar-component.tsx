"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NavigationMenuDemo() {
  return (
    <nav className="flex items-center gap-4">
      <Button variant="outline" size="sm" className="text-sm font-medium">
        Today
      </Button>
      <Button variant="outline" size="sm" className="text-sm font-medium">
        This Week
      </Button>
      <Button variant="outline" size="sm" className="text-sm font-medium">
        Earlier
      </Button>
    </nav>
  );
}
