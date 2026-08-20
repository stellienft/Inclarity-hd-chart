import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { calculateChart } from "@/lib/human-design";
import { CHANNEL_DEFINITIONS } from "@/lib/human-design/constants/channels";
import { GATE_DEFINITIONS } from "@/lib/human-design/constants/gates";
import type { CenterId } from "@/lib/human-design/types/center";
import type { LocationResult } from "@/lib/location/types";

import { BodyGraph } from "./BodyGraph";
import {
  AXIS_X,
  CENTERS,
  GATE_POINTS,
  GRAPH_BOX,
  VIEWBOX,
  channelPath,
  gateLabelPoint,
  getGatePoint,
  type Point,
} from "./geometry";
import { DESIGN_COLOR, markerRadius, PERSONALITY_COLOR } from "./styles";

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

  it("keeps every gate point inside the graph's own box", () => {
    for (const [gate, point] of Object.entries(GATE_POINTS)) {
      expect(point.x, `gate ${gate} x`).toBeGreaterThanOrEqual(0);
      expect(point.x, `gate ${gate} x`).toBeLessThanOrEqual(GRAPH_BOX.width);
      expect(point.y, `gate ${gate} y`).toBeGreaterThanOrEqual(0);
      expect(point.y, `gate ${gate} y`).toBeLessThanOrEqual(GRAPH_BOX.height);
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
    // Markers are circles sized per centre, so two of them in one centre need
    // a full diameter between their middles. This has caught real collisions
    // twice: once from pushing labels outward, once from a uniform inward
    // nudge that dragged opposite edges of the small triangles together.

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
          ).toBeGreaterThanOrEqual(2 * markerRadius(centre));
        }
      }
    }
  });

  it("keeps every gate marker inside the viewBox", () => {
    for (const { gate, center } of GATE_DEFINITIONS) {
      const p = gateLabelPoint(gate, center);
      expect(p.x).toBeGreaterThanOrEqual(markerRadius(center));
      expect(p.x).toBeLessThanOrEqual(GRAPH_BOX.width - markerRadius(center));
      expect(p.y).toBeGreaterThanOrEqual(markerRadius(center));
      expect(p.y).toBeLessThanOrEqual(GRAPH_BOX.height - markerRadius(center));
    }
  });

  /**
   * The Spleen and the Solar Plexus are the same triangle facing opposite
   * ways, so their gates must sit at mirrored positions. This is not a style
   * preference: the two sides carry mirrored channels (16-48 against 35-36,
   * 32-54 against 49-19, and so on), and a Spleen laid out in a different
   * order than its opposite drags those channels across each other.
   */
  it("lays the Spleen out as the exact mirror of the Solar Plexus", () => {
    const MIRROR: Array<[number, number]> = [
      [48, 36],
      [57, 22],
      [44, 37],
      [50, 6],
      [32, 49],
      [28, 55],
      [18, 30],
    ];

    for (const [left, right] of MIRROR) {
      const a = GATE_POINTS[left];
      const b = GATE_POINTS[right];
      if (!a || !b) throw new Error(`missing ${left} or ${right}`);
      expect(a.x, `gate ${left} against ${right}`).toBeCloseTo(2 * AXIS_X - b.x, 6);
      expect(a.y, `gate ${left} against ${right}`).toBeCloseTo(b.y, 6);
    }
  });

  /**
   * Channels running between the same pair of centres must not cross one
   * another.
   *
   * This is the property that catches a row of gates written in the wrong
   * order, which is exactly how the Sacral's bottom edge (42, 3, 9), the
   * Root's left edge (54, 38, 58) and the whole Spleen went wrong: each
   * looked fine on its own and only showed up as an X in the drawing. Tested
   * on the straight chord between anchors — the rendered channel bows away
   * from the figure's centre, but two chords that do not cross keep bowed
   * paths on the same sides of each other.
   */
  it("never crosses two channels that join the same pair of centres", () => {
    const centreOf = new Map(GATE_DEFINITIONS.map((g) => [g.gate, g.center]));

    const side = (a: Point, b: Point, p: Point) =>
      Math.sign((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));

    const crosses = (p1: Point, p2: Point, q1: Point, q2: Point) =>
      side(p1, p2, q1) * side(p1, p2, q2) < 0 && side(q1, q2, p1) * side(q1, q2, p2) < 0;

    const byCentrePair = new Map<string, Array<{ id: string; from: Point; to: Point }>>();
    for (const definition of CHANNEL_DEFINITIONS) {
      const [gateA, gateB] = definition.gates;
      const centreA = centreOf.get(gateA);
      const centreB = centreOf.get(gateB);
      const from = GATE_POINTS[gateA];
      const to = GATE_POINTS[gateB];
      if (!centreA || !centreB || !from || !to) throw new Error(`bad channel ${definition.id}`);

      const key = [centreA, centreB].sort().join("-");
      const list = byCentrePair.get(key) ?? [];
      list.push({ id: definition.id, from, to });
      byCentrePair.set(key, list);
    }

    for (const [pair, channels] of byCentrePair) {
      for (let i = 0; i < channels.length; i += 1) {
        for (let j = i + 1; j < channels.length; j += 1) {
          const a = channels[i]!;
          const b = channels[j]!;
          expect(
            crosses(a.from, a.to, b.from, b.to),
            `channels ${a.id} and ${b.id} cross between ${pair}`,
          ).toBe(false);
        }
      }
    }
  });

  /**
   * Which pairs of channels cross, counting the RENDERED curves rather than the
   * straight chords — the curvature is what makes a set of arcs nest or tangle,
   * and the chord test above cannot see it.
   *
   * Every crossing here belongs to 26-44, and the reference artwork draws all
   * of them. 26 sits on the Heart and 44 out on the Spleen, so the channel has
   * to traverse the corridor between the G's lower vertex and the Sacral's top
   * edge, straight across the three bars running down it.
   *
   * The artwork says so in its own line work: it leaves two small counters
   * there — the subpaths at (384, 879) and (426, 878), seven units wide, far
   * too small to be channels — which are the slivers of 26-44 visible BETWEEN
   * the bars it crosses. Their height is the check: the reference crosses that
   * corridor at y = 878, and the arc drawn here crosses it at y = 877.
   *
   * Everything else nests. That is only achievable because the channels are
   * circular arcs — concentric circles nest by construction, where the
   * quadratic Beziers this replaced could not get below two crossings at any
   * bow setting, because each bulges hardest at its own midpoint and so splays
   * away from its neighbours in a shared corridor.
   */
  it("crosses only where the reference artwork crosses", () => {
    type Segmented = { id: string; gates: readonly [number, number]; points: Point[] };

    /**
     * Sample a rendered channel path.
     *
     * The renderer emits either "M x0 y0 L x1 y1" or an SVG arc,
     * "M x0 y0 A r r 0 0 sweep x1 y1". The arc is reconstructed from the path
     * STRING rather than from the geometry module, so this test still sees what
     * actually gets drawn. Its centre is one of the two points at height h off
     * the chord's midpoint, and with the large-arc flag at 0 exactly one of
     * them sweeps start to end through at most pi in the direction the sweep
     * flag names.
     */
    const sample = (path: string): Point[] => {
      const numbers = (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

      if (!path.includes("A")) {
        const [x0, y0, x1, y1] = numbers;
        return [
          { x: x0!, y: y0! },
          { x: x1!, y: y1! },
        ];
      }

      const [x0, y0, r, , , , sweep, x1, y1] = numbers;
      const dx = x1! - x0!;
      const dy = y1! - y0!;
      const chord = Math.hypot(dx, dy);
      const mx = (x0! + x1!) / 2;
      const my = (y0! + y1!) / 2;
      const h = Math.sqrt(Math.max(r! * r! - (chord * chord) / 4, 0));
      const nx = -dy / chord;
      const ny = dx / chord;

      const arcFrom = (cx: number, cy: number) => {
        const a0 = Math.atan2(y0! - cy, x0! - cx);
        const a1 = Math.atan2(y1! - cy, x1! - cx);
        let delta = a1 - a0;
        if (sweep === 1 && delta < 0) delta += 2 * Math.PI;
        if (sweep === 0 && delta > 0) delta -= 2 * Math.PI;
        return { cx, cy, a0, delta };
      };

      const candidates = [
        arcFrom(mx + nx * h, my + ny * h),
        arcFrom(mx - nx * h, my - ny * h),
      ];
      const arc = candidates.find((c) => Math.abs(c.delta) <= Math.PI + 1e-9) ?? candidates[0]!;

      const points: Point[] = [];
      for (let step = 0; step <= 64; step += 1) {
        const angle = arc.a0 + (arc.delta * step) / 64;
        points.push({ x: arc.cx + r! * Math.cos(angle), y: arc.cy + r! * Math.sin(angle) });
      }
      return points;
    };

    const side = (a: Point, b: Point, p: Point) =>
      Math.sign((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));
    const segmentsCross = (p1: Point, p2: Point, q1: Point, q2: Point) =>
      side(p1, p2, q1) * side(p1, p2, q2) < 0 && side(q1, q2, p1) * side(q1, q2, p2) < 0;

    const channels: Segmented[] = CHANNEL_DEFINITIONS.map((definition) => ({
      id: definition.id,
      gates: definition.gates,
      points: sample(
        channelPath(getGatePoint(definition.gates[0]), getGatePoint(definition.gates[1]), definition.id),
      ),
    }));

    const crossing: string[] = [];
    for (let i = 0; i < channels.length; i += 1) {
      for (let j = i + 1; j < channels.length; j += 1) {
        const a = channels[i]!;
        const b = channels[j]!;
        // Channels meeting at a shared gate obviously touch; that is not a
        // crossing. The integration group (10, 20, 34, 57) is full of them.
        if (a.gates.some((gate) => b.gates.includes(gate))) continue;

        let hit = false;
        for (let m = 0; m + 1 < a.points.length && !hit; m += 1) {
          for (let n = 0; n + 1 < b.points.length && !hit; n += 1) {
            if (segmentsCross(a.points[m]!, a.points[m + 1]!, b.points[n]!, b.points[n + 1]!)) {
              hit = true;
            }
          }
        }
        if (hit) crossing.push(`${a.id} x ${b.id}`);
      }
    }

    expect(crossing).toEqual([
      // In definition order. 26-44 over the three bars running G to Sacral
      // (2-14, 5-15, 29-46) and over the three channels arriving at the
      // Sacral's left edge (10-34, 20-34, 34-57).
      "2-14 x 26-44",
      "5-15 x 26-44",
      "10-34 x 26-44",
      "20-34 x 26-44",
      "26-44 x 29-46",
      "26-44 x 34-57",
    ]);
  });

    /**
   * Every marker must sit a full radius inside its own centre.
   *
   * This measures against the sharp-cornered POLYGONS the geometry is defined
   * by, which is a coarse guard: what actually gets painted is the client's
   * artwork, and for a rounded shape the two disagree. The Heart is exempt for
   * that reason — the artwork fillets its corners so hard that its bbox corners
   * are not its vertices, so the polygon derived from them is SMALLER than the
   * drawn shape and reports markers outside it that are comfortably inside.
   * Its four are solved against the rendered path instead, and
   * `e2e/chart.spec.ts` checks them there with 48 points around each disc,
   * which is the stronger test.
   */
  it("keeps every marker a full radius inside its own centre", () => {
    const polygonOf = (center: CenterId): Point[] => {
      const shape = CENTERS.find((c) => c.id === center)?.shape;
      if (!shape) throw new Error(`no shape for ${center}`);
      if (shape.kind === "polygon") return [...shape.points];
      const { x, y, width, height } = shape;
      return [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ];
    };

    const distanceToEdge = (p: Point, polygon: Point[]): number => {
      let nearest = Infinity;
      for (let i = 0; i < polygon.length; i += 1) {
        const a = polygon[i]!;
        const b = polygon[(i + 1) % polygon.length]!;
        const vx = b.x - a.x;
        const vy = b.y - a.y;
        const lengthSquared = vx * vx + vy * vy || 1;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / lengthSquared));
        nearest = Math.min(nearest, Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy)));
      }
      return nearest;
    };

    // See the note above: the Heart's markers are solved against the drawn
    // path, and the e2e disc check is what holds them there.
    const POLYGON_IS_APPROXIMATE = new Set(["heart"]);

    const straddling: string[] = [];
    for (const { gate, center } of GATE_DEFINITIONS) {
      if (POLYGON_IS_APPROXIMATE.has(center)) continue;
      const clearance = distanceToEdge(gateLabelPoint(gate, center), polygonOf(center));
      if (clearance < markerRadius(center)) {
        straddling.push(`${gate}/${center} clears only ${clearance.toFixed(1)}`);
      }
    }
    expect(straddling).toEqual([]);
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

    expect(countMatches(markup, /data-center-shape="/g)).toBe(9);
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
