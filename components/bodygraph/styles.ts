/**
 * BodyGraph palette — straight from the Inclarity Mini Brand Guide.
 *
 * Every value below is either a brand hex quoted verbatim or one of the three
 * documented shades in app/globals.css. Nothing here is chosen by eye.
 *
 * This deliberately does NOT use the canonical Human Design colour scheme
 * (yellow Head, green Ajna, red Sacral and so on).
 *
 * PERSONALITY / DESIGN: the two imprints are ESPRESSO and OCHRE — the guide's
 * darkest accent against its warm primary, which is the strongest separation
 * the palette offers without leaving it. That distinction is required (a
 * trained reader relies on it), so the two tones carry channels, gate markers
 * and the planetary columns alike. Colour is never the only signal: every
 * centre, gate and channel carries a <title> stating its state in words, and
 * `ChartTextSummary` repeats all of it as prose.
 */

/** The guide's palette, named as the guide names it. */
export const PALETTE = {
  // Primary — use these the most.
  dusk: "#6A5960",
  skylight: "#C7E0DF",
  linen: "#F4F2ED",
  ochre: "#A17D6C",
  pebble: "#ECE7E4",
  // Accent — for contrast and balance.
  roseClay: "#D7B5A9",
  white: "#FFFFFF",
  espresso: "#40393B",
} as const;

/** Personality / conscious — ESPRESSO, the guide's darkest accent. */
export const PERSONALITY_COLOR = PALETTE.espresso;
/**
 * Design / unconscious — OCHRE, darkened 6% in lightness at the same hue and
 * saturation.
 *
 * White numerals sit directly on this fill, in the gate markers and in the
 * planetary chips. On OCHRE itself they measure 3.71:1, short of the 4.5:1
 * small text needs; this shade measures 4.62:1. See app/globals.css.
 */
export const DESIGN_COLOR = "#916D5D";

/** Defined centres take SKYLIGHT, a primary brand colour. */
export const CENTER_DEFINED_FILL = PALETTE.skylight;
export const CENTER_DEFINED_STROKE = "#A0CAC8";
/** Undefined centres take LINEN, the page's own ground. */
export const CENTER_UNDEFINED_FILL = PALETTE.linen;
export const CENTER_STROKE = "#DBD2CC";

/**
 * Inactive channels are drawn as WHITE "tracks" with a PEBBLE edge, so they
 * read both against the pale figure and against the page behind it.
 */
export const CHANNEL_TRACK_FILL = PALETTE.white;
export const CHANNEL_TRACK_EDGE = PALETTE.pebble;

export const BODY_SILHOUETTE_FILL = PALETTE.pebble;

/** Gate numerals on a defined (skylight) centre — ESPRESSO, 8.1:1. */
export const ON_DEFINED_TEXT = PALETTE.espresso;
/** Gate numerals on the linen ground of an undefined centre — DUSK, 5.9:1. */
export const ON_UNDEFINED_TEXT = PALETTE.dusk;
/** Numerals inside an activated gate marker. */
export const GATE_MARKER_TEXT = PALETTE.white;

/**
 * Weights for the numerals drawn inside the chart.
 *
 * The brand sets body copy in Extra Light, but these are 10px labels reversed
 * out of a 19px disc: at 200 the strokes disappear. 500 is the legibility
 * floor for reversed micro-type and is used only here, never in running text.
 */
export const GATE_NUMERAL_WEIGHT = { active: 500, inactive: 400 } as const;

export const STROKE_WIDTH = {
  centre: 1.25,
  channelTrack: 7,
  channelTrackEdge: 9,
  channelActive: 7,
} as const;

export const GATE_MARKER_RADIUS = 9.5;
/** A white ring separates a marker from whatever centre fill sits behind it. */
export const GATE_MARKER_RING = "#FFFFFF";
export const GATE_MARKER_RING_WIDTH = 1.5;

export type ActivationStyle = "none" | "personality" | "design" | "both";

export function activationColor(style: ActivationStyle): string {
  switch (style) {
    case "personality":
      return PERSONALITY_COLOR;
    case "design":
      return DESIGN_COLOR;
    case "both":
      // Rendered as two halves; this is the single-colour fallback.
      return PERSONALITY_COLOR;
    default:
      return CHANNEL_TRACK_FILL;
  }
}

export function describeActivation(style: ActivationStyle): string {
  switch (style) {
    case "personality":
      return "Personality (conscious)";
    case "design":
      return "Design (unconscious)";
    case "both":
      return "Personality and Design";
    default:
      return "not activated";
  }
}
