/**
 * Canonical base URL for every absolute URL the site emits (canonical, Open Graph, sitemap, JSON-LD).
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL                  (set this in production, e.g. https://example.com)
 *   2. VERCEL_PROJECT_PRODUCTION_URL         (Vercel, host only, no protocol)
 *   3. VERCEL_URL                            (Vercel deployment host, no protocol)
 *   4. http://localhost:3000
 *
 * Any value that still contains a placeholder (TODO_OWNER_DOMAIN, TODO_OWNER, TODO) is ignored, so a
 * placeholder can never leak into a tag.
 */

const FALLBACK = "http://localhost:3000";

function normalize(raw: string | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || /TODO/i.test(value)) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    return url.origin;
  } catch {
    return null;
  }
}

/** Origin without a trailing slash, e.g. "https://example.com". */
export function siteUrl(): string {
  return (
    normalize(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalize(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalize(process.env.VERCEL_URL) ??
    FALLBACK
  );
}

/** Absolute URL for a site path ("/faq" becomes "https://example.com/faq"). Absolute input is returned as-is. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${p}`;
}

/**
 * True on Vercel preview deployments. Preview URLs must not be indexed (docs/seo.md section 5),
 * so robots.ts and rootMetadata switch to noindex there.
 */
export function isPreviewDeployment(): boolean {
  return process.env.VERCEL_ENV === "preview";
}
