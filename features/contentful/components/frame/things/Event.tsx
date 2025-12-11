"use client";

import React from "react";
import type { IEvent } from "@/features/contentful/type";
import { usePreviewMode } from "@/features/contentful/preview-context";
import { usePreviewWarnings } from "@/features/contentful/preview-warnings-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

function formatDateRange(start?: string, end?: string) {
  if (!start && !end) return "";
  const startDate = start ? new Date(start) : undefined;
  const endDate = end ? new Date(end) : undefined;

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (startDate && endDate) {
    if (startDate.getTime() === endDate.getTime()) return fmt(startDate);
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  }
  if (startDate) return fmt(startDate);
  if (endDate) return fmt(endDate);
  return "";
}

const categoryColor: Record<string, string> = {
  "Public Holiday": "bg-emerald-500 text-emerald-50",
  Cultural: "bg-indigo-500 text-indigo-50",
  Company: "bg-sky-500 text-sky-50",
};

export default function Event({ entry }: { entry: IEvent }) {
  const isPreview = usePreviewMode();
  const { showWarnings } = usePreviewWarnings();

  const { title, category, startDate, endDate, description } = entry.fields;
  const dateLabel = formatDateRange(startDate, endDate);
  const catClass = category
    ? categoryColor[category] ?? "bg-slate-500 text-slate-50"
    : "bg-slate-500 text-slate-50";

  const now = new Date();
  const starts = startDate ? new Date(startDate) : undefined;
  const ends = endDate ? new Date(endDate) : undefined;
  const isPast = ends
    ? ends < now
    : startDate
    ? new Date(startDate) < now
    : false;

  return (
    <div className="relative">
      {isPreview && showWarnings && isPast ? (
        <div className="mb-2 rounded-md border border-dashed border-amber-500/70 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-900 dark:text-amber-100">
          <span className="font-medium">Event timing</span>
          <div className="mt-0.5">This event appears to be in the past.</div>
        </div>
      ) : null}

      <Card className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {category ? <Badge className={catClass}>{category}</Badge> : null}
              {dateLabel ? (
                <span className="text-[11px] font-medium text-muted-foreground">
                  {dateLabel}
                </span>
              ) : null}
            </div>
            <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--color-foreground)]">
              {title}
            </h3>
          </div>
        </div>
        {description ? (
          <div className="mt-1 text-xs text-muted-foreground prose prose-xs max-w-none">
            {documentToReactComponents(description as any)}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
