import type { MetadataRoute } from "next";
import { absoluteUrl, isPreviewDeployment } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  // Vercel preview deployments are never indexed (docs/seo.md section 5).
  if (isPreviewDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/booking/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
