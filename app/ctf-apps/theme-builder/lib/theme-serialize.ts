import { ThemeJson } from "./theme-types";
import { deriveDarkFromLight } from "./theme-derive";

function linesToBlock(lines: string[], indent = 0): string {
  const pad = " ".repeat(indent);
  return lines.map((l) => (l ? pad + l : "")).join("\n");
}

function kv(name: string, value: string): string {
  return `  --${name}: ${value};`;
}

export function serializeCssVariables(theme: ThemeJson): string {
  const t = deriveDarkFromLight(theme);
  const root: string[] = [":root{"];
  const light = t.colors.light;
  if (light.background) root.push(kv("color-background", light.background));
  if (light.foreground) root.push(kv("color-foreground", light.foreground));
  if (light.primary) root.push(kv("color-primary", light.primary));
  if (light["primary-foreground"]) root.push(kv("color-primary-foreground", light["primary-foreground"]!));
  if (light.secondary) root.push(kv("color-secondary", light.secondary));
  if (light.ring) root.push(kv("color-ring", light.ring));
  if (light.border) root.push(kv("color-border", light.border));
  root.push(kv("radius", t.shape.radius));
  root.push(kv("border-size", t.shape.border));
  root.push("}");

  const dark = t.colors.dark || {};
  const darkLines: string[] = [".dark{"];
  let hasDark = false;
  if (dark.background) { darkLines.push(kv("color-background", dark.background)); hasDark = true; }
  if (dark.foreground) { darkLines.push(kv("color-foreground", dark.foreground)); hasDark = true; }
  if (dark.primary) { darkLines.push(kv("color-primary", dark.primary)); hasDark = true; }
  if (dark["primary-foreground"]) { darkLines.push(kv("color-primary-foreground", dark["primary-foreground"]!)); hasDark = true; }
  if (dark.secondary) { darkLines.push(kv("color-secondary", dark.secondary)); hasDark = true; }
  if (dark.ring) { darkLines.push(kv("color-ring", dark.ring)); hasDark = true; }
  if (dark.border) { darkLines.push(kv("color-border", dark.border)); hasDark = true; }
  darkLines.push("}");

  return [linesToBlock(root), hasDark ? linesToBlock(darkLines) : ""].filter(Boolean).join("\n");
}

export function serializeTailwindTheme(theme: ThemeJson): string {
  const t = deriveDarkFromLight(theme);
  const lines: string[] = ["@theme {"];
  const light = t.colors.light;
  if (light.background) lines.push(kv("color-background", light.background));
  if (light.foreground) lines.push(kv("color-foreground", light.foreground));
  if (light.primary) lines.push(kv("color-primary", light.primary));
  if (light["primary-foreground"]) lines.push(kv("color-primary-foreground", light["primary-foreground"]!));
  if (light.secondary) lines.push(kv("color-secondary", light.secondary));
  if (light.ring) lines.push(kv("color-ring", light.ring));
  if (light.border) lines.push(kv("color-border", light.border));
  lines.push(kv("radius", t.shape.radius));
  lines.push(kv("border-size", t.shape.border));
  lines.push("}");
  return linesToBlock(lines);
}

export function serializeAll(theme: ThemeJson): { cssVariables: string; tailwindTheme: string } {
  return {
    cssVariables: serializeCssVariables(theme),
    tailwindTheme: serializeTailwindTheme(theme),
  };
}
