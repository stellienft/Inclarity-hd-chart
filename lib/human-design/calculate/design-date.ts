import type { EphemerisProvider } from "../astronomy/types";
import { normalise360, signedAngularDifference } from "./angles";

/**
 * ============================================================================
 *  THE DESIGN MOMENT — 88 degrees of SOLAR ARC before birth
 * ============================================================================
 *
 * The Design imprint is NOT "birth minus 88 days". It is the earlier moment at
 * which the Sun's apparent geocentric tropical longitude was exactly 88
 * degrees less than it was at birth.
 *
 * Because Earth's orbit is elliptical its angular velocity varies (roughly
 * 1.019 deg/day near perihelion in early January, 0.953 deg/day near aphelion
 * in early July), so the elapsed time to cover 88 degrees ranges from about
 * 86.4 to about 92.3 days depending on the time of year. Substituting a fixed
 * 88 days introduces errors of several days, which is many gates.
 *
 * METHOD
 *   1. Read the Sun's longitude at birth.
 *   2. target = normalise360(birthSunLongitude - 88)
 *   3. Bracket the crossing by stepping backwards from birth.
 *   4. Refine with bisection on a continuous, wrap-free error function.
 *
 * THE WRAP PROBLEM
 *   Naively comparing longitudes breaks whenever the 88-degree span crosses
 *   0 degrees Aries (which it does for anyone born between roughly late March
 *   and late June). The fix is to never compare raw longitudes: instead the
 *   error function measures the SIGNED SHORTEST separation between the Sun's
 *   longitude at a candidate time and the target longitude. Over the ~6 day
 *   search window the Sun moves under 7 degrees, so this separation is
 *   unambiguous, continuous and monotonic — and completely wrap-agnostic.
 */

/** The solar arc between the Design and Personality moments. */
export const DESIGN_SOLAR_ARC_DEG = 88;

/** Convergence tolerance on solar longitude, in degrees. */
const DEFAULT_TOLERANCE_DEG = 1e-9;

/** The Sun never moves slower than ~0.953 deg/day, so 88 deg takes <= ~92.4 days. */
const SEARCH_LOWER_DAYS = 84;
const SEARCH_UPPER_DAYS = 95;

const MS_PER_DAY = 86_400_000;

export interface DesignMomentResult {
  designUtc: Date;
  birthSunLongitude: number;
  targetSunLongitude: number;
  /** Sun longitude actually achieved at `designUtc`. */
  designSunLongitude: number;
  /** Achieved arc; should equal DESIGN_SOLAR_ARC_DEG to within tolerance. */
  solarArcDeg: number;
  /** Residual error in degrees. */
  residualDeg: number;
  elapsedDays: number;
  iterations: number;
}

export interface SolveDesignMomentOptions {
  toleranceDeg?: number;
  maxIterations?: number;
}

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * MS_PER_DAY);
}

/**
 * Solve for the Design moment.
 *
 * The error function is `signedAngularDifference(target, sunLongitude(t))`:
 * positive when the Sun has already passed the target, negative when it has
 * not yet reached it. Because the Sun's longitude increases monotonically with
 * time, the error increases monotonically with t, giving bisection a clean
 * sign change to work with.
 */
export async function solveDesignMoment(
  provider: EphemerisProvider,
  birthUtc: Date,
  options: SolveDesignMomentOptions = {},
): Promise<DesignMomentResult> {
  const tolerance = options.toleranceDeg ?? DEFAULT_TOLERANCE_DEG;
  const maxIterations = options.maxIterations ?? 200;

  const birthSunLongitude = await provider.getSunLongitude(birthUtc);
  const targetSunLongitude = normalise360(birthSunLongitude - DESIGN_SOLAR_ARC_DEG);

  const errorAt = async (daysBack: number): Promise<number> =>
    signedAngularDifference(
      targetSunLongitude,
      await provider.getSunLongitude(addDays(birthUtc, -daysBack)),
    );

  // Bracket: at SEARCH_LOWER_DAYS back the Sun should still be ahead of the
  // target (error > 0); at SEARCH_UPPER_DAYS back it should be behind (< 0).
  let lower = SEARCH_LOWER_DAYS;
  let upper = SEARCH_UPPER_DAYS;
  let lowerError = await errorAt(lower);
  let upperError = await errorAt(upper);

  // Widen defensively rather than trusting the nominal bounds blindly.
  let widenings = 0;
  while (Math.sign(lowerError) === Math.sign(upperError) && widenings < 6) {
    lower = Math.max(0, lower - 3);
    upper = upper + 3;
    lowerError = await errorAt(lower);
    upperError = await errorAt(upper);
    widenings += 1;
  }

  if (Math.sign(lowerError) === Math.sign(upperError)) {
    throw new Error(
      `Could not bracket the 88-degree solar arc for birth ${birthUtc.toISOString()} ` +
        `(target ${targetSunLongitude.toFixed(6)} deg, ` +
        `errors ${lowerError.toFixed(6)} / ${upperError.toFixed(6)})`,
    );
  }

  let iterations = 0;
  let midpoint = (lower + upper) / 2;
  let midpointError = await errorAt(midpoint);

  while (Math.abs(midpointError) > tolerance && iterations < maxIterations) {
    if (Math.sign(midpointError) === Math.sign(lowerError)) {
      lower = midpoint;
      lowerError = midpointError;
    } else {
      upper = midpoint;
      upperError = midpointError;
    }

    const next = (lower + upper) / 2;
    // Bisection has converged to the limit of double precision.
    if (next === midpoint) break;
    midpoint = next;
    midpointError = await errorAt(midpoint);
    iterations += 1;
  }

  const designUtc = addDays(birthUtc, -midpoint);
  const designSunLongitude = await provider.getSunLongitude(designUtc);

  return {
    designUtc,
    birthSunLongitude,
    targetSunLongitude,
    designSunLongitude,
    solarArcDeg: normalise360(birthSunLongitude - designSunLongitude),
    residualDeg: Math.abs(signedAngularDifference(targetSunLongitude, designSunLongitude)),
    elapsedDays: midpoint,
    iterations,
  };
}
