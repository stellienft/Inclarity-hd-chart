import {
  GATE_WHEEL_ORIGIN_DEG,
  GATE_WHEEL_SEQUENCE,
  GATE_WIDTH_DEG,
  GATES_IN_WHEEL,
  LINE_WIDTH_DEG,
  LINES_PER_GATE,
} from "../constants/gates";
import type { Activation } from "../types/activation";
import { normalise360 } from "./angles";

/**
 * Map an ecliptic longitude onto the Rave Mandala.
 *
 * BOUNDARY CONVENTION: half-open [start, end). A longitude falling exactly on
 * a gate or line boundary belongs to the gate/line that BEGINS there. This is
 * enforced by using floor() on a non-negative normalised offset, so it holds
 * across the 360 -> 0 wrap as well.
 *
 * Colour, Tone and Base are deliberately NOT returned. They are a further
 * 6 x 6 x 5 subdivision of each line and are extremely sensitive to ephemeris
 * error; they will only be added once independently verified. See
 * docs/HUMAN_DESIGN_CALCULATION.md §10.
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
  const lineIndex = Math.floor(withinGate / LINE_WIDTH_DEG);
  const safeLineIndex = lineIndex >= LINES_PER_GATE ? LINES_PER_GATE - 1 : lineIndex;

  return {
    longitude: normalised,
    gate,
    line: safeLineIndex + 1,
    lineDecimal: withinGate / LINE_WIDTH_DEG + 1,
  };
}

/** "37.6" — the conventional way an activation is written. */
export function formatGateLine(activation: { gate: number; line: number }): string {
  return `${activation.gate}.${activation.line}`;
}
