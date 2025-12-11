// components/theme-provider.tsx
"use client";

import React, { useMemo, useRef, useContext, useLayoutEffect } from "react";
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
} from "@contentful/live-preview/react";
import type { ThemeEntry, ThemeJson } from "./types/theme";
import {
  getThemeJsonFromEntry,
  themeToCssVarMap,
  applyCssVars,
} from "./lib/theme-utils";

type Props = {
  initialEntry: ThemeEntry;
  preview: boolean;
  locale?: string; // defaults to en-US
  children: React.ReactNode;
};

export function ThemeProvider({
  initialEntry,
  preview,
  locale = "en-US",
  children,
}: Props) {
  // Always call hook; branch by preview to satisfy React hooks rules
  const previewEntry = useContentfulLiveUpdates(initialEntry);
  const liveEntry = preview ? previewEntry : initialEntry;
  console.log("liveEntry new", liveEntry);
  const lastAppliedModeRef = useRef<"light" | "dark">("light");

  const theme: ThemeJson = useMemo(
    () => getThemeJsonFromEntry(liveEntry, locale) ?? {},
    [liveEntry, locale]
  );

  useLayoutEffect(() => {
    // derive ThemeJson from entry
    const t = theme;

    // apply light vars always
    const lightVars = themeToCssVarMap(t, "light");
    console.log("[ThemeProvider] CSS vars to set at :root:", lightVars);
    applyCssVars(lightVars, document);

    // if the document has .dark present, also apply dark vars under that scope
    const darkVars = themeToCssVarMap(t, "dark");
    if (Object.keys(darkVars).length > 0) {
      // For scoping, we don't need to do anything special here; .dark vars will override if you emit them in SSR.
      // If you want runtime dark patching, you can also set them directly on :root whenever .dark is present.
      if (document.documentElement.classList.contains("dark")) {
        applyCssVars(darkVars, document);
        lastAppliedModeRef.current = "dark";
      } else if (lastAppliedModeRef.current === "dark") {
        // If you just left dark, re-apply light to ensure no residue
        applyCssVars(lightVars, document);
        lastAppliedModeRef.current = "light";
      }
    }

    // Fonts: you can inject a <link> to Inter etc. if you want.
    // Logos: no need here; components can read from a hook below.
  }, [theme]);

  const logos = useMemo(
    () => ({
      light: theme.assets?.logoLightUrl ?? "",
      dark: theme.assets?.logoDarkUrl ?? "",
    }),
    [theme]
  );

  const contextValue = useMemo(
    () => ({ entry: liveEntry, theme, logos, locale, preview }),
    [liveEntry, theme, logos, locale, preview]
  );

  const content = (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );

  const wrapped = useMemo(() => {
    if (!preview) return content;
    return (
      <ContentfulLivePreviewProvider
        enableLiveUpdates
        enableInspectorMode
        locale={locale}
      >
        {content}
      </ContentfulLivePreviewProvider>
    );
  }, [content, preview, locale]);

  return <>{wrapped}</>;
}

// Context so consumers can easily get theme and logos
type ThemeContextValue = {
  entry: ThemeEntry;
  theme: ThemeJson;
  logos: { light: string; dark: string };
  locale: string;
  preview: boolean;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

// Re-export a provider-wrapping component to include context value
export function ThemeContextProvider(props: Props) {
  const { initialEntry, preview, locale = "en-US", children } = props;
  const previewEntry2 = useContentfulLiveUpdates(initialEntry);
  const liveEntry = preview ? previewEntry2 : initialEntry;
  const theme: ThemeJson = useMemo(
    () => getThemeJsonFromEntry(liveEntry, locale) ?? {},
    [liveEntry, locale]
  );
  const logos = useMemo(
    () => ({
      light: theme.assets?.logoLightUrl ?? "",
      dark: theme.assets?.logoDarkUrl ?? "",
    }),
    [theme]
  );

  // Wrap with the same preview provider behavior as ThemeProvider
  const core = (
    <ThemeContext.Provider
      value={{ entry: liveEntry, theme, logos, locale, preview }}
    >
      {children}
    </ThemeContext.Provider>
  );

  if (!preview) return core;
  return (
    <ContentfulLivePreviewProvider
      enableLiveUpdates
      enableInspectorMode
      locale={locale}
    >
      {core}
    </ContentfulLivePreviewProvider>
  );
}
