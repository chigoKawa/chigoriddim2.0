import countriesData from "./countries.json" assert { type: "json" };

export const APP_NAME = "Contentful Countries";
export const FLAG_CDN_BASE = "https://flagcdn.com";

// The bundled country data. Replace countries.json with an up-to-date dataset
// to control what gets installed.
export const COUNTRIES = Object.entries(
  countriesData as Record<string, any>
).map(([code, data]) => {
  const rawCurrency = String((data as any).currency || "");
  const primaryCurrency = rawCurrency.split(",")[0].trim();

  return {
    name: (data as any).name as string,
    code,
    status: "active" as const,
    currency: {
      code: primaryCurrency,
      symbol: primaryCurrency,
      name: primaryCurrency,
    },
  };
});
