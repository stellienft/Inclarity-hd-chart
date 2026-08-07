/**
 * The astronomy layer's entire contract with the rest of the application.
 *
 * Nothing in here knows what a gate, a channel or a Projector is. Everything
 * below returns geocentric APPARENT ecliptic longitude in degrees, referred to
 * the TRUE equinox and ecliptic OF DATE (the tropical convention used by
 * Human Design). See docs/EPHEMERIS.md.
 */

/** Bodies the ephemeris must be able to place. */
export const EPHEMERIS_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "northNode",
] as const;

export type EphemerisBody = (typeof EPHEMERIS_BODIES)[number];

export interface BodyPosition {
  /** Apparent geocentric ecliptic longitude, degrees in [0, 360). */
  longitude: number;
  /** True when apparent ecliptic longitude is decreasing. */
  retrograde: boolean;
}

export type PlanetaryPositions = Record<EphemerisBody, BodyPosition>;

/**
 * Which lunar node the ephemeris should return.
 *
 * "true" is the osculating node derived from the Moon's instantaneous state
 * vector; "mean" is the smoothed secular node. Human Design software built on
 * Swiss Ephemeris conventionally uses the TRUE node — see
 * docs/HUMAN_DESIGN_CALCULATION.md §5 for the evidence and the caveat.
 */
export type NodeConvention = "true" | "mean";

export interface EphemerisProvider {
  /** Stable identifier recorded in every chart's calculationMeta. */
  readonly id: string;
  readonly nodeConvention: NodeConvention;

  getPositions(timestampUtc: Date): Promise<PlanetaryPositions>;

  /**
   * Apparent geocentric ecliptic longitude of the Sun alone.
   *
   * Separated from getPositions because the Design-moment solver evaluates it
   * many times per chart and does not need the other twelve bodies.
   */
  getSunLongitude(timestampUtc: Date): Promise<number>;
}
