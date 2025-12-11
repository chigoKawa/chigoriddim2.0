import { Locale } from "@/i18n-config";
import { getEntries, getTags } from "@/lib/contentful";
import type { Metadata } from "next";
import Link from "next/link";
import {
  IBlogPostPage,
  BlogPostPageSkeleton,
} from "@/features/contentful/type";
import { extractContentfulAssetUrl } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ locale: Locale; tagId: string }>;
};

export default async function TagPage({ params }: Props) {
  const { locale, tagId } = await params;

  // Fetch all tags to get the tag name
  const allTags = await getTags();
  const currentTag = allTags.find((tag) => tag.sys.id === tagId);
  const tagName = currentTag?.name || tagId;

  // Fetch blog posts with this tag
  const entries = await getEntries<BlogPostPageSkeleton>(
    {
      content_type: "blogPost",
      "metadata.tags.sys.id[in]": [tagId],
      locale,
      include: 2,
      order: ["-fields.publishedDate"],
    },
    false
  );

  const blogPosts = entries as IBlogPostPage[];

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-12">
      {/* Back link */}
      <Link
        href={`/${locale}/blog`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all posts
      </Link>

      {/* Header */}
      <div className="mb-10">
        <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary text-primary-foreground mb-4">
          Tag
        </span>
        <h1 className="text-4xl font-bold">{tagName}</h1>
        <p className="text-muted-foreground mt-2">
          {blogPosts.length} {blogPosts.length === 1 ? "post" : "posts"} tagged
          with &quot;{tagName}&quot;
        </p>
      </div>

      {/* Blog posts grid */}
      {blogPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => {
            const imageUrl = extractContentfulAssetUrl(
              post.fields?.featuredImage || null
            );
            return (
              <Link
                key={post.sys.id}
                href={`/${locale}/blog/${post.fields.slug}`}
                className="group block overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                {imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={`https:${imageUrl}?w=400&h=225&fit=fill`}
                      alt={post.fields.title || "Blog post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {post.fields.title}
                  </h2>
                  {post.fields.publishedDate && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {format(
                        new Date(post.fields.publishedDate),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found with this tag.</p>
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagId } = await params;

  const allTags = await getTags();
  const currentTag = allTags.find((tag) => tag.sys.id === tagId);
  const tagName = currentTag?.name || tagId;

  return {
    title: `Posts tagged "${tagName}"`,
    description: `Browse all blog posts tagged with "${tagName}"`,
  };
}
