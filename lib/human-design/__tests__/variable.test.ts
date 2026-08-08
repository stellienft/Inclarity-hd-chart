import { describe, expect, it } from "vitest";

import { calculateChart } from "../index";
import { TONE_WIDTH_DEG } from "../constants/gates";
import {
  VARIABLE_POSITIONS,
  calculateVariable,
  toneToDirection,
  variableWarnings,
} from "../derive/variable";
import type { LocationResult } from "../../location/types";

const brisbane: LocationResult = {
  displayName: "Brisbane, Queensland, Australia",
  city: "Brisbane",
  region: "Queensland",
  country: "Australia",
  latitude: -27.4698,
  longitude: 153.0251,
  timezone: "Australia/Brisbane",
};

describe("toneToDirection", () => {
  it("points tones 1-3 left and tones 4-6 right", () => {
    expect([1, 2, 3].map(toneToDirection)).toEqual(["left", "left", "left"]);
    expect([4, 5, 6].map(toneToDirection)).toEqual(["right", "right", "right"]);
  });
});

describe("the four arrows", () => {
  const chartPromise = calculateChart({
    date: "1989-06-05",
    time: "17:58",
    location: brisbane,
  });

  it("names and places all four", async () => {
    const { chart } = await chartPromise;
    expect(Object.keys(chart.variable.arrows).sort()).toEqual([...VARIABLE_POSITIONS].sort());

    expect(chart.variable.arrows.determination.side).toBe("design");
    expect(chart.variable.arrows.environment.side).toBe("design");
    expect(chart.variable.arrows.motivation.side).toBe("personality");
    expect(chart.variable.arrows.perspective.side).toBe("personality");
  });

  it("takes the upper arrows from the Suns and the lower from the Nodes", async () => {
    const { chart } = await chartPromise;
    const { arrows } = chart.variable;

    expect(arrows.determination.color).toBe(chart.design.sun.color);
    expect(arrows.determination.tone).toBe(chart.design.sun.tone);
    expect(arrows.motivation.color).toBe(chart.personality.sun.color);
    expect(arrows.motivation.tone).toBe(chart.personality.sun.tone);
    expect(arrows.environment.color).toBe(chart.design.northNode.color);
    expect(arrows.environment.tone).toBe(chart.design.northNode.tone);
    expect(arrows.perspective.color).toBe(chart.personality.northNode.color);
    expect(arrows.perspective.tone).toBe(chart.personality.northNode.tone);
  });

  /**
   * Reading the Sun rather than the Earth (and the North Node rather than the
   * South) has to be an arbitrary choice, not a meaningful one. If an
   * ephemeris change ever broke that, every published chart's arrows would be
   * ambiguous — so it is asserted rather than assumed.
   */
  it("would produce the same arrows from the opposite bodies", async () => {
    const { chart } = await chartPromise;
    for (const side of [chart.design, chart.personality]) {
      expect([side.earth.color, side.earth.tone, side.earth.base]).toEqual([
        side.sun.color,
        side.sun.tone,
        side.sun.base,
      ]);
      expect([side.southNode.color, side.southNode.tone, side.southNode.base]).toEqual([
        side.northNode.color,
        side.northNode.tone,
        side.northNode.base,
      ]);
    }
  });

  it("agrees with its own arrow directions in the shorthand notation", async () => {
    const { chart } = await chartPromise;
    const { arrows, notation } = chart.variable;
    const letter = (d: string) => (d === "left" ? "L" : "R");
    expect(notation).toBe(
      `${letter(arrows.determination.direction)}${letter(arrows.environment.direction)} ` +
        `${letter(arrows.motivation.direction)}${letter(arrows.perspective.direction)}`,
    );
  });

  it("derives every direction from its own tone", async () => {
    const { chart } = await chartPromise;
    for (const position of VARIABLE_POSITIONS) {
      const arrow = chart.variable.arrows[position];
      expect(arrow.direction, position).toBe(toneToDirection(arrow.tone));
    }
  });
});

describe("tone-boundary honesty", () => {
  const activation = (tone: number, tonePhase: number) => ({
    longitude: 0,
    gate: 1,
    line: 1,
    lineDecimal: 1,
    color: 1,
    tone,
    base: 1,
    tonePhase,
  });

  const setFrom = (tone: number, tonePhase: number) => {
    const one = activation(tone, tonePhase);
    return {
      sun: one, earth: one, northNode: one, southNode: one, moon: one, mercury: one,
      venus: one, mars: one, jupiter: one, saturn: one, uranus: one, neptune: one,
      pluto: one,
    } as never;
  };

  it("flags an arrow sitting on the edge of its tone", () => {
    const variable = calculateVariable(setFrom(3, 0.999), setFrom(3, 0.999));
    expect(variable.arrows.determination.nearToneBoundary).toBe(true);
    expect(variableWarnings(variable)).toHaveLength(4);
  });

  it("says nothing about an arrow sitting safely mid-tone", () => {
    const variable = calculateVariable(setFrom(3, 0.5), setFrom(3, 0.5));
    expect(variable.arrows.determination.nearToneBoundary).toBe(false);
    expect(variable.arrows.determination.toneMarginDeg).toBeCloseTo(TONE_WIDTH_DEG / 2, 12);
    expect(variableWarnings(variable)).toEqual([]);
  });

  it("measures the margin to the nearer edge, whichever side it is on", () => {
    const low = calculateVariable(setFrom(3, 0.01), setFrom(3, 0.01));
    const high = calculateVariable(setFrom(3, 0.99), setFrom(3, 0.99));
    expect(low.arrows.motivation.toneMarginDeg).toBeCloseTo(
      high.arrows.motivation.toneMarginDeg,
      12,
    );
  });

  /**
   * This is not hypothetical. The validated 1989-06-05 Brisbane chart has its
   * Design Sun within a thousandth of a degree of a Tone edge — under a minute
   * of the Sun's motion — so its Determination arrow genuinely could point
   * either way. The chart has to say so.
   */
  it("surfaces the warning on the chart rather than keeping it internal", async () => {
    const { chart } = await calculateChart({
      date: "1989-06-05",
      time: "17:58",
      location: brisbane,
    });

    expect(chart.variable.arrows.determination.nearToneBoundary).toBe(true);
    expect(chart.calculationMeta.warnings.join(" ")).toContain("Determination arrow");
  });
});
