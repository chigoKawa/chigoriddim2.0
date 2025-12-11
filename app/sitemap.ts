import { MetadataRoute } from "next";
import { getEntries, getLocales } from "@/lib/contentful";
import type {
  LandingPageSkeleton,
  BlogPostPageSkeleton,
} from "@/features/contentful/type";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * Generates a dynamic sitemap from Contentful content
 * Includes all landing pages and blog posts
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: SitemapEntry[] = [];

  try {
    // Fetch locales
    const locales = await getLocales();
    const defaultLocale = locales.find((l) => l.default)?.code || "en-US";

    // Fetch all landing pages
    const landingPages = await getEntries<LandingPageSkeleton>(
      {
        content_type: "landingPage",
        select: "sys.updatedAt,fields.fullPath,fields.slugSegment",
        limit: 1000,
      },
      false
    );

    // Fetch all blog posts
    const blogPosts = await getEntries<BlogPostPageSkeleton>(
      {
        content_type: "blogPost",
        select: "sys.updatedAt,fields.slug",
        limit: 1000,
      },
      false
    );

    // Add landing pages to sitemap
    for (const page of landingPages) {
      const fields = page.fields as Record<string, unknown> | undefined;
      const fullPath = fields?.fullPath as string | undefined;
      const slugSegment = fields?.slugSegment as string | undefined;
      const path = fullPath || slugSegment;

      if (!path) continue;

      // Normalize path
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;

      // Add entry for default locale (no prefix)
      entries.push({
        url: `${SITE_URL}${normalizedPath}`,
        lastModified: new Date(page.sys.updatedAt),
        changeFrequency: "weekly",
        priority: normalizedPath === "/home" ? 1.0 : 0.8,
      });

      // Add entries for non-default locales
      for (const locale of locales) {
        if (locale.code === defaultLocale) continue;

        entries.push({
          url: `${SITE_URL}/${locale.code}${normalizedPath}`,
          lastModified: new Date(page.sys.updatedAt),
          changeFrequency: "weekly",
          priority: normalizedPath === "/home" ? 1.0 : 0.8,
        });
      }
    }

    // Add blog posts to sitemap
    for (const post of blogPosts) {
      const postFields = post.fields as Record<string, unknown> | undefined;
      const slug = postFields?.slug as string | undefined;
      if (!slug) continue;

      const blogPath = `/blog/${slug}`;

      // Add entry for default locale
      entries.push({
        url: `${SITE_URL}${blogPath}`,
        lastModified: new Date(post.sys.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });

      // Add entries for non-default locales
      for (const locale of locales) {
        if (locale.code === defaultLocale) continue;

        entries.push({
          url: `${SITE_URL}/${locale.code}${blogPath}`,
          lastModified: new Date(post.sys.updatedAt),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return entries;
}
