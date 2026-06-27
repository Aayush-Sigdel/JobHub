"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ 
        borderColor: isFocused ? "var(--color-foreground)" : "var(--color-border)" 
      }}
      className="flex items-center w-full max-w-xl bg-background border-2 border-border rounded-xl overflow-hidden transition-colors"
    >
      <div className="pl-4 pr-2 flex items-center justify-center">
        <motion.div
          animate={isFocused ? { scale: 1.15, rotate: -10, color: "var(--color-tomato-500)" } : { scale: 1, rotate: 0, color: "var(--color-muted-foreground)" }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <SearchIcon className="w-5 h-5" strokeWidth={3} />
        </motion.div>
      </div>
      <input
        type="text"
        placeholder="Search for jobs, companies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 py-3 px-2 bg-transparent outline-none text-foreground font-bold placeholder:text-muted-foreground placeholder:font-semibold"
      />
      <AnimatePresence>
        {searchQuery && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pr-2"
          >
            <button
              onClick={() => setSearchQuery("")}
              className="bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button className="bg-tomato-500 hover:bg-tomato-500 text-white font-black px-6 py-3 transition-colors border-l-2 border-border focus-visible:border-foreground h-full">
        Find
      </button>
    </motion.div>
  );
}
