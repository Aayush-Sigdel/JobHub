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
        className="grid gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary/30 md:grid-cols-[minmax(0,1fr)_minmax(180px,0.65fr)_auto] md:items-center"
      >
        {/* Role & Keyword Input */}
        <div className="relative min-w-0 rounded-xl bg-muted/30 px-3 pb-1 pt-2">
          <label htmlFor="job-query" className="block pl-7 text-xs font-medium">
            Role or company
          </label>
          <Search className="absolute left-3.5 top-8 h-4 w-4 text-muted-foreground" />
          <Input
            id="job-query"
            ref={searchInputRef}
            type="text"
            aria-label="Role, skill, or company"
            placeholder="Job title, skill, or company"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="h-9 rounded-lg border-0 bg-transparent pl-7 pr-8 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {queryInput ? (
            <button
              type="button"
              onClick={() => setQueryInput("")}
              className="absolute right-3 top-8 p-0.5 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="absolute right-3 top-2 hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/70 font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60 select-none">
              <span>⌘ / Ctrl</span>
              <span>K</span>
            </div>
          )}
        </div>

        {/* Location Input */}
        <div className="relative min-w-0 rounded-xl bg-muted/30 px-3 pb-1 pt-2">
          <label
            htmlFor="job-location"
            className="block pl-7 text-xs font-medium"
          >
            Location
          </label>
          <MapPin className="absolute left-3.5 top-8 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            id="job-location"
            aria-label="Job location"
            placeholder="City or country"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="h-9 rounded-lg border-0 bg-transparent pl-7 pr-8 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {locationInput && (
            <button
              type="button"
              onClick={() => setLocationInput("")}
              className="absolute right-3 top-8 p-0.5 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
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
          className="h-12 w-full rounded-xl px-6 font-semibold md:h-16 md:w-auto"
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
