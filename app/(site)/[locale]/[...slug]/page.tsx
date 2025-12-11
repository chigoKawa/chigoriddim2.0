import { Locale, getI18nConfig } from "@/i18n-config"; // Import locale type for internationalization
import ContentfulLandingPage from "@/features/contentful/components/contentful-landing-page"; // Component to render the landing page
import { ILandingPage } from "@/features/contentful/type"; // Types for Contentful landing page entries
import type { Asset } from "contentful";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { extractContentfulAssetUrl } from "@/lib/utils";
import LivePreviewProviderWrapper from "@/features/contentful/live-preview-provider-wrapper";
import { draftMode, cookies } from "next/headers";
import { resolveLandingPageByPath } from "@/features/contentful/landing-page-resolver";
import { JsonLd } from "@/components/seo/json-ld";
import { generateWebPageSchema } from "@/lib/seo";

// Safe stopgap: force dynamic rendering and disable caching on this route to avoid
// DYNAMIC_SERVER_USAGE during server component render while we validate upstream data.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Props = {
  params: Promise<{ locale: Locale; slug: string[] }>; // Catch-all slug segments
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function IndexPage({ params }: Props) {
  // App Router draft mode: read from Next.js draftMode() instead of ?preview
  const { isEnabled: isPreviewEnabled } = await draftMode();

  const { locale, slug } = await params;

  // Get timeline token from cookie (set by draft API, survives redirects)
  const cookieStore = await cookies();
  const timelineToken = cookieStore.get("__contentful_timeline_token")?.value;

  // Guard against invalid locales (e.g. _next) to avoid bad Contentful queries
  const { locales } = await getI18nConfig();
  if (!locales.includes(locale)) {
    notFound();
  }

  // slug is already an array of segments because this is a [...slug] route.
  const slugSegments = slug;

  let pageEntry: ILandingPage | undefined;
  try {
    pageEntry = await resolveLandingPageByPath({
      slugSegments,
      locale,
      isPreviewEnabled: !!isPreviewEnabled,
      timelineToken,
    });
  } catch (err) {
    console.error("[slug] getEntries error", { slug, locale, err });
  }

  if (!pageEntry) {
    // Gracefully render 404 for missing content/locale combinations
    notFound();
  }

  // Serialize the Contentful Entry to ensure only plain JSON crosses the server->client boundary
  // Use toPlainObject() to avoid circular references from the SDK entry graph.
  const asPlainObject = pageEntry as { toPlainObject?: () => unknown };
  const pageData = asPlainObject.toPlainObject
    ? (asPlainObject.toPlainObject() as ILandingPage)
    : (pageEntry as ILandingPage);

  // Generate JSON-LD structured data
  const slugPath = `/${slug.join("/")}`;
  const seoTitle =
    pageEntry.fields?.seoMetadata?.fields?.title ||
    pageEntry.fields?.title ||
    slug.join(" ");
  const seoDescription =
    pageEntry.fields?.seoMetadata?.fields?.description || "";
  const seoOgImage = extractContentfulAssetUrl(
    pageEntry.fields?.seoMetadata?.fields?.ogImage || null
  );

  // Build breadcrumbs from slug segments
  const breadcrumbs = [
    { name: "Home", path: "/" },
    ...slug.map((segment, index) => ({
      name:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      path: `/${slug.slice(0, index + 1).join("/")}`,
    })),
  ];

  const jsonLdSchema = generateWebPageSchema({
    title: seoTitle,
    description: seoDescription,
    path: slugPath,
    image: seoOgImage ? `https:${seoOgImage}` : undefined,
    dateModified: pageEntry.sys.updatedAt,
    breadcrumbs,
  });

  return (
    <div>
      <JsonLd data={jsonLdSchema} />
      <LivePreviewProviderWrapper
        locale={locale}
        isPreviewEnabled={!!isPreviewEnabled}
      >
        <ContentfulLandingPage entry={pageData} />
      </LivePreviewProviderWrapper>
    </div>
  );
}

// metadata for SEO
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { preview: isPreviewEnabled } = await searchParams;
  const { locale, slug } = await params;

  // Skip Contentful lookups for invalid locales
  const { locales } = await getI18nConfig();
  if (!locales.includes(locale)) {
    return {};
  }

  // slug is string[] for this catch-all route.
  const slugSegments = slug;
  const slugPath = slugSegments.join("/");

  let pageEntry: ILandingPage | undefined;
  try {
    pageEntry = await resolveLandingPageByPath({
      slugSegments,
      locale,
      isPreviewEnabled: !!isPreviewEnabled,
    });
  } catch (err) {
    console.error("[slug] generateMetadata getEntries error", {
      slug,
      locale,
      err,
    });
  }
  const previousImages = (await parent).openGraph?.images || [];
  const pageTitle = `${pageEntry?.fields?.title ?? slugPath} | Contentful Site`;
  const seoTitle = pageEntry?.fields?.seoMetadata?.fields?.title || pageTitle;
  const seoDescription =
    pageEntry?.fields?.seoMetadata?.fields?.description || "";

  const ogAsset = (pageEntry?.fields?.seoMetadata?.fields?.ogImage ??
    null) as Asset | null;
  const seoOgImage = extractContentfulAssetUrl(ogAsset);

  const fullImageUrl = seoOgImage ? `https:${seoOgImage}?w=1200&h=630` : null;

  const images = fullImageUrl
    ? [fullImageUrl, ...previousImages]
    : [...previousImages];

  const seoNoIndex = pageEntry?.fields?.seoMetadata?.fields?.noIndex || false;
  const seoNoFollow = pageEntry?.fields?.seoMetadata?.fields?.noFollow || false;

  // Determine the metadata base URL (Vercel's URL or localhost for development)
  const metadataBase = process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : new URL(
        process.env.NEXT_PUBLIC_SITE_URL ||
          `http://localhost:${process.env.PORT || 3000}`
      );

  // Build canonical URL: clean path for default locale, prefixed for others
  const { defaultLocale } = await getI18nConfig();
  const canonicalPath =
    locale === defaultLocale ? `/${slugPath}` : `/${locale}/${slugPath}`;

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      images: images,
    },
    robots: {
      index: !seoNoIndex,
      follow: !seoNoFollow,
    },
    metadataBase,
    alternates: {
      canonical: canonicalPath,
    },
  };
}

// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
// revalidate is defined at top of file for this route

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true; // or false, to 404 on unknown paths

export async function generateStaticParams() {
  // This route is fully dynamic; let Next.js render on demand.
  return [];
}
