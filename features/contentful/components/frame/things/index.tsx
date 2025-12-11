/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import ThingCallout from "./Callout";
import ThingImage from "./Image";
import ThingBlogPost from "./BlogPost";
import EventGroup from "./EventGroup";
import Announcement from "./Announcement";
import Event from "./Event";
import FaqGroup from "./FaqGroup";
import ContentfulFormRenderer from "./ContentfulForm";
import BlurbWrapper from "@/features/contentful/components/blurb/blurb-wrapper";
import PdfWrapper from "@/features/contentful/components/pdf-wrapper/pdf-wrapper";
import type {
  ICallout,
  IImageWrapper,
  IPexelsImageWrapper,
  IBlogPostPage,
  IEventGroup,
  IAnnouncement,
  IEvent,
  IFaqGroup,
  IFaqItem,
  IBlurb,
  IPdfWrapper,
  IContentfulForm,
} from "@/features/contentful/type";
import { Experience } from "@ninetailed/experience.js-react";
import { ExperienceMapper } from "@ninetailed/experience.js-utils-contentful";

type ThingEntry =
  | ICallout
  | IImageWrapper
  | IPexelsImageWrapper
  | IBlogPostPage
  | IEventGroup
  | IAnnouncement
  | IEvent
  | IFaqGroup
  | IFaqItem
  | IBlurb
  | IPdfWrapper
  | IContentfulForm;
type ThingDisplay = "default" | "hero";

function ThingView({
  entry,
  display,
}: {
  entry: ThingEntry;
  display: ThingDisplay;
}) {
  const liveEntry = useContentfulLiveUpdates(entry) || entry;
  const ctid = liveEntry?.sys?.contentType?.sys?.id as string | undefined;
  if (!ctid) return null;

  switch (ctid) {
    case "callout":
      return <ThingCallout entry={liveEntry as ICallout} display={display} />;
    case "imageWrapper":
    case "pexelsImageWrapper":
      return (
        <ThingImage
          entry={liveEntry as IImageWrapper | IPexelsImageWrapper}
          display={display}
        />
      );
    case "blogPost":
      return <ThingBlogPost entry={liveEntry as IBlogPostPage} />;
    case "event":
      return <Event entry={liveEntry as IEvent} />;
    case "eventGroup":
      return <EventGroup entry={liveEntry as IEventGroup} />;
    case "announcement":
      return (
        <Announcement entry={liveEntry as IAnnouncement} display={display} />
      );
    case "faqGroup":
      return <FaqGroup entry={liveEntry as IFaqGroup} />;
    case "blurb":
      return <BlurbWrapper entry={liveEntry as IBlurb} />;
    case "pdfWrapper":
      return <PdfWrapper entry={liveEntry as IPdfWrapper} />;
    case "contentfulForm":
      return <ContentfulFormRenderer entry={liveEntry as IContentfulForm} />;
    default:
      console.warn("Unsupported Thing content type:", ctid);
      return (
        <div className="rounded-lg border border-dashed border-amber-500/60 bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-200">
          <p className="font-medium">Missing renderer for Thing type: {ctid}</p>
          <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-100/70">
            This block is coming from Contentful but does not yet have a React
            component. Implement it in
            <code className="mx-1 rounded bg-amber-900/10 px-1 py-0.5">
              features/contentful/components/frame/things
            </code>
            and add a case in the Thing dispatcher.
          </p>
        </div>
      );
  }
}

export default function Thing({
  entry,
  display = "default",
}: {
  entry: ThingEntry;
  display?: ThingDisplay;
}) {
  const liveEntry = useContentfulLiveUpdates(entry) || entry;
  const experiences = (liveEntry as any)?.fields?.nt_experiences ?? [];

  const mapped = Array.isArray(experiences)
    ? experiences
        .filter(ExperienceMapper.isExperienceEntry)
        .map(ExperienceMapper.mapExperience)
    : [];

  if (mapped.length > 0) {
    return (
      <Experience
        loadingComponent={() => (
          <ThingView entry={liveEntry as ThingEntry} display={display} />
        )}
        id={liveEntry.sys.id}
        component={(props: any) => (
          <ThingView entry={props} display={display} />
        )}
        experiences={mapped}
        {...(liveEntry as any)}
      />
    );
  }

  return <ThingView entry={liveEntry as ThingEntry} display={display} />;
}
