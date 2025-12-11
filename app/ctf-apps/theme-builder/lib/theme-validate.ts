import { ThemeJson, ThemeModeColors } from "./theme-types";

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const HSL_RE =
  /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i;
const RGB_RE =
  /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;
const OKLCH_RE =
  /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/i;

const SIZE_RE = /^\d+(?:\.\d+)?(rem|px)$/;

export type ValidationIssue = { path: string; message: string };

export function isColorToken(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  if (input.includes("url(") || input.includes("javascript:")) return false;
  return (
    HEX_RE.test(input) ||
    HSL_RE.test(input) ||
    RGB_RE.test(input) ||
    OKLCH_RE.test(input)
  );
}

export function parseOklch(
  input: string
): { L: number; C: number; H: number; A?: number } | null {
  const m = input.match(OKLCH_RE);
  if (!m) return null;
  const L = clamp(parseFloat(m[1]), 0, 1);
  const C = Math.max(0, parseFloat(m[2]));
  let H = parseFloat(m[3]);
  if (!Number.isFinite(H)) H = 0;
  // normalize hue to [0,360)
  H = ((H % 360) + 360) % 360;
  const A = m[4] !== undefined ? clamp(parseFloat(m[4]), 0, 1) : undefined;
  return { L, C, H, A };
}

export function formatOklch(
  L: number,
  C: number,
  H: number,
  A?: number
): string {
  const l = clamp(L, 0, 1);
  const c = Math.max(0, C);
  const h = ((H % 360) + 360) % 360;
  if (A === undefined)
    return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)})`;
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 2)} / ${round(
    clamp(A, 0, 1),
    3
  )})`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function round(n: number, p = 2): number {
  const f = Math.pow(10, p);
  return Math.round(n * f) / f;
}

export function approxContrastFromOklch(bg: string, fg: string): number | null {
  const b = parseOklch(bg);
  const f = parseOklch(fg);
  if (!b || !f) return null;
  // Use L as a proxy of perceived lightness in [0..1]
  const L1 = Math.max(b.L, f.L);
  const L2 = Math.min(b.L, f.L);
  // Rough proxy (not exact WCAG) but monotonic
  return (L1 + 0.05) / (L2 + 0.05);
}

export function validateTheme(theme: ThemeJson): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  // meta
  if (typeof theme.meta?.version !== "number") {
    issues.push({ path: "meta.version", message: "version must be a number" });
  }
  if (!theme.meta?.name) {
    issues.push({ path: "meta.name", message: "name is required" });
  }

  // colors
  const light = theme.colors?.light as ThemeModeColors | undefined;
  if (!light) {
    issues.push({ path: "colors.light", message: "light colors are required" });
  } else {
    for (const [k, v] of Object.entries(light)) {
      if (v == null) continue;
      if (!isColorToken(v)) {
        issues.push({ path: `colors.light.${k}`, message: "invalid color" });
      }
      // Enforce OKLCH when sync is enabled so dark mode derivation works reliably
      if (theme.meta?.syncLightDark && !OKLCH_RE.test(v)) {
        issues.push({
          path: `colors.light.${k}`,
          message: "must be OKLCH when syncLightDark is true",
        });
      }
    }
  }
  const dark = theme.colors?.dark || {};
  for (const [k, v] of Object.entries(dark)) {
    if (v == null) continue;
    if (!isColorToken(v)) {
      issues.push({ path: `colors.dark.${k}`, message: "invalid color" });
    }
    if (theme.meta?.syncLightDark && v && !OKLCH_RE.test(v)) {
      issues.push({
        path: `colors.dark.${k}`,
        message: "must be OKLCH when syncLightDark is true",
      });
    }
  }

  // shape
  if (!SIZE_RE.test(theme?.shape?.radius || "")) {
    issues.push({ path: "shape.radius", message: "must be rem or px" });
  }
  if (!SIZE_RE.test(theme?.shape?.border || "")) {
    issues.push({ path: "shape.border", message: "must be rem or px" });
  }

  // typography
  const scale = theme.typography?.sizeScale || {};
  for (const [k, v] of Object.entries(scale)) {
    if (!SIZE_RE.test(v)) {
      issues.push({
        path: `typography.sizeScale.${k}`,
        message: "must be rem or px",
      });
    }
  }

  return issues;
}
