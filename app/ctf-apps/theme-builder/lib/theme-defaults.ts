import { Theme, ColorScheme } from "./theme-types";

export const DEFAULT_THEME: Theme = {
  logo: {
    light: {
      url: "",
      width: 200,
      height: 50,
    },
    dark: {
      url: "",
      width: 200,
      height: 50,
    },
  },
  colorScheme: ColorScheme.Monochromatic,
  palette: {
    primary: {
      200: {
        hex: "#E6E6FF",
        rgb: "rgb(230, 230, 255)",
        oklch: "oklch(0.92 0.02 260)",
      },
      300: {
        hex: "#B3B3FF",
        rgb: "rgb(179, 179, 255)",
        oklch: "oklch(0.82 0.10 260)",
      },
      400: {
        hex: "#8080FF",
        rgb: "rgb(128, 128, 255)",
        oklch: "oklch(0.72 0.20 260)",
      },
      500: {
        hex: "#4D4DFF",
        rgb: "rgb(77, 77, 255)",
        oklch: "oklch(0.62 0.28 260)",
      },
    },
    background: {
      hex: "#FFFFFF",
      rgb: "rgb(255, 255, 255)",
      oklch: "oklch(1 0 0)",
    },
    foreground: {
      hex: "#000000",
      rgb: "rgb(0, 0, 0)",
      oklch: "oklch(0 0 0)",
    },
    primaryContrast: {
      hex: "#FFFFFF",
      rgb: "rgb(255, 255, 255)",
      oklch: "oklch(1 0 0)",
    },
    white: {
      hex: "#FFFFFF",
      rgb: "rgb(255, 255, 255)",
      oklch: "oklch(1 0 0)",
    },
    black: {
      hex: "#000000",
      rgb: "rgb(0, 0, 0)",
      oklch: "oklch(0 0 0)",
    },
    gray: {
      400: {
        hex: "#9CA3AF",
        rgb: "rgb(156, 163, 175)",
        oklch: "oklch(0.70 0.02 258)",
      },
      600: {
        hex: "#4B5563",
        rgb: "rgb(75, 85, 99)",
        oklch: "oklch(0.40 0.02 258)",
      },
    },
  },
  typography: {
    headers: {
      h1: {
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 48,
        textTransform: "none",
      },
      h2: {
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 40,
        textTransform: "none",
      },
      h3: {
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 32,
        textTransform: "none",
      },
      h4: {
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 24,
        textTransform: "none",
      },
      h5: {
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 20,
        textTransform: "none",
      },
      h6: {
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 16,
        textTransform: "none",
      },
    },
    subheader: {
      fontFamily: "Inter",
      fontWeight: 600,
      fontSize: 16,
    },
    body: {
      fontFamily: "Inter",
      fontWeight: 400,
      fontSize: 16,
    },
  },
  shape: {
    borderRadius: 8,
  },
};
