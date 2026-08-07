import type { CenterId } from "../types/center";
import type { GateDefinition } from "../types/channel";

/**
 * ============================================================================
 *  THE RAVE MANDALA — the single source of truth for longitude -> gate mapping
 * ============================================================================
 *
 * Every magic number relating ecliptic longitude to gates and lines lives in
 * this file. Nothing else in the codebase may hard-code a longitude.
 *
 * CONVENTION (verified — see docs/HUMAN_DESIGN_CALCULATION.md §6):
 *
 *   - Zodiac:     tropical, geocentric, apparent, true equinox of date.
 *   - Origin:     Gate 41 begins at exactly 302.0 degrees of tropical ecliptic
 *                 longitude, i.e. 2°00'00" Aquarius.
 *   - Direction:  gates advance with INCREASING ecliptic longitude, in the
 *                 order given by GATE_WHEEL_SEQUENCE below.
 *   - Gate width: 360 / 64 = 5.625 degrees.
 *   - Line width: 5.625 / 6 = 0.9375 degrees.
 *   - Boundaries: half-open [start, end). A longitude exactly on a boundary
 *                 belongs to the gate/line that STARTS there.
 *
 * HOW THE ORIGIN WAS VERIFIED (five independent checkpoints):
 *
 *   1. Gate 41 spans 2°00'00" - 7°37'30" Aquarius  -> 302.000 - 307.625
 *   2. Gate 19 begins at 7°37'30" Aquarius         -> 307.625  (index 1)
 *   3. Gate 25 spans 28°15'00" Pisces - 3°52'30" Aries -> 358.250 - 363.875
 *                                                     (index 10, wraps 0°)
 *   4. Gate 17 begins at 3°52'30" Aries            -> 363.875 => 3.875 (index 11)
 *   5. Gate 21 begins at 9°30'00" Aries            -> 369.500 => 9.500 (index 12)
 *      Gate 51 begins at 15°07'30" Aries           -> 375.125 => 15.125 (index 13)
 *
 *   Corroborating fact: the "Rave New Year" is the Sun's entry into Gate 41,
 *   observed on ~22 January, which is precisely when the tropical Sun reaches
 *   2° Aquarius.
 *
 *   All five checkpoints satisfy  start(i) = 302.0 + i * 5.625  (mod 360),
 *   which fixes both the origin and the direction of travel.
 */

/** Degrees of ecliptic longitude at which GATE_WHEEL_SEQUENCE[0] begins. */
export const GATE_WHEEL_ORIGIN_DEG = 302.0;

export const GATES_IN_WHEEL = 64;
export const LINES_PER_GATE = 6;
export const GATE_WIDTH_DEG = 360 / GATES_IN_WHEEL; // 5.625
export const LINE_WIDTH_DEG = GATE_WIDTH_DEG / LINES_PER_GATE; // 0.9375

/** Bumped whenever the mapping convention changes, for chart debugging. */
export const GATE_MAPPING_VERSION = "mandala-2025-01:origin-302.0-ascending";

/**
 * Gate order around the wheel, starting at GATE_WHEEL_ORIGIN_DEG and
 * advancing with increasing ecliptic longitude.
 */
export const GATE_WHEEL_SEQUENCE: readonly number[] = [
  41, 19, 13, 49, 30, 55, 37, 63,
  22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35,
  45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5,
  26, 11, 10, 58, 38, 54, 61, 60,
] as const;

/**
 * Gate -> centre, plus the traditional gate name.
 *
 * Gate names are the standard I Ching hexagram names, which are ancient and
 * in the public domain. No proprietary Human Design description text is
 * reproduced anywhere in this codebase.
 */
export const GATE_DEFINITIONS: readonly GateDefinition[] = [
  { gate: 1, center: "g", name: "The Creative" },
  { gate: 2, center: "g", name: "The Receptive" },
  { gate: 3, center: "sacral", name: "Difficulty at the Beginning" },
  { gate: 4, center: "ajna", name: "Youthful Folly" },
  { gate: 5, center: "sacral", name: "Waiting" },
  { gate: 6, center: "solarPlexus", name: "Conflict" },
  { gate: 7, center: "g", name: "The Army" },
  { gate: 8, center: "throat", name: "Holding Together" },
  { gate: 9, center: "sacral", name: "The Taming Power of the Small" },
  { gate: 10, center: "g", name: "Treading" },
  { gate: 11, center: "ajna", name: "Peace" },
  { gate: 12, center: "throat", name: "Standstill" },
  { gate: 13, center: "g", name: "The Fellowship of Man" },
  { gate: 14, center: "sacral", name: "Possession in Great Measure" },
  { gate: 15, center: "g", name: "Modesty" },
  { gate: 16, center: "throat", name: "Enthusiasm" },
  { gate: 17, center: "ajna", name: "Following" },
  { gate: 18, center: "spleen", name: "Work on What Has Been Spoilt" },
  { gate: 19, center: "root", name: "Approach" },
  { gate: 20, center: "throat", name: "Contemplation" },
  { gate: 21, center: "heart", name: "Biting Through" },
  { gate: 22, center: "solarPlexus", name: "Grace" },
  { gate: 23, center: "throat", name: "Splitting Apart" },
  { gate: 24, center: "ajna", name: "Returning" },
  { gate: 25, center: "g", name: "Innocence" },
  { gate: 26, center: "heart", name: "The Taming Power of the Great" },
  { gate: 27, center: "sacral", name: "Nourishment" },
  { gate: 28, center: "spleen", name: "Preponderance of the Great" },
  { gate: 29, center: "sacral", name: "The Abysmal" },
  { gate: 30, center: "solarPlexus", name: "The Clinging Fire" },
  { gate: 31, center: "throat", name: "Influence" },
  { gate: 32, center: "spleen", name: "Duration" },
  { gate: 33, center: "throat", name: "Retreat" },
  { gate: 34, center: "sacral", name: "The Power of the Great" },
  { gate: 35, center: "throat", name: "Progress" },
  { gate: 36, center: "solarPlexus", name: "The Darkening of the Light" },
  { gate: 37, center: "solarPlexus", name: "The Family" },
  { gate: 38, center: "root", name: "Opposition" },
  { gate: 39, center: "root", name: "Obstruction" },
  { gate: 40, center: "heart", name: "Deliverance" },
  { gate: 41, center: "root", name: "Decrease" },
  { gate: 42, center: "sacral", name: "Increase" },
  { gate: 43, center: "ajna", name: "Breakthrough" },
  { gate: 44, center: "spleen", name: "Coming to Meet" },
  { gate: 45, center: "throat", name: "Gathering Together" },
  { gate: 46, center: "g", name: "Pushing Upward" },
  { gate: 47, center: "ajna", name: "Oppression" },
  { gate: 48, center: "spleen", name: "The Well" },
  { gate: 49, center: "solarPlexus", name: "Revolution" },
  { gate: 50, center: "spleen", name: "The Cauldron" },
  { gate: 51, center: "heart", name: "The Arousing" },
  { gate: 52, center: "root", name: "Keeping Still" },
  { gate: 53, center: "root", name: "Development" },
  { gate: 54, center: "root", name: "The Marrying Maiden" },
  { gate: 55, center: "solarPlexus", name: "Abundance" },
  { gate: 56, center: "throat", name: "The Wanderer" },
  { gate: 57, center: "spleen", name: "The Gentle" },
  { gate: 58, center: "root", name: "The Joyous" },
  { gate: 59, center: "sacral", name: "Dispersion" },
  { gate: 60, center: "root", name: "Limitation" },
  { gate: 61, center: "head", name: "Inner Truth" },
  { gate: 62, center: "throat", name: "Preponderance of the Small" },
  { gate: 63, center: "head", name: "After Completion" },
  { gate: 64, center: "head", name: "Before Completion" },
] as const;

const gateIndexByGate = new Map<number, number>();
GATE_WHEEL_SEQUENCE.forEach((gate, index) => gateIndexByGate.set(gate, index));

const definitionByGate = new Map<number, GateDefinition>();
for (const definition of GATE_DEFINITIONS) definitionByGate.set(definition.gate, definition);

export function getGateDefinition(gate: number): GateDefinition {
  const definition = definitionByGate.get(gate);
  if (!definition) throw new Error(`Unknown gate: ${gate}`);
  return definition;
}

export function getGateCenter(gate: number): CenterId {
  return getGateDefinition(gate).center;
}

/** Zero-based position of a gate around the wheel. */
export function getGateWheelIndex(gate: number): number {
  const index = gateIndexByGate.get(gate);
  if (index === undefined) throw new Error(`Unknown gate: ${gate}`);
  return index;
}

/** Ecliptic longitude, in degrees, at which a gate begins. */
export function getGateStartLongitude(gate: number): number {
  const raw = GATE_WHEEL_ORIGIN_DEG + getGateWheelIndex(gate) * GATE_WIDTH_DEG;
  return ((raw % 360) + 360) % 360;
}
