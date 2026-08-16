"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Box, ArrowUpRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  category: "Projects" | "People";
  title: string;
};

const RAW_PROJECTS = [
  { id: "p1", org: "Workflow Inc.", name: "Website Redesign" },
  { id: "p2", org: "Conglomerate Inc.", name: "Mobile App" },
  { id: "p3", org: "Products Inc.", name: "Print Brochure" },
];

const RAW_USERS = [
  { id: "u1", name: "Alicia Bell", avatar: "https://i.pravatar.cc/40?img=32" },
  { id: "u2", name: "Anna Roberts", avatar: "https://i.pravatar.cc/40?img=47" },
  {
    id: "u3",
    name: "Benjamin Russel",
    avatar: "https://i.pravatar.cc/40?img=12",
  },
  {
    id: "u4",
    name: "Bianca Torres",
    avatar: "https://i.pravatar.cc/40?img=5",
  },
];

const PROJECTS: Item[] = RAW_PROJECTS.map((p) => ({
  id: p.id,
  category: "Projects",
  title: p.name,
}));

const USERS: Item[] = RAW_USERS.map((u) => ({
  id: u.id,
  category: "People",
  title: u.name,
}));

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const idx = text.toLowerCase().indexOf(query.toLowerCase());

  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  /*
   * Filter all items.
   */
  const filtered = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) {
      return [...PROJECTS, ...USERS];
    }

    return [...PROJECTS, ...USERS].filter((item) =>
      item.title.toLowerCase().includes(search),
    );
  }, [query]);

  /*
   * Group results by category.
   */
  const groupedResults = useMemo(() => {
    return {
      Projects: filtered.filter((item) => item.category === "Projects"),
      People: filtered.filter((item) => item.category === "People"),
    };
  }, [filtered]);

  /*
   * Keyboard navigation.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));

      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      setActiveIndex((i) => Math.max(i - 1, 0));

      return;
    }

    if (e.key === "Enter" && filtered[activeIndex]) {
      console.log("selected:", filtered[activeIndex]);
      onClose();
    }
  };

  /*
   * Keeps track of the index across categories.
   */
  let runningIndex = -1;

  return (
    <div
      ref={containerRef}
      className="absolute left-75 right-75 top-15 mt-2 z-50 overflow-hidden rounded-xl border border-white/10 bg-[#111a2c] shadow-2xl"
    >
      {/* Search input */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search projects, people..."
          className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />

        <kbd className="shrink-0 rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-slate-400">
          esc
        </kbd>
      </div>

      {/* Results */}
      <div className="max-h-80 overflow-y-auto p-3">
        {filtered.length > 0 ? (
          <>
            {/* PROJECTS */}
            {groupedResults.Projects.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Projects
                </p>

                <div className="flex flex-col gap-1.5">
                  {groupedResults.Projects.map((item) => {
                    runningIndex++;

                    const index = runningIndex;
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={item.id}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          console.log("selected:", item);
                          onClose();
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          isActive
                            ? "bg-blue-600"
                            : "bg-white/5 hover:bg-white/[0.08]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                            isActive ? "bg-white/15" : "bg-white/10",
                          )}
                        >
                          <Box className="h-4 w-4 text-white" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium text-slate-400">
                            Projects
                          </span>

                          <span className="block truncate text-sm font-medium text-white">
                            <HighlightMatch text={item.title} query={query} />
                          </span>
                        </span>

                        <ArrowUpRight
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-blue-100" : "text-slate-500",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PEOPLE */}
            {groupedResults.People.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  People
                </p>

                <div className="flex flex-col gap-1.5">
                  {groupedResults.People.map((item) => {
                    runningIndex++;

                    const index = runningIndex;
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={item.id}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          console.log("selected:", item);
                          onClose();
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          isActive
                            ? "bg-blue-600"
                            : "bg-white/5 hover:bg-white/[0.08]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                            isActive ? "bg-white/15" : "bg-white/10",
                          )}
                        >
                          <Users className="h-4 w-4 text-white" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium text-slate-400">
                            People
                          </span>

                          <span className="block truncate text-sm font-medium text-white">
                            <HighlightMatch text={item.title} query={query} />
                          </span>
                        </span>

                        <ArrowUpRight
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-blue-100" : "text-slate-500",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No results for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-2.5 text-xs text-slate-500">
        Search by
        <span className="flex items-center gap-1 font-semibold text-slate-300">
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-500 text-[9px]">
            A
          </span>
          abcde
        </span>
      </div>
    </div>
  );
}
