# SEO wiring for page owners

Everything SEO lives in `src/lib/seo/`, `src/components/seo/` and the file-convention routes
(`sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, `icon.tsx`, `apple-icon.tsx`).
Titles and descriptions come from `src/content/seo.ts`; do not hard-code them in pages.
Strategy: `docs/seo.md`. Tests: `npx tsx --test tests/seo/seo.test.ts`.

## Environment

Set `NEXT_PUBLIC_SITE_URL=https://<owner domain>` in production. Fallbacks: `VERCEL_PROJECT_PRODUCTION_URL`,
`VERCEL_URL`, then `http://localhost:3000`. Placeholder values containing "TODO" are ignored.
Vercel preview deployments (`VERCEL_ENV=preview`) are automatically noindex and robots disallow all.

## 1. `src/app/layout.tsx`

Replace the current `metadata` export (it uses `meta.title`, which differs from the SEO title in `seo.ts`):

```tsx
import { rootMetadata } from "@/lib/seo/metadata";

export const metadata = rootMetadata;
```

Do not put JSON-LD in the layout (WebSite belongs on `/` only).

`src/app/favicon.ico` was removed; `src/app/icon.tsx` and `apple-icon.tsx` replace it.

## 2. Each page

| Route | Metadata export | JSON-LD (render anywhere inside the page JSX) |
| --- | --- | --- |
| `/` (`src/app/page.tsx`) | `export const metadata = pageMetadata("home");` | `<JsonLd data={[websiteSchema(), propertySchema(getPhotos())]} />` |
| `/book` | `export const metadata = pageMetadata("book");` | `<JsonLd data={pageBreadcrumb("book")} />` |
| `/gallery` | `export const metadata = pageMetadata("gallery");` | `<JsonLd data={pageBreadcrumb("gallery")} />` |
| `/area` | `export const metadata = pageMetadata("area");` | `<JsonLd data={pageBreadcrumb("area")} />` |
| `/faq` | `export const metadata = pageMetadata("faq");` | `<JsonLd data={[faqPageSchema(faq), pageBreadcrumb("faq")]} />` |
| `/policies` | `export const metadata = pageMetadata("policies");` | `<JsonLd data={pageBreadcrumb("policies")} />` |
| `/booking/success` (and any other `/booking/*`) | `export const metadata: Metadata = { ...noindexMetadata, title: "Request received" };` | none |

Imports:

```tsx
import type { Metadata } from "next";
import { pageMetadata, noindexMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { websiteSchema, propertySchema, faqPageSchema, pageBreadcrumb } from "@/lib/seo/schema";
import { getPhotos } from "@/lib/photos";
import { faq } from "@/content/faq";
```

Notes:
- `propertySchema(getPhotos())` emits a full `VacationRental` once public/photos holds 8+ photos that
  include a bedroom, a bathroom and a common area (Google's requirement). Until then it emits a
  `LodgingBusiness` for the same entity. Never emit both. No code change needed when photos arrive.
- FAQ: pass exactly the items shown on the page. `{{tokens}}` are filled from `siteConfig` via
  `fillTokens`; if the page fills tokens with its own function, pass it: `faqPageSchema(items, render)`.
- `/book` with `?checkin=...` canonicalizes to `/book` automatically.
- Do not add `AggregateRating` or `Review` JSON-LD (docs/seo.md 4.4). Reviews stay plain HTML.
- Breadcrumb labels (`PAGE_LABELS` in schema.ts) match the masthead/footer: Photographs, Area guide,
  Questions, Policies, Book direct. Change them there if the nav labels change.

## 3. Open Graph image

`/opengraph-image` is generated (1200x630, typographic, fonts bundled from `@fontsource`). It becomes the
"cover crop with wordmark" automatically when `public/photos/og-image.jpg` exists (JPEG or PNG), or else a
`cover-*`/`hero-*` or `boardwalk-*` JPEG/PNG. Action for the owner of `src/lib/photos.ts`: `og-image.jpg`
(the path in `seo.ogImagePath`) would currently be listed in the gallery as an "other" photo, so skip files
named `og-image.*` in `getPhotos()`.

## 4. Known build blocker (not SEO)

`next build` currently fails offline because `layout.tsx` uses `next/font/google`. Either build with network
access or switch to `next/font/local` using the `.woff2` files now in `node_modules/@fontsource/newsreader`
and `node_modules/@fontsource/hanken-grotesk`.
