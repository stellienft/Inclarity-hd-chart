import type { GateLine, PlanetaryActivationSet } from "../types/activation";

export type CrossAngle = "Right Angle" | "Juxtaposition" | "Left Angle";

export interface IncarnationCross {
  personalitySun: GateLine;
  personalityEarth: GateLine;
  designSun: GateLine;
  designEarth: GateLine;
  /**
   * The cross's angle, which IS structurally derivable from the profile.
   * Right Angle = personal destiny profiles, Juxtaposition = the single fixed
   * 4/1, Left Angle = transpersonal profiles.
   */
  angle: CrossAngle;
  /** "(41/31 | 44/24)" — the conventional gate notation. */
  notation: string;
  /**
   * Verified name, e.g. "Right Angle Cross of the Sphinx".
   *
   * Deliberately absent in v1. The complete 192-cross naming table has not yet
   * been sourced in a form we can verify and use lawfully, and inventing names
   * from a loose lookup would be worse than omitting them. See
   * `lib/human-design/constants/incarnation-cross-names.ts` for the drop-in
   * point once a verified table exists.
   */
  name?: string;
}

/**
 * Angle is a direct function of profile:
 *
 *   4/1                              -> Juxtaposition
 *   1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6 -> Right Angle
 *   5/1, 5/2, 6/2, 6/3               -> Left Angle
 *
 * Expressed as a rule rather than a table: profiles whose personality line is
 * 5 or 6 are Left Angle (transpersonal), 4/1 is the sole Juxtaposition, and
 * everything else is Right Angle.
 */
export function deriveCrossAngle(personalitySunLine: number, designSunLine: number): CrossAngle {
  if (personalitySunLine === 4 && designSunLine === 1) return "Juxtaposition";
  if (personalitySunLine === 5 || personalitySunLine === 6) return "Left Angle";
  return "Right Angle";
}

export function deriveIncarnationCross(
  personality: PlanetaryActivationSet,
  design: PlanetaryActivationSet,
): IncarnationCross {
  const toGateLine = (a: { gate: number; line: number }): GateLine => ({
    gate: a.gate,
    line: a.line,
  });

  const personalitySun = toGateLine(personality.sun);
  const personalityEarth = toGateLine(personality.earth);
  const designSun = toGateLine(design.sun);
  const designEarth = toGateLine(design.earth);

  return {
    personalitySun,
    personalityEarth,
    designSun,
    designEarth,
    angle: deriveCrossAngle(personality.sun.line, design.sun.line),
    notation:
      `(${personalitySun.gate}/${personalityEarth.gate} | ` +
      `${designSun.gate}/${designEarth.gate})`,
  };
}
