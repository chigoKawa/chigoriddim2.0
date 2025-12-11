import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { getI18nConfig, type Locale } from "@/i18n-config";
import { Toaster } from "@/components/ui/sonner";
import { JsonLdMultiple } from "@/components/seo/json-ld";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";

import "./globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Contentful Example";

export const generateStaticParams = async () => {
  const { locales } = await getI18nConfig();

  return locales.map((locale) => ({
    locale: locale,
  }));
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "A modern content platform powered by Contentful",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "A modern content platform powered by Contentful",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locales } = await getI18nConfig();
  const locale: Locale = (locales[0] as Locale) ?? "en-US";

  // Generate structured data schemas
  const schemas = [generateOrganizationSchema(), generateWebsiteSchema()];

  return (
    <html lang={locale}>
      <head>
        <JsonLdMultiple schemas={schemas} />
      </head>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
