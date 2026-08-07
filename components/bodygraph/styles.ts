/**
 * BodyGraph palette.
 *
 * Warm terracotta for defined centres against a pale cream ground, with near
 * black and terracotta carrying the Personality/Design distinction.
 *
 * This deliberately does NOT use the canonical Human Design colour scheme
 * (yellow Head, green Ajna, red Sacral and so on). The reference style we are
 * matching does not either, which is fortunate: terracotta and cream sit
 * naturally beside the Inclarity brown (#A27E6B) and off grey (#EAE7E1), so the
 * chart reads as part of the brand rather than as an imported asset.
 *
 * Colour is never the only signal. Every centre, gate and channel carries a
 * <title> stating its state in words, and `ChartTextSummary` repeats all of it
 * as prose.
 */

export const PALETTE = {
  plum: "#7A5F60",
  dustyPink: "#B18F90",
  darkGrey: "#443E3D",
  brown: "#A27E6B",
  offGrey: "#EAE7E1",
  warmWhite: "#FBFAF8",
  ink: "#1F1B1A",
} as const;

/** Personality / conscious. */
export const PERSONALITY_COLOR = "#221E1D";
/** Design / unconscious. */
/**
 * Design markers sit ON terracotta centres, so this is darkened until white
 * numerals clear 4.5:1 against it (measured ~5.0:1). A lighter, prettier tan
 * failed that test by blending into CENTER_DEFINED_FILL.
 */
export const DESIGN_COLOR = "#A2622F";

/** Every defined centre shares one warm fill, as in the reference. */
export const CENTER_DEFINED_FILL = "#E2AE85";
export const CENTER_UNDEFINED_FILL = "#FCF6F2";
export const CENTER_STROKE = "#E3D9D1";
export const CENTER_DEFINED_STROKE = "#CE955F";

export const CHANNEL_INACTIVE = "#E0D7CF";
export const BODY_SILHOUETTE_FILL = "#F1F1EB";

/** Text that sits on top of a defined (terracotta) centre. */
export const ON_DEFINED_TEXT = "#2B2320";
/** Text on the pale ground of an undefined centre. */
export const ON_UNDEFINED_TEXT = "#6E625C";
/** Numerals inside an activated gate marker. */
export const GATE_MARKER_TEXT = "#FFFFFF";

export const STROKE_WIDTH = {
  centre: 1.25,
  channelInactive: 2.5,
  channelActive: 6,
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
      return CHANNEL_INACTIVE;
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
