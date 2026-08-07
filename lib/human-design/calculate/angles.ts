/** Angle helpers. Every longitude in the engine is normalised through here. */

/** Wrap to [0, 360). Handles negative and >360 inputs. */
export function normalise360(degrees: number): number {
  if (!Number.isFinite(degrees)) {
    throw new RangeError(`Longitude must be finite, received ${degrees}`);
  }
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/**
 * Signed shortest angular separation from `a` to `b`, in (-180, 180].
 *
 * Positive means `b` is ahead of `a` in increasing-longitude order.
 */
export function signedAngularDifference(a: number, b: number): number {
  let delta = (normalise360(b) - normalise360(a)) % 360;
  if (delta > 180) delta -= 360;
  if (delta <= -180) delta += 360;
  return delta;
}

/** Unsigned separation between two longitudes, in [0, 180]. */
export function angularDifference(a: number, b: number): number {
  return Math.abs(signedAngularDifference(a, b));
}

/**
 * Forward arc from `a` to `b` measured in the direction of increasing
 * longitude, in [0, 360).
 */
export function forwardArc(a: number, b: number): number {
  return normalise360(normalise360(b) - normalise360(a));
}
