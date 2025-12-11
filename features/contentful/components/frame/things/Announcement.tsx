"use client";

import React from "react";
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from "@contentful/live-preview/react";
import type { IAnnouncement } from "@/features/contentful/type";
import { usePreviewMode } from "@/features/contentful/preview-context";
import { usePreviewWarnings } from "@/features/contentful/preview-warnings-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return "";
  const startDate = start ? new Date(start) : undefined;
  const endDate = end ? new Date(end) : undefined;

  // Use explicit locale and UTC to avoid hydration mismatch between server and client
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  if (startDate && endDate) {
    if (startDate.getTime() === endDate.getTime()) return fmt(startDate);
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  }
  if (startDate) return fmt(startDate);
  if (endDate) return fmt(endDate);
  return "";
}

type AnnouncementDisplay = "default" | "hero";

export default function Announcement({
  entry,
  display = "default",
}: {
  entry: IAnnouncement;
  display?: AnnouncementDisplay;
}) {
  // Live preview hooks for real-time updates
  const live = (useContentfulLiveUpdates(entry) as IAnnouncement) || entry;
  const inspectorProps = useContentfulInspectorMode({ entryId: live?.sys?.id });

  const isPreview = usePreviewMode();
  const { showWarnings } = usePreviewWarnings();

  const { body, startDate, endDate } = live.fields;
  const dateLabel = formatDateRange(startDate, endDate);

  const now = new Date();
  const starts = startDate ? new Date(startDate) : undefined;
  const ends = endDate ? new Date(endDate) : undefined;

  // Check if announcement has expired (end date is in the past)
  const isExpired = ends && ends < now;

  // Check if announcement hasn't started yet
  const isNotStarted = starts && starts > now;

  const isInactive = isNotStarted || (isExpired && !starts);

  // Hide expired announcements in production (show in preview for editors)
  if (isExpired && !isPreview) {
    return null;
  }

  const isHero = display === "hero";

  return (
    <div className={isHero ? "relative mx-auto max-w-3xl" : "relative"}>
      {isPreview && showWarnings && isInactive ? (
        <div className="mb-2 rounded-md border border-dashed border-amber-500/70 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-900 dark:text-amber-100">
          <span className="font-medium">Announcement timing</span>
          <div className="mt-0.5">
            This announcement appears to be outside its active date range.
          </div>
        </div>
      ) : null}

      <Card
        className={
          isHero
            ? "border border-[color:var(--color-primary)]/50 bg-[color:var(--color-primary)]/10 px-5 py-4 sm:px-8 sm:py-6 text-center flex flex-col gap-2 shadow-sm"
            : "border border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/5 px-3 py-2 sm:px-4 sm:py-3 text-left flex flex-col gap-1"
        }
      >
        <div
          className={
            isHero
              ? "flex flex-wrap items-center justify-center gap-2"
              : "flex flex-wrap items-center justify-between gap-2"
          }
        >
          <div className="inline-flex items-center gap-2">
            <Badge className="bg-[color:var(--color-primary)] text-[color:var(--color-on-primary,white)]">
              Announcement
            </Badge>
            {dateLabel ? (
              <span
                {...inspectorProps({ fieldId: "startDate" })}
                className="text-[11px] text-muted-foreground"
              >
                {dateLabel}
              </span>
            ) : null}
          </div>
        </div>
        <div
          {...inspectorProps({ fieldId: "body" })}
          className={
            isHero
              ? "mt-2 text-sm sm:text-base text-[color:var(--color-foreground)] prose prose-sm sm:prose-base max-w-none mx-auto"
              : "mt-1 text-xs sm:text-sm text-[color:var(--color-foreground)] prose prose-xs sm:prose-sm max-w-none"
          }
        >
          {documentToReactComponents(body as any)}
        </div>
      </Card>
    </div>
  );
}
