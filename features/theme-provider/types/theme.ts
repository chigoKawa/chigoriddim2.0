// types/theme.ts
export type LocaleCode = string; // e.g. "en-US"

export interface ThemeColorsMode {
  background?: string;
  foreground?: string;
  primary?: string;
  "primary-foreground"?: string;
  secondary?: string;
  "secondary-foreground"?: string;
  ring?: string;
  border?: string;
  // add more when you grow the token set
}

export interface ThemeJson {
  meta?: { version?: number; name?: string; syncLightDark?: boolean };
  colors?: {
    light?: ThemeColorsMode;
    dark?: ThemeColorsMode;
  };
  shape?: { radius?: string; border?: string };
  typography?: {
    sizeScale?: Record<string, string>;
    fonts?: Array<{
      family: string;
      variants?: string[];
      axes?: string[];
    }>;
    fallbacks?: string[];
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
  assets?: {
    logoLightUrl?: string;
    logoDarkUrl?: string;
  };
  palette?: {
    primary?: Record<
      string,
      {
        hex?: string;
        rgb?: string;
        oklch?: string;
      }
    >;
    gray?: Record<
      string,
      {
        hex?: string;
        rgb?: string;
        oklch?: string;
      }
    >;
    black?: {
      hex?: string;
      rgb?: string;
      oklch?: string;
    };
    white?: {
      hex?: string;
      rgb?: string;
      oklch?: string;
    };
    background?: {
      hex?: string;
      rgb?: string;
      oklch?: string;
    };
    foreground?: {
      hex?: string;
      rgb?: string;
      oklch?: string;
    };
    primaryContrast?: {
      hex?: string;
      rgb?: string;
      oklch?: string;
    };
  };
}

export interface ContentfulSys {
  id: string;
  type: string;
  [k: string]: any;
}

export interface ThemeEntry {
  sys: ContentfulSys;
  fields: {
    title?: Record<LocaleCode, string>;
    theme?: Record<LocaleCode, ThemeJson> | ThemeJson;
  };
}
