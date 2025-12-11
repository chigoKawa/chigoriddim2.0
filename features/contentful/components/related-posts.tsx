import Link from "next/link";
import { extractContentfulAssetUrl } from "@/lib/utils";
import { format } from "date-fns";
import type { IBlogPostPage } from "../type";

interface RelatedPostsProps {
  posts: IBlogPostPage[];
  locale: string;
}

export function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (!posts.length) return null;

  return (
    <section className="mt-16 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => {
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
                    alt={post.fields.title || "Related post"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {post.fields.title}
                </h3>
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
    </section>
  );
}

export default RelatedPosts;
