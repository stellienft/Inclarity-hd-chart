import type { PlanetaryActivationSet } from "../types/activation";

export interface ProfileDerivation {
  /** e.g. "5/1" */
  profile: string;
  personalitySunLine: number;
  designSunLine: number;
  /** e.g. "Heretic / Investigator" */
  name: string;
}

/**
 * The six line themes. These are the standard structural names for the lines
 * of a hexagram, used here as labels only.
 */
const LINE_NAMES: Record<number, string> = {
  1: "Investigator",
  2: "Hermit",
  3: "Martyr",
  4: "Opportunist",
  5: "Heretic",
  6: "Role Model",
};

/**
 * Profile is Personality Sun line / Design Sun line, in that order.
 *
 * It is derived purely from the two calculated Sun activations. There is no
 * birth-date lookup table anywhere in this codebase.
 */
export function deriveProfile(
  personality: PlanetaryActivationSet,
  design: PlanetaryActivationSet,
): ProfileDerivation {
  const personalitySunLine = personality.sun.line;
  const designSunLine = design.sun.line;

  return {
    profile: `${personalitySunLine}/${designSunLine}`,
    personalitySunLine,
    designSunLine,
    name: `${LINE_NAMES[personalitySunLine] ?? "?"} / ${LINE_NAMES[designSunLine] ?? "?"}`,
  };
}
