/**
 * Builds a single self-contained HTML file containing the whole chart
 * generator — engine, BodyGraph, styles and fonts — with no external requests.
 *
 * Used to share a testable build where a Next.js server isn't available.
 *
 *   npm run build:standalone
 *   -> dist/inclarity-chart.html
 *
 * The page imports the REAL modules, so it exercises the same calculation code
 * as the app. Birth-place search falls back to the offline gazetteer because
 * there is no server to proxy the geocoder through.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");
mkdirSync(out, { recursive: true });

const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: root, stdio: ["ignore", "pipe", "inherit"] });

// 1. Styles — Tailwind over the real globals plus the component sources.
run("npx", [
  "@tailwindcss/cli",
  "-i",
  "demo/_tw.css",
  "-o",
  "dist/demo.css",
  "--minify",
]);

// 2. Script — the real engine and components, bundled for the browser.
run("npx", [
  "esbuild",
  "demo/main.tsx",
  "--bundle",
  "--format=iife",
  "--minify",
  "--target=es2020",
  "--jsx=automatic",
  `--alias:@=${root}`,
  '--define:process.env.NODE_ENV="production"',
  '--define:process.env.NEXT_PUBLIC_INCLARITY_BOOKING_URL="https://inclarity.space"',
  '--define:process.env.ENABLE_CHART_DEBUG="false"',
  '--define:process.env.LOCATION_PROVIDER="static"',
  "--outfile=dist/demo.js",
]);

// 3. Fonts — inlined as data URIs. A <link> to a font CDN is blocked by the
//    host page's content-security policy and would fall back silently.
const fontFace = (family, file, weights) =>
  `@font-face{font-family:'${family}';font-style:normal;font-weight:${weights};` +
  `font-display:swap;src:url(data:font/woff2;base64,` +
  `${readFileSync(join(root, "demo/fonts", file)).toString("base64")}) format('woff2');}`;

const fonts = [
  fontFace("Bricolage Grotesque", "bricolage-grotesque.woff2", "400 700"),
  fontFace("Inter", "inter.woff2", "400 600"),
  ":root{--font-display-loaded:'Bricolage Grotesque';--font-sans-loaded:'Inter';}",
  "html,body{background:#FBFAF8;}",
].join("\n");

const html = [
  "<title>Inclarity Space — Human Design Chart Generator</title>",
  `<style>${fonts}${readFileSync(join(out, "demo.css"), "utf8")}</style>`,
  '<div id="root"></div>',
  `<script>${readFileSync(join(out, "demo.js"), "utf8")}</script>`,
  "",
].join("\n");

const target = join(out, "inclarity-chart.html");
writeFileSync(target, html);
console.log(`${target} — ${(html.length / 1024 / 1024).toFixed(2)} MB`);
