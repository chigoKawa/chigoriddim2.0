export interface Logo {
  url: string;
  width: number;
  height: number;
}

export enum ColorScheme {
  Achromatic = "Achromatic",
  Monochromatic = "Monochromatic",
  MonoDark = "Mono Dark",
  MonoLight = "Mono Light",
}

interface Color {
  hex: string;
  rgb: string;
  oklch: string;
}

interface PaletteColor {
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

export interface SlugFields {
  title?: string;
  parent?: unknown;
  slugSegment?: string;
  fullPath?: string;
  pathMeta?: {
    previousPaths?: string[];
    pathChain?: string[];
    // allow additional metadata without strict typing
    [key: string]: unknown;
  } | null;
}
