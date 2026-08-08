import { describe, expect, it } from "vitest";

import {
  BASE_WIDTH_DEG,
  COLOR_WIDTH_DEG,
  GATE_WHEEL_ORIGIN_DEG,
  GATE_WHEEL_SEQUENCE,
  GATE_WIDTH_DEG,
  LINE_WIDTH_DEG,
  TONE_WIDTH_DEG,
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

describe("substructure: colour, tone and base", () => {
  const gateStart = getGateStartLongitude(41);

  it("subdivides a line into 6 colours, 6 tones and 5 bases", () => {
    expect(COLOR_WIDTH_DEG * 6).toBeCloseTo(LINE_WIDTH_DEG, 12);
    expect(TONE_WIDTH_DEG * 6).toBeCloseTo(COLOR_WIDTH_DEG, 12);
    expect(BASE_WIDTH_DEG * 5).toBeCloseTo(TONE_WIDTH_DEG, 12);
    // 6 lines x 6 colours x 6 tones x 5 bases = 1080 positions in a gate.
    expect(GATE_WIDTH_DEG / BASE_WIDTH_DEG).toBeCloseTo(1080, 6);
  });

  it("starts a gate at 1.1.1.1 and ends it just short of the next gate", () => {
    const first = longitudeToActivation(gateStart);
    expect([first.line, first.color, first.tone, first.base]).toEqual([1, 1, 1, 1]);

    const last = longitudeToActivation(gateStart + GATE_WIDTH_DEG - EPS);
    expect([last.line, last.color, last.tone, last.base]).toEqual([6, 6, 6, 5]);
  });

  it("walks all 1080 positions of a gate in order, without gaps or repeats", () => {
    const seen: string[] = [];
    for (let step = 0; step < 1080; step += 1) {
      // Sample the middle of each base so the test is about ordering, not
      // about floating-point behaviour exactly on the boundaries.
      const a = longitudeToActivation(gateStart + (step + 0.5) * BASE_WIDTH_DEG);
      expect(a.gate).toBe(41);
      seen.push(`${a.line}.${a.color}.${a.tone}.${a.base}`);
    }
    expect(new Set(seen).size).toBe(1080);
    expect(seen[0]).toBe("1.1.1.1");
    expect(seen[1]).toBe("1.1.1.2");
    expect(seen[5]).toBe("1.1.2.1");
    expect(seen[29]).toBe("1.1.6.5");
    expect(seen[30]).toBe("1.2.1.1");
    expect(seen[179]).toBe("1.6.6.5");
    expect(seen[180]).toBe("2.1.1.1");
    expect(seen[1079]).toBe("6.6.6.5");
  });

  it("gives a boundary to the subdivision that begins there, like gates and lines", () => {
    const onToneEdge = gateStart + TONE_WIDTH_DEG;
    expect(longitudeToActivation(onToneEdge).tone).toBe(2);
    expect(longitudeToActivation(onToneEdge - EPS).tone).toBe(1);

    const onColorEdge = gateStart + COLOR_WIDTH_DEG;
    expect(longitudeToActivation(onColorEdge).color).toBe(2);
    expect(longitudeToActivation(onColorEdge - EPS).color).toBe(1);
  });

  it("never reports an out-of-range value, anywhere on the wheel", () => {
    for (let deg = 0; deg < 360; deg += 0.017) {
      const { color, tone, base, tonePhase } = longitudeToActivation(deg);
      expect(color).toBeGreaterThanOrEqual(1);
      expect(color).toBeLessThanOrEqual(6);
      expect(tone).toBeGreaterThanOrEqual(1);
      expect(tone).toBeLessThanOrEqual(6);
      expect(base).toBeGreaterThanOrEqual(1);
      expect(base).toBeLessThanOrEqual(5);
      expect(tonePhase).toBeGreaterThanOrEqual(0);
      expect(tonePhase).toBeLessThan(1);
    }
  });

  it("tonePhase tracks the position within the tone", () => {
    expect(longitudeToActivation(gateStart).tonePhase).toBeCloseTo(0, 9);
    expect(longitudeToActivation(gateStart + TONE_WIDTH_DEG / 2).tonePhase).toBeCloseTo(0.5, 9);
  });

  /**
   * The reason "Sun and Earth" and "the Nodes" are quoted as single values in
   * the literature: opposites are 180 degrees apart, 180 / 5.625 = 32 gates
   * exactly, so they land on the identical fraction of their own gates.
   */
  it("gives a body and its opposite the same line, colour, tone and base", () => {
    for (let deg = 0; deg < 360; deg += 0.37) {
      const here = longitudeToActivation(deg);
      const opposite = longitudeToActivation(deg + 180);
      expect([opposite.line, opposite.color, opposite.tone, opposite.base]).toEqual([
        here.line,
        here.color,
        here.tone,
        here.base,
      ]);
      expect(opposite.gate).not.toBe(here.gate);
    }
  });
});
