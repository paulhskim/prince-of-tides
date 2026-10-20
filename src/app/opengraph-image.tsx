import { ImageResponse } from "next/og";
import { meta } from "@/content/copy";
import { seo } from "@/content/seo";
import { photoFor } from "@/lib/photos";
import { BRAND_COLORS as C, loadOgFonts, photoDataUri } from "@/lib/seo/og-assets";

export const alt = seo.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Editorial card: paper ground, serif wordmark, italic tagline in marsh, sans particulars on a hairline.
 * If the owner adds public/photos/og-image.jpg (or a cover/hero photo, JPEG or PNG), it fills the right
 * panel as the design system's "cover crop with wordmark". Until then the card is purely typographic.
 */
async function coverPhoto(): Promise<string | null> {
  const dedicated = await photoDataUri(seo.ogImagePath);
  if (dedicated) return dedicated;
  const hero = photoFor("hero") ?? photoFor("boardwalk");
  return hero ? photoDataUri(hero.src) : null;
}

export default async function OpengraphImage() {
  const [fonts, photo] = await Promise.all([loadOgFonts(), coverPhoto()]);
  const textWidth = photo ? 660 : 1200;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.paper, color: C.ink }}>
        <div
          style={{
            width: textWidth,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: photo ? "64px 56px 60px 72px" : "64px 80px 60px 80px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "Hanken Grotesk", fontWeight: 500, fontSize: 22, letterSpacing: "0.01em", color: C.inkMuted }}>
              Hilton Head Resort, mid-island
            </div>
            {photo ? null : (
              <div style={{ fontFamily: "Hanken Grotesk", fontWeight: 400, fontSize: 22, color: C.inkMuted }}>
                Book direct with the host
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Newsreader",
                fontWeight: 400,
                fontSize: photo ? 112 : 148,
                lineHeight: 1,
                letterSpacing: "-0.025em",
                color: C.ink,
              }}
            >
              Prince of Tides
            </div>
            <div
              style={{
                marginTop: 28,
                fontFamily: "Newsreader",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: photo ? 40 : 46,
                lineHeight: 1.2,
                color: C.marsh,
              }}
            >
              {meta.tagline}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                borderTop: `1px solid ${C.rule}`,
                paddingTop: 22,
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "Hanken Grotesk",
                fontSize: 24,
                color: C.ink,
              }}
            >
              <div style={{ display: "flex", fontWeight: 500 }}>Hilton Head Island, South Carolina</div>
              {photo ? null : (
                <div style={{ display: "flex", color: C.inkMuted }}>Two bedrooms, two baths, sleeps six</div>
              )}
            </div>
          </div>
        </div>

        {photo ? (
          <div style={{ width: 1200 - textWidth, height: "100%", display: "flex" }}>
            <img src={photo} alt="" width={1200 - textWidth} height={630} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          </div>
        ) : null}
      </div>
    ),
    { ...size, fonts },
  );
}
