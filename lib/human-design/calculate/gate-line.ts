import {
  BASES_PER_TONE,
  COLOR_WIDTH_DEG,
  COLORS_PER_LINE,
  GATE_WHEEL_ORIGIN_DEG,
  GATE_WHEEL_SEQUENCE,
  GATE_WIDTH_DEG,
  GATES_IN_WHEEL,
  LINE_WIDTH_DEG,
  LINES_PER_GATE,
  TONE_WIDTH_DEG,
  TONES_PER_COLOR,
} from "../constants/gates";
import type { Activation } from "../types/activation";
import { normalise360 } from "./angles";

/**
 * Subdivide a span into `count` equal parts and return the 1-based index.
 *
 * The clamp is not defensive noise: `withinSpan / width` can land exactly on
 * `count` through floating-point error when a longitude sits a hair under the
 * top of its parent, and an off-the-end index would surface as a Tone 7.
 */
function subdivision(withinSpan: number, width: number, count: number): number {
  const index = Math.floor(withinSpan / width);
  return (index >= count ? count - 1 : index < 0 ? 0 : index) + 1;
}

/**
 * Map an ecliptic longitude onto the Rave Mandala.
 *
 * BOUNDARY CONVENTION: half-open [start, end). A longitude falling exactly on
 * a gate, line, colour, tone or base boundary belongs to the one that BEGINS
 * there. This is enforced by using floor() on a non-negative normalised
 * offset, so it holds across the 360 -> 0 wrap as well.
 *
 * Colour, Tone and Base are the substructure beneath the line. They are far
 * more sensitive to birth-time precision than the gate and line are — a Tone
 * is about 38 minutes of the Sun's motion — so callers that act on them
 * (the Variable arrows) are expected to check how close the position sits to
 * the next boundary. See docs/HUMAN_DESIGN_CALCULATION.md §10.
 */
export function longitudeToActivation(longitude: number): Activation {
  const normalised = normalise360(longitude);

  // Offset from the wheel's origin, in degrees, always in [0, 360).
  const offset = normalise360(normalised - GATE_WHEEL_ORIGIN_DEG);

  const wheelIndex = Math.floor(offset / GATE_WIDTH_DEG);
  // Guard against floor() returning 64 through floating-point error when the
  // offset is a hair under 360.
  const safeIndex = wheelIndex >= GATES_IN_WHEEL ? GATES_IN_WHEEL - 1 : wheelIndex;

  const gate = GATE_WHEEL_SEQUENCE[safeIndex];
  if (gate === undefined) {
    throw new Error(`Gate wheel index out of range: ${safeIndex} (longitude ${longitude})`);
  }

  const withinGate = offset - safeIndex * GATE_WIDTH_DEG;
  const line = subdivision(withinGate, LINE_WIDTH_DEG, LINES_PER_GATE);

  const withinLine = withinGate - (line - 1) * LINE_WIDTH_DEG;
  const color = subdivision(withinLine, COLOR_WIDTH_DEG, COLORS_PER_LINE);

  const withinColor = withinLine - (color - 1) * COLOR_WIDTH_DEG;
  const tone = subdivision(withinColor, TONE_WIDTH_DEG, TONES_PER_COLOR);

  const withinTone = withinColor - (tone - 1) * TONE_WIDTH_DEG;
  const base = subdivision(withinTone, TONE_WIDTH_DEG / BASES_PER_TONE, BASES_PER_TONE);

  return {
    longitude: normalised,
    gate,
    line,
    lineDecimal: withinGate / LINE_WIDTH_DEG + 1,
    color,
    tone,
    base,
    /** How far through the current Tone this longitude sits, 0 to 1. */
    tonePhase: withinTone / TONE_WIDTH_DEG,
  };
}

/** "37.6" — the conventional way an activation is written. */
export function formatGateLine(activation: { gate: number; line: number }): string {
  return `${activation.gate}.${activation.line}`;
}
