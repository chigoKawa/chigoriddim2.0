"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import type ExperienceConfiguration from "@ninetailed/experience.js-plugin-preview";

type AnyExperienceConfig = ExperienceConfiguration;
type AnyAudience = unknown;

export type PreviewData = {
  experiences: AnyExperienceConfig[];
  audiences: AnyAudience[];
};

export type PreviewDataContextType = PreviewData & {
  setExperiences: (exps: AnyExperienceConfig[]) => void;
  setAudiences: (audiences: AnyAudience[]) => void;
  reset: () => void;
  isDraftMode: boolean;
};

const PreviewDataContext = createContext<PreviewDataContextType | null>(null);

export function useDraftMode(): boolean {
  // This is a client-side hook that reads draft mode from cookies
  // In a real implementation, you might want to use Next.js's draftMode().isEnabled()
  // but for client-side usage, we'll check for the draft mode cookie
  if (typeof window === "undefined") return false;

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  return !!getCookie("__prerender_bypass");
}

export function PreviewDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [experiences, setExperiences] = useState<AnyExperienceConfig[]>([]);
  const [audiences, setAudiences] = useState<AnyAudience[]>([]);
  const isDraftMode = useDraftMode();

  const value: PreviewDataContextType = useMemo(
    () => ({
      experiences: isDraftMode ? experiences : [],
      audiences: isDraftMode ? audiences : [],
      setExperiences: isDraftMode ? setExperiences : () => {},
      setAudiences: isDraftMode ? setAudiences : () => {},
      reset: isDraftMode
        ? () => {
            setExperiences([]);
            setAudiences([]);
          }
        : () => {},
      isDraftMode,
    }),
    [experiences, audiences, isDraftMode]
  );

  return (
    <PreviewDataContext.Provider value={value}>
      {children}
    </PreviewDataContext.Provider>
  );
}

export function usePreviewData() {
  const ctx = useContext(PreviewDataContext);
  if (!ctx)
    throw new Error("usePreviewData must be used within PreviewDataProvider");
  return ctx;
}
