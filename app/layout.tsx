import type { Metadata } from "next";

import { siteConfig } from "@/lib/config/site";

import "./globals.css";

export const metadata: Metadata = {
  title: `${siteConfig.brand} ${siteConfig.product}`,
  description:
    "Enter your birth details to generate your Human Design BodyGraph and explore the " +
    "mechanics that shape your design.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are loaded from Google Fonts with a system fallback stack
          declared in globals.css, so the page remains fully legible if the
          request is blocked or slow.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
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
