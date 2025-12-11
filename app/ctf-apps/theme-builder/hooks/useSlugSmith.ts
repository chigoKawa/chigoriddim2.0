/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { locations, type SidebarAppSDK } from "@contentful/app-sdk";
import { ensureSiblingUniqueSegment } from "../lib/siblings";
import { buildFullPath } from "../lib/fullpath";
import { findFullPathConflict } from "../lib/conflicts";
import type { SlugFields } from "../types";
import { RECOMPUTE_DEBOUNCE_MS } from "../constants";
import { useSDK } from "@contentful/react-apps-toolkit";

export function useSlugSmith() {
  const sdk = useSDK<SidebarAppSDK>();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{
    segment: string;
    fullPath: string;
  } | null>(null);
  const lastPathRef = useRef<string | null>(null);

  const computeAndPreview = useCallback(
    async (sdkInst: SidebarAppSDK) => {
      setBusy(true);
      try {
        const fields = readFields(sdkInst);
        const segment = await ensureSiblingUniqueSegment(sdkInst, fields);
        const { fullPath, pathChain } = await buildFullPath(
          sdkInst,
          fields.parent,
          segment
        );

        setPreview({ segment, fullPath });

        await writeIfChanged(sdkInst, "fields.slugSegment", segment);
        await writeIfChanged(sdkInst, "fields.fullPath", fullPath);

        // Hybrid: update pathMeta JSON with chain and previous paths
        const existingMeta = fields.pathMeta || {};
        const prevList = Array.isArray(existingMeta.previousPaths)
          ? existingMeta.previousPaths
          : [];

        const prev = lastPathRef.current ?? (fields.fullPath || null);
        if (prev && prev !== fullPath) {
          const updatedMeta = {
            ...existingMeta,
            pathChain,
            previousPaths: prevList.includes(prev)
              ? prevList
              : [...prevList, prev],
          };
          await writeIfChanged(sdkInst, "fields.pathMeta", updatedMeta);
        } else {
          const updatedMeta = {
            ...existingMeta,
            pathChain,
            previousPaths: prevList,
          };
          await writeIfChanged(sdkInst, "fields.pathMeta", updatedMeta);
        }
        lastPathRef.current = fullPath;

        const conflictId = await findFullPathConflict(sdkInst, fullPath);
        if (conflictId && conflictId !== sdkInst.entry.getSys().id) {
          sdkInst.notifier.error(
            `Path "${fullPath}" is already in use by entry ${conflictId}.`
          );
        }
      } catch (e) {
        const err = e as { message?: string } | undefined;
        sdk?.notifier.error(
          err?.message ?? "SlugSmith failed to compute path."
        );
      } finally {
        setBusy(false);
      }
    },
    [sdk]
  );

  useEffect(() => {
    if (!sdk || !sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) return;
    sdk.window.startAutoResizer();
    const recompute = debounce(
      () => void computeAndPreview(sdk),
      RECOMPUTE_DEBOUNCE_MS
    );
    const unsub = sdk.entry.onSysChanged(recompute);
    void computeAndPreview(sdk);
    return () => {
      unsub?.();
    };
  }, [sdk, computeAndPreview]);

  function readFields(sdk: SidebarAppSDK): SlugFields {
    const g = (id: string) => (sdk.entry.fields as any)[id]?.getValue();
    return {
      title: g("title") as string | undefined,
      parent: g("parent") as SlugFields["parent"],
      slugSegment: g("slugSegment") as string | undefined,
      fullPath: g("fullPath") as string | undefined,
      pathMeta: g("pathMeta") as SlugFields["pathMeta"],
    };
  }

  async function writeIfChanged(
    sdk: SidebarAppSDK,
    dotted: string,
    value: unknown
  ) {
    const fieldId = dotted.split(".")[1];
    const field = (sdk.entry.fields as any)[fieldId];
    if (!field) return;
    const current = field.getValue() as unknown;
    const defaultLocale = sdk.locales.default;
    const localized = (current as Record<string, unknown>) || {};
    const currentVal =
      current && typeof localized === "object" && defaultLocale in localized
        ? (localized as Record<string, unknown>)[defaultLocale]
        : current;
    if (JSON.stringify(currentVal) === JSON.stringify(value)) return;
    await field.setValue(value as unknown as never);
  }

  return {
    sdk,
    busy,
    preview,
    recompute: () => sdk && computeAndPreview(sdk),
  } as const;
}
