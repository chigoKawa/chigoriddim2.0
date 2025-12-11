"use client";

import React from "react";
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from "@contentful/live-preview/react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { baseRichTextOptions } from "@/features/contentful/richtext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import BaseButtonWrapper from "../../base-button/base-button-wrapper";
import type { ICallout, IBaseButton } from "@/features/contentful/type";
import { renderAsset } from "../utils";
import { extractContentfulAssetUrl } from "@/lib/utils";

type DisplayMode = "default" | "hero";

export default function ThingCallout({
  entry,
  display = "default",
}: {
  entry: ICallout;
  display?: DisplayMode;
}) {
  const live = (useContentfulLiveUpdates(entry) as ICallout) || entry;
  const inspectorProps = useContentfulInspectorMode({ entryId: live?.sys?.id });
  const f = live.fields;

  const title = f.title; // rich text
  const subtitle = f.subtitle; // rich text
  const button = f.button as IBaseButton | undefined;
  const media = f.media;

  const hero = display === "hero";
  const cardClass = hero
    ? "bg-transparent border-0 shadow-none rounded-none mx-auto max-w-3xl"
    : "rounded-2xl shadow-sm";

  if (hero) {
    return (
      <div className="mx-auto max-w-3xl text-inherit">
        <div className="text-center">
          {title ? (
            <div
              {...inspectorProps({ fieldId: "title" })}
              className="text-current"
            >
              {documentToReactComponents(title, baseRichTextOptions)}
            </div>
          ) : null}
          {subtitle ? (
            <div
              {...inspectorProps({ fieldId: "subtitle" })}
              className="text-current/80 mt-2"
            >
              {documentToReactComponents(subtitle, baseRichTextOptions)}
            </div>
          ) : null}
        </div>
        {button ? (
          <div
            {...inspectorProps({ fieldId: "button" })}
            className="mt-6 flex justify-center"
          >
            <BaseButtonWrapper {...button} />
          </div>
        ) : null}
      </div>
    );
  }

  if (media) {
    return (
      <article
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--radius, 8px)",
          overflow: "hidden",
          //border: "1px solid var(--color-border, #e5e7eb)",
          //background: "var(--color-background, #ffffff)",
          background:
            "linear-gradient(161deg, var(--color-primary-300) 0%, transparent 50%, transparent 100%)",
          boxShadow: "rgba(15, 23, 42, 0.32) 7px 7px 13px -11px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "66%",
            // background: "var(--color-background, #f8fafc)",
          }}
        >
          {media ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={extractContentfulAssetUrl(media)}
              alt={subtitle?.toString() || ""}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            padding: 28,
            display: "grid",
            gap: 12,
            color: "var(--color-foreground, #111827)",
            flexGrow: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.2,
                fontWeight: 600,
              }}
            >
              {title ? (
                <span {...inspectorProps({ fieldId: "title" })}>
                  {documentToReactComponents(title, baseRichTextOptions)}
                </span>
              ) : null}
            </h3>
          </div>

          {subtitle ? (
            <div
              {...inspectorProps({ fieldId: "subtitle" })}
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.4,
                fontFamily: "var(--font-family-subheader)",
              }}
            >
              {documentToReactComponents(subtitle, baseRichTextOptions)}
            </div>
          ) : null}

          {button ? (
            <div {...inspectorProps({ fieldId: "button" })}>
              <BaseButtonWrapper {...button} />
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <>
      <Card className={cardClass}>
        {
          <>
            <CardHeader>
              {title ? (
                <CardTitle {...inspectorProps({ fieldId: "title" })}>
                  {documentToReactComponents(title, baseRichTextOptions)}
                </CardTitle>
              ) : null}
              {subtitle ? (
                <CardDescription {...inspectorProps({ fieldId: "subtitle" })}>
                  {documentToReactComponents(subtitle, baseRichTextOptions)}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent>
              {media ? (
                <div
                  {...inspectorProps({ fieldId: "media" })}
                  className="aspect-video rounded-lg overflow-hidden"
                >
                  {renderAsset(media, "w-full h-full object-cover")}
                </div>
              ) : null}
            </CardContent>
            {button ? (
              <CardFooter {...inspectorProps({ fieldId: "button" })}>
                <BaseButtonWrapper {...button} />
              </CardFooter>
            ) : null}
          </>
        }
      </Card>
    </>
  );
}
