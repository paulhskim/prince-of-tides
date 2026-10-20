import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // docs/ux-spec.md section 6: serve owner photographs as AVIF, then WebP.
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
