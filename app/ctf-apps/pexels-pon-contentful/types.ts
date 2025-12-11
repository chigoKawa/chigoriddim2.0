export interface PexelsImage {
  provider: "pexels";
  photoId: number;
  url: string;
  width: number;
  height: number;
  alt?: string;
  avgColor?: string;

  src: {
    original: string;
    large?: string;
    large2x?: string;
    medium?: string;
    small?: string;
    portrait?: string;
    landscape?: string;
    tiny?: string;
  };

  photographer: {
    id: number;
    name: string;
    url: string;
  };

  attribution: {
    text: string;
    url: string;
  };

  meta?: {
    selectedAt?: string;
    locale?: string;
    source?: "search" | "curated" | "other";
  };

  display?: {
    preferredVariant?: keyof PexelsImage["src"];
    focalUsage?: "thumbnail" | "card" | "hero" | "background";
  };
}
