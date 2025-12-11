/* eslint-disable @typescript-eslint/no-explicit-any */
type ThemeModeColors = Record<string, string>;

interface ThemeJson {
  colors: {
    light: Record<string, string>;
    dark?: ThemeModeColors;
  };
  meta?: {
    syncLightDark?: boolean;
  };
}
import {
  clamp,
  formatOklch,
  parseOklch,
  approxContrastFromOklch,
} from "./theme-validate";

export type DeriveOptions = {
  enforceContrastAA?: boolean; // default true
};

const DEFAULTS: Required<DeriveOptions> = {
  enforceContrastAA: true,
};

export function deriveDarkFromLight(
  theme: ThemeJson,
  opts: DeriveOptions = {}
): ThemeJson {
  const options = { ...DEFAULTS, ...opts };
  if (!theme.meta?.syncLightDark) return theme;

  const light = theme.colors.light;
  const darkExisting = theme.colors.dark || {};

  const dark: ThemeModeColors = { ...darkExisting } as ThemeModeColors;

  // Background
  if (!dark.background && light.background) {
    const bg = parseOklch(light.background);
    if (bg) {
      const L = clamp(0.13, 0.1, 0.18);
      const C = bg.C * 0.9;
      dark.background = formatOklch(L, C, bg.H);
    }
  }

  // Foreground
  if (!dark.foreground && light.foreground && dark.background) {
    const bg = dark.background;
    const d = parseOklch(bg);
    const lf = parseOklch(light.foreground);
    if (d) {
      const useLight = d.L < 0.4;
      const fg = formatOklch(useLight ? 0.98 : 0.14, 0.02, lf?.H ?? d.H);
      if (
        !options.enforceContrastAA ||
        (approxContrastFromOklch(bg, fg) ?? 0) >= 4.5
      ) {
        dark.foreground = fg;
      } else {
        // Nudge L to meet contrast roughly
        const target = useLight
          ? Math.min(0.99, d.L + 0.7)
          : Math.max(0.12, d.L - 0.7);
        dark.foreground = formatOklch(target, 0.02, lf?.H ?? d.H);
      }
    }
  }

  // Primary and secondary families
  for (const key of ["primary", "secondary"]) {
    const lightBase = (light as any)[key] as string | undefined;
    const lightFgKey = `${key}-foreground`;
    if (lightBase && !(dark as any)[key]) {
      const p = parseOklch(lightBase);
      if (p) {
        const L = clamp(p.L - 0.25, 0.2, 0.8);
        const C = p.C * 0.9;
        (dark as any)[key] = formatOklch(L, C, p.H);
      }
    }
    if ((dark as any)[key] && !(dark as any)[lightFgKey]) {
      const bg = dark.background || light.background;
      const base = (dark as any)[key] as string;
      const dBg = bg ? parseOklch(bg) : null;
      const dBase = parseOklch(base);
      const useLight = (dBg?.L ?? 0.13) < 0.4;
      const fg = formatOklch(
        useLight ? 0.98 : 0.14,
        0.02,
        dBase?.H ?? dBg?.H ?? 0
      );
      if (
        !options.enforceContrastAA ||
        (approxContrastFromOklch(base, fg) ?? 0) >= 4.5
      ) {
        (dark as any)[lightFgKey] = fg;
      } else {
        const target = useLight ? 0.98 : 0.14;
        (dark as any)[lightFgKey] = formatOklch(
          target,
          0.02,
          dBase?.H ?? dBg?.H ?? 0
        );
      }
    }
  }

  // Ring and border
  const baseBg = dark.background || light.background;
  const bgParsed = baseBg ? parseOklch(baseBg) : null;
  if (bgParsed) {
    if (!dark.ring) {
      const L = clamp(bgParsed.L + 0.1, 0.18, 0.7);
      const C = bgParsed.C * 0.9;
      dark.ring = formatOklch(L, C, bgParsed.H);
    }
    if (!dark.border) {
      const L = clamp(bgParsed.L + 0.2, 0.18, 0.7);
      const C = bgParsed.C * 0.9;
      dark.border = formatOklch(L, C, bgParsed.H);
    }
  }

  return {
    ...theme,
    colors: {
      ...theme.colors,
      dark,
    },
  };
}
