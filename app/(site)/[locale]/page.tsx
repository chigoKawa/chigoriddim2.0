import { Locale, getI18nConfig } from "@/i18n-config"; // Import locale type for internationalization
import ContentfulLandingPage from "@/features/contentful/components/contentful-landing-page"; // Component to render the landing page
import { ILandingPage } from "@/features/contentful/type"; // Types for Contentful landing page entries
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { extractContentfulAssetUrl } from "@/lib/utils";
import LivePreviewProviderWrapper from "@/features/contentful/live-preview-provider-wrapper";
import { resolveLandingPageByPath } from "@/features/contentful/landing-page-resolver";
import { draftMode, cookies } from "next/headers";
import { JsonLd } from "@/components/seo/json-ld";
import { generateWebPageSchema } from "@/lib/seo";

// Determine the homepage path from env; this is the fullPath that SlugSmith would manage.
const HOMEPAGE_PATH = process.env.NEXT_PUBLIC_HOMEPAGE_SLUG || "home";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function IndexPage({ params }: Props) {
  const { isEnabled: isPreviewEnabled } = await draftMode();
  const { locale } = await params;

  // Get timeline token from cookie (set by draft API, survives redirects)
  const cookieStore = await cookies();
  const timelineToken = cookieStore.get("__contentful_timeline_token")?.value;

  const slugSegments = [HOMEPAGE_PATH];

  let pageEntry: ILandingPage | undefined;
  try {
    pageEntry = await resolveLandingPageByPath({
      slugSegments,
      locale,
      isPreviewEnabled: !!isPreviewEnabled,
      timelineToken,
    });
  } catch (err) {
    console.error("[home] resolveLandingPageByPath error", {
      slugSegments,
      locale,
      err,
    });
  }

  if (!pageEntry) {
    notFound();
  }

  // Serialize the Contentful Entry to ensure only plain JSON crosses the server->client boundary
  // Use toPlainObject() to avoid circular references from the SDK entry graph.
  const asPlainObject = pageEntry as { toPlainObject?: () => unknown };
  const pageData = asPlainObject.toPlainObject
    ? (asPlainObject.toPlainObject() as ILandingPage)
    : (pageEntry as ILandingPage);

  // Generate JSON-LD structured data
  const seoTitle =
    pageEntry.fields?.seoMetadata?.fields?.title ||
    pageEntry.fields?.title ||
    "Home";
  const seoDescription =
    pageEntry.fields?.seoMetadata?.fields?.description || "";
  const seoOgImage = extractContentfulAssetUrl(
    pageEntry.fields?.seoMetadata?.fields?.ogImage || null
  );

  const jsonLdSchema = generateWebPageSchema({
    title: seoTitle,
    description: seoDescription,
    path: "/",
    image: seoOgImage ? `https:${seoOgImage}` : undefined,
    dateModified: pageEntry.sys.updatedAt,
  });

  return (
    <div>
      <JsonLd data={jsonLdSchema} />
      {/* Render the landing page component with the fetched data */}
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
  const sp = await searchParams;
  const isPreviewEnabled = Object.prototype.hasOwnProperty.call(
    sp ?? {},
    "preview"
  );
  const { locale } = await params;

  const slugSegments = [HOMEPAGE_PATH];
  const slugPath = HOMEPAGE_PATH;

  let pageEntry: ILandingPage | undefined;
  try {
    pageEntry = await resolveLandingPageByPath({
      slugSegments,
      locale,
      isPreviewEnabled: !!isPreviewEnabled,
    });
  } catch (err) {
    console.error("[home] generateMetadata resolveLandingPageByPath error", {
      slugSegments,
      locale,
      err,
    });
  }

  const previousImages = (await parent).openGraph?.images || [];
  const pageTitle = `${pageEntry?.fields?.title || slugPath} | Contentful Site`;
  const seoTitle = pageEntry?.fields?.seoMetadata?.fields?.title || pageTitle;
  const seoDescription =
    pageEntry?.fields?.seoMetadata?.fields?.description || "";

  const seoOgImage = extractContentfulAssetUrl(
    pageEntry?.fields?.seoMetadata?.fields?.ogImage || null
  );

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

  // Canonical URL should be clean for default locale, prefixed for others
  const { defaultLocale } = await getI18nConfig();
  const canonicalPath = locale === defaultLocale ? `/` : `/${locale}`;

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
