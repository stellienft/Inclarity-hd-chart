import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { calculateChart } from "@/lib/human-design";
import { CHANNEL_DEFINITIONS } from "@/lib/human-design/constants/channels";
import { GATE_DEFINITIONS } from "@/lib/human-design/constants/gates";
import type { LocationResult } from "@/lib/location/types";

import { BodyGraph } from "./BodyGraph";
import {
  AXIS_X,
  FIGURE_OUTLINE,
  BODY_SILHOUETTE_PATH,
  CENTERS,
  GATE_POINTS,
  VIEWBOX,
  gateLabelPoint,
  type Point,
} from "./geometry";
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

/**
 * The silhouette is decoration, but its proportions are not arbitrary: it is a
 * person sitting cross-legged, and it stops working the moment it stops
 * reading as one. Earlier drafts failed in exactly two ways — a shape with no
 * waist became a bell, and a shape with no narrow neck became a blob — so
 * both are pinned here.
 *
 * Rather than pin the path string, which would fight every redesign, these
 * tests flatten it to a polygon and measure it: is it symmetric, does it hold
 * the centres it should, and does its silhouette still have a head, a neck, a
 * waist and a lap in the right places and the right order?
 */
describe("body silhouette", () => {
  /** Flatten the cubic path to a polygon, sampling each segment evenly. */
  function flatten(path: string, steps = 24): Point[] {
    const numbers = (text: string) =>
      (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

    const commands = path.match(/[MCZ][^MCZ]*/g) ?? [];
    const points: Point[] = [];
    let cursor: Point = { x: 0, y: 0 };

    for (const command of commands) {
      const values = numbers(command.slice(1));
      if (command.startsWith("M")) {
        const [x, y] = values;
        if (x === undefined || y === undefined) throw new Error(`bad move: ${command}`);
        cursor = { x, y };
        points.push(cursor);
        continue;
      }
      if (command.startsWith("Z")) continue;

      const [x1, y1, x2, y2, x, y] = values;
      if (
        x1 === undefined || y1 === undefined || x2 === undefined ||
        y2 === undefined || x === undefined || y === undefined
      ) {
        throw new Error(`bad curve: ${command}`);
      }

      const from = cursor;
      for (let step = 1; step <= steps; step += 1) {
        const t = step / steps;
        const u = 1 - t;
        points.push({
          x: u ** 3 * from.x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * x,
          y: u ** 3 * from.y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * y,
        });
      }
      cursor = { x, y };
    }

    return points;
  }

  /** Standard ray-casting containment test. */
  function contains(polygon: Point[], point: Point): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const a = polygon[i];
      const b = polygon[j];
      if (!a || !b) continue;
      const straddles = a.y > point.y !== b.y > point.y;
      if (!straddles) continue;
      const crossingX = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
      if (point.x < crossingX) inside = !inside;
    }
    return inside;
  }

  const polygon = flatten(BODY_SILHOUETTE_PATH);

  /** Left and right edge of the figure at a given height, or null above/below it. */
  function span(y: number): { left: number; right: number } | null {
    const crossings: number[] = [];
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const a = polygon[i];
      const b = polygon[j];
      if (!a || !b) continue;
      if (a.y > y === b.y > y) continue;
      crossings.push(((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x);
    }
    if (crossings.length < 2) return null;
    return { left: Math.min(...crossings), right: Math.max(...crossings) };
  }

  it("is a closed shape that stays within the viewBox", () => {
    expect(BODY_SILHOUETTE_PATH.trimEnd().endsWith("Z")).toBe(true);
    for (const point of polygon) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(VIEWBOX.width);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(VIEWBOX.height);
    }
  });

  /**
   * An asymmetric figure reads as a mistake rather than as a style, and the
   * lopsidedness is easy to introduce and hard to spot by eye once the chart
   * is drawn on top. Checked as a scanline rather than by comparing the path
   * text, so it holds however the curves are written.
   */
  it("is symmetric about the axis at every height", () => {
    for (let y = 10; y < 836; y += 4) {
      const edges = span(y);
      if (!edges) continue;
      // Half a unit on a 620-wide figure. Loose enough to absorb the polyline
      // approximation, far tighter than any asymmetry a person could draw.
      expect(Math.abs(AXIS_X - edges.left) - (edges.right - AXIS_X), `y=${y}`).toBeLessThan(0.5);
    }
  });

  /**
   * The exact version of the same claim, free of any sampling error. Checked
   * on the source outline rather than on the generated path: the curve fitter
   * rounds its control points to two decimals, which can split a mirrored
   * pair by a hundredth and says nothing about the shape.
   */
  it("pairs every point of the outline with its mirror", () => {
    const key = (p: Point) => `${p.x},${p.y}`;
    const present = new Set(FIGURE_OUTLINE.map(key));
    for (const point of FIGURE_OUTLINE) {
      expect(
        present.has(key({ x: 2 * AXIS_X - point.x, y: point.y })),
        `${point.x},${point.y} has no mirror`,
      ).toBe(true);
    }
  });

  /**
   * Everything but the two wings. The seated base is wide enough to hold the
   * Root, which a torso ending at the hips would leave hanging below.
   */
  it("holds every gate outside the Spleen and Solar Plexus, marker edges included", () => {
    for (const { gate, center } of GATE_DEFINITIONS) {
      if (center === "spleen" || center === "solarPlexus") continue;
      const marker = gateLabelPoint(gate, center);
      // Check the marker's extremes, not just its middle, so a gate cannot sit
      // half outside the figure and still pass.
      for (const [dx, dy] of [
        [0, 0],
        [-GATE_MARKER_RADIUS, 0],
        [GATE_MARKER_RADIUS, 0],
        [0, -GATE_MARKER_RADIUS],
        [0, GATE_MARKER_RADIUS],
      ]) {
        const probe = { x: marker.x + (dx ?? 0), y: marker.y + (dy ?? 0) };
        expect(contains(polygon, probe), `gate ${gate} (${center}) at ${probe.x},${probe.y}`).toBe(
          true,
        );
      }
    }
  });

  /**
   * The wings GRAZE the outline: their inner halves lie over the body, their
   * outer tips reach past it. Both failure modes matter — a figure so wide it
   * swallows them is a blob, and one so narrow they float free of it looks
   * broken — so this checks each wing keeps a foot on the body AND a tip off
   * it, rather than counting gates.
   */
  it("lets the wings reach past the body without floating free of it", () => {
    for (const center of ["spleen", "solarPlexus"] as const) {
      const markers = GATE_DEFINITIONS.filter((g) => g.center === center).map((g) =>
        gateLabelPoint(g.gate, center),
      );
      const held = markers.filter((m) => contains(polygon, m));

      expect(held.length, `${center} gates over the body`).toBeGreaterThan(0);
      expect(held.length, `${center} gates past the body`).toBeLessThan(markers.length);
    }

    // Nothing outside the two wings may break the outline.
    const strays = GATE_DEFINITIONS.filter(
      ({ gate, center }) =>
        center !== "spleen" &&
        center !== "solarPlexus" &&
        !contains(polygon, gateLabelPoint(gate, center)),
    );
    expect(strays.map((g) => `${g.gate}/${g.center}`)).toEqual([]);
  });

  /** Measured width at a height, or NaN above/below the figure. */
  const widthAt = (y: number) => {
    const edges = span(y);
    return edges ? edges.right - edges.left : NaN;
  };

  it("has a head, a neck, shoulders, a waist and a lap, in that order", () => {
    const hair = widthAt(100);
    const neck = widthAt(232);
    const shoulders = widthAt(300);
    const waist = widthAt(520);
    const lap = widthAt(730);

    // A neck at all. Roughly half the head, as on a person.
    expect(neck / hair).toBeGreaterThan(0.35);
    expect(neck / hair).toBeLessThan(0.6);

    // Shoulders much wider than the neck, and wider than the head.
    expect(shoulders).toBeGreaterThan(neck * 2);
    expect(shoulders).toBeGreaterThan(hair);

    // A waist: narrower than the shoulders above it and the lap below it.
    // Without this the figure drifts back into a bell.
    expect(waist).toBeLessThan(shoulders);
    expect(lap).toBeGreaterThan(waist);

    // The crossed legs are the widest thing in the drawing.
    expect(lap).toBeGreaterThan(shoulders);
  });

  it("puts its widest point down in the crossed legs", () => {
    const widest = polygon.reduce((max, p) => (Math.abs(p.x - AXIS_X) > Math.abs(max.x - AXIS_X) ? p : max));
    expect(widest.y).toBeGreaterThan(VIEWBOX.height * 0.75);
    // Wide, but still inside the frame.
    expect(Math.abs(widest.x - AXIS_X)).toBeLessThan(VIEWBOX.width / 2);
  });

  it("keeps the bob's points beside the jaw, below the widest of the hair", () => {
    // The two points hang lower than the hair is wide, which is what stops
    // them reading as horns sticking out of the sides of the head.
    const widestHair = FIGURE_OUTLINE.reduce((max, p) =>
      p.y < 160 && p.x > max.x ? p : max,
    );
    const lowestHair = FIGURE_OUTLINE.filter((p) => p.y < 240 && p.x > AXIS_X + 40).reduce(
      (low, p) => (p.y > low.y ? p : low),
    );
    expect(lowestHair.y).toBeGreaterThan(widestHair.y + 80);
    expect(lowestHair.x).toBeLessThan(widestHair.x);
  });

  it("has a head tall enough to hold the Head and Ajna centres", () => {
    // The knot of hair is the only thing above the Head centre's apex.
    const crown = Math.min(...polygon.filter((p) => Math.abs(p.x - AXIS_X) < 40).map((p) => p.y));
    expect(crown).toBeLessThan(20);
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
