// lib/theme-utils.ts
import type { ThemeEntry, ThemeJson } from "../types/theme";

// New App Settings theme shape from Contentful
type ColorToken = { hex?: string; rgb?: string; oklch?: string };
type ShadeScale = Record<string, ColorToken>;
interface AppSettingsThemeShape {
  logo?: {
    light?: { url?: string; width?: number; height?: number };
    dark?: { url?: string; width?: number; height?: number };
  };
  shape?: { borderRadius?: number | string; border?: string };
  palette?: {
    black?: ColorToken;
    white?: ColorToken;
    gray?: ShadeScale;
    primary?: ShadeScale;
    background?: ColorToken;
    foreground?: ColorToken;
    primaryContrast?: ColorToken;
    // allow any additional palette groups
    [k: string]: unknown;
  };
  typography?: {
    body?: {
      fontSize?: number | string;
      fontFamily?: string;
      fontWeight?: number | string;
    };
    headers?: Record<
      string,
      {
        fontSize?: number | string;
        fontFamily?: string;
        fontWeight?: number | string;
        textTransform?: string;
      }
    >;
    subheader?: {
      fontSize?: number | string;
      fontFamily?: string;
      fontWeight?: number | string;
    };
  };
  colorScheme?: string;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isThemeJson(x: unknown): x is ThemeJson {
  if (!isRecord(x)) return false;
  return "colors" in x || "assets" in x || "meta" in x;
}

function isAppSettingsThemeShape(x: unknown): x is AppSettingsThemeShape {
  if (!isRecord(x)) return false;
  return "palette" in x || "logo" in x;
}

// Pick a locale safely
export function pickLocale<T>(
  localized: Record<string, T> | undefined,
  pref = "en-US"
): T | undefined {
  if (!localized) return undefined;
  return localized[pref] ?? Object.values(localized)[0];
}

// Normalize new App Settings theme shape to our ThemeJson
function normalizeAppSettingsTheme(src: AppSettingsThemeShape): ThemeJson {
  const pick = (t?: ColorToken) => t?.hex || t?.rgb || t?.oklch;

  const primary400 = isRecord(src.palette?.primary)
    ? pick((src.palette!.primary as ShadeScale)["400"]) ||
      pick((src.palette!.primary as ShadeScale)["500"]) ||
      pick((src.palette!.primary as ShadeScale)["300"])
    : undefined;
  const gray400 = isRecord(src.palette?.gray)
    ? pick((src.palette!.gray as ShadeScale)["400"]) ||
      pick((src.palette!.gray as ShadeScale)["600"])
    : undefined;

  const colors = {
    light: {
      background: pick(src.palette?.background) || pick(src.palette?.white),
      foreground: pick(src.palette?.foreground) || pick(src.palette?.black),
      primary: primary400,
      "primary-foreground":
        pick(src.palette?.primaryContrast) || pick(src.palette?.white),
      secondary: gray400,
      "secondary-foreground": pick(src.palette?.black),
      ring: pick((src.palette?.primary as ShadeScale)?.["300"]) || primary400,
      border: pick((src.palette?.gray as ShadeScale)?.["600"]) || gray400,
    },
    dark: {},
  } as ThemeJson["colors"];

  const radiusVal = src.shape?.borderRadius;
  const radius = typeof radiusVal === "number" ? `${radiusVal}px` : radiusVal;

  const sizeScale: Record<string, string> = {};
  const headers = src.typography?.headers || {};
  for (const [k, v] of Object.entries(headers)) {
    if (!v) continue;
    const fs =
      typeof v.fontSize === "number"
        ? `${v.fontSize}px`
        : String(v.fontSize ?? "");
    if (fs) sizeScale[k] = fs;
  }
  const body = src.typography?.body;
  if (body?.fontSize !== undefined) {
    sizeScale.body =
      typeof body.fontSize === "number"
        ? `${body.fontSize}px`
        : String(body.fontSize);
  }

  const fonts = [] as Array<{
    family: string;
    variants?: string[];
    axes?: string[];
  }>;
  const fam = body?.fontFamily || headers["h1"]?.fontFamily;
  if (fam) fonts.push({ family: fam });

  // Pass through all typography fields from Contentful
  const typography = {
    sizeScale,
    fonts,
    body: src.typography?.body,
    headers: src.typography?.headers,
    subheader: src.typography?.subheader,
  };

  return {
    meta: { name: src.colorScheme, version: 1 },
    colors,
    shape: { radius: radius, border: undefined },
    typography,
    assets: {
      logoLightUrl: src.logo?.light?.url,
      logoDarkUrl: src.logo?.dark?.url,
    },
    palette: src.palette,
  };
}

// Extract ThemeJson from the Contentful entry for a given locale
export function getThemeJsonFromEntry(
  entry: ThemeEntry,
  locale = "en-US"
): ThemeJson {
  const themeField: unknown = (
    entry as unknown as { fields?: { theme?: unknown } }
  )?.fields?.theme;
  if (!themeField) return {};

  // Direct ThemeJson
  if (isThemeJson(themeField)) return themeField;
  // Direct App Settings Theme
  if (isAppSettingsThemeShape(themeField))
    return normalizeAppSettingsTheme(themeField);

  // Localized map
  if (isRecord(themeField)) {
    const localized = pickLocale(themeField as Record<string, unknown>, locale);
    if (!localized) return {};
    if (isThemeJson(localized)) return localized;
    if (isAppSettingsThemeShape(localized))
      return normalizeAppSettingsTheme(localized);
  }
  return {};
}

// Map ThemeJson to a flat CSS var map for a given mode
export function themeToCssVarMap(
  theme: ThemeJson,
  mode: "light" | "dark" = "light"
) {
  const vars: Record<string, string> = {};
  const c = theme.colors?.[mode] ?? {};

  const set = (key: string, value?: string) => {
    if (!value) return;
    vars[key] = value;
  };

  // colors
  set("--color-background", c.background);
  set("--color-foreground", c.foreground);
  set("--color-primary", c.primary);
  set("--color-primary-foreground", c["primary-foreground"]);
  set("--color-secondary", c.secondary);
  set("--color-ring", c.ring);
  set("--color-border", c.border);

  // Add primary 200, 300, 500 from theme.palette if available
  if (
    theme.colors &&
    theme.colors[mode] &&
    theme.palette &&
    theme.palette.primary
  ) {
    type ColorToken = { hex?: string; rgb?: string; oklch?: string };
    const primaryPalette = theme.palette.primary as Record<string, ColorToken>;
    const pick = (t?: ColorToken) => t?.hex || t?.rgb || t?.oklch;
    set("--color-primary-200", pick(primaryPalette["200"]));
    set("--color-primary-300", pick(primaryPalette["300"]));
    set("--color-primary-500", pick(primaryPalette["500"]));
  }

  // shadcn/tailwind palette aliases expected by components
  set("--background", c.background);
  set("--foreground", c.foreground);
  set("--primary", c.primary);
  set("--primary-foreground", c["primary-foreground"]);
  set("--secondary", c.secondary);
  // fallback: use foreground if secondary-foreground absent
  set("--secondary-foreground", c["secondary-foreground"] ?? c.foreground);
  set("--ring", c.ring);
  set("--border", c.border);

  // additional common tokens used by globals.css/shadcn defaults
  // map to sensible fallbacks from our palette
  set("--card", c.background);
  set("--card-foreground", c.foreground);
  set("--popover", c.background);
  set("--popover-foreground", c.foreground);
  set("--muted", c.secondary ?? c.background);
  set("--muted-foreground", c.foreground);
  set("--accent", c.secondary ?? c.primary);
  set(
    "--accent-foreground",
    c["secondary-foreground"] ?? c["primary-foreground"] ?? c.foreground
  );
  set("--input", c.border ?? c.secondary);

  // shape
  set("--radius", theme.shape?.radius);
  // Tailwind v4 has border-size as a token you can use in components; keep it as a var
  set("--border-size", theme.shape?.border);

  // typography (optional surface: sizes -> CSS custom props)
  if (theme.typography?.sizeScale) {
    for (const [k, v] of Object.entries(theme.typography.sizeScale)) {
      set(`--font-size-${k}`, v);
    }
  }

  // Add font family and weight variables for body, subheader, and headers
  // Always set font family and weight variables, using defaults if missing
  type HeaderType = {
    fontSize?: number | string;
    fontFamily?: string;
    fontWeight?: number | string;
    textTransform?: string;
  };
  const typography = theme.typography;

  // Body
  let bodyFontFamily = "DM Sans, Arial, sans-serif";
  let bodyFontWeight = "400";
  if (
    typography &&
    typeof typography === "object" &&
    "body" in typography &&
    typography.body &&
    typeof typography.body === "object"
  ) {
    const body = typography.body as {
      fontFamily?: string;
      fontWeight?: number | string;
    };
    bodyFontFamily = body.fontFamily || bodyFontFamily;
    bodyFontWeight = String(body.fontWeight || bodyFontWeight);
  }
  set("--font-family-body", bodyFontFamily);
  set("--font-weight-body", bodyFontWeight);

  // Subheader
  let subheaderFontFamily = "Besley, serif";
  let subheaderFontWeight = "500";
  if (
    typography &&
    typeof typography === "object" &&
    "subheader" in typography &&
    typography.subheader &&
    typeof typography.subheader === "object"
  ) {
    const subheader = typography.subheader as {
      fontFamily?: string;
      fontWeight?: number | string;
    };
    subheaderFontFamily = subheader.fontFamily || subheaderFontFamily;
    subheaderFontWeight = String(subheader.fontWeight || subheaderFontWeight);
  }
  set("--font-family-subheader", subheaderFontFamily);
  set("--font-weight-subheader", subheaderFontWeight);

  // Headers (h1-h6)
  const headerDefaults = {
    fontFamily: "Crimson Pro, serif",
    fontWeight: "700",
  };
  if (
    typography &&
    typeof typography === "object" &&
    "headers" in typography &&
    typeof typography.headers === "object"
  ) {
    Object.entries(typography.headers as Record<string, HeaderType>).forEach(
      ([headerKey, headerVal]) => {
        set(
          `--font-family-header-${headerKey}`,
          headerVal.fontFamily || headerDefaults.fontFamily
        );
        set(
          `--font-weight-header-${headerKey}`,
          String(headerVal.fontWeight || headerDefaults.fontWeight)
        );
      }
    );
  } else {
    // If no headers defined, set h1-h6 to defaults
    ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((headerKey) => {
      set(`--font-family-header-${headerKey}`, headerDefaults.fontFamily);
      set(
        `--font-weight-header-${headerKey}`,
        String(headerDefaults.fontWeight)
      );
    });
  }

  return vars;
}

// Merge light + dark into a CSS string for SSR <style>
export function buildInitialCss(theme: ThemeJson) {
  const light = themeToCssVarMap(theme, "light");
  const dark = themeToCssVarMap(theme, "dark");

  const lightBlock = `:root{${Object.entries(light)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;
  // Dark values applied under a .dark scope.
  const darkBlock = Object.keys(dark).length
    ? `.dark{${Object.entries(dark)
        .map(([k, v]) => `${k}:${v}`)
        .join(";")}}`
    : "";

  return `${lightBlock}${darkBlock}`;
}

// Push vars into documentElement at runtime
export function applyCssVars(
  vars: Record<string, string>,
  scope: HTMLElement | Document = document
) {
  const root = scope instanceof Document ? scope.documentElement : scope;
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v, "important");
  }
}
