/**
 * Assets for generated images (Open Graph, icons). Server only.
 * Fonts are bundled from @fontsource packages (.woff, which next/og accepts; .woff2 is not supported),
 * so builds never depend on fetching Google Fonts.
 */
import fs from "node:fs/promises";
import path from "node:path";

/** From src/styles/tokens.css. */
export const BRAND_COLORS = {
  paper: "#ECECE5",
  sheet: "#F6F6F1",
  stone: "#DFE0D6",
  ink: "#22241F",
  inkMuted: "#585B52",
  marsh: "#475638",
  rule: "#C6C8BC",
} as const;

type FontWeight = 400 | 500;
type FontStyle = "normal" | "italic";
export type OgFont = { name: string; data: ArrayBuffer; weight: FontWeight; style: FontStyle };

const FONT_DIR = path.join(process.cwd(), "node_modules", "@fontsource");

async function readFont(pkg: string, file: string): Promise<ArrayBuffer> {
  const buf = await fs.readFile(path.join(FONT_DIR, pkg, "files", file));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export async function loadOgFonts(): Promise<OgFont[]> {
  const [serif400, serif400i, serif500, sans400, sans500] = await Promise.all([
    readFont("newsreader", "newsreader-latin-400-normal.woff"),
    readFont("newsreader", "newsreader-latin-400-italic.woff"),
    readFont("newsreader", "newsreader-latin-500-normal.woff"),
    readFont("hanken-grotesk", "hanken-grotesk-latin-400-normal.woff"),
    readFont("hanken-grotesk", "hanken-grotesk-latin-500-normal.woff"),
  ]);
  return [
    { name: "Newsreader", data: serif400, weight: 400, style: "normal" },
    { name: "Newsreader", data: serif400i, weight: 400, style: "italic" },
    { name: "Newsreader", data: serif500, weight: 500, style: "normal" },
    { name: "Hanken Grotesk", data: sans400, weight: 400, style: "normal" },
    { name: "Hanken Grotesk", data: sans500, weight: 500, style: "normal" },
  ];
}

/** Serif "P" only, for icons (keeps the icon route light). */
export async function loadMonogramFont(): Promise<OgFont[]> {
  return [{ name: "Newsreader", data: await readFont("newsreader", "newsreader-latin-500-normal.woff"), weight: 500, style: "normal" }];
}

/**
 * A local owner photo as a data URI, for the OG image. Only JPEG and PNG (the formats next/og decodes).
 * Returns null when the file is missing or in another format, so the image falls back to typography.
 */
export async function photoDataUri(publicSrc: string): Promise<string | null> {
  const rel = decodeURIComponent(publicSrc.replace(/^\/+/, ""));
  const ext = path.extname(rel).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : null;
  if (!mime) return null;
  try {
    const buf = await fs.readFile(path.join(process.cwd(), "public", rel));
    if (buf.byteLength > 6 * 1024 * 1024) return null; // keep the render fast; owner should supply og-image.jpg
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
