"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X, Loader2 } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const requestedQuery = searchParams.get("query") || "";
  const requestedLocation = searchParams.get("location") || "";
  const searchKey = JSON.stringify([requestedQuery, requestedLocation]);
  const [previousSearchKey, setPreviousSearchKey] = useState(searchKey);
  const [queryInput, setQueryInput] = useState(requestedQuery);
  const [locationInput, setLocationInput] = useState(requestedLocation);
  const searchInputRef = useRef<HTMLInputElement>(null);

  if (searchKey !== previousSearchKey) {
    setPreviousSearchKey(searchKey);
    setQueryInput(requestedQuery);
    setLocationInput(requestedLocation);
  }

  // Keyboard shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (queryInput.trim()) {
      params.set("query", queryInput.trim());
    } else {
      params.delete("query");
    }

    if (locationInput.trim()) {
      params.set("location", locationInput.trim());
    } else {
      params.delete("location");
    }

    startTransition(() =>
      router.push(`${pathname}?${params.toString()}`, { scroll: false }),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Inputs Bar */}
      <form
        onSubmit={handleSearch}
        role="search"
        aria-label="Find jobs"
        aria-busy={isPending}
        className="rounded-2xl border border-border bg-muted/25 p-2 flex flex-col md:flex-row items-center gap-2"
      >
        {/* Role & Keyword Input */}
        <div className="relative w-full flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            ref={searchInputRef}
            type="text"
            aria-label="Role, skill, or company"
            placeholder="Role, tech stack, or company..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="pl-10 pr-14 h-11 rounded-xl bg-transparent border-transparent shadow-none text-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
          />
          {queryInput ? (
            <button
              type="button"
              onClick={() => setQueryInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/70 font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60 select-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}
        </div>

        {/* Location Input */}
        <div className="relative w-full md:w-64">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            type="text"
            aria-label="Job location"
            placeholder="City or country"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-xl bg-transparent border-transparent shadow-none text-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
          />
          {locationInput && (
            <button
              type="button"
              onClick={() => setLocationInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
              aria-label="Clear location"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Action Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full md:w-auto h-11 px-7 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span>{isPending ? "Searching…" : "Search jobs"}</span>
        </Button>
      </form>
    </div>
  );
}
