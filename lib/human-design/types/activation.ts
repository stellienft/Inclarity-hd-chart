/**
 * The thirteen celestial bodies activated in a Human Design chart.
 *
 * Order matters: this is the conventional top-to-bottom order of the
 * planetary activation columns either side of the BodyGraph.
 */
export const PLANET_IDS = [
  "sun",
  "earth",
  "northNode",
  "southNode",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

export type PlanetId = (typeof PLANET_IDS)[number];

export const PLANET_LABELS: Record<PlanetId, string> = {
  sun: "Sun",
  earth: "Earth",
  northNode: "North Node",
  southNode: "South Node",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
};

/** Astronomical glyphs, used only for display. */
export const PLANET_GLYPHS: Record<PlanetId, string> = {
  sun: "☉",
  earth: "⊕",
  northNode: "☊",
  southNode: "☋",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
};

/** Which of the two calculation moments an activation belongs to. */
export type Side = "personality" | "design";

/**
 * A single celestial body mapped onto the Rave Mandala.
 *
 * `color`, `tone` and `base` are the substructure beneath the line. They are
 * calculated for every body, but only the Sun/Earth and Node pairs are shown,
 * as the four Variable arrows — see docs/HUMAN_DESIGN_CALCULATION.md §10.
 */
export interface Activation {
  /** Geocentric apparent ecliptic longitude, degrees, true equinox of date. */
  longitude: number;
  gate: number;
  /** 1-6 */
  line: number;
  /** Fractional position within the gate, expressed in lines. e.g. 3.42 */
  lineDecimal: number;
  /** 1-6, a sixth of a line. */
  color: number;
  /** 1-6, a sixth of a colour. Sets the direction of a Variable arrow. */
  tone: number;
  /** 1-5 — the one level of the substructure that is fives, not sixes. */
  base: number;
  /**
   * How far through the current Tone the longitude sits, 0 to 1.
   *
   * Kept so callers can tell a Tone sitting safely mid-band from one a
   * rounding error away from flipping its arrow.
   */
  tonePhase: number;
}

export interface PlanetaryActivation extends Activation {
  planet: PlanetId;
  /** True when the body's apparent motion is retrograde at this moment. */
  retrograde: boolean;
}

export type PlanetaryActivationSet = Record<PlanetId, PlanetaryActivation>;

export interface GateLine {
  gate: number;
  line: number;
}
