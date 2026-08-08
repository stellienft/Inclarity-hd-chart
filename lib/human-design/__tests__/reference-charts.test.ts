import { describe, expect, it } from "vitest";

import { calculateChart } from "../index";
import { formatGateLine } from "../calculate/gate-line";
import { PLANET_IDS } from "../types/activation";
import { MOTOR_CENTERS } from "../types/center";
import type { LocationResult } from "../../location/types";

/**
 * ============================================================================
 *  REFERENCE CHART REGRESSION SUITE
 * ============================================================================
 *
 * Every expectation below comes from a PUBLISHED chart, not from this engine's
 * own output. Recording our own results as "expected" would make the suite
 * self-confirming and worthless. Where a published source only states part of
 * a chart, only that part is asserted.
 *
 * Sources and the full comparison log are in docs/VALIDATION.md.
 */

const location = (
  displayName: string,
  city: string,
  region: string,
  country: string,
  latitude: number,
  longitude: number,
  timezone: string,
): LocationResult => ({ displayName, city, region, country, latitude, longitude, timezone });

describe("reference chart: Ra Uru Hu", () => {
  /**
   * Born Robert Alan Krakower, 9 April 1948, 00:05, Montreal, Quebec.
   * Birth data per Astro-Databank (sourced from Jovian Archive, the founder's
   * own organisation). Published chart: Manifestor, Splenic authority, 5/1
   * profile, Left Angle Cross of The Clarion (51/57 | 61/62).
   *
   * This fixture is the strongest single check in the suite: matching all four
   * Incarnation Cross gates validates the birth moment AND the 88-degree solar
   * arc solver simultaneously, because the cross is built from the Personality
   * Sun/Earth (birth) and the Design Sun/Earth (the solved moment).
   */
  const montreal = location(
    "Montreal, Quebec, Canada",
    "Montreal",
    "Quebec",
    "Canada",
    45.5019,
    -73.5674,
    "America/Toronto",
  );

  it("matches the published Type, Authority and Profile", async () => {
    const { chart } = await calculateChart({
      name: "Ra Uru Hu",
      date: "1948-04-09",
      time: "00:05",
      location: montreal,
    });

    expect(chart.type).toBe("Manifestor");
    expect(chart.authority).toBe("Splenic");
    expect(chart.profile).toBe("5/1");
    expect(chart.profileName).toBe("Heretic / Investigator");
    expect(chart.strategy).toBe("To Inform");
  });

  it("matches the published Incarnation Cross gates and angle", async () => {
    const { chart } = await calculateChart({
      date: "1948-04-09",
      time: "00:05",
      location: montreal,
    });

    // Left Angle Cross of The Clarion (51/57 | 61/62)
    expect(chart.incarnationCross.angle).toBe("Left Angle");
    expect(chart.incarnationCross.personalitySun.gate).toBe(51);
    expect(chart.incarnationCross.personalityEarth.gate).toBe(57);
    expect(chart.incarnationCross.designSun.gate).toBe(61);
    expect(chart.incarnationCross.designEarth.gate).toBe(62);
    expect(chart.incarnationCross.notation).toBe("(51/57 | 61/62)");
  });

  it("is stable across the published birth-time variants (00:05 / 00:14 / 00:20)", async () => {
    // Astro-Databank notes variants of 0:05, 0:14 and 0:20. A correct engine
    // should return the same headline chart for all three.
    for (const time of ["00:05", "00:14", "00:20"]) {
      const { chart } = await calculateChart({
        date: "1948-04-09",
        time,
        location: montreal,
      });
      expect(chart.type).toBe("Manifestor");
      expect(chart.authority).toBe("Splenic");
      expect(chart.profile).toBe("5/1");
      expect(chart.incarnationCross.notation).toBe("(51/57 | 61/62)");
    }
  });

  it("derives Manifestor through a genuine motor-to-Throat path", async () => {
    const { chart, diagnostics } = await calculateChart({
      date: "1948-04-09",
      time: "00:05",
      location: montreal,
    });

    expect(chart.centers.defined).not.toContain("sacral");
    expect(diagnostics.typeDerivation.motorToThroat).toBe(true);
    // Heart is the motor; it reaches the Throat via the G centre.
    expect(diagnostics.typeDerivation.connectedMotors).toContain("heart");
  });
});

describe("reference chart: Princess Diana", () => {
  /**
   * 1 July 1961, 19:45 BST, Sandringham, Norfolk, England.
   * Birth data is Rodden rating AA (birth certificate).
   *
   * Published claims checked here: she is a Projector, and Gate 39 carries
   * BOTH her Personality Sun and her Design Mars. The second is an unusually
   * specific, independently-stated cross-check on a non-Sun body in the
   * Design imprint.
   */
  const sandringham = location(
    "Sandringham, England, United Kingdom",
    "Sandringham",
    "England",
    "United Kingdom",
    52.8309,
    0.5158,
    "Europe/London",
  );

  it("is a Projector with Gate 39 on both Personality Sun and Design Mars", async () => {
    const { chart } = await calculateChart({
      name: "Diana",
      date: "1961-07-01",
      time: "19:45",
      location: sandringham,
    });

    expect(chart.type).toBe("Projector");
    expect(chart.personality.sun.gate).toBe(39);
    expect(chart.design.mars.gate).toBe(39);
  });

  it("applies British Summer Time to the birth conversion", async () => {
    const { chart } = await calculateChart({
      date: "1961-07-01",
      time: "19:45",
      location: sandringham,
    });
    expect(chart.subject.birthLocal).toBe("1961-07-01T19:45:00+01:00");
    expect(chart.subject.birthUtc).toBe("1961-07-01T18:45:00.000Z");
  });

  it("has no motor reaching the Throat", async () => {
    const { chart, diagnostics } = await calculateChart({
      date: "1961-07-01",
      time: "19:45",
      location: sandringham,
    });
    expect(chart.centers.defined).not.toContain("sacral");
    expect(diagnostics.typeDerivation.motorToThroat).toBe(false);
  });
});

describe("reference chart: Nelson Mandela", () => {
  /**
   * 18 July 1918, Mvezo, South Africa. His birth TIME is not reliably
   * recorded, so only claims that are robust to the unknown time are asserted:
   * he is published as a Projector with no defined motor centres.
   */
  const mvezo = location(
    "Mvezo, Eastern Cape, South Africa",
    "Mvezo",
    "Eastern Cape",
    "South Africa",
    -31.9167,
    28.5,
    "Africa/Johannesburg",
  );

  it("is a Projector with no defined motor centres", async () => {
    const { chart } = await calculateChart({
      name: "Nelson Mandela",
      date: "1918-07-18",
      time: "12:00",
      location: mvezo,
    });

    expect(chart.type).toBe("Projector");
    for (const motor of MOTOR_CENTERS) {
      expect(chart.centers.defined).not.toContain(motor);
    }
  });
});

describe("reference chart: Genetic Matrix, 5 June 1989 Brisbane", () => {
  /**
   * The strongest fixture in the suite, and the only one checked against a
   * live established calculator rather than a published description.
   *
   * Source: a Genetic Matrix "Foundation Chart" for 5 June 1989, 17:58,
   * Brisbane (UTC+10). Genetic Matrix computes with Swiss Ephemeris against
   * the JPL planetary database, so this is a direct comparison against the
   * reference implementation of the field.
   *
   * ALL 26 ACTIVATIONS are asserted, not just the headline properties. Getting
   * 26 gate.line values right simultaneously is not something a wrong wheel
   * offset, a wrong node convention or a wrong Design solver can do by luck.
   */
  const brisbane = location(
    "Brisbane, Queensland, Australia",
    "Brisbane",
    "Queensland",
    "Australia",
    -27.4678,
    153.028,
    "Australia/Brisbane",
  );

  const DESIGN: Record<string, string> = {
    sun: "63.6", earth: "64.6", northNode: "55.6", southNode: "59.6", moon: "37.4",
    mercury: "30.1", venus: "37.4", mars: "8.4", jupiter: "8.6", saturn: "38.3",
    uranus: "58.2", neptune: "38.3", pluto: "1.2",
  };
  const PERSONALITY: Record<string, string> = {
    sun: "35.4", earth: "5.4", northNode: "30.5", southNode: "29.5", moon: "52.1",
    mercury: "8.4", venus: "15.3", mars: "62.3", jupiter: "45.1", saturn: "38.4",
    uranus: "58.1", neptune: "38.3", pluto: "44.6",
  };

  const chartPromise = calculateChart({
    date: "1989-06-05",
    time: "17:58",
    location: brisbane,
  });

  it("matches all 13 Design activations", async () => {
    const { chart } = await chartPromise;
    for (const planet of PLANET_IDS) {
      expect(formatGateLine(chart.design[planet]), `design ${planet}`).toBe(DESIGN[planet]);
    }
  });

  it("matches all 13 Personality activations", async () => {
    const { chart } = await chartPromise;
    for (const planet of PLANET_IDS) {
      expect(formatGateLine(chart.personality[planet]), `personality ${planet}`).toBe(
        PERSONALITY[planet],
      );
    }
  });

  it("matches the published Type, Profile, Definition and Authority", async () => {
    const { chart } = await chartPromise;
    // Genetic Matrix says "Pure Manifesting Generator"; "Pure" is its own
    // sub-label for an MG with a direct Sacral-Throat channel, not a separate
    // type, so the type itself is Manifesting Generator.
    expect(chart.type).toBe("Manifesting Generator");
    expect(chart.profile).toBe("4/6");
    expect(chart.definition).toBe("Single Definition");
    expect(chart.authority).toBe("Sacral");
    expect(chart.strategy).toBe("To Respond");
  });

  it("matches the published channel list", async () => {
    const { chart } = await chartPromise;
    expect(chart.channels.map((c) => c.id).sort()).toEqual(["1-8", "5-15"]);
    expect(chart.channels.map((c) => c.name).sort()).toEqual(["Inspiration", "Rhythm"]);
  });

  it("converts the birth time with Queensland's June 1989 offset", async () => {
    const { chart } = await chartPromise;
    // The DST trial ran from late October 1989, so June is plain UTC+10.
    expect(chart.subject.birthLocal).toBe("1989-06-05T17:58:00+10:00");
    expect(chart.subject.birthUtc).toBe("1989-06-05T07:58:00.000Z");
  });

  it("solves the Design moment to within a minute of Swiss Ephemeris", async () => {
    const { chart } = await chartPromise;
    // Genetic Matrix reports 1989-03-07 05:46:55 UTC. The remaining seconds
    // are the ephemeris difference between astronomy-engine and Swiss
    // Ephemeris/JPL — far too small to move a gate (5.625 deg) or a line
    // (0.9375 deg), as the 26 matching activations above demonstrate.
    const ours = new Date(chart.subject.designUtc).getTime();
    const theirs = Date.UTC(1989, 2, 7, 5, 46, 55);
    expect(Math.abs(ours - theirs)).toBeLessThan(60_000);
  });
});

describe("engine invariants across reference charts", () => {
  const cases = [
    {
      label: "Ra Uru Hu",
      date: "1948-04-09",
      time: "00:05",
      location: location("Montreal", "Montreal", "Quebec", "Canada", 45.5019, -73.5674, "America/Toronto"),
    },
    {
      label: "Diana",
      date: "1961-07-01",
      time: "19:45",
      location: location("Sandringham", "Sandringham", "England", "United Kingdom", 52.8309, 0.5158, "Europe/London"),
    },
    {
      label: "Brisbane 1990",
      date: "1990-03-01",
      time: "14:32",
      location: location("Brisbane", "Brisbane", "Queensland", "Australia", -27.4698, 153.0251, "Australia/Brisbane"),
    },
  ];

  it.each(cases)("$label — Sun and Earth are exactly opposite", async ({ date, time, location: loc }) => {
    const { chart } = await calculateChart({ date, time, location: loc });
    for (const side of ["personality", "design"] as const) {
      const diff = Math.abs(chart[side].earth.longitude - chart[side].sun.longitude);
      expect(Math.min(diff, 360 - diff)).toBeCloseTo(180, 9);
    }
  });

  it.each(cases)("$label — the nodes are exactly opposite", async ({ date, time, location: loc }) => {
    const { chart } = await calculateChart({ date, time, location: loc });
    for (const side of ["personality", "design"] as const) {
      const diff = Math.abs(chart[side].southNode.longitude - chart[side].northNode.longitude);
      expect(Math.min(diff, 360 - diff)).toBeCloseTo(180, 9);
    }
  });

  it.each(cases)("$label — the Design moment is exactly 88 degrees of solar arc back", async ({ date, time, location: loc }) => {
    const { chart, diagnostics } = await calculateChart({ date, time, location: loc });
    expect(diagnostics.designSolver.residualDeg).toBeLessThan(1e-7);
    expect(new Date(chart.subject.designUtc).getTime()).toBeLessThan(
      new Date(chart.subject.birthUtc).getTime(),
    );
  });

  it.each(cases)("$label — every defined centre is justified by a channel", async ({ date, time, location: loc }) => {
    const { chart } = await calculateChart({ date, time, location: loc });
    const fromChannels = new Set(chart.channels.flatMap((c) => c.centers));
    expect([...chart.centers.defined].sort()).toEqual([...fromChannels].sort());
  });

  it.each(cases)("$label — defined and undefined centres partition all nine", async ({ date, time, location: loc }) => {
    const { chart } = await calculateChart({ date, time, location: loc });
    expect(chart.centers.defined.length + chart.centers.undefined.length).toBe(9);
    expect(
      chart.centers.defined.filter((c) => chart.centers.undefined.includes(c)),
    ).toEqual([]);
  });

  it.each(cases)("$label — profile matches the two Sun lines", async ({ date, time, location: loc }) => {
    const { chart } = await calculateChart({ date, time, location: loc });
    expect(chart.profile).toBe(`${chart.personality.sun.line}/${chart.design.sun.line}`);
  });

  it.each(cases)("$label — hanging gates define nothing", async ({ date, time, location: loc }) => {
    const { chart } = await calculateChart({ date, time, location: loc });
    const gatesInChannels = new Set(chart.channels.flatMap((c) => c.gates));
    for (const gate of chart.hangingGates) {
      expect(gatesInChannels.has(gate)).toBe(false);
    }
  });

  it("formats activations conventionally", async () => {
    const first = cases[0];
    if (!first) throw new Error("missing case");
    const { chart } = await calculateChart({
      date: first.date,
      time: first.time,
      location: first.location,
    });
    expect(formatGateLine(chart.personality.sun)).toBe("51.5");
  });
});
