import {
  Body,
  GeoVector,
  MakeTime,
  RotateVector,
  Rotation_EQJ_ECT,
  type AstroTime,
  type Vector,
} from "astronomy-engine";

import { normalise360 } from "../calculate/angles";
import type {
  BodyPosition,
  EphemerisBody,
  EphemerisProvider,
  NodeConvention,
  PlanetaryPositions,
} from "./types";

/**
 * Production ephemeris provider, backed by `astronomy-engine` (MIT).
 *
 * WHY THIS LIBRARY — see docs/EPHEMERIS.md for the full comparison. Summary:
 *
 *   - MIT licensed, so it imposes no obligations on the Inclarity product.
 *     (Swiss Ephemeris is AGPL-or-commercial; using it would either force the
 *     whole application to be AGPL or require a paid licence.)
 *   - Pure TypeScript, no native build step and no ephemeris data files, so it
 *     runs unchanged in serverless environments.
 *   - Provides Pluto and a correct `Rotation_EQJ_ECT` (true ecliptic of date),
 *     which is exactly the frame Swiss Ephemeris returns by default.
 *   - Cross-validated against an independent MIT implementation
 *     (astronomia's VSOP87D + Meeus): Sun through Saturn agree to within
 *     13 arcseconds across six test epochs spanning 1937-2018. A Human Design
 *     LINE is 3375 arcseconds wide, so that is ~0.4% of a line.
 *
 * FRAME: `GeoVector(body, t, true)` returns a geocentric equatorial J2000
 * vector corrected for light-time and aberration. `Rotation_EQJ_ECT` then
 * rotates it into the true ecliptic of date, giving apparent tropical
 * longitude — the Human Design convention.
 */

const AE_BODY: Record<Exclude<EphemerisBody, "northNode">, Body> = {
  sun: Body.Sun,
  moon: Body.Moon,
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
  pluto: Body.Pluto,
};

/**
 * Step used for numerical differentiation, in days.
 *
 * 60 s. The osculating node was verified to be stable to 7 decimal places for
 * steps between 0.1 s and 900 s, so this sits comfortably inside the plateau
 * where truncation and round-off error are both negligible.
 */
const DIFF_STEP_DAYS = 60 / 86400;

function eclipticLongitudeOfDate(body: Body, time: AstroTime): number {
  const geo = GeoVector(body, time, true);
  const ect = RotateVector(Rotation_EQJ_ECT(time), geo);
  return normalise360((Math.atan2(ect.y, ect.x) * 180) / Math.PI);
}

/** Geometric (no aberration) geocentric Moon vector in the true ecliptic of date. */
function moonEclipticVector(time: AstroTime, rotation: ReturnType<typeof Rotation_EQJ_ECT>): Vector {
  return RotateVector(rotation, GeoVector(Body.Moon, time, false));
}

/**
 * Osculating ("true") north node of the lunar orbit.
 *
 * The node is where the Moon's orbital plane crosses the ecliptic. The orbital
 * plane's normal is h = r x v, so the ascending-node direction is z_hat x h,
 * which works out to (-h_y, h_x, 0). This is the same quantity Swiss Ephemeris
 * returns for SE_TRUE_NODE.
 *
 * The node is a geometric construct, so it is computed from unaberrated
 * positions.
 */
function trueNorthNodeLongitude(time: AstroTime): number {
  const rotation = Rotation_EQJ_ECT(time);
  const r = moonEclipticVector(time, rotation);
  const ahead = moonEclipticVector(time.AddDays(DIFF_STEP_DAYS), rotation);
  const behind = moonEclipticVector(time.AddDays(-DIFF_STEP_DAYS), rotation);

  const v = {
    x: (ahead.x - behind.x) / (2 * DIFF_STEP_DAYS),
    y: (ahead.y - behind.y) / (2 * DIFF_STEP_DAYS),
    z: (ahead.z - behind.z) / (2 * DIFF_STEP_DAYS),
  };

  const hx = r.y * v.z - r.z * v.y;
  const hy = r.z * v.x - r.x * v.z;

  // node direction n = z_hat x h = (-h_y, h_x, 0)
  return normalise360((Math.atan2(hx, -hy) * 180) / Math.PI);
}

/**
 * Mean north node (Meeus, Astronomical Algorithms 2nd ed., eq. 47.7).
 *
 * Provided so the convention is switchable and testable, not because it is the
 * default. T is measured in Julian centuries of TT from J2000.0; we use the
 * library's UT-based `tt` field, whose difference from the strict TT argument
 * is far below the accuracy this formula claims.
 */
function meanNorthNodeLongitude(time: AstroTime): number {
  const T = time.tt / 36525;
  const omega =
    125.0445479 +
    T * (-1934.1362891 + T * (0.0020754 + T * (1 / 467441 - T / 60616000)));
  return normalise360(omega);
}

export interface AstronomyEngineProviderOptions {
  nodeConvention?: NodeConvention;
}

export class AstronomyEngineProvider implements EphemerisProvider {
  readonly id: string;
  readonly nodeConvention: NodeConvention;

  constructor(options: AstronomyEngineProviderOptions = {}) {
    this.nodeConvention = options.nodeConvention ?? "true";
    this.id = `astronomy-engine@2 (ECT, ${this.nodeConvention}-node)`;
  }

  private northNode(time: AstroTime): number {
    return this.nodeConvention === "mean"
      ? meanNorthNodeLongitude(time)
      : trueNorthNodeLongitude(time);
  }

  private positionOf(body: EphemerisBody, time: AstroTime): BodyPosition {
    const at = (t: AstroTime): number =>
      body === "northNode" ? this.northNode(t) : eclipticLongitudeOfDate(AE_BODY[body], t);

    const longitude = at(time);

    // Retrograde is decided from the sign of d(longitude)/dt across the wrap
    // point, so a body sitting at 359.99 degrees is handled correctly.
    const ahead = at(time.AddDays(DIFF_STEP_DAYS));
    let delta = ahead - longitude;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    return { longitude, retrograde: delta < 0 };
  }

  async getPositions(timestampUtc: Date): Promise<PlanetaryPositions> {
    const time = MakeTime(timestampUtc);
    return {
      sun: this.positionOf("sun", time),
      moon: this.positionOf("moon", time),
      mercury: this.positionOf("mercury", time),
      venus: this.positionOf("venus", time),
      mars: this.positionOf("mars", time),
      jupiter: this.positionOf("jupiter", time),
      saturn: this.positionOf("saturn", time),
      uranus: this.positionOf("uranus", time),
      neptune: this.positionOf("neptune", time),
      pluto: this.positionOf("pluto", time),
      northNode: this.positionOf("northNode", time),
    };
  }

  async getSunLongitude(timestampUtc: Date): Promise<number> {
    return eclipticLongitudeOfDate(Body.Sun, MakeTime(timestampUtc));
  }
}

/** The provider the application uses unless a caller injects another. */
export function createDefaultEphemerisProvider(): EphemerisProvider {
  return new AstronomyEngineProvider({ nodeConvention: "true" });
}
