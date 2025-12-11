"use client";

import React, { useCallback, useState } from "react";
import { Box, Button, Note, Paragraph, Text } from "@contentful/f36-components";
import type { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK, useAutoResizer } from "@contentful/react-apps-toolkit";
import type { PexelsImage } from "../../types";

export default function PexelsField() {
  const sdk = useSDK<FieldAppSDK>();
  useAutoResizer();
  const installationParams = sdk.parameters.installation as
    | {
        pexelsApiKey?: string;
        proxyUrl?: string;
        proxyHandlesApiKey?: boolean;
      }
    | undefined;

  const apiKey = installationParams?.pexelsApiKey ?? null;
  const proxyUrl = installationParams?.proxyUrl;
  const proxyHandlesApiKey = installationParams?.proxyHandlesApiKey ?? false;
  const [current, setCurrent] = useState<PexelsImage | null>(() => {
    const raw = sdk.field.getValue();
    if (raw && typeof raw === "object" && (raw as any).provider === "pexels") {
      return raw as PexelsImage;
    }
    return null;
  });
  const [lastQuery, setLastQuery] = useState("");
  const [lastOrientation, setLastOrientation] = useState<
    "any" | "landscape" | "portrait" | "square"
  >("any");

  const handleOpenDialog = useCallback(async () => {
    // Allow opening if proxy handles API key OR if we have an API key
    if (!proxyHandlesApiKey && !apiKey) return;

    const result = (await sdk.dialogs.openCurrentApp({
      width: 800,
      position: "center",
      minHeight: "800px",
      allowHeightOverflow: true,
      shouldCloseOnEscapePress: true,
      shouldCloseOnOverlayClick: true,
      parameters: {
        apiKey: apiKey || "",
        proxyUrl: proxyUrl || "",
        proxyHandlesApiKey,
        lastQuery,
        lastOrientation,
        locale: sdk.field.locale,
      },
    })) as {
      image: PexelsImage;
      query: string;
      orientation: "any" | "landscape" | "portrait" | "square";
    } | null;

    if (result?.image) {
      sdk.field.setValue(result.image);
      setCurrent(result.image);
      setLastQuery(result.query || "");
      setLastOrientation(result.orientation || "any");
    }
  }, [
    apiKey,
    proxyUrl,
    proxyHandlesApiKey,
    lastOrientation,
    lastQuery,
    sdk.dialogs,
    sdk.field,
  ]);

  const handleClear = useCallback(() => {
    sdk.field.removeValue();
    setCurrent(null);
  }, [sdk.field]);

  if (!proxyHandlesApiKey && !apiKey) {
    return (
      <Note variant="warning">
        <Text>
          Pexels API key is not configured. Ask an admin to open the app&apos;s
          configuration and add a key from the{" "}
          <a
            href="https://www.pexels.com/api/"
            target="_blank"
            rel="noreferrer"
          >
            Pexels API page
          </a>
          .
        </Text>
      </Note>
    );
  }

  return (
    <Box>
      {current ? (
        <Box
          style={{
            border: "1px solid #dde2eb",
            borderRadius: 4,
            background: "#f7f9fb",
            padding: 12,
            marginBottom: 8,
          }}
        >
          <Text
            as="p"
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Selected Pexels image
          </Text>
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            {current.src && (
              <img
                src={
                  current.src.medium ||
                  current.src.original ||
                  current.src.small
                }
                alt={current.alt || "Selected Pexels image"}
                style={{
                  // width: 260,
                  // height: 180,
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  display: "block",
                  // maxWidth: 260,
                  // width: "100%",
                  // height: "auto",
                  // objectFit: "cover",
                  borderRadius: 4,
                  border: "1px solid #dde2eb",
                }}
              />
            )}
            <Box style={{ width: "100%" }}>
              <Text fontWeight="fontWeightMedium">{current.alt}</Text>
              <Paragraph style={{ marginTop: 2, fontSize: 12 }}>
                {current.photographer?.name && (
                  <>Photo by {current.photographer.name} on Pexels</>
                )}
              </Paragraph>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <Button size="small" onClick={handleClear} variant="secondary">
                  Clear
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          style={{
            border: "1px dashed #dde2eb",
            borderRadius: 4,
            padding: 12,
            marginBottom: 8,
          }}
        >
          <Paragraph style={{ margin: 0, fontSize: 13 }}>
            No Pexels image selected.
          </Paragraph>
        </Box>
      )}
      <Button variant="primary" size="small" onClick={handleOpenDialog}>
        {current ? "Change image" : "Choose from Pexels"}
      </Button>
    </Box>
  );
}
