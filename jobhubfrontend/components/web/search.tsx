"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconX } from "@tabler/icons-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/find-job?query=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full max-w-md h-9 bg-muted/40 hover:bg-muted/60 focus-within:bg-background border border-border focus-within:border-foreground/40 rounded-lg transition-all"
    >
      <div className="pl-3 pr-2 flex items-center justify-center text-muted-foreground">
        <IconSearch size={16} stroke={1.75} />
      </div>

      <input
        type="text"
        placeholder="Search jobs, skills, companies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent text-xs font-normal text-foreground placeholder:text-muted-foreground focus:outline-none pr-8"
      />

      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-2 p-0.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          aria-label="Clear search"
        >
          <IconX size={14} stroke={1.75} />
        </button>
      ) : (
        <div className="absolute right-2.5 hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/70 font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60 select-none">
          <span>⌘</span>
          <span>K</span>
        </div>
      )}
    </form>
  );
}

