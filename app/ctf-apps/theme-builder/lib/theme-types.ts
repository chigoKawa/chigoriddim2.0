export interface Logo {
  url: string;
  width: number;
  height: number;
  assetId?: string;
}

export enum ColorScheme {
  Monochromatic = "Monochromatic",
  MonoDark = "Mono Dark",
  MonoTint = "Mono Tint",
  MonoLight = "MonoLight",
}

export interface Color {
  hex: string;
  rgb: string;
  oklch: string;
}

export interface PaletteColor {
  200: Color;
  300: Color;
  400: Color;
  500: Color;
}

interface Font {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  textTransform?: string;
}

export interface Theme {
  logo: {
    light: Logo;
    dark: Logo;
  };
  colorScheme: ColorScheme;
  palette: {
    primary: PaletteColor;
    secondary?: PaletteColor | null;
    background: Color;
    foreground: Color;
    primaryContrast: Color;
    white: Color;
    black: Color;
    gray: {
      400: Color;
      600: Color;
    };
  };
  typography: {
    headers: {
      h1: Font;
      h2: Font;
      h3: Font;
      h4: Font;
      h5: Font;
      h6: Font;
    };
    subheader: Font;
    body: Font;
  };
  shape: {
    borderRadius: number;
  };
}

export type SerializedCssBlocks = {
  cssVariables: string;
  tailwindTheme: string;
};

// Minimal theme JSON structures used by validation/derivation helpers
export type ThemeModeColors = Record<string, string>;

export interface ThemeJson {
  colors: {
    light: Record<string, string>;
    dark?: ThemeModeColors;
  };
  meta?: {
    name?: string;
    version?: number;
    syncLightDark?: boolean;
  };
  shape?: {
    radius?: string;
    border?: string;
  };
  typography?: {
    sizeScale?: Record<string, string>;
  };
}
