import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CENTER_DEFINED_FILL,
  CENTER_UNDEFINED_FILL,
  CHANNEL_TRACK_EDGE,
  CHANNEL_TRACK_FILL,
  DESIGN_COLOR,
  ON_DEFINED_TEXT,
  ON_UNDEFINED_TEXT,
  PALETTE,
  PERSONALITY_COLOR,
  GATE_MARKER_TEXT,
} from "./styles";

/**
 * The Inclarity Mini Brand Guide (Indeko Creative, April 2026), transcribed.
 *
 * These are the only colours the product may use. The test exists because a
 * palette drifts one convenient hex at a time, and nobody notices until it no
 * longer matches the printed collateral.
 */
const GUIDE = {
  primary: {
    DUSK: "#6A5960",
    SKYLIGHT: "#C7E0DF",
    LINEN: "#F4F2ED",
    OCHRE: "#A17D6C",
    PEBBLE: "#ECE7E4",
  },
  accent: {
    "ROSE CLAY": "#D7B5A9",
    WHITE: "#FFFFFF",
    ESPRESSO: "#40393B",
  },
} as const;

/**
 * The three shades allowed beyond the guide.
 *
 * Each keeps its parent's hue and saturation and only drops lightness, and
 * each earns its place for a reason recorded in app/globals.css. Anything else
 * appearing in the theme is a mistake.
 */
const DERIVED = {
  "ochre-deep": "#916D5D",
  "skylight-edge": "#A0CAC8",
  "pebble-edge": "#DBD2CC",
} as const;

/** Every source file that can carry a colour utility. */
function globSync(dir = process.cwd(), found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) globSync(full, found);
    else if (/\.(tsx?|css)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) found.push(full);
  }
  return found;
}

const relativeLuminance = (hex: string): number => {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

describe("brand palette", () => {
  const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

  it("declares every brand colour, at the guide's exact hex", () => {
    const all = { ...GUIDE.primary, ...GUIDE.accent };
    for (const [name, hex] of Object.entries(all)) {
      if (name === "WHITE") continue; // used literally, not as a token
      const token = `--color-${name.toLowerCase().replace(" ", "")}`;
      expect(css.toLowerCase(), `${name} missing from the theme`).toContain(
        `${token}: ${hex.toLowerCase()}`,
      );
    }
  });

  it("adds no colour to the theme beyond the guide and the three derived shades", () => {
    const declared = [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => ({
      token: m[1]!,
      hex: m[2]!.toUpperCase(),
    }));

    const allowed = new Set(
      [...Object.values(GUIDE.primary), ...Object.values(GUIDE.accent), ...Object.values(DERIVED)].map(
        (h) => h.toUpperCase(),
      ),
    );

    const strays = declared.filter((d) => !allowed.has(d.hex));
    expect(strays.map((d) => `--color-${d.token}: ${d.hex}`)).toEqual([]);
  });

  it("keeps the BodyGraph on the same palette", () => {
    expect(PALETTE.dusk).toBe(GUIDE.primary.DUSK);
    expect(PALETTE.skylight).toBe(GUIDE.primary.SKYLIGHT);
    expect(PALETTE.linen).toBe(GUIDE.primary.LINEN);
    expect(PALETTE.ochre).toBe(GUIDE.primary.OCHRE);
    expect(PALETTE.pebble).toBe(GUIDE.primary.PEBBLE);
    expect(PALETTE.roseClay).toBe(GUIDE.accent["ROSE CLAY"]);
    expect(PALETTE.white).toBe(GUIDE.accent.WHITE);
    expect(PALETTE.espresso).toBe(GUIDE.accent.ESPRESSO);

    expect(PERSONALITY_COLOR).toBe(GUIDE.accent.ESPRESSO);
    expect(DESIGN_COLOR).toBe(DERIVED["ochre-deep"]);
    expect(CENTER_DEFINED_FILL).toBe(GUIDE.primary.SKYLIGHT);
    expect(CENTER_UNDEFINED_FILL).toBe(GUIDE.primary.LINEN);
    expect(CHANNEL_TRACK_FILL).toBe(GUIDE.accent.WHITE);
    expect(CHANNEL_TRACK_EDGE).toBe(GUIDE.primary.DUSK);
  });

  /**
   * The one place the palette is bent, and the measurement that justifies it.
   *
   * OCHRE straight from the guide cannot carry white numerals: it lands at
   * 3.71:1. If this test ever reports OCHRE passing, the assumption behind
   * `ochre-deep` has changed and the shade should go.
   */
  it("bends OCHRE only as far as white numerals require", () => {
    expect(contrast(GUIDE.accent.WHITE, GUIDE.primary.OCHRE)).toBeLessThan(4.5);
    expect(contrast(GUIDE.accent.WHITE, DESIGN_COLOR)).toBeGreaterThanOrEqual(4.5);

    // And no further: the shade must stay recognisably OCHRE.
    expect(contrast(DESIGN_COLOR, GUIDE.primary.OCHRE)).toBeLessThan(1.35);
  });

  it("passes WCAG AA everywhere text sits on a brand colour", () => {
    const pairs: Array<[string, string, string]> = [
      ["gate numeral on a Personality marker", GATE_MARKER_TEXT, PERSONALITY_COLOR],
      ["gate numeral on a Design marker", GATE_MARKER_TEXT, DESIGN_COLOR],
      ["gate numeral on a defined centre", ON_DEFINED_TEXT, CENTER_DEFINED_FILL],
      ["gate numeral on an undefined centre", ON_UNDEFINED_TEXT, CENTER_UNDEFINED_FILL],
      ["body text on the page", GUIDE.accent.ESPRESSO, GUIDE.primary.LINEN],
      ["secondary text on the page", GUIDE.primary.DUSK, GUIDE.primary.LINEN],
      ["button label on DUSK", GUIDE.accent.WHITE, GUIDE.primary.DUSK],
    ];

    for (const [what, fg, bg] of pairs) {
      expect(contrast(fg, bg), `${what} (${fg} on ${bg})`).toBeGreaterThanOrEqual(4.5);
    }
  });

  /**
   * OCHRE and ROSE CLAY are real brand colours that simply cannot carry small
   * text on LINEN. Asserted so nobody reaches for them as a text colour and
   * quietly ships 3.3:1.
   */
  it("records which brand colours are not usable as body text", () => {
    expect(contrast(GUIDE.primary.OCHRE, GUIDE.primary.LINEN)).toBeLessThan(4.5);
    expect(contrast(GUIDE.accent["ROSE CLAY"], GUIDE.primary.LINEN)).toBeLessThan(4.5);
  });
});

describe("brand typography", () => {
  const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
  const layout = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");

  it("uses Bricolage Grotesque for both display and body, and nothing else", () => {
    // Read the declarations, not the whole file — prose about the change would
    // otherwise satisfy or break this by accident.
    const families = [...css.matchAll(/--font-[a-z]+:\s*([^;]+);/g)].map((m) =>
      m[1]!.replace(/\s+/g, " ").trim(),
    );
    expect(families.length).toBeGreaterThanOrEqual(2);
    for (const stack of families) {
      expect(stack, "font stack").toContain("Bricolage Grotesque");
      expect(stack, "font stack still names Inter").not.toContain("Inter");
    }

    // Same again for the loader: check the imports, not the prose around them.
    const imports = layout
      .split("\n")
      .filter((line) => line.startsWith("import "))
      .join("\n");
    expect(imports).toContain("Bricolage_Grotesque");
    expect(imports, "layout still imports Inter").not.toMatch(/\bInter\b/);
  });

  it("sets the guide's weights: Extra Light body, Light display", () => {
    const body = css.slice(css.indexOf("body {"), css.indexOf("}", css.indexOf("body {")));
    expect(body).toContain("font-weight: 200");

    const headings = css.slice(css.indexOf("h1,"), css.indexOf("}", css.indexOf("h1,")));
    expect(headings).toContain("font-weight: 300");
  });

  it("sets the guide's tracking: -10 on display, +50 on navigation", () => {
    const headings = css.slice(css.indexOf("h1,"), css.indexOf("}", css.indexOf("h1,")));
    // Canva tracking is thousandths of an em.
    expect(headings).toContain("letter-spacing: -0.01em");
    expect(headings).toContain("line-height: 1.1");

    const nav = css.slice(css.indexOf(".brand-nav {"), css.indexOf("}", css.indexOf(".brand-nav {")));
    expect(nav).toContain("letter-spacing: 0.05em");
    expect(nav).toContain("text-transform: uppercase");
  });
});

/**
 * A guard against the failure mode that actually bit: a second copy.
 *
 * Two stale duplicates of the styling were live when the brand guide arrived —
 * `demo/_tw.css` held its own @theme block, and `demo/main.tsx` its own copy
 * of the form markup. Both were internally consistent and both were wrong, so
 * nothing failed; the shared preview simply stopped matching the app. This
 * sweeps every source file for colour utilities that are not on the palette.
 */
describe("no stale palette anywhere in the source", () => {
  const RETIRED = ["plum", "dusty", "ink", "brown", "offgrey", "warmwhite", "parchment", "sage", "design"];
  const PREFIXES = ["text", "bg", "border", "fill", "stroke", "ring", "divide", "from", "to", "via"];

  const sources = globSync();

  it("finds source files to check", () => {
    expect(sources.length).toBeGreaterThan(15);
  });

  it("uses no retired colour token", () => {
    const offenders: string[] = [];
    for (const file of sources) {
      const text = readFileSync(file, "utf8");
      for (const name of RETIRED) {
        for (const prefix of PREFIXES) {
          const pattern = new RegExp(`(?<![\\w-])${prefix}-${name}(?![\\w-])`, "g");
          if (pattern.test(text)) offenders.push(`${file}: ${prefix}-${name}`);
        }
      }
    }
    expect([...new Set(offenders)]).toEqual([]);
  });

  it("declares the theme in exactly one place", () => {
    const withTheme = sources.filter(
      (f) => f.endsWith(".css") && /@theme\s*\{/.test(readFileSync(f, "utf8")),
    );
    expect(withTheme).toEqual([expect.stringContaining("globals.css")]);
  });
});
