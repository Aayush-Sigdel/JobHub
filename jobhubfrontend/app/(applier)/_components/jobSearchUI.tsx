"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  MoveUp,
  MoveDown,
  CornerDownLeft,
  FileText,
  Smartphone,
  Laptop,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ResultItem = {
  id: number;
  name: string;
  desc: string;
  icon: LucideIcon;
};

type SearchData = Record<string, ResultItem[]>;

const MOCK_DATA: SearchData = {
  Laptops: [
    {
      id: 1,
      name: "MacBook Pro 14-inch (M3 Pro)",
      desc: "11-core M3 Pro, 18GB RAM",
      icon: Laptop,
    },
    {
      id: 2,
      name: "Dell XPS 15",
      desc: "Intel Core i9, 32GB RAM",
      icon: Laptop,
    },
  ],
  Mobiles: [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      desc: "A17 Pro, 256GB Storage",
      icon: Smartphone,
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      desc: "Snapdragon 8 Gen 3, 512GB",
      icon: Smartphone,
    },
  ],
  Accessories: [
    {
      id: 1,
      name: "Sony WH-1000XM5",
      desc: "Noise Cancelling Headphones",
      icon: FileText,
    },
    {
      id: 2,
      name: "Magic Keyboard",
      desc: "Apple Wireless Keyboard",
      icon: FileText,
    },
  ],
};

function getRoute(category: string, item: ResultItem) {
  if (category === "Laptops") return `/product/laptop/${item.id}`;
  if (category === "Mobiles") return `/product/mobile/${item.id}`;
  return `/product/extra/${item.id}`;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span
            key={i}
            className="bg-[#d4ff35]/60 dark:bg-[#d4ff35]/40 text-foreground px-0.5 rounded-sm"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
   * Filter every category, drop categories with no matches.
   */
  const groupedResults = useMemo(() => {
    const search = query.toLowerCase().trim();
    const result: SearchData = {};

    Object.entries(MOCK_DATA).forEach(([category, items]) => {
      const match = search
        ? items.filter(
            (item) =>
              item.name.toLowerCase().includes(search) ||
              item.desc.toLowerCase().includes(search),
          )
        : items;

      if (match.length > 0) result[category] = match;
    });

    return result;
  }, [query]);

  /*
   * Flat list (render order) drives keyboard nav across category boundaries.
   */
  const flatItems = useMemo(() => {
    const flat: { category: string; item: ResultItem }[] = [];

    Object.entries(groupedResults).forEach(([category, items]) => {
      items.forEach((item) => flat.push({ category, item }));
    });

    return flat;
  }, [groupedResults]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = (category: string, item: ResultItem) => {
    router.push(getRoute(category, item));
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Enter" && flatItems[activeIndex]) {
      const { category, item } = flatItems[activeIndex];
      handleSelect(category, item);
    }
  };

  const hasResults = flatItems.length > 0;

  return (
    <div
      ref={containerRef}
      className="absolute left-75 right-75 top-full mt-2 z-50 flex flex-col max-h-[70vh] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
    >
      {/* Header / Input */}
      <div className="flex items-center px-4 py-4 border-b border-border/50 gap-3 shrink-0">
        <Search size={20} className="text-primary" />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing..."
          className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
        />

        {query && (
          <button
            onClick={() => setQuery("")}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar min-h-[200px]">
        {hasResults ? (
          Object.entries(groupedResults).map(([category, items]) => (
            <div key={category} className="mb-4 last:mb-0">
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {category}
              </div>

              <div className="flex flex-col gap-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const index = flatItems.findIndex(
                    (f) => f.category === category && f.item.id === item.id,
                  );
                  const isActive = index === activeIndex;

                  return (
                    <Link
                      key={item.id}
                      href={getRoute(category, item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => onClose()}
                      className={cn(
                        "group flex items-start gap-4 px-3 py-3 rounded-xl cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive ? "bg-muted/50" : "hover:bg-muted/50",
                      )}
                    >
                      <div className="p-2 bg-background border border-border rounded-lg group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                        <Icon
                          size={20}
                          className="text-muted-foreground group-hover:text-primary-foreground"
                        />
                      </div>

                      <div className="flex flex-col flex-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          <HighlightMatch text={item.name} query={query} />
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <HighlightMatch text={item.desc} query={query} />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No results found for &quot;{query}&quot;
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-6 px-4 py-3 bg-muted/30 border-t border-border/50 text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex gap-1">
            <kbd className="bg-background border border-border rounded p-1 shadow-sm">
              <MoveUp size={12} />
            </kbd>
            <kbd className="bg-background border border-border rounded p-1 shadow-sm">
              <MoveDown size={12} />
            </kbd>
          </span>
          <span>Move</span>
        </div>

        <div className="flex items-center gap-2">
          <kbd className="bg-background border border-border rounded px-1.5 py-1 shadow-sm flex items-center justify-center">
            <CornerDownLeft size={12} />
          </kbd>
          <span>Select</span>
        </div>

        <div className="flex items-center gap-2">
          <kbd className="bg-background border border-border rounded px-2 py-1 shadow-sm font-semibold">
            ESC
          </kbd>
          <span>Clear / Close</span>
        </div>
      </div>
    </div>
  );
}
