import { createClient, type ContentfulClientApi } from "contentful";
import type { EntryCollection, EntrySkeletonType, Entry } from "contentful";
import type { TimelineData } from "./timeline";

const client = createClient({
  space: process.env.NEXT_PUBLIC_CTF_SPACE_ID!,
  accessToken: process.env.NEXT_PUBLIC_CTF_DELIVERY_TOKEN!,
  environment: process.env.NEXT_PUBLIC_CTF_ENVIRONMENT || "master",
});

const previewClient = createClient({
  space: process.env.NEXT_PUBLIC_CTF_SPACE_ID!,
  accessToken: process.env.NEXT_PUBLIC_CTF_PREVIEW_TOKEN!,
  host: "preview.contentful.com",
  environment: process.env.NEXT_PUBLIC_CTF_ENVIRONMENT || "master",
});

/**
 * Creates a preview client with Timeline support.
 * Timeline preview requires contentful.js v11.9.0+
 */
function createTimelinePreviewClient(
  timelineData: TimelineData
): ContentfulClientApi<undefined> {
  // Build timelinePreview config based on available data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timelinePreview: Record<string, any> = {};

  if (timelineData.releaseId) {
    timelinePreview.release = { lte: timelineData.releaseId };
  }
  if (timelineData.timestamp) {
    timelinePreview.timestamp = { lte: timelineData.timestamp };
  }

  // Cast to any to support timelinePreview which may not be in older type definitions

  return createClient({
    space: process.env.NEXT_PUBLIC_CTF_SPACE_ID!,
    accessToken: process.env.NEXT_PUBLIC_CTF_PREVIEW_TOKEN!,
    host: "preview.contentful.com",
    environment: process.env.NEXT_PUBLIC_CTF_ENVIRONMENT || "master",
    timelinePreview,
  } as any);
}

/**
 * Parses timeline token and returns TimelineData.
 * Token format: "releaseId;timestamp" or just "releaseId;"
 */
function parseTimelineToken(token: string): TimelineData | null {
  if (!token) return null;

  // Token format: "releaseId;timestamp" (timestamp may be empty)
  const parts = token.split(";");
  const releaseId = parts[0] || undefined;
  const timestamp = parts[1] || undefined;

  if (!releaseId && !timestamp) return null;

  return { releaseId, timestamp };
}

export const getEntries = async <T extends EntrySkeletonType>(
  options: Record<string, unknown>,
  isPreviewEnabled: boolean = false,
  timelineToken?: string
): Promise<Entry<T>[]> => {
  try {
    let clientInstance: ContentfulClientApi<undefined>;

    if (isPreviewEnabled && timelineToken) {
      // Parse timeline token and use timeline-aware client
      const timelineData = parseTimelineToken(timelineToken);
      if (timelineData?.releaseId) {
        clientInstance = createTimelinePreviewClient(timelineData);
      } else {
        clientInstance = previewClient;
      }
    } else if (isPreviewEnabled) {
      clientInstance = previewClient;
    } else {
      clientInstance = client;
    }

    const entries: EntryCollection<T> = await clientInstance.getEntries<T>(
      options
    );
    return entries.items;
  } catch (error) {
    console.error("Error fetching entries from Contentful:", error);
    return [];
  }
};

/**
 * Fetches available locales from Contentful.
 * @returns An array of locales.
 */
export const getLocales = async () => {
  try {
    const response = await client.getLocales();

    return response.items.map((locale) => ({
      code: locale.code,
      name: locale.name,
      default: locale.default,
    }));
  } catch (error) {
    console.error("Error fetching locales:", error);
    return [];
  }
};

export const getAllPageSlugs = async <T extends EntrySkeletonType>(
  options: Record<string, unknown>,
  isPreviewEnabled: boolean = false
): Promise<string[]> => {
  try {
    const allSlugs: string[] = [];
    const clientInstance = isPreviewEnabled ? previewClient : client;

    const entries: EntryCollection<T> = await clientInstance.getEntries<T>(
      options
    );
    const totalPages = entries?.total;
    const limit = entries.limit as number;
    const numberOfPages = Math.ceil(totalPages / limit);
    for (let page = 0; page < numberOfPages; page++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const slugs = await clientInstance.getEntries<T>({
        ...options,
        skip: page * entries.limit,
        limit: entries.limit,
        select: "fields.slug",
      });

      const slugValues = slugs.items.map((item) => item.fields.slug as string);

      allSlugs.push(...slugValues);
    }

    return allSlugs;
  } catch (error) {
    console.error("Error fetching entries from Contentful:", error);
    return [];
  }
};
