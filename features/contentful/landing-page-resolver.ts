import { getEntries } from "@/lib/contentful";
import type { ILandingPage, LandingPageSkeleton } from "./type";

/**
 * Resolve a landing page entry from a slug path like ["faqs", "it-faqs"].
 *
 * Prefers the landingPage.fullPath field (joined path), with a fallback to
 * slugSegment matching the last segment for backwards compatibility.
 *
 * Supports Timeline preview when timelineToken is provided.
 */
export async function resolveLandingPageByPath(params: {
  slugSegments: string[];
  locale: string;
  isPreviewEnabled: boolean;
  timelineToken?: string;
}): Promise<ILandingPage | undefined> {
  const { slugSegments, locale, isPreviewEnabled, timelineToken } = params;
  const slugPath = slugSegments.join("/");
  const lastSegment = slugSegments[slugSegments.length - 1];

  let pageEntry: ILandingPage | undefined;

  // 1) Try fullPath match
  let entries = await getEntries<LandingPageSkeleton>(
    {
      content_type: "landingPage",
      "fields.fullPath": slugPath,
      include: 10,
      locale,
    },
    isPreviewEnabled,
    timelineToken
  );

  pageEntry = entries[0] as ILandingPage | undefined;

  // 2) Fallback: slugSegment match
  if (!pageEntry) {
    entries = await getEntries<LandingPageSkeleton>(
      {
        content_type: "landingPage",
        "fields.slugSegment": lastSegment,
        include: 10,
        locale,
      },
      isPreviewEnabled,
      timelineToken
    );

    pageEntry = entries[0] as ILandingPage | undefined;
  }

  return pageEntry;
}
