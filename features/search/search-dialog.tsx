"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Newspaper,
  X,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useSearch } from "./use-search";
import type { SearchResult } from "./types";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    query,
    setQuery,
    results,
    isLoading,
    isIndexLoaded,
    error,
    clearSearch,
  } = useSearch();

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      clearSearch();
      setSelectedIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Handle result selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      onOpenChange(false);
      clearSearch();
      router.push(result.path);
    },
    [router, onOpenChange, clearSearch]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    },
    [results, selectedIndex, handleSelect]
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "blog":
        return <Newspaper className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "blog":
        return "Blog Post";
      default:
        return "Page";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <DialogTitle className="sr-only">Search</DialogTitle>

        {/* Search Input */}
        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <input
              ref={inputRef}
              placeholder={
                isIndexLoaded
                  ? "Search pages, blog posts..."
                  : "Loading search..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isIndexLoaded}
              className="flex-1 h-10 bg-transparent text-base font-medium outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearSearch}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-primary origin-left"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-4 py-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-3">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm text-destructive font-medium">{error}</p>
              </motion.div>
            )}

            {!isLoading && !error && query && results.length === 0 && (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-4 py-12 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No results found for{" "}
                  <span className="font-semibold text-foreground">
                    &quot;{query}&quot;
                  </span>
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try different keywords or check spelling
                </p>
              </motion.div>
            )}

            {!isLoading && !error && results.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-2"
              >
                <div className="px-4 py-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <ul>
                  {results.map((result, index) => (
                    <motion.li
                      key={result.id || `result-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`group flex w-full items-center gap-4 px-4 py-3 text-left transition-all duration-200 ${
                          selectedIndex === index
                            ? "bg-primary/10"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                            selectedIndex === index
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                          }`}
                        >
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium truncate transition-colors ${
                                selectedIndex === index
                                  ? "text-primary"
                                  : "text-foreground"
                              }`}
                            >
                              {result.title}
                            </span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide ${
                                result.type === "blog"
                                  ? "bg-chart-2/20 text-chart-2"
                                  : "bg-chart-1/20 text-chart-1"
                              }`}
                            >
                              {getTypeLabel(result.type)}
                            </span>
                          </div>
                          {result.excerpt && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                              {result.excerpt}
                            </p>
                          )}
                          <p className="mt-0.5 text-[11px] text-muted-foreground/50 font-mono">
                            {result.path}
                          </p>
                        </div>
                        <ArrowRight
                          className={`h-4 w-4 transition-all ${
                            selectedIndex === index
                              ? "opacity-100 translate-x-0 text-primary"
                              : "opacity-0 -translate-x-2 text-muted-foreground"
                          }`}
                        />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {!query && !isLoading && !error && (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-4 py-8"
              >
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="flex flex-col items-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default">
                    <Sparkles className="h-5 w-5 text-chart-4 mb-2" />
                    <span className="text-xs font-medium">Quick Find</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default">
                    <Clock className="h-5 w-5 text-chart-2 mb-2" />
                    <span className="text-xs font-medium">Instant</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-default">
                    <TrendingUp className="h-5 w-5 text-chart-1 mb-2" />
                    <span className="text-xs font-medium">Smart</span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Start typing to search across all pages and blog posts
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-background border border-border px-1.5 font-mono text-[10px] font-medium shadow-sm">
                ↑
              </kbd>
              <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-background border border-border px-1.5 font-mono text-[10px] font-medium shadow-sm">
                ↓
              </kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="inline-flex h-5 items-center justify-center rounded bg-background border border-border px-1.5 font-mono text-[10px] font-medium shadow-sm">
                Enter
              </kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
          <kbd className="inline-flex h-6 items-center justify-center rounded bg-background border border-border px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
            ESC
          </kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}
