"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  /** Show blur placeholder while loading */
  showBlur?: boolean;
  /** Aspect ratio for placeholder (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string;
}

/**
 * Optimized image component with:
 * - Lazy loading by default
 * - Blur-up effect on load
 * - Automatic AVIF/WebP format selection
 * - Contentful image optimization params
 */
export function OptimizedImage({
  src,
  alt,
  className,
  showBlur = true,
  aspectRatio,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Add Contentful image optimization params if it's a Contentful URL
  const optimizedSrc =
    typeof src === "string" && src.includes("ctfassets.net")
      ? `${src}?fm=webp&q=80`
      : src;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        className={cn(
          "transition-all duration-500",
          showBlur && !isLoaded && "scale-105 blur-sm",
          isLoaded && "scale-100 blur-0"
        )}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

/**
 * Get optimized Contentful image URL with format and quality params
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpg" | "png";
    fit?: "pad" | "fill" | "scale" | "crop" | "thumb";
  } = {}
): string {
  if (!url || !url.includes("ctfassets.net")) return url;

  const params = new URLSearchParams();

  if (options.width) params.set("w", options.width.toString());
  if (options.height) params.set("h", options.height.toString());
  if (options.quality) params.set("q", options.quality.toString());
  if (options.format) params.set("fm", options.format);
  if (options.fit) params.set("fit", options.fit);

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.toString()}`;
}
