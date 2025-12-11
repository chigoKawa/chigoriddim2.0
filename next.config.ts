import type { NextConfig } from "next";
import { getLocales } from "@/lib/contentful";

// Export async function for Next.js config
const nextConfig = async (): Promise<NextConfig> => {
  const locales = await getLocales();

  const localeCodes = locales.map((locale) => locale.code);

  return {
    // i18n: {
    //   locales: localeCodes,
    //   defaultLocale: localeCodes.includes("en-US") ? "en-US" : localeCodes[0], // Ensure default
    // },

    // Performance: Enable experimental features
    experimental: {
      // Optimize package imports for smaller bundles
      optimizePackageImports: [
        "lucide-react",
        "framer-motion",
        "date-fns",
        "@contentful/rich-text-react-renderer",
        "lodash",
      ],
    },

    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "Content-Security-Policy",
              // allow Contentful's UI to iframe your app
              value:
                "frame-ancestors 'self' https://app.contentful.com https://preview.contentful.com;",
            },
            {
              // Explicitly unset X-Frame-Options (CSP frame-ancestors takes precedence)
              key: "X-Frame-Options",
              value: "SAMEORIGIN",
            },
          ],
        },
        // Cache static assets aggressively
        {
          source: "/search-index.json",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=3600, stale-while-revalidate=86400",
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
        },
      ];
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
      // Performance: Image optimization settings
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256],
    },

    // Remove console.log in production builds
    compiler: {
      removeConsole:
        process.env.NODE_ENV === "production"
          ? { exclude: ["error", "warn"] }
          : false,
    },

    // Performance: Enable compression
    compress: true,

    // Performance: Strict mode for better debugging
    reactStrictMode: true,

    // Performance: Generate ETags for caching
    generateEtags: true,

    // Performance: Reduce powered-by header
    poweredByHeader: false,
  };
};

// const nextConfig2: NextConfig = {
//   /* config options here */
//   i18n: {
//     locales: ["en-US", "es"],
//     defaultLocale: "en-US",
//   },
// };

export default nextConfig;
