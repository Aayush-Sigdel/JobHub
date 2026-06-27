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
        borderColor: isFocused ? "#0f172a" : "#e2e8f0" 
      }}
      className="flex items-center w-full max-w-xl bg-white border-2 border-slate-200 rounded-xl overflow-hidden transition-colors"
    >
      <div className="pl-4 pr-2 flex items-center justify-center">
        <motion.div
          animate={isFocused ? { scale: 1.15, rotate: -10, color: "#f59e0b" } : { scale: 1, rotate: 0, color: "#94a3b8" }}
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
        className="flex-1 py-3 px-2 bg-transparent outline-none text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-semibold"
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
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button className="bg-[#FFCC00] hover:bg-amber-400 text-slate-900 font-black px-6 py-3 transition-colors border-l-2 border-slate-900 h-full">
        Find
      </button>
    </motion.div>
  );
}
