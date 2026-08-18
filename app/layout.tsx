import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";

import { siteConfig } from "@/lib/config/site";

import "./globals.css";

/**
 * ONE typeface, as the brand guide specifies: Bricolage Grotesque, Light for
 * display and Extra Light for body. Inter has been removed — it was never a
 * brand font.
 *
 * Loaded as the VARIABLE font (no `weight` array), so a single file covers the
 * whole 200-800 axis and both brand weights arrive in one request.
 *
 * Self-hosted via `next/font`, which downloads and serves it from our own
 * origin at build time. That removes the third-party request to Google Fonts
 * entirely — better for privacy — and avoids the flash of unstyled text a
 * blocking <link> would cause. A system fallback stack keeps the page legible
 * if it fails to load.
 */
const brand = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-brand-loaded",
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
    <html lang="en" className={brand.variable}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 brand-nav focus:bg-dusk focus:px-4 focus:py-2 focus:text-linen"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
