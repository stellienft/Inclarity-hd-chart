import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";

import { siteConfig } from "@/lib/config/site";

import "./globals.css";

/**
 * Fonts are self-hosted via `next/font`, which downloads and serves them from
 * our own origin at build time. That removes the third-party request to Google
 * Fonts entirely — better for privacy, and it avoids the flash of unstyled text
 * a blocking <link> would cause. Both declare a system fallback stack, so the
 * page stays fully legible if a font fails to load.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-loaded",
  display: "swap",
  fallback: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-loaded",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: `${siteConfig.brand} ${siteConfig.product}`,
  description:
    "Enter your birth details to generate your Human Design BodyGraph and explore the " +
    "mechanics that shape your design.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-plum focus:px-4 focus:py-2 focus:text-warmwhite"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
