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
 * `color`, `tone` and `base` are the deeper substructure. They are modelled
 * here so the return shape is stable, but they are NOT calculated or
 * displayed in v1 — see docs/HUMAN_DESIGN_CALCULATION.md.
 */
export interface Activation {
  /** Geocentric apparent ecliptic longitude, degrees, true equinox of date. */
  longitude: number;
  gate: number;
  /** 1-6 */
  line: number;
  /** Fractional position within the gate, expressed in lines. e.g. 3.42 */
  lineDecimal: number;
  color?: number;
  tone?: number;
  base?: number;
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
