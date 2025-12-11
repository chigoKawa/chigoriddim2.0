"use client";
import React, { ReactNode } from "react";
import { ContentfulLivePreviewProvider } from "@contentful/live-preview/react";
import { PreviewModeProvider } from "./preview-context";

const LivePreviewProviderWrapper = ({
  children,
  locale,
  isPreviewEnabled,
  disableLiveUpdates = false,
}: {
  children: ReactNode;
  locale: string;
  isPreviewEnabled: boolean;
  /** Disable live updates (e.g., for Timeline preview which isn't compatible) */
  disableLiveUpdates?: boolean;
}) => {
  // Live updates should be disabled for Timeline preview
  const enableLiveUpdates = isPreviewEnabled && !disableLiveUpdates;

  return (
    <ContentfulLivePreviewProvider
      locale={locale}
      enableInspectorMode={isPreviewEnabled}
      enableLiveUpdates={enableLiveUpdates}
    >
      <PreviewModeProvider value={isPreviewEnabled}>
        {children}
      </PreviewModeProvider>
    </ContentfulLivePreviewProvider>
  );
};

export default LivePreviewProviderWrapper;
