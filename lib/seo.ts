import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Contentful Example";

export interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  locale?: string;
}

/**
 * Generate metadata for a page with Open Graph and Twitter cards
 */
export function generateSEO({
  title,
  description,
  path = "",
  image,
  noIndex = false,
  noFollow = false,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  locale = "en-US",
}: SEOProps): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}/og-image.png`;

  return {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Generate JSON-LD structured data for Organization
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      // Add social media URLs here
    ],
  };
}

/**
 * Generate JSON-LD structured data for WebSite with search
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate JSON-LD structured data for Article/BlogPosting
 */
export function generateArticleSchema({
  title,
  description,
  path,
  image,
  publishedTime,
  modifiedTime,
  authors = [],
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}${path}`,
    image: image || `${SITE_URL}/og-image.png`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: authors.map((name) => ({
      "@type": "Person",
      name,
    })),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Generate JSON-LD structured data for BreadcrumbList
 */
export function generateBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * Generate JSON-LD structured data for WebPage
 */
export function generateWebPageSchema({
  title,
  description,
  path,
  image,
  datePublished,
  dateModified,
  breadcrumbs,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumbs?: { name: string; path: string }[];
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  if (image) {
    schema.primaryImageOfPage = {
      "@type": "ImageObject",
      url: image,
    };
  }

  if (datePublished) {
    schema.datePublished = datePublished;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schema.breadcrumb = generateBreadcrumbSchema(breadcrumbs);
  }

  return schema;
}

/**
 * Generate JSON-LD structured data for BlogPosting
 */
export function generateBlogPostSchema({
  title,
  description,
  path,
  image,
  datePublished,
  dateModified,
  author,
  tags,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${SITE_URL}${path}`,
    image: image || `${SITE_URL}/og-image.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: author
      ? {
          "@type": "Person",
          name: author,
        }
      : {
          "@type": "Organization",
          name: SITE_NAME,
        },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${path}`,
    },
    ...(tags && tags.length > 0 && { keywords: tags.join(", ") }),
  };
}

/**
 * Generate JSON-LD structured data for FAQPage
 */
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
