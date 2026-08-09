/**
 * BodyGraph palette — Inclarity brand.
 *
 * Taken from the Inclarity-branded chart artwork: pale sage for defined
 * centres against warm off-white, warm browns for the activations, and a
 * near-black marker for gates.
 *
 * This deliberately does NOT use the canonical Human Design colour scheme
 * (yellow Head, green Ajna, red Sacral and so on).
 *
 * PERSONALITY / DESIGN: the brand artwork distinguishes the two imprints with
 * two weights of the same warm brown rather than the traditional black/red.
 * That distinction is required (a trained reader relies on it), so the two
 * tones are used consistently for channels, gate markers and the planetary
 * columns alike. Colour is never the only signal: every centre, gate and
 * channel carries a <title> stating its state in words, and
 * `ChartTextSummary` repeats all of it as prose.
 */

export const PALETTE = {
  plum: "#7A5F60",
  dustyPink: "#B18F90",
  darkGrey: "#443E3D",
  brown: "#A27E6B",
  offGrey: "#EAE7E1",
  warmWhite: "#FBFAF8",
  sage: "#C9DDD7",
  ink: "#2B2724",
} as const;

/** Personality / conscious — the darker of the two brand browns. */
export const PERSONALITY_COLOR = "#4A403A";
/**
 * Design / unconscious — the lighter of the two brand browns.
 *
 * Darkened from the artwork's tan until white numerals clear 4.5:1 against it
 * (measured ~4.8:1). The lighter tone reached only 3.85:1, which fails on the
 * filled column chips where the text sits directly on it.
 */
export const DESIGN_COLOR = "#8F6A4E";

/** Defined centres share one pale sage fill, as in the brand artwork. */
export const CENTER_DEFINED_FILL = "#C9DDD7";
export const CENTER_DEFINED_STROKE = "#A6C7BF";
export const CENTER_UNDEFINED_FILL = "#F7F5F2";
export const CENTER_STROKE = "#DCD7D0";

/**
 * Inactive channels are drawn as white "tracks" with a faint edge, so they
 * read both against the pale silhouette and against the page behind it.
 */
export const CHANNEL_TRACK_FILL = "#FFFFFF";
export const CHANNEL_TRACK_EDGE = "#E4DFD8";

export const BODY_SILHOUETTE_FILL = "#EEEBE6";
/**
 * The arms, a shade darker than the robe.
 *
 * Kept very close to the body fill on purpose: the figure sits behind the
 * whole chart, so anything with real contrast here competes with the gates.
 */
export const BODY_ARMS_FILL = "#E5E1D9";

/** Gate numerals on a defined (sage) centre. */
export const ON_DEFINED_TEXT = "#2B3A36";
/** Gate numerals on the pale ground of an undefined centre. */
export const ON_UNDEFINED_TEXT = "#6B615B";
/** Numerals inside an activated gate marker. */
export const GATE_MARKER_TEXT = "#FFFFFF";

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
