"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

// Lazy load the search dialog for better initial page load
const SearchDialog = lazy(() =>
  import("./search-dialog").then((mod) => ({ default: mod.SearchDialog }))
);

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all duration-200"
        aria-label="Search"
      >
        <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="hidden sm:inline-flex text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          Search
        </span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded-md bg-background border border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
          <span className="text-xs">⌘</span>K
        </kbd>
      </motion.button>
      {/* Only render dialog when opened to reduce initial load */}
      {open && (
        <Suspense fallback={null}>
          <SearchDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}
