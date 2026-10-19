import localFont from "next/font/local";
import { rootMetadata } from "@/lib/seo/metadata";
import { Masthead } from "@/components/site/Masthead";
import { Footer } from "@/components/site/Footer";
import "./globals.css";

/*
 * Newsreader (opsz 6 to 72, wght 200 to 800) and Hanken Grotesk (wght 100 to 900), self-hosted
 * from the Fontsource variable packages via next/font/local (latin subset, display swap).
 * Equivalent to the next/font/google setup in docs/design-system.md 4.2, without a build-time
 * dependency on fonts.googleapis.com.
 */
const serif = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2", style: "normal", weight: "200 800" },
    { path: "../../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2", style: "italic", weight: "200 800" },
  ],
  display: "swap",
  variable: "--font-serif-family",
  fallback: ["Iowan Old Style", "Georgia", "serif"],
});

const sans = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2", style: "normal", weight: "100 900" },
  ],
  display: "swap",
  variable: "--font-sans-family",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata = rootMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-w-[320px] overflow-x-clip">
        <a
          href="#main"
          className="sr-only z-[100] bg-ink px-4 py-3 text-small font-medium text-paper no-underline focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        <Masthead />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
