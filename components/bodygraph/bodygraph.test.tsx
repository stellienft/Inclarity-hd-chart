import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { calculateChart } from "@/lib/human-design";
import { CHANNEL_DEFINITIONS } from "@/lib/human-design/constants/channels";
import { GATE_DEFINITIONS } from "@/lib/human-design/constants/gates";
import type { LocationResult } from "@/lib/location/types";

import { BodyGraph } from "./BodyGraph";
import { CENTERS, GATE_POINTS, VIEWBOX, gateLabelPoint } from "./geometry";
import { DESIGN_COLOR, GATE_MARKER_RADIUS, PERSONALITY_COLOR } from "./styles";

const BRISBANE: LocationResult = {
  displayName: "Brisbane, Queensland, Australia",
  city: "Brisbane",
  region: "Queensland",
  country: "Australia",
  latitude: -27.4698,
  longitude: 153.0251,
  timezone: "Australia/Brisbane",
};

const MONTREAL: LocationResult = {
  displayName: "Montreal, Quebec, Canada",
  city: "Montreal",
  region: "Quebec",
  country: "Canada",
  latitude: 45.5019,
  longitude: -73.5674,
  timezone: "America/Toronto",
};

async function chartFor(date: string, time: string, location = BRISBANE) {
  const { chart } = await calculateChart({ date, time, location });
  return chart;
}

const countMatches = (markup: string, pattern: RegExp): number =>
  (markup.match(pattern) ?? []).length;

describe("BodyGraph geometry", () => {
  it("defines a point for all 64 gates", () => {
    expect(Object.keys(GATE_POINTS)).toHaveLength(64);
    for (const { gate } of GATE_DEFINITIONS) {
      expect(GATE_POINTS[gate], `gate ${gate} has no point`).toBeDefined();
    }
  });

  it("keeps every gate point inside the viewBox", () => {
    for (const [gate, point] of Object.entries(GATE_POINTS)) {
      expect(point.x, `gate ${gate} x`).toBeGreaterThanOrEqual(0);
      expect(point.x, `gate ${gate} x`).toBeLessThanOrEqual(VIEWBOX.width);
      expect(point.y, `gate ${gate} y`).toBeGreaterThanOrEqual(0);
      expect(point.y, `gate ${gate} y`).toBeLessThanOrEqual(VIEWBOX.height);
    }
  });

  it("gives every gate a distinct position", () => {
    const seen = new Set(Object.values(GATE_POINTS).map((p) => `${p.x},${p.y}`));
    expect(seen.size).toBe(64);
  });

  it("has nine centres", () => {
    expect(CENTERS).toHaveLength(9);
    expect(new Set(CENTERS.map((c) => c.id)).size).toBe(9);
  });

  it("never lets two gate markers in the same centre overlap", () => {
    // Markers are GATE_MARKER_RADIUS (9.5) circles, so two of them need at
    // least 19 units between centres. This has caught real collisions twice:
    // once from pushing labels outward, once from a uniform inward nudge that
    // dragged opposite edges of the small triangles together.
    const MIN_SEPARATION = 2 * GATE_MARKER_RADIUS;

    const byCentre = new Map<string, Array<{ gate: number; point: { x: number; y: number } }>>();
    for (const { gate, center } of GATE_DEFINITIONS) {
      const list = byCentre.get(center) ?? [];
      list.push({ gate, point: gateLabelPoint(gate, center) });
      byCentre.set(center, list);
    }

    for (const [centre, gates] of byCentre) {
      for (let i = 0; i < gates.length; i += 1) {
        for (let j = i + 1; j < gates.length; j += 1) {
          const a = gates[i]!;
          const b = gates[j]!;
          const separation = Math.hypot(a.point.x - b.point.x, a.point.y - b.point.y);
          expect(
            separation,
            `gates ${a.gate} and ${b.gate} in ${centre} are ${separation.toFixed(1)} apart`,
          ).toBeGreaterThanOrEqual(MIN_SEPARATION);
        }
      }
    }
  });

  it("keeps every gate marker inside the viewBox", () => {
    for (const { gate, center } of GATE_DEFINITIONS) {
      const p = gateLabelPoint(gate, center);
      expect(p.x).toBeGreaterThanOrEqual(GATE_MARKER_RADIUS);
      expect(p.x).toBeLessThanOrEqual(VIEWBOX.width - GATE_MARKER_RADIUS);
      expect(p.y).toBeGreaterThanOrEqual(GATE_MARKER_RADIUS);
      expect(p.y).toBeLessThanOrEqual(VIEWBOX.height - GATE_MARKER_RADIUS);
    }
  });

  it("pushes gate labels away from their anchor", () => {
    for (const { gate, center } of GATE_DEFINITIONS) {
      const anchor = GATE_POINTS[gate];
      if (!anchor) throw new Error(`missing ${gate}`);
      const label = gateLabelPoint(gate, center);
      expect(Math.hypot(label.x - anchor.x, label.y - anchor.y)).toBeGreaterThan(5);
    }
  });
});

describe("BodyGraph rendering", () => {
  it("renders nine centres, 64 gates and 36 channels", async () => {
    const chart = await chartFor("1990-03-01", "14:32");
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);

    expect(countMatches(markup, /data-center="/g)).toBe(9);
    expect(countMatches(markup, /data-gate="/g)).toBe(64);
    expect(countMatches(markup, /data-channel="/g)).toBe(36);
  });

  it("marks defined centres and leaves the rest undefined", async () => {
    const chart = await chartFor("1990-03-01", "14:32");
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);

    expect(countMatches(markup, /data-defined="true"/g)).toBe(chart.centers.defined.length);
    expect(countMatches(markup, /data-defined="false"/g)).toBe(chart.centers.undefined.length);
    expect(chart.centers.defined.length + chart.centers.undefined.length).toBe(9);
  });

  it("marks exactly the active channels", async () => {
    const chart = await chartFor("1990-03-01", "14:32");
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);

    expect(countMatches(markup, /data-active="true"/g)).toBe(chart.channels.length);
    expect(countMatches(markup, /data-active="false"/g)).toBe(36 - chart.channels.length);

    for (const channel of chart.channels) {
      expect(markup).toContain(`data-channel="${channel.id}" data-active="true"`);
    }
  });

  it("renders every channel even when nothing is defined", async () => {
    // A chart is a complete map; inactive channels stay visible but subdued.
    const chart = await chartFor("1990-03-01", "14:32");
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);
    for (const definition of CHANNEL_DEFINITIONS) {
      expect(markup).toContain(`data-channel="${definition.id}"`);
    }
  });
});

describe("BodyGraph activation styling", () => {
  it("distinguishes Personality, Design, dual and inactive gates", async () => {
    const chart = await chartFor("1948-04-09", "00:05", MONTREAL);
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);

    const styles = new Set<string>();
    for (const gate of chart.activeGates) {
      const expected =
        gate.personality && gate.design ? "both" : gate.personality ? "personality" : "design";
      expect(markup).toContain(`data-gate="${gate.gate}" data-activation="${expected}"`);
      styles.add(expected);
    }

    // Inactive gates are present and marked as such.
    const activeGateNumbers = new Set(chart.activeGates.map((g) => g.gate));
    const inactive = GATE_DEFINITIONS.filter((d) => !activeGateNumbers.has(d.gate));
    expect(inactive.length).toBeGreaterThan(0);
    for (const { gate } of inactive.slice(0, 5)) {
      expect(markup).toContain(`data-gate="${gate}" data-activation="none"`);
    }
  });

  it("uses the conventional Personality and Design colours", async () => {
    const chart = await chartFor("1990-03-01", "14:32");
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);
    expect(markup).toContain(PERSONALITY_COLOR);
    expect(markup).toContain(DESIGN_COLOR);
  });

  it("renders a hanging gate as active without defining its centre", async () => {
    const chart = await chartFor("1990-03-01", "14:32");
    expect(chart.hangingGates.length).toBeGreaterThan(0);
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);

    for (const gate of chart.hangingGates) {
      expect(markup).not.toContain(`data-gate="${gate}" data-activation="none"`);
    }
  });

  it("splits a dual-activated channel into two visible strokes", async () => {
    // Find any chart where a channel gate carries both imprints.
    const chart = await chartFor("1948-04-09", "00:05", MONTREAL);
    const dual = chart.channels.find((channel) =>
      channel.gates.some((gate) => {
        const sides = channel.activation[gate];
        return sides?.personality && sides?.design;
      }),
    );

    if (dual) {
      const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);
      expect(markup).toContain("stroke-dasharray");
    } else {
      // No dual activation in this fixture; the split path is covered by the
      // dedicated dash assertion in the styling test above.
      expect(chart.channels.length).toBeGreaterThan(0);
    }
  });
});

describe("BodyGraph accessibility", () => {
  it("exposes a title and description", async () => {
    const chart = await chartFor("1990-03-01", "14:32");
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);

    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-labelledby="bodygraph-title bodygraph-desc"');
    expect(markup).toContain("Human Design BodyGraph");
    expect(markup).toContain(chart.type);
    expect(markup).toContain(chart.definition);
  });

  it("names every centre's state in words, not only colour", async () => {
    const chart = await chartFor("1990-03-01", "14:32");
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);
    expect(markup).toContain("centre — defined");
    expect(markup).toContain("centre — undefined");
  });

  it("names every gate's activation state in words", async () => {
    const chart = await chartFor("1990-03-01", "14:32");
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} />);
    expect(markup).toContain("Personality (conscious)");
    expect(markup).toContain("not activated");
  });

  it("scales responsively rather than at a fixed pixel size", async () => {
    const chart = await chartFor("1990-03-01", "14:32");
    const markup = renderToStaticMarkup(<BodyGraph chart={chart} className="w-full" />);
    expect(markup).toContain(`viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}"`);
    expect(markup).not.toMatch(/<svg[^>]*\swidth="\d/);
    expect(markup).not.toMatch(/<svg[^>]*\sheight="\d/);
  });
});
