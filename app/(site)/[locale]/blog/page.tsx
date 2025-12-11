import { Locale, getI18nConfig } from "@/i18n-config"; // Import locale type for internationalization
import ContentfulLandingPage from "@/features/contentful/components/contentful-landing-page"; // Component to render the landing page
import { ILandingPage } from "@/features/contentful/type"; // Types for Contentful landing page entries
import LivePreviewProviderWrapper from "@/features/contentful/live-preview-provider-wrapper";
import { resolveLandingPageByPath } from "@/features/contentful/landing-page-resolver";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";

// Treat /blog as a normal landingPage resolved by fullPath "blog".
const BLOG_PATH = "blog";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogIndexPage({ params }: Props) {
  const { isEnabled: isPreviewEnabled } = await draftMode();
  const { locale } = await params;

  // Guard against invalid locales (e.g. _next) to avoid bad Contentful queries
  const { locales } = await getI18nConfig();
  if (!locales.includes(locale)) {
    notFound();
  }

  const slugSegments = [BLOG_PATH];

  let pageEntry: ILandingPage | undefined;
  try {
    pageEntry = await resolveLandingPageByPath({
      slugSegments,
      locale,
      isPreviewEnabled: !!isPreviewEnabled,
    });
  } catch (err) {
    console.error("[blog] resolveLandingPageByPath error", {
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

  return (
    <div>
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

  const { locales } = await getI18nConfig();
  if (!locales.includes(locale)) {
    return {};
  }

  const slugSegments = [BLOG_PATH];

  let pageEntry: ILandingPage | undefined;
  try {
    pageEntry = await resolveLandingPageByPath({
      slugSegments,
      locale,
      isPreviewEnabled: !!isPreviewEnabled,
    });
  } catch (err) {
    console.error("[blog] generateMetadata resolveLandingPageByPath error", {
      slugSegments,
      locale,
      err,
    });
  }

  const previousImages = (await parent).openGraph?.images || [];
  const pageTitle = `${pageEntry?.fields?.title ?? "Blog"} | Contentful Site`;

  return {
    title: pageTitle,
    openGraph: {
      images: [...previousImages],
    },
  };
}
