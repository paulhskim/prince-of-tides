import type { MetadataRoute } from "next";
import { seo, type PageKey } from "@/content/seo";
import { getGalleryPhotos } from "@/lib/photos";
import { absoluteUrl } from "@/lib/seo/site-url";

const ORDER: { page: PageKey; changeFrequency: "weekly" | "monthly" | "yearly"; priority: number }[] = [
  { page: "home", changeFrequency: "weekly", priority: 1 },
  { page: "book", changeFrequency: "weekly", priority: 0.9 },
  { page: "gallery", changeFrequency: "monthly", priority: 0.7 },
  { page: "area", changeFrequency: "monthly", priority: 0.7 },
  { page: "faq", changeFrequency: "monthly", priority: 0.6 },
  { page: "policies", changeFrequency: "yearly", priority: 0.4 },
];

/** Public pages only. /booking/* and /api/* are never listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const photos = getGalleryPhotos().map((p) => absoluteUrl(p.src));
  return ORDER.map(({ page, changeFrequency, priority }) => ({
    url: absoluteUrl(seo.pages[page].path),
    lastModified,
    changeFrequency,
    priority,
    ...(page === "gallery" && photos.length ? { images: photos } : {}),
  }));
}
