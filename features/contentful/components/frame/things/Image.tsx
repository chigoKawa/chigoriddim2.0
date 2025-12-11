"use client";

import React from "react";
import type { Asset } from "contentful";
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from "@contentful/live-preview/react";
import { renderAsset } from "../utils";
import type {
  IImageWrapper,
  IPexelsImageWrapper,
  IPexelsPhotoData,
  IPexelsPhotoDataLegacy,
} from "@/features/contentful/type";

type DisplayMode = "default" | "hero";

/** Type guard to check if pexels data is the new format */
function isNewPexelsFormat(data: unknown): data is IPexelsPhotoData {
  return (
    typeof data === "object" &&
    data !== null &&
    "provider" in data &&
    (data as IPexelsPhotoData).provider === "pexels"
  );
}

/** Type guard to check if pexels data is the legacy format */
function isLegacyPexelsFormat(data: unknown): data is IPexelsPhotoDataLegacy {
  return (
    typeof data === "object" &&
    data !== null &&
    "photographer" in data &&
    typeof (data as IPexelsPhotoDataLegacy).photographer === "string" &&
    "src" in data
  );
}

/** Get the best URL from pexels data based on display mode */
function getPexelsUrl(
  data: IPexelsPhotoData | IPexelsPhotoDataLegacy | undefined,
  display: DisplayMode
): string | undefined {
  if (!data?.src) return undefined;

  const s = data.src;

  // Check for preferred variant in new format
  if (isNewPexelsFormat(data) && data.display?.preferredVariant) {
    const preferred = s[data.display.preferredVariant];
    if (preferred) return preferred;
  }

  // Hero prefers wider images
  if (display === "hero") {
    return s.landscape || s.large2x || s.large || s.original;
  }

  // Default prefers reasonable size
  return s.medium || s.large || s.small || s.original;
}

/** Get alt text from pexels data */
function getPexelsAlt(
  data: IPexelsPhotoData | IPexelsPhotoDataLegacy | undefined
): string | undefined {
  if (!data) return undefined;

  if (isNewPexelsFormat(data)) {
    return data.alt || data.attribution?.text;
  }

  if (isLegacyPexelsFormat(data)) {
    return data.alt || data.attribution || data.photographer_attribution;
  }

  return undefined;
}

export default function ThingImage({
  entry,
  display = "default",
}: {
  entry: IImageWrapper | IPexelsImageWrapper;
  display?: DisplayMode;
}) {
  const live =
    (useContentfulLiveUpdates(entry) as IImageWrapper | IPexelsImageWrapper) ||
    entry;
  const inspectorProps = useContentfulInspectorMode({ entryId: live?.sys?.id });
  const fields = live?.fields as Partial<
    IImageWrapper["fields"] & IPexelsImageWrapper["fields"]
  > &
    Partial<{ image?: Asset; url?: string; src?: string }>;

  // Resolve a source either from a Contentful Asset, legacy url/src string, or Pexels payload
  const asset = (fields?.asset ||
    (fields as unknown as { image?: Asset })?.image) as Asset | undefined;

  // Pexels support: handle both new and legacy formats
  const pexelsData = fields?.pexelsImage as
    | IPexelsPhotoData
    | IPexelsPhotoDataLegacy
    | undefined;

  const pexelsUrl = getPexelsUrl(pexelsData, display);
  const pexelsAlt = getPexelsAlt(pexelsData);

  const legacyUrl =
    (fields as unknown as { url?: string; src?: string })?.url ||
    (fields as unknown as { url?: string; src?: string })?.src;

  const resolved = asset ?? (pexelsUrl as string | undefined) ?? legacyUrl;

  const presentFieldId = asset
    ? fields?.asset
      ? "asset"
      : "image"
    : pexelsUrl
    ? ("pexelsImage" as const)
    : legacyUrl
    ? ("url" as const)
    : ("asset" as const);
  const hero = display === "hero";

  return (
    <div
      {...inspectorProps({ fieldId: presentFieldId })}
      className={hero ? "" : "rounded-xl overflow-hidden aspect-video"}
      title={pexelsAlt}
    >
      {renderAsset(resolved, { alt: pexelsAlt })}
    </div>
  );
}
