"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X, Target, SlidersHorizontal } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [queryInput, setQueryInput] = useState(searchParams.get("query") || "");
  const [locationInput, setLocationInput] = useState(searchParams.get("location") || "");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQueryInput(searchParams.get("query") || "");
    setLocationInput(searchParams.get("location") || "");
  }, [searchParams]);

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

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key);

    if (current === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const isRemote = searchParams.get("workplaceType") === "REMOTE";
  const isFullTime = searchParams.get("jobType") === "FULL_TIME";
  const hasTasks = searchParams.get("hasTasks") === "true";
  const hasSalary = Boolean(searchParams.get("salaryMin"));

  return (
    <div className="flex flex-col gap-3">
      {/* Search Inputs Bar */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-border bg-card p-2 shadow-xs flex flex-col md:flex-row items-center gap-2"
      >
        {/* Role & Keyword Input */}
        <div className="relative w-full flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Role, tech stack, or company..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="pl-10 pr-14 h-11 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
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
            placeholder="City, country, or remote..."
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            className="pl-10 pr-9 h-11 rounded-xl bg-background border-border/80 text-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
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
          className="w-full md:w-auto h-11 px-7 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Search className="h-4 w-4" />
          <span>Search Jobs</span>
        </Button>
      </form>

      {/* Quick Filter Discovery Pills */}
      <div className="flex items-center flex-wrap gap-1.5 px-0.5">
        <span className="text-xs text-muted-foreground font-medium mr-1 shrink-0">
          Quick filters:
        </span>

        <button
          type="button"
          onClick={() => toggleParam("workplaceType", "REMOTE")}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isRemote
              ? "bg-primary text-black border border-primary shadow-xs font-bold"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
          }`}
        >
          <span>Remote</span>
          {isRemote && <X className="h-3 w-3 text-black" />}
        </button>

        <button
          type="button"
          onClick={() => toggleParam("jobType", "FULL_TIME")}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isFullTime
              ? "bg-primary text-black border border-primary shadow-xs font-bold"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
          }`}
        >
          <span>Full-time</span>
          {isFullTime && <X className="h-3 w-3 text-black" />}
        </button>

        <button
          type="button"
          onClick={() => toggleParam("hasTasks", "true")}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            hasTasks
              ? "bg-primary text-black border border-primary shadow-xs font-bold"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
          }`}
        >
          <Target className="h-3 w-3" />
          <span>With Assessments</span>
          {hasTasks && <X className="h-3 w-3 text-black" />}
        </button>

        <button
          type="button"
          onClick={() => toggleParam("salaryMin", "50000")}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            hasSalary
              ? "bg-primary text-black border border-primary shadow-xs font-bold"
              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
          }`}
        >
          <span>$50k+ Salary</span>
          {hasSalary && <X className="h-3 w-3 text-black" />}
        </button>
      </div>
    </div>
  );
}
