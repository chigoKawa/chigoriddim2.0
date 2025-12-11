"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SearchDocument, SearchIndex, SearchResult } from "./types";
import { trackSearch } from "@/lib/analytics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlexSearchIndexType = any;

let indexPromise: Promise<FlexSearchIndexType> | null = null;
const documentsMap: Map<string, SearchDocument> = new Map();

/**
 * Load and initialize the search index (singleton)
 */
async function loadSearchIndex(): Promise<FlexSearchIndexType> {
  if (indexPromise) return indexPromise;

  indexPromise = (async () => {
    try {
      // Dynamic import to avoid SSR issues
      const FlexSearch = (await import("flexsearch")).default;

      const response = await fetch("/search-index.json");
      if (!response.ok) {
        // In dev mode, the index might not exist yet
        console.warn(
          "Search index not found. Run `npm run build:search-index` to generate it."
        );
        throw new Error("Search index not available. Please build it first.");
      }

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Search index not available. Run `npm run build:search-index` to generate it."
        );
      }

      const data: SearchIndex = await response.json();

      // Create FlexSearch document index
      const index = new FlexSearch.Document({
        document: {
          id: "id",
          index: ["title", "excerpt"],
          store: ["id", "type", "title", "path", "excerpt"],
        },
        tokenize: "forward",
        resolution: 9,
        cache: 100,
      });

      // Add documents to index and map
      for (const doc of data.documents) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        index.add(doc as any);
        documentsMap.set(doc.id, doc);
      }

      return index;
    } catch (error) {
      console.error("Error loading search index:", error);
      indexPromise = null;
      throw error;
    }
  })();

  return indexPromise;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexLoaded, setIsIndexLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const indexRef = useRef<FlexSearchIndexType | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load index on mount
  useEffect(() => {
    loadSearchIndex()
      .then((index) => {
        indexRef.current = index;
        setIsIndexLoaded(true);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    if (!indexRef.current) {
      setError("Search index not loaded");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Search in both title and excerpt fields
      const searchResults = indexRef.current.search(searchQuery, {
        limit: 10,
        enrich: true,
      });

      // Deduplicate and merge results from different fields
      const seenIds = new Set<string>();
      const mergedResults: SearchResult[] = [];

      for (const fieldResult of searchResults) {
        for (const item of fieldResult.result) {
          const id = typeof item === "object" ? item.id : item;
          if (!seenIds.has(String(id))) {
            seenIds.add(String(id));
            const doc = documentsMap.get(String(id));
            if (doc) {
              mergedResults.push(doc);
            }
          }
        }
      }

      setResults(mergedResults);

      // Track search analytics
      trackSearch(searchQuery, mergedResults.length);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      search(query);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isIndexLoaded,
    error,
    clearSearch,
  };
}
