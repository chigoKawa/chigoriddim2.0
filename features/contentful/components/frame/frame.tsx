"use client";

import React from "react";
import { clsx as cx } from "clsx";
import type { IFrame } from "@/features/contentful/type";
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode,
} from "@contentful/live-preview/react";
import FrameHeader from "./FrameHeader";
import Thing from "./things";
import { FadeIn, Stagger } from "@/features/animations/in-view";
import {
  getTextClassFromBgColor,
  getBgClass,
  getGapClass,
  getPaddingClass,
  getLayoutClass,
  getDynamicGridLayout,
  renderAsset,
  getOverlayFromOptions,
} from "./utils";
import type {
  ICallout,
  IImageWrapper,
  IPexelsImageWrapper,
  IBlurb,
  IPdfWrapper,
  IContentfulForm,
} from "@/features/contentful/type";
import { usePreviewMode } from "@/features/contentful/preview-context";
import { usePreviewWarnings } from "@/features/contentful/preview-warnings-context";

// (FrameHeader and Thing now live in dedicated files)

export default function Frame(frame: IFrame) {
  const isPreview = usePreviewMode();
  const { showWarnings } = usePreviewWarnings();

  const liveFrame = useContentfulLiveUpdates(frame) || frame;
  const inspectorProps = useContentfulInspectorMode({
    entryId: liveFrame.sys.id,
  });
  // Fields can be temporarily undefined while preview/live updates stream in.
  // Use a defensive fallback with sensible defaults to avoid runtime crashes.
  const f =
    (liveFrame as unknown as { fields?: Partial<IFrame["fields"]> }).fields ||
    {};

  const {
    layout = "single",
    theme = "light",
    backgroundColor = "neutral",
    backgroundMedia,
    things,
    gap = "md",
    padding = "md",
    alignment = "left",
    dimBackground,
    tintColor,
  } = f as Partial<IFrame["fields"]>;
  const thingsArr = (things as IFrame["fields"]["things"]) || [];

  // Lightweight editor guidance: flag obviously incompatible layout/Things combos.
  // We only show these when preview mode is enabled (?preview=true) to avoid
  // leaking authoring hints to end users.
  const layoutWarnings: string[] = [];
  const thingCount = Array.isArray(thingsArr) ? thingsArr.length : 0;
  const thingCtids = (thingsArr || [])
    .map((it) => it?.sys?.contentType?.sys?.id as string | undefined)
    .filter(Boolean) as string[];

  if (isPreview && showWarnings) {
    if (layout === "hero") {
      if (thingCount > 1) {
        layoutWarnings.push(
          "Hero layout is optimized for a single Thing (e.g. Callout or Image). Extra items will be ignored."
        );
      }
      if (
        thingCount === 1 &&
        !["callout", "imageWrapper", "pexelsImageWrapper"].includes(
          thingCtids[0] ?? ""
        )
      ) {
        layoutWarnings.push(
          "Hero layout works best with Callout or Image-based Things. Consider changing the Thing type or layout."
        );
      }
    }

    if (layout === "duplex") {
      if (thingCount === 0) {
        layoutWarnings.push(
          "Duplex layout expects at least one Thing (ideally two) to render side-by-side content."
        );
      }
      if (thingCount === 1) {
        layoutWarnings.push(
          "Duplex layout will render a single Thing alongside the frame header (if present). For a true split layout, link two Things."
        );
      }
      if (thingCount > 2) {
        layoutWarnings.push(
          "Duplex layout only uses the first two linked Things. Extra items will not be visible in this layout."
        );
      }
    }

    if (["grid", "list", "carousel"].includes(layout) && thingCount === 0) {
      layoutWarnings.push(
        "This layout is designed to showcase multiple Things, but none are linked yet."
      );
    }

    if (["grid", "list"].includes(layout)) {
      if (thingCount === 1) {
        layoutWarnings.push(
          "Grid/List layouts are optimized for multiple Things. With a single item, consider using a single or hero layout instead."
        );
      }
      if (thingCount > 1) {
        const distinctCtids = Array.from(new Set(thingCtids));
        if (distinctCtids.length > 1) {
          layoutWarnings.push(
            "Grid/List layouts work best when all Things share the same content type. Mixed types may lead to uneven card heights or visual glitches."
          );
        }
      }
    }
  }

  const containerClasses = [
    getBgClass(theme, backgroundColor),
    alignment === "center"
      ? "text-center"
      : alignment === "right"
      ? "text-right"
      : "text-left",
  ]
    .filter(Boolean)
    .join(" ");

  const itemsWrapperClasses = [
    layout === "grid"
      ? getDynamicGridLayout(thingsArr?.length || 0)
      : getLayoutClass(layout),
    getGapClass(gap),
  ].join(" ");

  const hasImage = !!backgroundMedia;
  const forceWhiteText = hasImage && backgroundColor === "transparent";
  const imageTextClass = hasImage
    ? getTextClassFromBgColor(theme, backgroundColor)
    : undefined;

  // Let backgroundColor drive the overlay tint when an image is present and
  // no explicit tintColor was chosen. This makes the combination of bg color
  // and dimBackground visually meaningful.
  const effectiveTint: IFrame["fields"]["tintColor"] | undefined =
    tintColor && tintColor !== "none"
      ? tintColor
      : backgroundColor === "primary" ||
        backgroundColor === "secondary" ||
        backgroundColor === "accent"
      ? (backgroundColor as IFrame["fields"]["tintColor"])
      : undefined;

  return (
    <section
      className={cx(
        "relative overflow-hidden",
        containerClasses,
        hasImage ? "bg-transparent" : undefined,
        forceWhiteText ? "text-white" : undefined,
        hasImage ? imageTextClass : undefined
      )}
    >
      {layoutWarnings.length > 0 && showWarnings ? (
        <div className="container mx-auto max-w-7xl px-4 pt-4">
          <div className="inline-flex max-w-xl flex-col gap-1 rounded-md border border-dashed border-amber-500/70 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
            <span className="font-medium">Layout guidance</span>
            <ul className="list-disc pl-4">
              {layoutWarnings.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      {backgroundMedia ? (
        <>
          <div
            {...inspectorProps({ fieldId: "backgroundMedia" })}
            className="absolute inset-0 -z-10 pointer-events-none"
          >
            {renderAsset(backgroundMedia, "w-full h-full object-cover")}
          </div>
          {/* Full-bleed darken/tint overlay driven by editor options */}
          <div
            className={cx(
              "absolute inset-0 -z-10 pointer-events-none",
              getOverlayFromOptions(dimBackground, effectiveTint)
            )}
          />
        </>
      ) : null}
      {layout === "hero" ? (
        <div
          className={cx(
            "relative mx-auto max-w-5xl text-center min-h-[50vh] md:min-h-[60vh] flex items-center justify-center",
            getPaddingClass(padding)
          )}
        >
          {!backgroundMedia && isPreview ? (
            <div className="absolute top-4 right-4 z-10 rounded-md bg-amber-500/90 text-white text-xs px-2 py-1 shadow">
              Hero layout: add a Background Image for best results
            </div>
          ) : null}
          <div className="relative z-10 w-full">
            <FadeIn y={24}>
              <FrameHeader frame={liveFrame} />
            </FadeIn>
            <div {...inspectorProps({ fieldId: "things" })}>
              {Array.isArray(thingsArr) && thingsArr.length > 0 ? (
                <FadeIn y={16} delay={0.1}>
                  <div
                    key={thingsArr[0]?.sys?.id ?? 0}
                    data-contentful-entry-id={thingsArr[0]?.sys?.id}
                    className="mt-6"
                  >
                    <Thing
                      entry={
                        thingsArr[0] as unknown as
                          | ICallout
                          | IImageWrapper
                          | IPexelsImageWrapper
                          | IBlurb
                          | IPdfWrapper
                          | IContentfulForm
                      }
                      display="hero"
                    />
                  </div>
                </FadeIn>
              ) : null}
            </div>
          </div>
        </div>
      ) : layout === "duplex" ? (
        <div className={cx("container mx-auto", getPaddingClass(padding))}>
          {(() => {
            const isHeaderPresent = !!liveFrame.fields.frameHeader;
            const first = thingsArr?.[0];
            const second = thingsArr?.[1];
            const firstCtid = first?.sys?.contentType?.sys?.id as
              | string
              | undefined;
            const secondCtid = second?.sys?.contentType?.sys?.id as
              | string
              | undefined;
            const isImageCtid = (ctid?: string) =>
              ctid === "imageWrapper" || ctid === "pexelsImageWrapper";

            const headerNode = isHeaderPresent ? (
              <div className="max-w-prose md:mx-0 mx-auto">
                <FrameHeader frame={liveFrame} />
              </div>
            ) : null;
            const firstNode = first ? (
              <div
                key={first?.sys?.id ?? 0}
                data-contentful-entry-id={first?.sys?.id}
              >
                <Thing
                  entry={
                    first as unknown as
                      | ICallout
                      | IImageWrapper
                      | IPexelsImageWrapper
                      | IBlurb
                      | IPdfWrapper
                      | IContentfulForm
                  }
                />
              </div>
            ) : null;
            const secondNode = second ? (
              <div
                key={second?.sys?.id ?? 1}
                data-contentful-entry-id={second?.sys?.id}
              >
                <Thing
                  entry={
                    second as unknown as
                      | ICallout
                      | IPexelsImageWrapper
                      | IImageWrapper
                      | IBlurb
                      | IPdfWrapper
                      | IContentfulForm
                  }
                />
              </div>
            ) : null;

            let left = null as React.ReactNode;
            let right = null as React.ReactNode;

            if (isHeaderPresent) {
              // Header on one side, first thing on the other; respect explicit alignment
              if (alignment === "right") {
                left = firstNode;
                right = headerNode;
              } else {
                left = headerNode;
                right = firstNode;
              }
            } else {
              // Use first two things; swap by alignment
              if (alignment === "right") {
                left = secondNode;
                right = firstNode;
              } else {
                left = firstNode;
                right = secondNode;
              }
              // Prefer media on the right if one side is an image
              if (isImageCtid(firstCtid) && left === firstNode) {
                const tmp = left;
                left = right;
                right = tmp;
              }
              if (isImageCtid(secondCtid) && right === secondNode) {
                // already on the right; ok
              }
            }

            return (
              <Stagger
                {...inspectorProps({ fieldId: "things" })}
                className={cx(
                  "grid grid-cols-1 md:grid-cols-2 gap-8 md:items-center gap-y-10",
                  getGapClass(gap)
                )}
              >
                <FadeIn y={20}>
                  <div className="min-w-0 md:flex md:flex-col md:justify-center md:gap-4">
                    {left}
                  </div>
                </FadeIn>
                <FadeIn y={20} delay={0.08}>
                  <div className="min-w-0 md:flex md:flex-col md:justify-center md:gap-4">
                    {right}
                  </div>
                </FadeIn>
              </Stagger>
            );
          })()}
        </div>
      ) : (
        <div
          className={cx(
            "container mx-auto max-w-7xl",
            getPaddingClass(padding)
          )}
        >
          <FrameHeader frame={liveFrame} />
          <Stagger
            {...inspectorProps({ fieldId: "things" })}
            className={cx(itemsWrapperClasses, "gap-y-10")}
          >
            {thingsArr?.map((it, idx) => (
              <FadeIn key={`${it?.sys?.id}-${idx}`} y={20} delay={idx * 0.05}>
                <div data-contentful-entry-id={it?.sys?.id} className="min-w-0">
                  <Thing
                    entry={
                      it as unknown as
                        | ICallout
                        | IImageWrapper
                        | IPexelsImageWrapper
                        | IBlurb
                        | IPdfWrapper
                        | IContentfulForm
                    }
                  />
                </div>
              </FadeIn>
            ))}
          </Stagger>
        </div>
      )}
    </section>
  );
}
