import { describe, expect, it } from "vitest";

import { CHANNEL_DEFINITIONS, channelId } from "../constants/channels";
import {
  GATE_DEFINITIONS,
  GATE_WHEEL_SEQUENCE,
  GATE_WIDTH_DEG,
  LINE_WIDTH_DEG,
  getGateStartLongitude,
} from "../constants/gates";
import { CENTER_IDS, MOTOR_CENTERS } from "../types/center";

describe("gate wheel", () => {
  it("contains all 64 gates exactly once", () => {
    expect(GATE_WHEEL_SEQUENCE).toHaveLength(64);
    expect(new Set(GATE_WHEEL_SEQUENCE).size).toBe(64);
    for (let gate = 1; gate <= 64; gate += 1) {
      expect(GATE_WHEEL_SEQUENCE).toContain(gate);
    }
  });

  it("has correct gate and line widths", () => {
    expect(GATE_WIDTH_DEG).toBe(5.625);
    expect(LINE_WIDTH_DEG).toBe(0.9375);
    expect(GATE_WIDTH_DEG * 64).toBe(360);
  });

  /**
   * The five checkpoints that pin the wheel's origin and direction. These are
   * the values published in Human Design gate/degree tables; if any of them
   * breaks, the mapping convention has been changed and every chart is wrong.
   */
  it.each([
    ["Gate 41 begins at 2°00'00\" Aquarius", 41, 302.0],
    ["Gate 19 begins at 7°37'30\" Aquarius", 19, 307.625],
    ["Gate 25 begins at 28°15'00\" Pisces", 25, 358.25],
    ["Gate 17 begins at 3°52'30\" Aries", 17, 3.875],
    ["Gate 21 begins at 9°30'00\" Aries", 21, 9.5],
    ["Gate 51 begins at 15°07'30\" Aries", 51, 15.125],
  ])("%s", (_label, gate, expected) => {
    expect(getGateStartLongitude(gate as number)).toBeCloseTo(expected as number, 9);
  });
});

describe("gate definitions", () => {
  it("has exactly 64 records, one per gate, with no duplicates", () => {
    expect(GATE_DEFINITIONS).toHaveLength(64);
    const gates = GATE_DEFINITIONS.map((d) => d.gate);
    expect(new Set(gates).size).toBe(64);
    expect([...gates].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 64 }, (_, i) => i + 1),
    );
  });

  it("assigns every gate to a valid centre", () => {
    for (const definition of GATE_DEFINITIONS) {
      expect(CENTER_IDS).toContain(definition.center);
    }
  });

  it("distributes gates across all nine centres", () => {
    const used = new Set(GATE_DEFINITIONS.map((d) => d.center));
    expect(used.size).toBe(9);
  });
});

describe("channels", () => {
  const EXPECTED_PAIRS = [
    "1-8", "2-14", "3-60", "4-63", "5-15", "6-59", "7-31", "9-52",
    "10-20", "10-34", "10-57", "11-56", "12-22", "13-33", "16-48", "17-62",
    "18-58", "19-49", "20-34", "20-57", "21-45", "23-43", "24-61", "25-51",
    "26-44", "27-50", "28-38", "29-46", "30-41", "32-54", "34-57", "35-36",
    "37-40", "39-55", "42-53", "47-64",
  ];

  it("models exactly the 36 recognised gate pairs", () => {
    expect(CHANNEL_DEFINITIONS).toHaveLength(36);
    const ids = CHANNEL_DEFINITIONS.map((c) => c.id).sort();
    expect(ids).toEqual([...EXPECTED_PAIRS].sort());
  });

  it("has no duplicate channels", () => {
    expect(new Set(CHANNEL_DEFINITIONS.map((c) => c.id)).size).toBe(36);
  });

  it("joins two different centres in every channel", () => {
    for (const channel of CHANNEL_DEFINITIONS) {
      expect(channel.centers[0]).not.toBe(channel.centers[1]);
      expect(CENTER_IDS).toContain(channel.centers[0]);
      expect(CENTER_IDS).toContain(channel.centers[1]);
    }
  });

  it("normalises ids to low-high order", () => {
    for (const channel of CHANNEL_DEFINITIONS) {
      expect(channel.id).toBe(channelId(channel.gates[0], channel.gates[1]));
      expect(channel.gates[0]).toBeLessThan(channel.gates[1]);
    }
  });

  it("references only gates that exist", () => {
    const known = new Set(GATE_DEFINITIONS.map((d) => d.gate));
    for (const channel of CHANNEL_DEFINITIONS) {
      expect(known.has(channel.gates[0])).toBe(true);
      expect(known.has(channel.gates[1])).toBe(true);
    }
  });
});

describe("centres", () => {
  it("has nine centres and four motors", () => {
    expect(CENTER_IDS).toHaveLength(9);
    expect(MOTOR_CENTERS).toHaveLength(4);
    expect([...MOTOR_CENTERS].sort()).toEqual(["heart", "root", "sacral", "solarPlexus"]);
  });

  it("never treats the Throat as a motor", () => {
    expect(MOTOR_CENTERS).not.toContain("throat");
  });
});
