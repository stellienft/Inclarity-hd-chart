import { TONE_WIDTH_DEG, TONES_PER_COLOR } from "../constants/gates";
import type { PlanetaryActivationSet } from "../types/activation";

/**
 * The four Variable arrows drawn either side of the head of the BodyGraph.
 *
 * Sources and the reasoning behind each rule are in
 * docs/HUMAN_DESIGN_CALCULATION.md §10. In short:
 *
 *   position      name            driven by
 *   ------------  --------------  -------------------------
 *   top-left      Determination   Design Sun / Earth
 *   bottom-left   Environment     Design Nodes
 *   top-right     Motivation      Personality Sun / Earth
 *   bottom-right  Perspective     Personality Nodes
 *
 * The left pair is Design, the right pair Personality — the same convention
 * as the activation columns. COLOUR names the variable (it is the number
 * printed large); TONE points the arrow: tones 1-3 left, tones 4-6 right.
 *
 * "Sun / Earth" and "Nodes" are written as pairs in the literature because
 * the members of each pair always agree. They sit exactly 180 degrees apart,
 * and 180 / 5.625 = 32 gates exactly, so a body and its opposite land on the
 * identical fraction of their own gates and therefore share line, colour,
 * tone and base. Which member is read is arithmetically irrelevant; this
 * module reads the Sun and the North Node, and a test asserts the pairs agree
 * so a future ephemeris change cannot quietly break the assumption.
 */

export type ArrowDirection = "left" | "right";

export const VARIABLE_POSITIONS = [
  "determination",
  "environment",
  "motivation",
  "perspective",
] as const;

export type VariablePosition = (typeof VARIABLE_POSITIONS)[number];

export interface VariableArrow {
  position: VariablePosition;
  /** Which side of the head it is drawn on. */
  side: "design" | "personality";
  /** Human-readable name, e.g. "Determination". */
  label: string;
  /** 1-6. The number printed large next to the arrow. */
  color: number;
  /** 1-6. Printed small, and the reason the arrow points where it does. */
  tone: number;
  direction: ArrowDirection;
  /**
   * True when the driving longitude sits close enough to a Tone boundary that
   * a small birth-time error would flip the arrow.
   */
  nearToneBoundary: boolean;
  /** Distance to the nearest Tone edge, in degrees of longitude. */
  toneMarginDeg: number;
}

export interface Variable {
  arrows: Record<VariablePosition, VariableArrow>;
  /** "PLL DRR" style shorthand, Design pair then Personality pair. */
  notation: string;
}

const LABELS: Record<VariablePosition, string> = {
  determination: "Determination",
  environment: "Environment",
  motivation: "Motivation",
  perspective: "Perspective",
};

/**
 * Tones 1-3 point the arrow left, 4-6 point it right.
 *
 * Written as a comparison against the halfway mark rather than a literal
 * list so it stays correct if TONES_PER_COLOR is ever wrong somewhere else —
 * it would then be wrong in one place, not two.
 */
export function toneToDirection(tone: number): ArrowDirection {
  return tone <= TONES_PER_COLOR / 2 ? "left" : "right";
}

/**
 * How close to a Tone edge counts as "could go either way".
 *
 * 4% of a Tone is about 90 seconds of the Sun's motion. Inside that, a birth
 * time recorded to the nearest minute — or a birth certificate rounded to the
 * nearest five — cannot settle the arrow, and saying so is more useful than
 * printing a direction that looks decided.
 */
const TONE_EDGE_FRACTION = 0.04;

export function calculateVariable(
  personality: PlanetaryActivationSet,
  design: PlanetaryActivationSet,
): Variable {
  const build = (
    position: VariablePosition,
    side: "design" | "personality",
    source: { color: number; tone: number; tonePhase: number },
  ): VariableArrow => {
    // Distance to whichever edge of the Tone is nearer, as a fraction.
    const margin = Math.min(source.tonePhase, 1 - source.tonePhase);

    return {
      position,
      side,
      label: LABELS[position],
      color: source.color,
      tone: source.tone,
      direction: toneToDirection(source.tone),
      nearToneBoundary: margin < TONE_EDGE_FRACTION,
      toneMarginDeg: margin * TONE_WIDTH_DEG,
    };
  };

  const arrows: Record<VariablePosition, VariableArrow> = {
    determination: build("determination", "design", design.sun),
    environment: build("environment", "design", design.northNode),
    motivation: build("motivation", "personality", personality.sun),
    perspective: build("perspective", "personality", personality.northNode),
  };

  const initial = (arrow: VariableArrow) => (arrow.direction === "left" ? "L" : "R");
  const notation =
    `${initial(arrows.determination)}${initial(arrows.environment)}` +
    ` ${initial(arrows.motivation)}${initial(arrows.perspective)}`;

  return { arrows, notation };
}

/**
 * Warnings for any arrow whose Tone is a rounding error from flipping.
 *
 * Returned rather than logged so the chart can show them next to everything
 * else the reader should know: an arrow that could point the other way is
 * exactly the kind of thing that must not be presented as settled.
 */
export function variableWarnings(variable: Variable): string[] {
  return VARIABLE_POSITIONS.filter((position) => variable.arrows[position].nearToneBoundary).map(
    (position) => {
      const arrow = variable.arrows[position];
      return (
        `The ${arrow.label} arrow sits very close to the edge of its Tone, so a birth time ` +
        `out by even a minute or two could point it the other way. Treat this arrow as ` +
        `provisional unless the birth time is exact.`
      );
    },
  );
}
