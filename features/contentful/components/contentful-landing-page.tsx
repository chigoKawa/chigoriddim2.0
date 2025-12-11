"use client";

import React, { FC } from "react";
import { ILandingPage, IFrame } from "../type";
import Frame from "./frame/frame";
import { usePreviewMode } from "@/features/contentful/preview-context";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import Link from "next/link";

interface IProps {
  entry: ILandingPage;
  // locale and slug are currently unused but may be needed for future i18n
}

const ContentfulLandingPage: FC<IProps> = ({ entry: publishedEntry }) => {
  const isPreview = usePreviewMode();
  const entry =
    (useContentfulLiveUpdates(publishedEntry) as ILandingPage | null) ||
    publishedEntry;
  const frames = entry?.fields?.frames as unknown as IFrame[] | undefined;

  // Build breadcrumbs from the parent chain (if present). We rely on the
  // server query including linked parents so that entry.fields.parent is
  // resolved to a full landingPage entry.
  const breadcrumbs: { title: string; href: string }[] = [];
  let node: ILandingPage | undefined = entry;
  while (node) {
    const title: string =
      node.fields?.title || node.fields?.internalTitle || "";
    const path: string =
      node.fields?.fullPath || node.fields?.slugSegment || "";

    breadcrumbs.push({
      title,
      href: path ? `${path}` : "/",
    });

    const parent = node.fields?.parent as ILandingPage | undefined;
    if (!parent) break;
    node = parent;
  }

  breadcrumbs.reverse();

  if (isPreview && typeof window !== "undefined") {
    // Lightweight debug to help validate wiring during preview.
    // Debug statement removed
  }

  return (
    <div className="w-full overflow-hidden">
      {breadcrumbs.length > 1 ? (
        <div className="container mx-auto max-w-7xl px-4 pt-4">
          <nav
            className="mb-4 text-xs text-muted-foreground"
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={crumb.href}>
                  {!isLast ? (
                    <>
                      <Link href={crumb.href} className="hover:underline">
                        {crumb.title || "Untitled"}
                      </Link>
                      <span className="mx-1">/</span>
                    </>
                  ) : (
                    <span className="font-medium text-foreground">
                      {crumb.title || "Untitled"}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        </div>
      ) : null}
      {/* {isPreview && Array.isArray(frames) ? (
        <div className="container mx-auto max-w-7xl px-4 pt-4">
          <div className="mb-2 inline-flex max-w-xl flex-col gap-1 rounded-md border border-dashed border-sky-500/70 bg-sky-500/10 px-3 py-2 text-xs text-sky-900 dark:text-sky-100">
            <span className="font-medium">Page debug</span>
            <span>{`Resolved frames: ${frames.length}`}</span>
          </div>
        </div>
      ) : null} */}
      {Array.isArray(frames) &&
        frames.map((frameEntry, index) => (
          <Frame key={`frame-${index}`} {...frameEntry} />
        ))}
    </div>
  );
};

export default ContentfulLandingPage;
