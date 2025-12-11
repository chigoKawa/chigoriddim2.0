"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Note,
  Paragraph,
  Spinner,
  Text,
} from "@contentful/f36-components";
import type { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import type { PexelsImage } from "../../types";

export default function PexelsSidebarSummary() {
  const sdk = useSDK<SidebarAppSDK>();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<PexelsImage[]>([]);

  useEffect(() => {
    async function collect() {
      setLoading(true);
      const found: PexelsImage[] = [];

      // Iterate over actual entry fields, not the content type link
      for (const fieldId of Object.keys(sdk.entry.fields)) {
        try {
          const f = sdk.entry.fields[fieldId];
          if (!f) continue;
          const value = f.getValue();

          if (Array.isArray(value)) {
            for (const item of value) {
              if (
                item &&
                typeof item === "object" &&
                (item as any).provider === "pexels"
              ) {
                found.push(item as PexelsImage);
              }
            }
          } else if (
            value &&
            typeof value === "object" &&
            (value as any).provider === "pexels"
          ) {
            found.push(value as PexelsImage);
          }
        } catch {
          // ignore field access issues
        }
      }

      setImages(found);
      setLoading(false);
    }

    collect();
  }, [sdk]);

  if (loading) {
    return (
      <Box
        marginTop="spacingM"
        style={{ display: "flex", alignItems: "center" }}
      >
        <Spinner size="small" />
        <Text style={{ marginLeft: 8 }}>Scanning for Pexels images…</Text>
      </Box>
    );
  }

  if (!images.length) {
    return (
      <Note>
        <Text>This entry does not reference any Pexels images yet.</Text>
      </Note>
    );
  }

  return (
    <Box>
      <Paragraph marginBottom="spacingS">
        Pexels images used in this entry
      </Paragraph>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 6,
        }}
      >
        {images.slice(0, 9).map((img, idx) => (
          <img
            key={idx}
            src={img.src.small || img.src.medium || img.src.original}
            alt={img.alt || "Pexels image"}
            style={{
              width: "100%",
              height: 60,
              objectFit: "cover",
              borderRadius: 3,
              border: "1px solid #dde2eb",
            }}
          />
        ))}
      </Box>
      {images.length > 9 && (
        <Paragraph marginTop="spacingXs" style={{ fontSize: 12 }}>
          + {images.length - 9} more
        </Paragraph>
      )}
    </Box>
  );
}
