import { describe, expect, it } from "vitest";

import { AstronomyEngineProvider } from "../astronomy/astronomy-engine-provider";
import { angularDifference, normalise360, signedAngularDifference } from "../calculate/angles";
import { DESIGN_SOLAR_ARC_DEG, solveDesignMoment } from "../calculate/design-date";

const provider = new AstronomyEngineProvider();

/**
 * Birth moments spread across the year so the solver is exercised at both
 * orbital extremes, and — critically — including cases whose 88-degree span
 * crosses 0 degrees Aries.
 */
const CASES: Array<{ label: string; birth: Date; crossesAries: boolean }> = [
  { label: "early January (near perihelion, fastest Sun)", birth: new Date(Date.UTC(1990, 0, 4, 12, 0)), crossesAries: false },
  { label: "early April (design falls before 0 Aries)", birth: new Date(Date.UTC(1990, 3, 5, 6, 30)), crossesAries: true },
  { label: "mid May (span straddles 0 Aries)", birth: new Date(Date.UTC(1985, 4, 15, 3, 15)), crossesAries: true },
  { label: "late June (span just clears 0 Aries)", birth: new Date(Date.UTC(2001, 5, 25, 18, 45)), crossesAries: true },
  { label: "early July (near aphelion, slowest Sun)", birth: new Date(Date.UTC(1972, 6, 5, 9, 0)), crossesAries: false },
  { label: "October", birth: new Date(Date.UTC(1955, 9, 12, 23, 55)), crossesAries: false },
  { label: "late December", birth: new Date(Date.UTC(2018, 11, 30, 1, 5)), crossesAries: false },
  { label: "leap day", birth: new Date(Date.UTC(2000, 1, 29, 12, 0)), crossesAries: false },
  { label: "1930s epoch", birth: new Date(Date.UTC(1937, 8, 9, 11, 0)), crossesAries: false },
  { label: "near-future epoch", birth: new Date(Date.UTC(2030, 2, 21, 0, 1)), crossesAries: true },
];

describe("solveDesignMoment", () => {
  it.each(CASES)("achieves exactly 88 degrees of solar arc — $label", async ({ birth }) => {
    const result = await solveDesignMoment(provider, birth);

    // The headline assertion the spec asks for.
    const arc = normalise360(result.birthSunLongitude - result.designSunLongitude);
    expect(arc).toBeCloseTo(DESIGN_SOLAR_ARC_DEG, 7);

    expect(result.residualDeg).toBeLessThan(1e-7);
    expect(
      angularDifference(result.targetSunLongitude, result.designSunLongitude),
    ).toBeLessThan(1e-7);
  });

  it.each(CASES)("returns a Design moment before birth — $label", async ({ birth }) => {
    const result = await solveDesignMoment(provider, birth);
    expect(result.designUtc.getTime()).toBeLessThan(birth.getTime());
  });

  it("is NOT equivalent to subtracting 88 days", async () => {
    // The whole point of the solver. Across the year the elapsed time varies
    // by several days, so a fixed 88-day offset is wrong for almost everyone.
    const elapsed: number[] = [];
    for (const { birth } of CASES) {
      const result = await solveDesignMoment(provider, birth);
      elapsed.push(result.elapsedDays);
    }

    const min = Math.min(...elapsed);
    const max = Math.max(...elapsed);

    // Physically expected range for 88 degrees of solar arc.
    expect(min).toBeGreaterThan(86);
    expect(max).toBeLessThan(93);

    // At least one case must differ from 88 days by more than half a day,
    // which is far more than enough to change gates.
    expect(Math.max(...elapsed.map((d) => Math.abs(d - 88)))).toBeGreaterThan(0.5);

    // And the spread itself must be material.
    expect(max - min).toBeGreaterThan(1);
  });

  it("handles the 359/0 boundary when the target wraps below zero", async () => {
    // Choose a birth where the Sun is just past 0 Aries, forcing the target
    // (birth - 88) to land in the high 200s and the search to cross the wrap.
    const birth = new Date(Date.UTC(1990, 2, 21, 12, 0)); // Sun ~0.3 Aries
    const result = await solveDesignMoment(provider, birth);

    expect(result.birthSunLongitude).toBeLessThan(5);
    expect(result.targetSunLongitude).toBeGreaterThan(180);
    expect(result.residualDeg).toBeLessThan(1e-7);
    expect(normalise360(result.birthSunLongitude - result.designSunLongitude)).toBeCloseTo(88, 7);
  });

  it("converges quickly and deterministically", async () => {
    const birth = new Date(Date.UTC(1990, 2, 1, 4, 32));
    const a = await solveDesignMoment(provider, birth);
    const b = await solveDesignMoment(provider, birth);

    expect(a.designUtc.toISOString()).toBe(b.designUtc.toISOString());
    expect(a.iterations).toBeLessThan(80);
  });

  it("respects a looser tolerance when asked", async () => {
    const birth = new Date(Date.UTC(1990, 2, 1, 4, 32));
    const loose = await solveDesignMoment(provider, birth, { toleranceDeg: 1e-4 });
    expect(loose.residualDeg).toBeLessThan(1e-4);
  });

  it("keeps the error function monotonic over the search window", async () => {
    // Guards the bisection precondition: the Sun's longitude relative to the
    // target must increase with time, with no sign flips from wrapping.
    const birth = new Date(Date.UTC(1990, 4, 20, 0, 0));
    const { targetSunLongitude } = await solveDesignMoment(provider, birth);

    let previous = -Infinity;
    for (let daysBack = 95; daysBack >= 84; daysBack -= 0.5) {
      const at = new Date(birth.getTime() - daysBack * 86_400_000);
      const error = signedAngularDifference(targetSunLongitude, await provider.getSunLongitude(at));
      expect(error).toBeGreaterThan(previous);
      previous = error;
    }
  });
});
