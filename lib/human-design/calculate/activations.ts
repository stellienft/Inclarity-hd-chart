import type { EphemerisProvider, PlanetaryPositions } from "../astronomy/types";
import type { PlanetaryActivation, PlanetaryActivationSet, PlanetId } from "../types/activation";
import { normalise360 } from "./angles";
import { longitudeToActivation } from "./gate-line";

/**
 * Turn a set of raw ephemeris longitudes into the thirteen Human Design
 * activations.
 *
 * Two of the thirteen are derived rather than measured:
 *
 *   Earth      = Sun + 180 degrees. In the Human Design convention the Earth
 *                activation is the geocentric point opposite the Sun, which is
 *                exact by construction, not an independent ephemeris lookup.
 *   South Node = North Node + 180 degrees. The lunar nodes are by definition
 *                the two antipodal intersections of the Moon's orbital plane
 *                with the ecliptic.
 *
 * Retrograde is carried through from the measured body: Earth shares the Sun's
 * direction of travel and the South Node shares the North Node's (the nodes
 * are almost always retrograde, but the osculating node does briefly turn
 * direct, so this is measured rather than assumed).
 */
export function positionsToActivationSet(positions: PlanetaryPositions): PlanetaryActivationSet {
  const build = (planet: PlanetId, longitude: number, retrograde: boolean): PlanetaryActivation => ({
    planet,
    retrograde,
    ...longitudeToActivation(longitude),
  });

  const sun = positions.sun;
  const northNode = positions.northNode;

  return {
    sun: build("sun", sun.longitude, sun.retrograde),
    earth: build("earth", normalise360(sun.longitude + 180), sun.retrograde),
    northNode: build("northNode", northNode.longitude, northNode.retrograde),
    southNode: build("southNode", normalise360(northNode.longitude + 180), northNode.retrograde),
    moon: build("moon", positions.moon.longitude, positions.moon.retrograde),
    mercury: build("mercury", positions.mercury.longitude, positions.mercury.retrograde),
    venus: build("venus", positions.venus.longitude, positions.venus.retrograde),
    mars: build("mars", positions.mars.longitude, positions.mars.retrograde),
    jupiter: build("jupiter", positions.jupiter.longitude, positions.jupiter.retrograde),
    saturn: build("saturn", positions.saturn.longitude, positions.saturn.retrograde),
    uranus: build("uranus", positions.uranus.longitude, positions.uranus.retrograde),
    neptune: build("neptune", positions.neptune.longitude, positions.neptune.retrograde),
    pluto: build("pluto", positions.pluto.longitude, positions.pluto.retrograde),
  };
}

export async function calculateActivations(
  provider: EphemerisProvider,
  timestampUtc: Date,
): Promise<PlanetaryActivationSet> {
  return positionsToActivationSet(await provider.getPositions(timestampUtc));
}
