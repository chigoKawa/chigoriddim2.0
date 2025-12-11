// lib/contentful.ts
import type { ThemeEntry } from "../types/theme";

const SPACE = process.env.NEXT_PUBLIC_CTF_SPACE_ID!;
const ENV = process.env.NEXT_PUBLIC_CTF_ENVIRONMENT ?? "master";

function baseUrl(preview: boolean) {
  const host = preview ? "preview.contentful.com" : "cdn.contentful.com";
  return `https://${host}/spaces/${SPACE}/environments/${ENV}`;
}

function token(preview: boolean) {
  return preview
    ? process.env.NEXT_PUBLIC_CTF_PREVIEW_TOKEN!
    : process.env.NEXT_PUBLIC_CTF_DELIVERY_TOKEN!;
}

export async function getThemeEntry(preview: boolean): Promise<ThemeEntry> {
  const url = new URL(`${baseUrl(preview)}/entries`);
  url.searchParams.set("content_type", "appSettings");
  url.searchParams.set("limit", "1");
  url.searchParams.set("include", "5");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token(preview)}` },
    cache: preview ? "no-store" : undefined,
    // tag the request so you can revalidate on publish
    next: preview ? undefined : { revalidate: 300, tags: ["theme"] },
  });

  if (!res.ok) {
    throw new Error(
      `Contentful fetch failed: ${res.status} ${await res.text()}`
    );
  }
  const json = await res.json();

  const item = json?.items?.[0];
  if (!item) throw new Error("No theme entry found");
  return item as ThemeEntry;
}
