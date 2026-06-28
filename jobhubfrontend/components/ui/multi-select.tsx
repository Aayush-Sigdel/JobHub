"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search } from "lucide-react";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = "Search..." }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (o) => o.toLowerCase().includes(query.toLowerCase()) && !selected.includes(o)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (!selected.includes(option)) {
      onChange([...selected, option]);
    }
    setQuery("");
  };

  const handleRemove = (option: string) => {
    onChange(selected.filter((s) => s !== option));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="flex flex-wrap gap-1.5 p-2 min-h-[42px] border border-input rounded-md bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-input cursor-text transition-all"
        onClick={() => setIsOpen(true)}
      >
        {selected.map((s) => (
          <span
            key={s}
            className="flex items-center gap-1 px-2 py-0.5 bg-muted text-foreground text-[12px] font-semibold rounded-md border border-border"
          >
            {s}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(s);
              }}
              className="hover:text-red-500 focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center flex-1 min-w-[120px]">
          {selected.length === 0 && !query && (
            <Search className="w-3.5 h-3.5 text-muted-foreground/50 mr-2" />
          )}
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                e.preventDefault();
                handleSelect(query.trim());
              } else if (e.key === "Backspace" && !query && selected.length > 0) {
                handleRemove(selected[selected.length - 1]);
              }
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50 min-w-[60px]"
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-background border border-border shadow-xl rounded-md z-[100] custom-scrollbar">
          {filteredOptions.length > 0 ? (
            <>
              {filteredOptions.map((o) => (
                <div
                  key={o}
                  className="px-3 py-2.5 text-sm text-foreground/90 hover:bg-muted hover:text-foreground cursor-pointer border-b border-border/30 last:border-0"
                  onClick={() => handleSelect(o)}
                >
                  {o}
                </div>
              ))}
              {query.trim() && !filteredOptions.some(o => o.toLowerCase() === query.trim().toLowerCase()) && !selected.some(s => s.toLowerCase() === query.trim().toLowerCase()) && (
                <div
                  className="px-3 py-2.5 text-sm text-primary font-medium hover:bg-primary/10 cursor-pointer border-t border-border/50"
                  onClick={() => handleSelect(query.trim())}
                >
                  Add "{query.trim()}"
                </div>
              )}
            </>
          ) : query.trim() && !selected.some(s => s.toLowerCase() === query.trim().toLowerCase()) ? (
            <div
              className="px-3 py-2.5 text-sm text-primary font-medium hover:bg-primary/10 cursor-pointer"
              onClick={() => handleSelect(query.trim())}
            >
              Add "{query.trim()}"
            </div>
          ) : (
            <div className="px-3 py-3 text-sm text-muted-foreground text-center italic">
              {query ? "Already selected." : "All skills selected."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
