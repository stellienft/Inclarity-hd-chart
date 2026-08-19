/**
 * BodyGraph palette — straight from the Inclarity Mini Brand Guide.
 *
 * Every value below is either a brand hex quoted verbatim or one of the three
 * documented shades in app/globals.css. Nothing here is chosen by eye.
 *
 * This deliberately does NOT use the canonical Human Design colour scheme
 * (yellow Head, green Ajna, red Sacral and so on).
 *
 * PERSONALITY / DESIGN: the two imprints are DUSK and OCHRE — the guide's
 * cool primary against its warm one, which is how the reference chart the
 * client supplied separates them. It is a hue difference rather than a
 * light-dark one, so the two stay legible against each other at the width of a
 * channel. That distinction is required (a trained reader relies on it), so the
 * two tones carry channels, gate markers and the planetary columns alike.
 * Colour is never the only signal: every centre, gate and channel carries a
 * <title> stating its state in words, and `ChartTextSummary` repeats all of it
 * as prose.
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

/**
 * Personality / conscious — DUSK, the guide's cool primary.
 *
 * ESPRESSO was here, and reads as black at channel width; the reference chart
 * uses the plum. White numerals on it measure 6.49:1, so the markers and the
 * planetary chips still clear AA comfortably.
 */
export const PERSONALITY_COLOR = PALETTE.dusk;
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
/**
 * Undefined centres take WHITE.
 *
 * LINEN was here, which is the page's own ground and so made an undefined
 * centre invisible as a shape. The reference chart fills them white, a shade
 * lighter than everything around them, so the outline is not doing all the
 * work.
 */
export const CENTER_UNDEFINED_FILL = PALETTE.white;
export const CENTER_STROKE = "#DBD2CC";

/**
 * Inactive channels are drawn as WHITE "tracks" with a thin outline, so they
 * read both against the pale figure and against the page behind it.
 *
 * The outline is DUSK held back to about half strength rather than a lighter
 * hex, which keeps it on the palette while giving the line enough definition
 * to be followed. In PEBBLE it measured 1.10:1 against the page — the long
 * arcs run in nested families of four or five and simply disappeared into one
 * another.
 */
export const CHANNEL_TRACK_FILL = PALETTE.white;
export const CHANNEL_TRACK_EDGE = PALETTE.dusk;
export const CHANNEL_TRACK_EDGE_OPACITY = 0.5;

/** Gate numerals on a defined (skylight) centre — ESPRESSO, 8.1:1. */
export const ON_DEFINED_TEXT = PALETTE.espresso;
/**
 * Gate numerals on the white ground of an undefined centre — ESPRESSO, 11.2:1.
 *
 * The same colour as on a defined centre, so an inactive numeral reads the
 * same everywhere. It also has to differ from PERSONALITY_COLOR now that the
 * imprint is DUSK, or a plain numeral and an activated marker would be the
 * same ink and only the disc behind it would say which is which.
 */
export const ON_UNDEFINED_TEXT = PALETTE.espresso;
/** Numerals inside an activated gate marker. */
export const GATE_MARKER_TEXT = PALETTE.white;

/**
 * Weights for the numerals drawn inside the chart.
 *
 * The brand sets body copy in Extra Light, but these are 17px numerals
 * reversed out of a 28px disc: at 200 the strokes disappear. 500 is the
 * legibility floor for reversed type and is used only here, never in running
 * text.
 */
export const GATE_NUMERAL_WEIGHT = { active: 500, inactive: 400 } as const;

export const STROKE_WIDTH = {
  centre: 2,
  /*
   * Channels are drawn as outlined tracks rather than fat white tubes: a wider
   * stroke in the edge colour with a narrower white one on top, so what reads
   * is the outline. 14 is the track width measured off the reference artwork,
   * and the 3.5 of edge either side matches the line weight it draws them in.
   */
  channelTrack: 14,
  channelTrackEdge: 17.5,
  channelActive: 14,
} as const;

/** Gate numerals. Sized to sit legibly inside a marker of GATE_MARKER_RADIUS. */
export const GATE_NUMERAL_SIZE = 17;

/**
 * Marker radius, and the reason it is not larger.
 *
 * The binding constraint is the Root's left edge, where 54, 38 and 58 sit 39
 * apart: two markers of radius 14 leave 11 units of daylight between them, and
 * at 16 they touch. It is also just wider than the 14-unit channel tracks the
 * reference artwork draws, so a marker reads as a stop on the line rather than
 * a bulge in it.
 */
export const GATE_MARKER_RADIUS = 14;
/** A white ring separates a marker from whatever centre fill sits behind it. */
export const GATE_MARKER_RING = "#FFFFFF";
export const GATE_MARKER_RING_WIDTH = 2;

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
