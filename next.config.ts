import type { NextConfig } from "next";
import { getLocales } from "@/lib/contentful";

const nextConfig = async (): Promise<NextConfig> => {
  const locales = await getLocales();
  const localeCodes = locales.map((locale) => locale.code);
  const isProd = process.env.NODE_ENV === "production";
  console.log("isProd", isProd);

  return {
    experimental: {
      optimizePackageImports: [
        "lucide-react",
        "framer-motion",
        "date-fns",
        "@contentful/rich-text-react-renderer",
        "lodash",
      ],
    },

    turbopack: {
      root: process.cwd(),
    },

    async headers() {
      const headers = [
        {
          source: "/:path*",
          headers: [
            {
              key: "Content-Security-Policy",
              value:
                "frame-ancestors 'self' https://app.contentful.com https://preview.contentful.com;",
            },
            {
              key: "X-Frame-Options",
              value: "SAMEORIGIN",
            },
          ],
        },
      ];

      if (isProd) {
        headers.push(
          {
            source: "/search-index.json",
            headers: [
              {
                key: "Cache-Control",
                value:
                  "public, max-age=3600, stale-while-revalidate=86400",
              },
            ],
          },
          {
            source: "/_next/static/:path*",
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
              },
            ],
          }
        );
      }

      return headers;
    },

    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "images.ctfassets.net",
          port: "",
        },
        {
          protocol: "https",
          hostname: "downloads.ctfassets.net",
          port: "",
        },
      ],
      dangerouslyAllowSVG: true,
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60 * 60 * 24 * 30,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256],
    },

    compiler: {
      removeConsole:
        process.env.NODE_ENV === "production"
          ? { exclude: ["error", "warn"] }
          : false,
    },

    compress: true,
    reactStrictMode: true,
    generateEtags: true,
    poweredByHeader: false,
  };
};

export default nextConfig;
