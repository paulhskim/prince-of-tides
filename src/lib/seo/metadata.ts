import type { Metadata } from "next";
import { seo, type PageKey } from "@/content/seo";
import { absoluteUrl, isPreviewDeployment, siteUrl } from "./site-url";

export type { PageKey };

/** Generated Open Graph image (src/app/opengraph-image.tsx). */
export const OG_IMAGE = {
  path: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: seo.ogImageAlt,
  type: "image/png",
} as const;

function ogImages() {
  return [
    {
      url: absoluteUrl(OG_IMAGE.path),
      width: OG_IMAGE.width,
      height: OG_IMAGE.height,
      alt: OG_IMAGE.alt,
      type: OG_IMAGE.type,
    },
  ];
}

/** The exact <title> text a page renders (template applied where the page uses it). */
export function renderedTitle(page: PageKey): string {
  const p = seo.pages[page];
  return p.useTemplate ? seo.titleTemplate.replace("%s", p.title) : p.title;
}

const indexRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
};

const noindexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

/**
 * Root layout metadata. In src/app/layout.tsx: `export const metadata = rootMetadata;`
 * No canonical here on purpose: a root canonical would be inherited by pages that forget their own.
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: seo.defaultTitle, template: seo.titleTemplate },
  description: seo.defaultDescription,
  applicationName: seo.siteName,
  authors: [{ name: seo.siteName }],
  creator: seo.siteName,
  publisher: seo.siteName,
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [{ url: "/icon/32", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: seo.locale,
    siteName: seo.siteName,
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    url: absoluteUrl("/"),
    images: ogImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: seo.defaultTitle,
    description: seo.defaultDescription,
    images: ogImages(),
  },
  robots: isPreviewDeployment() ? noindexRobots : indexRobots,
};

/**
 * Per-page metadata. In a page file: `export const metadata = pageMetadata("faq");`
 * `overrides` is shallow-merged last (use sparingly; titles and descriptions belong in src/content/seo.ts).
 */
export function pageMetadata(page: PageKey, overrides: Metadata = {}): Metadata {
  const p = seo.pages[page];
  const fullTitle = renderedTitle(page);
  const url = absoluteUrl(p.path);
  const images = ogImages();

  const base: Metadata = {
    title: p.useTemplate ? p.title : { absolute: p.title },
    description: p.description,
    keywords: p.keywords,
    // Self-referencing canonical with no query string (/book?checkin=... canonicalizes to /book).
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: seo.locale,
      siteName: seo.siteName,
      title: fullTitle,
      description: p.description,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: p.description,
      images,
    },
    robots: isPreviewDeployment() ? noindexRobots : indexRobots,
  };

  return { ...base, ...overrides };
}

/**
 * For pages that must never be indexed (booking confirmation, thank-you, error states).
 * Usage: `export const metadata: Metadata = { ...noindexMetadata, title: "Request received" };`
 */
export const noindexMetadata: Metadata = {
  robots: noindexRobots,
};
