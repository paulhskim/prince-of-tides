import { ImageResponse } from "next/og";
import { Monogram } from "@/lib/seo/monogram";
import { loadMonogramFont } from "@/lib/seo/og-assets";

/** Served at /icon/32 (favicon), /icon/192 and /icon/512 (manifest). */
const SIZES = [32, 192, 512] as const;

export function generateImageMetadata() {
  return SIZES.map((s) => ({ id: String(s), size: { width: s, height: s }, contentType: "image/png" }));
}

export default async function Icon({ id }: { id: string | Promise<string> }) {
  const resolved = Number(await id);
  const s = (SIZES as readonly number[]).includes(resolved) ? resolved : 32;
  return new ImageResponse(<Monogram size={s} />, {
    width: s,
    height: s,
    fonts: await loadMonogramFont(),
  });
}
