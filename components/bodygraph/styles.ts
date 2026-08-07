import type { CenterId } from "@/lib/human-design/types/center";

/**
 * BodyGraph palette.
 *
 * Built from the Inclarity system (plum #7A5F60, dusty pink #B18F90, dark grey
 * #443E3D, brown #A27E6B, off grey #EAE7E1) while keeping the two conventions
 * a trained Human Design reader relies on:
 *
 *   - Personality (conscious) activations read as dark grey/black.
 *   - Design (unconscious) activations read as red — here a muted plum-red
 *     rather than a primary red, so it sits inside the brand.
 *
 * Defined centres are filled with restrained, distinguishable brand tones;
 * undefined centres stay warm white. Colour is never the only signal: every
 * centre and channel also carries a text label via <title>, and the chart is
 * fully described in the accompanying text summary.
 */

export const PALETTE = {
  plum: "#7A5F60",
  dustyPink: "#B18F90",
  darkGrey: "#443E3D",
  brown: "#A27E6B",
  offGrey: "#EAE7E1",
  warmWhite: "#FBFAF8",
  ink: "#2E2A29",
} as const;

/** Personality / conscious. */
export const PERSONALITY_COLOR = PALETTE.darkGrey;
/** Design / unconscious. */
export const DESIGN_COLOR = "#9C4A4A";

export const CHANNEL_INACTIVE = "#DFDAD2";
export const CENTER_UNDEFINED_FILL = PALETTE.warmWhite;
export const CENTER_STROKE = "#8C837E";

/**
 * Fill for each defined centre. Adjacent centres are given enough separation
 * to stay legible when several are defined at once.
 */
export const CENTER_DEFINED_FILL: Record<CenterId, string> = {
  head: "#C9BCB0",
  ajna: "#B9A79C",
  throat: "#A27E6B",
  g: "#B18F90",
  heart: "#8E5F5E",
  sacral: "#C08E7E",
  spleen: "#9E9A8C",
  solarPlexus: "#7A5F60",
  root: "#6F6360",
};

/** Text colour that stays readable on each defined centre fill. */
export const CENTER_DEFINED_TEXT: Record<CenterId, string> = {
  head: PALETTE.ink,
  ajna: PALETTE.ink,
  throat: "#FFFFFF",
  g: PALETTE.ink,
  heart: "#FFFFFF",
  sacral: PALETTE.ink,
  spleen: PALETTE.ink,
  solarPlexus: "#FFFFFF",
  root: "#FFFFFF",
};

export const STROKE_WIDTH = {
  centre: 1.5,
  channelInactive: 3,
  channelActive: 7,
  gateDot: 1,
} as const;

export type ActivationStyle = "none" | "personality" | "design" | "both";

export function activationColor(style: ActivationStyle): string {
  switch (style) {
    case "personality":
      return PERSONALITY_COLOR;
    case "design":
      return DESIGN_COLOR;
    case "both":
      // Rendered as two half-strokes; this is the fallback single colour.
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
