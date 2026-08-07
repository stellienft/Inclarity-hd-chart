/**
 * The nine BodyGraph centres.
 *
 * These identifiers are used throughout the engine and must never be
 * confused with presentation labels — see `CENTER_LABELS` for display text.
 */
export const CENTER_IDS = [
  "head",
  "ajna",
  "throat",
  "g",
  "heart",
  "sacral",
  "spleen",
  "solarPlexus",
  "root",
] as const;

export type CenterId = (typeof CENTER_IDS)[number];

export const CENTER_LABELS: Record<CenterId, string> = {
  head: "Head",
  ajna: "Ajna",
  throat: "Throat",
  g: "G / Identity",
  heart: "Heart / Ego",
  sacral: "Sacral",
  spleen: "Spleen",
  solarPlexus: "Solar Plexus",
  root: "Root",
};

/**
 * The four motor centres.
 *
 * Motors are the centres that generate energy for action. Type derivation
 * depends on whether a motor reaches the Throat through defined channels.
 */
export const MOTOR_CENTERS: readonly CenterId[] = [
  "sacral",
  "heart",
  "solarPlexus",
  "root",
] as const;

export function isMotorCenter(center: CenterId): boolean {
  return MOTOR_CENTERS.includes(center);
}

/** Centres that can act as an inner authority, in hierarchy order. */
export const AWARENESS_CENTERS: readonly CenterId[] = ["spleen", "ajna", "head"] as const;
