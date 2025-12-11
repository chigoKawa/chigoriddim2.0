"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

interface Tag {
  id: string;
  name: string;
}

interface BlogTagsProps {
  tags: Tag[];
}

export function BlogTags({ tags }: BlogTagsProps) {
  const params = useParams();
  const locale = params?.locale || "en-US";

  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/${locale}/blog/tag/${tag.id}`}
          className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full 
            bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}

export default BlogTags;
