"use client";

import React from "react";
import { motion } from "framer-motion";
import type { IEventGroup, IEvent } from "@/features/contentful/type";
import { usePreviewMode } from "@/features/contentful/preview-context";
import { usePreviewWarnings } from "@/features/contentful/preview-warnings-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";
import { Calendar, Clock, ChevronRight } from "lucide-react";

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

function getCategoryColor(category?: string) {
  switch (category) {
    case "Public Holiday":
      return "bg-accent shadow-accent/25";
    case "Cultural":
      return "bg-secondary shadow-secondary/25";
    case "Company":
    default:
      return "bg-primary shadow-primary/25";
  }
}

function getCategoryBadgeVariant(category?: string): "default" | "secondary" {
  switch (category) {
    case "Public Holiday":
      return "secondary";
    case "Cultural":
      return "default";
    case "Company":
    default:
      return "default";
  }
}

function getCategoryIcon(category?: string) {
  switch (category) {
    case "Public Holiday":
      return Calendar;
    case "Cultural":
      return Clock;
    case "Company":
    default:
      return Calendar;
  }
}

export default function EventGroup({ entry }: { entry: IEventGroup }) {
  const isPreview = usePreviewMode();
  const { showWarnings } = usePreviewWarnings();

  const events =
    (entry.fields.events as unknown as IEvent[] | undefined) ?? undefined;

  const sorted = (events ?? []).slice().sort((a, b) => {
    const aDate = a.fields.startDate ? new Date(a.fields.startDate) : null;
    const bDate = b.fields.startDate ? new Date(b.fields.startDate) : null;
    if (aDate && bDate) return aDate.getTime() - bDate.getTime();
    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    return 0;
  });

  const hasNoEvents = !sorted || sorted.length === 0;
  const hasMissingDates = sorted.some((ev) => !ev.fields.startDate);

  return (
    <div className="relative">
      {entry.fields.title ? (
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {entry.fields.title}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
        </div>
      ) : null}
      {isPreview && showWarnings && hasNoEvents ? (
        <div className="mb-6 rounded-xl border border-dashed border-accent/30 bg-accent/5 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-accent" />
            <div>
              <span className="font-semibold text-accent-foreground">
                Event group is empty
              </span>
              <div className="mt-1 text-sm text-muted-foreground">
                Link one or more Events to this Event Group to see the timeline
                preview.
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {isPreview && showWarnings && hasMissingDates ? (
        <div className="mb-6 rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-destructive/60" />
            <div className="text-sm text-muted-foreground">
              Some events do not have a start date; they will appear at the
              bottom of the timeline.
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative pl-6 sm:pl-8">
        {/* Vertical timeline rail */}
        <div
          className="absolute left-1 sm:left-2 top-0 bottom-0 w-px bg-border"
          aria-hidden="true"
        />

        <div className="space-y-4">
          {sorted.map((ev, index) => {
            const category = ev.fields.category;
            const dateLabel = formatDateRange(
              ev.fields.startDate,
              ev.fields.endDate
            );
            const CategoryIcon = getCategoryIcon(category);

            return (
              <motion.div
                key={ev.sys.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="relative flex gap-3 sm:gap-4"
              >
                {/* Timeline node */}
                <div className="mt-1 flex flex-col items-center">
                  <div
                    className={[
                      "h-2.5 w-2.5 rounded-full border border-background shadow-sm",
                      getCategoryColor(category),
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                </div>

                {/* Modern event card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1"
                >
                  <Card className="group border-border/40 bg-gradient-to-br from-background via-background/95 to-background/90 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Enhanced header with gradient background */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 bg-gradient-to-r from-muted/30 to-muted/10 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={getCategoryBadgeVariant(category)}
                          className="px-3 py-1 text-xs font-semibold gap-1.5"
                        >
                          <CategoryIcon className="h-3 w-3" />
                          {category || "Event"}
                        </Badge>
                        {dateLabel ? (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {dateLabel}
                          </div>
                        ) : null}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </div>

                    {/* Enhanced content area */}
                    <div className="px-4 py-4">
                      <h3 className="text-base font-semibold leading-tight text-foreground mb-2 group-hover:text-primary transition-colors">
                        {ev.fields.title}
                      </h3>
                      {ev.fields.description ? (
                        <div className="text-sm text-muted-foreground/80 prose prose-sm max-w-none leading-relaxed">
                          {documentToReactComponents(
                            ev.fields.description as Document
                          )}
                        </div>
                      ) : null}
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}

          {hasNoEvents ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground/60">
                  No events linked yet.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
