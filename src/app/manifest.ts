import type { MetadataRoute } from "next";
import { seo } from "@/content/seo";
import { meta } from "@/content/copy";
import { BRAND_COLORS } from "@/lib/seo/og-assets";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${seo.siteName}, Hilton Head Resort`,
    short_name: seo.siteName,
    description: meta.shortDescription,
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: BRAND_COLORS.paper,
    theme_color: BRAND_COLORS.paper,
    lang: "en-US",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
