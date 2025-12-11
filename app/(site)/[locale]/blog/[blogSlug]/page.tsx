import { Locale } from "@/i18n-config"; // Import locale type for internationalization
import { getEntries, getRelatedBlogPosts, getTags } from "@/lib/contentful"; // Function to fetch data from Contentful
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import {
  IBlogPostPage,
  BlogPostPageSkeleton,
} from "@/features/contentful/type";
import ContentfulBlogPage from "@/features/contentful/components/contentful-blog-page";
import { extractContentfulAssetUrl } from "@/lib/utils";
import LivePreviewProviderWrapper from "@/features/contentful/live-preview-provider-wrapper";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBlogPostSchema } from "@/lib/seo";
import { BlogTags } from "@/features/contentful/components/blog-tags";
import { RelatedPosts } from "@/features/contentful/components/related-posts";

const INCLUDES_COUNT = 6;

type Props = {
  params: Promise<{ locale: Locale; blogSlug: string }>; // Extract locale from the URL params
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; // Extract preview from the URL search params

  // searchParams: { preview?: string };
};

export default async function IndexPage({ params, searchParams }: Props) {
  // preview search param is used to enable preview mode e.g localhost:3000/de/home?preview=true
  const { preview: isPreviewEnabled } = await searchParams;
  const { locale, blogSlug } = await params;

  // Fetch landing page data from Contentful based on the slug and locale
  const entries = await getEntries<BlogPostPageSkeleton>(
    {
      content_type: "blogPost",
      "fields.slug": blogSlug,
      include: INCLUDES_COUNT,
      locale,
    },
    !!isPreviewEnabled
  );

  // Get the first entry and cast it to ILandingPage type
  const blogEntry = entries[0] as IBlogPostPage;

  if (!blogEntry) {
    notFound();
  }

  // Extract tags from the blog entry metadata
  const entryTags = blogEntry.metadata?.tags || [];
  const tagIds = entryTags.map((tag) => tag.sys.id);

  // Fetch all tags to get tag names, and related posts in parallel
  const [allTags, relatedPostsRaw] = await Promise.all([
    getTags(),
    tagIds.length > 0
      ? getRelatedBlogPosts(tagIds, blogSlug, locale, 3)
      : Promise.resolve([]),
  ]);

  // Map tag IDs to names
  const tags = entryTags.map((tagLink) => {
    const fullTag = allTags.find((t) => t.sys.id === tagLink.sys.id);
    return {
      id: tagLink.sys.id,
      name: fullTag?.name || tagLink.sys.id,
    };
  });

  // Cast related posts
  const relatedPosts = relatedPostsRaw as IBlogPostPage[];

  // Generate JSON-LD structured data for blog post
  const blogPath = `/blog/${blogSlug}`;
  const seoTitle =
    blogEntry.fields?.seoMetadata?.fields?.title ||
    blogEntry.fields?.title ||
    blogSlug;
  const seoDescription =
    blogEntry.fields?.seoMetadata?.fields?.description || "";
  const seoOgImage = extractContentfulAssetUrl(
    blogEntry.fields?.seoMetadata?.fields?.ogImage ||
      blogEntry.fields?.featuredImage ||
      null
  );

  // Extract author name if available (uses firstName + lastName)
  const authorFields = blogEntry.fields?.author?.fields;
  const authorName = authorFields
    ? `${authorFields.firstName}${
        authorFields.lastName ? ` ${authorFields.lastName}` : ""
      }`
    : undefined;

  const jsonLdSchema = generateBlogPostSchema({
    title: seoTitle,
    description: seoDescription,
    path: blogPath,
    image: seoOgImage ? `https:${seoOgImage}` : undefined,
    datePublished: blogEntry.sys.createdAt,
    dateModified: blogEntry.sys.updatedAt,
    author: authorName,
  });

  return (
    <div>
      <JsonLd data={jsonLdSchema} />
      {/* Render the blog page component with the fetched data */}
      <LivePreviewProviderWrapper
        locale={locale}
        isPreviewEnabled={!!isPreviewEnabled}
      >
        <ContentfulBlogPage entry={blogEntry} />

        {/* Tags section */}
        <div className="mx-auto max-w-screen-md px-4 mt-8">
          {tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Tagged with
              </h3>
              <BlogTags tags={tags} />
            </div>
          )}

          {/* Related posts section */}
          <RelatedPosts posts={relatedPosts} locale={locale} />
        </div>
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
  const { locale, blogSlug } = await params;

  // Fetch landing page data from Contentful based on the slug and locale
  const entries = await getEntries<BlogPostPageSkeleton>(
    {
      content_type: "blogPost",
      "fields.slug": blogSlug,
      include: INCLUDES_COUNT,
      locale,
    },
    !!isPreviewEnabled
  );

  // Get the first entry and cast it to ILandingPage type
  const blogEntry = entries[0] as IBlogPostPage;
  const previousImages = (await parent).openGraph?.images || [];
  const pageTitle = `${blogEntry?.fields?.title} | Contentful Site`;
  const seoTitle = blogEntry?.fields?.seoMetadata?.fields?.title || pageTitle;
  const seoDescription =
    blogEntry?.fields?.seoMetadata?.fields?.description || "";

  const seoOgImage = extractContentfulAssetUrl(
    blogEntry?.fields?.seoMetadata?.fields?.ogImage || null
  );

  const fullImageUrl = seoOgImage ? `https:${seoOgImage}?w=1200&h=630` : null;

  const images = fullImageUrl
    ? [fullImageUrl, ...previousImages]
    : [...previousImages];

  const seoNoIndex = blogEntry?.fields?.seoMetadata?.fields?.noIndex || false;
  const seoNoFollow = blogEntry?.fields?.seoMetadata?.fields?.noFollow || false;

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
  };
}
