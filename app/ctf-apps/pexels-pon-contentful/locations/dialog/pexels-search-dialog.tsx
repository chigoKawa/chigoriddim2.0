"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Form,
  Note,
  Paragraph,
  Select,
  Text,
  TextInput,
} from "@contentful/f36-components";
import type { DialogAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { sendGTMEvent } from "@next/third-parties/google";
import type { PexelsImage } from "../../types";
import { DEFAULT_PEXELS_PROXY_URL } from "../../constants";

interface PexelsPhotoApi {
  id: number;
  width: number;
  height: number;
  url: string;
  avg_color?: string;
  alt?: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  src: {
    original: string;
    large?: string;
    large2x?: string;
    medium?: string;
    small?: string;
    portrait?: string;
    landscape?: string;
    tiny?: string;
  };
}

interface PexelsDialogInvocation {
  apiKey?: string;
  proxyUrl?: string;
  proxyHandlesApiKey?: boolean;
  lastQuery?: string;
  lastOrientation?: "any" | "landscape" | "portrait" | "square";
  locale?: string;
}

export default function PexelsSearchDialog() {
  const sdk = useSDK<DialogAppSDK>();
  const {
    apiKey,
    proxyUrl,
    proxyHandlesApiKey,
    lastQuery,
    lastOrientation,
    locale,
  } =
    (sdk.parameters as unknown as { invocation?: PexelsDialogInvocation })
      .invocation ?? {};

  // Use configured proxy URL or fall back to default
  const effectiveProxyUrl = proxyUrl || DEFAULT_PEXELS_PROXY_URL;

  const [query, setQuery] = useState<string>(lastQuery || "");
  const [orientation, setOrientation] = useState<
    "any" | "landscape" | "portrait" | "square"
  >(lastOrientation || "any");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PexelsPhotoApi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // If there is a remembered query from the field, keep it in the input
    // and automatically run a search when the dialog opens.
    if (lastQuery) {
      setQuery(lastQuery);
      // Fire and forget; executeSearch guards against empty queries/API key.
      executeSearch(true);
    }
    // We intentionally omit executeSearch from deps to avoid re-running when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastQuery]);

  const mapPhotoToPexelsImage = useCallback(
    (photo: PexelsPhotoApi): PexelsImage => {
      const attributionText = `Photo by ${photo.photographer} on Pexels`;

      return {
        provider: "pexels",
        photoId: photo.id,
        url: photo.url,
        width: photo.width,
        height: photo.height,
        alt: photo.alt || attributionText,
        avgColor: photo.avg_color,
        src: photo.src,
        photographer: {
          id: photo.photographer_id,
          name: photo.photographer,
          url: photo.photographer_url,
        },
        attribution: {
          text: attributionText,
          url: photo.url,
        },
        meta: {
          selectedAt: new Date().toISOString(),
          source: "search",
          locale: locale as string | undefined,
        },
        display: {
          preferredVariant: photo.src.landscape
            ? "landscape"
            : photo.src.medium
            ? "medium"
            : "original",
          focalUsage: "card",
        },
      };
    },
    [locale]
  );

  const executeSearch = useCallback(
    async (resetPage: boolean) => {
      // Allow search if proxy handles API key OR if we have an API key
      if (!proxyHandlesApiKey && !apiKey) return;
      if (!query.trim()) return;

      setSearching(true);
      setError(null);

      const targetPage = resetPage ? 1 : page + 1;

      try {
        const params = new URLSearchParams({
          query: query.trim(),
          per_page: "24",
          page: String(targetPage),
        });

        if (orientation !== "any") {
          params.set("orientation", orientation);
        }

        // Use proxy to avoid CORS issues
        const headers: Record<string, string> = {};
        if (!proxyHandlesApiKey && apiKey) {
          headers["x-pexels-api-key"] = apiKey;
        }
        const res = await fetch(`${effectiveProxyUrl}?${params.toString()}`, {
          headers,
        });

        if (!res.ok) {
          throw new Error(`Pexels API error: ${res.status}`);
        }

        const json = await res.json();
        const photos = Array.isArray(json.photos)
          ? (json.photos as PexelsPhotoApi[])
          : [];

        // Track search in GTM
        sendGTMEvent({
          event: "pexels_app_search",
          search_query: query.trim(),
          orientation,
          results_count: photos.length,
          page: targetPage,
          using_proxy: !!effectiveProxyUrl,
        });

        setPage(targetPage);
        setHasMore(photos.length > 0);
        setResults((prev) => (resetPage ? photos : [...prev, ...photos]));
      } catch (error: unknown) {
        // Surface a helpful message while still logging the original error for debugging.

        console.error("Pexels search failed", error);
        setError("Failed to search Pexels. Check your API key and try again.");
        if (resetPage) {
          setResults([]);
        }
        setHasMore(false);
      } finally {
        setSearching(false);
      }
    },
    [apiKey, effectiveProxyUrl, orientation, page, proxyHandlesApiKey, query]
  );

  const handleSearch = useCallback(() => {
    executeSearch(true);
  }, [executeSearch]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !searching) {
      executeSearch(false);
    }
  }, [executeSearch, hasMore, searching]);

  const handleSelect = useCallback(
    (photo: PexelsPhotoApi) => {
      // Track image selection in GTM
      sendGTMEvent({
        event: "pexels_app_image_selected",
        photo_id: photo.id,
        photographer: photo.photographer,
        search_query: query,
        orientation,
      });

      const mapped = mapPhotoToPexelsImage(photo);
      sdk.close({
        image: mapped,
        query,
        orientation,
      });
    },
    [mapPhotoToPexelsImage, orientation, query, sdk]
  );

  const handleCancel = useCallback(() => {
    sdk.close(null);
  }, [sdk]);

  return (
    <Box padding="spacingL" style={{ minHeight: "60vh" }}>
      <Paragraph marginBottom="spacingS">
        Search Pexels and choose an image.
      </Paragraph>

      <Form
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 8,
        }}
      >
        <Box
          marginBottom="spacingS"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Pexels (e.g. 'mountains', 'coffee')"
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Select
            value={orientation}
            onChange={(e) =>
              setOrientation(
                e.target.value as "any" | "landscape" | "portrait" | "square"
              )
            }
          >
            <Select.Option value="any">Any orientation</Select.Option>
            <Select.Option value="landscape">Landscape</Select.Option>
            <Select.Option value="portrait">Portrait</Select.Option>
            <Select.Option value="square">Square</Select.Option>
          </Select>
          <Button
            variant="primary"
            onClick={handleSearch}
            isDisabled={!query.trim() || searching}
          >
            {searching ? "Searching…" : "Search"}
          </Button>
        </Box>

        {error && (
          <Box marginBottom="spacingS">
            <Note variant="negative">
              <Text>{error}</Text>
            </Note>
          </Box>
        )}

        <Box
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {results.length > 0 ? (
            <>
              <Box
                marginTop="spacingS"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 8,
                }}
              >
                {results.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => handleSelect(photo)}
                    style={
                      {
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        background: "transparent",
                      } as React.CSSProperties
                    }
                  >
                    <img
                      src={
                        photo.src.medium ||
                        photo.src.large ||
                        photo.src.original
                      }
                      alt={photo.alt || "Pexels image"}
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "1px solid #dde2eb",
                      }}
                    />
                  </button>
                ))}
              </Box>
              {hasMore && (
                <Box
                  marginTop="spacingS"
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleLoadMore}
                    isDisabled={searching}
                  >
                    Load more
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Paragraph marginTop="spacingS">
              Enter a search term and click Search to see results from Pexels.
            </Paragraph>
          )}
        </Box>

        <Box
          marginTop="spacingS"
          style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
        >
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </Box>
      </Form>
    </Box>
  );
}
