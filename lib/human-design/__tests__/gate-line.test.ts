import { describe, expect, it } from "vitest";

import {
  GATE_WHEEL_ORIGIN_DEG,
  GATE_WHEEL_SEQUENCE,
  GATE_WIDTH_DEG,
  LINE_WIDTH_DEG,
  getGateStartLongitude,
} from "../constants/gates";
import { normalise360, signedAngularDifference, forwardArc } from "../calculate/angles";
import { longitudeToActivation } from "../calculate/gate-line";

const EPS = 1e-6;

describe("normalise360", () => {
  it.each([
    [0, 0],
    [360, 0],
    [-1, 359],
    [720.5, 0.5],
    [-720.5, 359.5],
    [359.999999, 359.999999],
  ])("normalise360(%s) = %s", (input, expected) => {
    expect(normalise360(input)).toBeCloseTo(expected, 9);
  });

  it("rejects non-finite input", () => {
    expect(() => normalise360(NaN)).toThrow(RangeError);
    expect(() => normalise360(Infinity)).toThrow(RangeError);
  });
});

describe("signedAngularDifference", () => {
  it("takes the short way around the wrap", () => {
    expect(signedAngularDifference(359, 1)).toBeCloseTo(2, 9);
    expect(signedAngularDifference(1, 359)).toBeCloseTo(-2, 9);
    expect(signedAngularDifference(0, 180)).toBeCloseTo(180, 9);
    expect(signedAngularDifference(0, 181)).toBeCloseTo(-179, 9);
  });
});

describe("forwardArc", () => {
  it("measures only in the increasing direction", () => {
    expect(forwardArc(359, 1)).toBeCloseTo(2, 9);
    expect(forwardArc(1, 359)).toBeCloseTo(358, 9);
  });
});

describe("longitudeToActivation — wheel structure", () => {
  it("maps the origin to the first gate, line 1", () => {
    const result = longitudeToActivation(GATE_WHEEL_ORIGIN_DEG);
    expect(result.gate).toBe(GATE_WHEEL_SEQUENCE[0]);
    expect(result.gate).toBe(41);
    expect(result.line).toBe(1);
  });

  it("walks the whole wheel in sequence order", () => {
    for (let index = 0; index < 64; index += 1) {
      const midGate = normalise360(
        GATE_WHEEL_ORIGIN_DEG + index * GATE_WIDTH_DEG + GATE_WIDTH_DEG / 2,
      );
      expect(longitudeToActivation(midGate).gate).toBe(GATE_WHEEL_SEQUENCE[index]);
    }
  });

  it("always returns a gate in 1..64 and a line in 1..6", () => {
    for (let deg = 0; deg < 360; deg += 0.037) {
      const { gate, line } = longitudeToActivation(deg);
      expect(gate).toBeGreaterThanOrEqual(1);
      expect(gate).toBeLessThanOrEqual(64);
      expect(line).toBeGreaterThanOrEqual(1);
      expect(line).toBeLessThanOrEqual(6);
    }
  });
});

describe("longitudeToActivation — gate boundaries", () => {
  /**
   * Half-open [start, end): a longitude exactly on a boundary belongs to the
   * gate starting there, and one ulp before it belongs to the previous gate.
   */
  it("assigns every gate boundary to the gate that starts there", () => {
    for (let index = 0; index < 64; index += 1) {
      const gate = GATE_WHEEL_SEQUENCE[index] as number;
      const previous = GATE_WHEEL_SEQUENCE[(index + 63) % 64] as number;
      const start = getGateStartLongitude(gate);

      expect(longitudeToActivation(start).gate).toBe(gate);
      expect(longitudeToActivation(start).line).toBe(1);
      expect(longitudeToActivation(normalise360(start + EPS)).gate).toBe(gate);
      expect(longitudeToActivation(normalise360(start - EPS)).gate).toBe(previous);
      expect(longitudeToActivation(normalise360(start - EPS)).line).toBe(6);
    }
  });
});

describe("longitudeToActivation — line boundaries", () => {
  it("assigns every line boundary to the line that starts there", () => {
    for (let index = 0; index < 64; index += 1) {
      const gate = GATE_WHEEL_SEQUENCE[index] as number;
      const gateStart = getGateStartLongitude(gate);

      for (let line = 1; line <= 6; line += 1) {
        const lineStart = normalise360(gateStart + (line - 1) * LINE_WIDTH_DEG);

        const at = longitudeToActivation(lineStart);
        expect(at.gate).toBe(gate);
        expect(at.line).toBe(line);

        const justAfter = longitudeToActivation(normalise360(lineStart + EPS));
        expect(justAfter.gate).toBe(gate);
        expect(justAfter.line).toBe(line);

        const justBefore = longitudeToActivation(normalise360(lineStart - EPS));
        if (line === 1) {
          expect(justBefore.gate).not.toBe(gate);
          expect(justBefore.line).toBe(6);
        } else {
          expect(justBefore.gate).toBe(gate);
          expect(justBefore.line).toBe(line - 1);
        }
      }
    }
  });
});

describe("longitudeToActivation — the 359.999 -> 0.000 wrap", () => {
  it("is continuous across 0 degrees Aries", () => {
    // 0 Aries falls inside gate 25 (which spans 358.25 -> 3.875).
    expect(longitudeToActivation(359.999999).gate).toBe(25);
    expect(longitudeToActivation(0).gate).toBe(25);
    expect(longitudeToActivation(0.000001).gate).toBe(25);
  });

  it("keeps the same line across the wrap", () => {
    const before = longitudeToActivation(359.9999999);
    const after = longitudeToActivation(0.0000001);
    expect(after.gate).toBe(before.gate);
    expect(after.line).toBe(before.line);
  });

  it("treats 360 and 0 identically", () => {
    expect(longitudeToActivation(360)).toEqual(longitudeToActivation(0));
  });

  it("handles longitudes supplied outside [0,360)", () => {
    expect(longitudeToActivation(-58).gate).toBe(longitudeToActivation(302).gate);
    expect(longitudeToActivation(662).gate).toBe(longitudeToActivation(302).gate);
  });
});

describe("lineDecimal", () => {
  it("runs from 1 at the gate start to just under 7 at the gate end", () => {
    const gate = 41;
    const start = getGateStartLongitude(gate);
    expect(longitudeToActivation(start).lineDecimal).toBeCloseTo(1, 9);
    expect(longitudeToActivation(start + GATE_WIDTH_DEG / 2).lineDecimal).toBeCloseTo(4, 9);
    expect(longitudeToActivation(start + GATE_WIDTH_DEG - EPS).lineDecimal).toBeLessThan(7);
    expect(longitudeToActivation(start + GATE_WIDTH_DEG - EPS).lineDecimal).toBeGreaterThan(6.99);
  });

  it("agrees with the integer line", () => {
    for (let deg = 0; deg < 360; deg += 0.11) {
      const { line, lineDecimal } = longitudeToActivation(deg);
      expect(Math.floor(lineDecimal)).toBe(line);
    }
  });
});
