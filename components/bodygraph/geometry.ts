import type { VariablePosition } from "@/lib/human-design/derive/variable";
import type { CenterId } from "@/lib/human-design/types/center";

/**
 * ============================================================================
 *  BODYGRAPH GEOMETRY
 * ============================================================================
 *
 * Pure coordinates. This module imports no calculation logic and the
 * calculation engine imports nothing from here — the two are joined only in
 * the React components, which read a chart and look positions up by gate
 * number.
 *
 * The arrangement is the standard nine-centre BodyGraph, drawn from scratch as
 * original geometry. No proprietary chart artwork was traced or copied.
 *
 * PROPORTIONS AND LAYOUT come from the reference BodyGraph artwork supplied
 * by the client (813 x 1370.3 Illustrator export). Its nine centre shapes were
 * measured off the file — bounding boxes, vertices and a 30-unit corner
 * radius — and are reproduced here symmetrised about the vertical axis, since
 * the drawing wobbles by a unit or two either side of centre and the Spleen
 * and Solar Plexus must mirror each other exactly.
 *
 * CHANNELS come from it too. The artwork is line art, so what it contains are
 * white regions between strokes: a bundle of n channels leaves 2n-1 of them,
 * n track interiors alternating with n-1 gaps. Counted that way the file holds
 * exactly 36 channels, which is the whole point — five regions between the
 * Head and the Ajna is three channels, not five. (An earlier reading of this
 * file took each region for a channel, concluded the drawing was decorative,
 * and routed the channels independently. That was wrong.)
 *
 * The channels are drawn here as CIRCULAR ARCS with radii solved from the
 * artwork, which is what makes the two drawings match: see
 * CHANNEL_ARC_RADIUS.
 */

/**
 * The graph's OWN coordinate space — the reference artwork's, unchanged. Every
 * centre, gate and channel in this module is expressed in it.
 */
export const GRAPH_BOX = { width: 813, height: 1370.3 } as const;

/**
 * The frame the whole drawing is composed in.
 *
 * Shorter than the graph's own space, because the graph is scaled down inside
 * it: the figure is what sets the height, and leaving the graph's full 1370
 * left a fifth of the picture empty below the Root.
 */
export const VIEWBOX = { width: 813, height: 1010 } as const;

/**
 * How the graph sits inside the viewBox, against the figure.
 *
 * The graph is drawn at full size in its own coordinates and then scaled down
 * as a group, so every number in this module stays in the artwork's own space
 * and only one value governs the composition. At 1.0 the graph filled the
 * frame and dwarfed the silhouette. At 0.68 it is 932 tall against the
 * figure's 992, so the head and shoulders stand clear above and around it and
 * the Root sits just inside the base — which is how a conventional chart is
 * laid out.
 */
export const GRAPH_SCALE = 0.68;
export const GRAPH_ORIGIN = {
  x: (VIEWBOX.width - GRAPH_BOX.width * GRAPH_SCALE) / 2,
  y: 40,
} as const;

/** The transform that places the graph group inside the viewBox. */
export function graphTransformAttr(): string {
  return `translate(${GRAPH_ORIGIN.x.toFixed(2)} ${GRAPH_ORIGIN.y}) scale(${GRAPH_SCALE})`;
}

/** Vertical axis of the graph. Long channels bow away from it. */
export const AXIS_X = 405.5;
/** Visual centre of mass, used to decide which way a channel bows. */
const FIGURE_CENTER = { x: 405.5, y: 760 } as const;

export interface Point {
  x: number;
  y: number;
}

export type CenterShape =
  | { kind: "polygon"; points: Point[] }
  | { kind: "rect"; x: number; y: number; width: number; height: number };

export interface CenterGeometry {
  id: CenterId;
  shape: CenterShape;
}

/* -------------------------------------------------------------------------- */
/*  Centres                                                                    */
/* -------------------------------------------------------------------------- */

/*
 * The nine centres, measured off the reference artwork.
 *
 * Each shape is given as its sharp-cornered polygon or rectangle; the 30-unit
 * rounding the drawing uses is applied when the path is generated, so one set
 * of numbers drives both the picture and the gate maths.
 *
 * Everything lateral is symmetric about AXIS_X. The Heart is the exception by
 * nature — it is an off-axis centre, sitting in the pocket between the G's
 * lower-right edge and the Solar Plexus.
 */
const HEAD = {
  apex: { x: 405.5, y: 6.8 },
  left: { x: 320.4, y: 155.4 },
  right: { x: 490.6, y: 155.4 },
};
const AJNA = {
  left: { x: 320.1, y: 215.4 },
  right: { x: 490.9, y: 215.4 },
  apex: { x: 405.5, y: 360.4 },
};
const THROAT = { x: 323.75, y: 453, width: 163.5, height: 155.4 };
const G = {
  top: { x: 405.5, y: 652.1 },
  right: { x: 509.5, y: 753.5 },
  bottom: { x: 405.5, y: 855 },
  left: { x: 301.5, y: 753.5 },
};
/*
 * The Heart, as the artwork actually draws it: a TILTED triangle, well right
 * of and below where this had it.
 *
 * The vertices are the intersections of the three straight edges, recovered
 * from where each corner fillet begins and ends, because the drawing rounds
 * them and a bounding box therefore does not give the corners. For a long
 * while this was the wrong shape entirely — subpath 32 was taken for the
 * Heart, and it is the background wedge beside it.
 */
const HEART = {
  top: { x: 613.4, y: 786.4 },
  left: { x: 501.2, y: 887.5 },
  bottomRight: { x: 675.2, y: 921.4 },
};
const SPLEEN = {
  top: { x: 6.4, y: 943.1 },
  apex: { x: 170.9, y: 1034.1 },
  bottom: { x: 6.4, y: 1125 },
};
const SOLAR = {
  top: { x: 804.6, y: 943.1 },
  apex: { x: 640.1, y: 1034.1 },
  bottom: { x: 804.6, y: 1125 },
};
const SACRAL = { x: 323.8, y: 968.3, width: 163.4, height: 158.6 };
const ROOT = { x: 323.9, y: 1195, width: 163.2, height: 168.8 };

export const CENTERS: readonly CenterGeometry[] = [
  { id: "head", shape: { kind: "polygon", points: [HEAD.apex, HEAD.right, HEAD.left] } },
  { id: "ajna", shape: { kind: "polygon", points: [AJNA.left, AJNA.right, AJNA.apex] } },
  { id: "throat", shape: { kind: "rect", ...THROAT } },
  { id: "g", shape: { kind: "polygon", points: [G.top, G.right, G.bottom, G.left] } },
  {
    id: "heart",
    shape: { kind: "polygon", points: [HEART.top, HEART.bottomRight, HEART.left] },
  },
  { id: "spleen", shape: { kind: "polygon", points: [SPLEEN.top, SPLEEN.apex, SPLEEN.bottom] } },
  {
    id: "solarPlexus",
    shape: { kind: "polygon", points: [SOLAR.top, SOLAR.apex, SOLAR.bottom] },
  },
  { id: "sacral", shape: { kind: "rect", ...SACRAL } },
  { id: "root", shape: { kind: "rect", ...ROOT } },
] as const;

/* -------------------------------------------------------------------------- */
/*  Gate anchor points                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Every gate sits on its centre's boundary, on the side facing the centre its
 * channel travels to, so the two ends of a channel always face each other.
 */
export const GATE_POINTS: Readonly<Record<number, Point>> = {
  /*
   * Three columns run the length of the graph, at AXIS_X and 42.3 either side.
   * They are the artwork's own: the drawing's vertical bars between the Head
   * and the Ajna, the Ajna and the Throat, the Throat and the G, the G and the
   * Sacral, and the Sacral and the Root all sit on these centre-lines, so
   * every stacked channel is a straight vertical the way the reference draws
   * it. Only gates whose channel leaves the column sit anywhere else.
   */

  // Head — bottom edge, facing the Ajna.
  64: { x: 363.2, y: 155.4 },
  61: { x: 405.5, y: 155.4 },
  63: { x: 447.8, y: 155.4 },

  // Ajna — top edge faces the Head; the lower slopes face the Throat. 17 and
  // 11 sit where the outer columns cross those slopes, 43 on the apex.
  47: { x: 363.2, y: 215.4 },
  24: { x: 405.5, y: 215.4 },
  4: { x: 447.8, y: 215.4 },
  17: { x: 363.2, y: 288.6 },
  43: { x: 405.5, y: 360.4 },
  11: { x: 447.8, y: 288.6 },

  // Throat — top to the Ajna, bottom to the G, sides outward.
  62: { x: 363.2, y: 453 },
  23: { x: 405.5, y: 453 },
  56: { x: 447.8, y: 453 },
  // The side gates pair off across the centre: 16 opposite 35, 20 opposite 12.
  // 45 hangs below them with nothing facing it, which is how a conventional
  // chart draws the Throat, and it is where the artwork starts its long sweep
  // out to the right and down into the Heart.
  16: { x: 323.8, y: 496 },
  20: { x: 323.8, y: 530 },
  35: { x: 487.2, y: 496 },
  12: { x: 487.2, y: 530 },
  45: { x: 487.2, y: 564 },
  31: { x: 363.2, y: 608.4 },
  8: { x: 405.5, y: 608.4 },
  33: { x: 447.8, y: 608.4 },

  // G — diamond; 7/13 and 15/46 sit where the outer columns cross its edges,
  // 10 and 25 on the side vertices, 1 and 2 on the top and bottom.
  1: { x: 405.5, y: 652.1 },
  7: { x: 363.2, y: 693.3 },
  13: { x: 447.8, y: 693.3 },
  10: { x: 301.5, y: 753.5 },
  25: { x: 509.5, y: 753.5 },
  15: { x: 363.2, y: 813.7 },
  46: { x: 447.8, y: 813.7 },
  2: { x: 405.5, y: 855 },

  /*
   * Heart / Ego — read around the triangle the way the reference template
   * draws it: 21 at the top vertex, 51 partway down the upper-left edge, then
   * 26 and 40 on the two lower edges.
   *
   * That order is what keeps the four channels untangled. 21 meets the Throat
   * at 45 and 51 the G at 25 — both up and to the left, but 45 sits a hundred
   * and eighty units higher, so the gate reaching it has to start higher too
   * or the two arcs swap sides. Below them 26 leaves for the Spleen's 44, far
   * out to the left, and 40 for the Solar Plexus's 37, out to the right, so
   * they part company at once.
   *
   * 26 is the one gate that cannot take the template's position. The template
   * puts it on the left vertex; from there its channel to 44 has to cross the
   * column at x = 447.8, where 29-46 runs as a straight vertical, and it has
   * only the width of the Heart in which to drop clear. It sits instead at the
   * first position down the lower edge that the crossing test passes, as far
   * toward the vertex as the drawing allows.
   */
  21: { x: 608, y: 797 },
  51: { x: 575, y: 818 },
  26: { x: 521.5, y: 882 },
  40: { x: 659, y: 912 },

  /*
   * Spleen — the exact mirror of the Solar Plexus, and it has to be. Read
   * around the perimeter from the top corner: 48, 57, 44 down the upper edge
   * at quarter, half and three-quarters, 50 at the apex, then 32, 28, 18 back
   * along the lower edge at the same fractions.
   *
   * That order is forced by the channels, not chosen. Going up: 48 meets the
   * Throat at 16, 57 the Throat at 20, 44 the Heart at 26 — targets that get
   * progressively lower, so the gates must too or their channels cross. Going
   * down: 32 meets the Root at 54, 28 at 38, 18 at 58, which sit in that order
   * down the Root's left edge.
   */
  48: { x: 47.5, y: 965.9 },
  57: { x: 88.7, y: 988.6 },
  44: { x: 129.8, y: 1011.4 },
  50: { x: 170.9, y: 1034.1 },
  32: { x: 129.8, y: 1056.8 },
  28: { x: 88.7, y: 1079.6 },
  18: { x: 47.5, y: 1102.3 },

  // Solar Plexus — upper edge to Throat/Heart, lower edge to the Root.
  36: { x: 763.5, y: 965.9 },
  22: { x: 722.3, y: 988.6 },
  37: { x: 681.2, y: 1011.4 },
  6: { x: 640.1, y: 1034.1 },
  49: { x: 681.2, y: 1056.8 },
  55: { x: 722.3, y: 1079.6 },
  30: { x: 763.5, y: 1102.3 },

  /*
   * Sacral — 34 belongs on the LEFT edge, not in the top row: all three of its
   * channels (57, 10, 20) run up and to the left.
   *
   * The bottom row reads 42, 3, 9 left to right so that it lines up with the
   * Root's 53, 60, 52 and the three channels drop straight down the columns.
   * Reversed, they cross in an X below the centre.
   */
  5: { x: 363.2, y: 968.3 },
  14: { x: 405.5, y: 968.3 },
  29: { x: 447.8, y: 968.3 },
  34: { x: 323.8, y: 1016.4 },
  27: { x: 323.8, y: 1082.1 },
  59: { x: 487.2, y: 1082.1 },
  42: { x: 363.2, y: 1126.9 },
  3: { x: 405.5, y: 1126.9 },
  9: { x: 447.8, y: 1126.9 },

  /*
   * Root — the left edge runs 54, 38, 58 downward to meet the Spleen's 32, 28,
   * 18, mirroring 19, 39, 41 against the Solar Plexus's 49, 55, 30. Swapping
   * 54 and 58, as an earlier layout did, crosses all three channels.
   */
  53: { x: 363.2, y: 1195 },
  60: { x: 405.5, y: 1195 },
  52: { x: 447.8, y: 1195 },
  54: { x: 323.9, y: 1240 },
  38: { x: 323.9, y: 1280 },
  58: { x: 323.9, y: 1319 },
  19: { x: 487.1, y: 1240 },
  39: { x: 487.1, y: 1280 },
  41: { x: 487.1, y: 1319 },
};

/**
 * Marker positions that are set outright rather than derived.
 *
 * The three triangles cannot use the nudge-toward-the-midpoint rule: their
 * gates start close together and every edge aims at the same spot, so any
 * inset deep enough to clear the boundary drives neighbours into each other.
 * These eighteen were solved instead — pushed inward until each cleared its
 * edges by a marker radius, then relaxed apart until no two overlapped — and
 * the result is written down so the drawing is stable and reviewable rather
 * than recomputed on every render.
 *
 * The Spleen's and Solar Plexus's values are exact mirrors, which the mirror
 * test checks.
 */
const GATE_MARKER_OVERRIDES: Readonly<Record<number, Point>> = {
  // Spleen — radius 12 here, not 14; see GATE_MARKER_RADIUS_BY_CENTRE.
  48: { x: 48.3, y: 980.5 },
  57: { x: 82.2, y: 999.3 },
  44: { x: 116.6, y: 1018.4 },
  50: { x: 145.1, y: 1034.1 },
  32: { x: 116.6, y: 1049.8 },
  28: { x: 82.2, y: 1068.8 },
  18: { x: 48.2, y: 1087.6 },
  // Solar Plexus — the exact mirror of the Spleen about AXIS_X.
  36: { x: 762.7, y: 980.5 },
  22: { x: 728.8, y: 999.3 },
  37: { x: 694.4, y: 1018.4 },
  6: { x: 665.9, y: 1034.1 },
  49: { x: 694.4, y: 1049.8 },
  55: { x: 728.8, y: 1068.8 },
  30: { x: 762.8, y: 1087.6 },
  /*
   * Heart — solved against the DRAWN region, not the polygon.
   *
   * The artwork rounds this triangle's corners hard, so solving against the
   * sharp polygon puts markers out on corners the drawing does not have. These
   * four were relaxed inside the rendered path instead, and clear it by 22.5
   * at worst.
   */
  21: { x: 604.9, y: 837.5 },
  51: { x: 576.9, y: 849.5 },
  26: { x: 572.9, y: 873.5 },
  40: { x: 624.9, y: 879.5 },
  /*
   * The Ajna's apex, and only the apex. A vertex needs its marker on the angle
   * bisector, and the Ajna's is sharp enough that the inset the rest of the
   * centre can afford leaves 43 straddling its edges. It also has to clear the
   * ROUNDED apex, not the sharp one — the e2e disc check is what measures it.
   */
  43: { x: 405.5, y: 320 },
};


/**
 * How far each gate marker is pushed inside its own centre.
 *
 * Per-centre because the nudge has to be a fraction of the centre's size. The
 * three small triangles are the binding constraint: seven gates around the
 * Spleen start barely more than a marker's width apart, so they can take about
 * nine units before neighbours touch, where the Throat and Sacral take
 * eighteen.
 *
 * These are the largest values that keep every pair of markers in a centre at
 * least a full marker-diameter apart — the collision test in bodygraph.test.tsx
 * is what says so, and it has caught this twice.
 */
const GATE_INSET: Record<CenterId, number> = {
  head: 20,
  ajna: 20,
  throat: 20,
  g: 24,
  heart: 14,
  spleen: 14,
  solarPlexus: 14,
  sacral: 22,
  root: 22,
};

/** A centre's boundary as a polygon, for the gate maths. */
export function centerPolygon(center: CenterId): Point[] {
  const shape = CENTERS.find((c) => c.id === center)?.shape;
  if (!shape) throw new Error(`No shape for ${center}`);
  if (shape.kind === "polygon") return [...shape.points];
  const { x, y, width, height } = shape;
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}

/**
 * Where a gate's marker is drawn: straight in from the edge it sits on,
 * PERPENDICULAR to that edge.
 *
 * This used to nudge each marker toward its centre's midpoint, and that is
 * what knocked the numerals off their channels. A gate on the Throat's top
 * edge belongs directly above its channel; aiming it at the midpoint moves it
 * sideways as well as down, so 62, 23 and 56 drifted together and stopped
 * lining up with the three tracks running to the Ajna. Perpendicular keeps a
 * gate on its own column, which is how the reference charts read.
 *
 * The cost is that gates on ADJACENT edges converge at a corner rather than
 * staying parallel — which is why the three triangles, where every gate is
 * near a corner, are solved outright in GATE_MARKER_OVERRIDES instead.
 */
export function gateLabelPoint(gate: number, center: CenterId, distance?: number): Point {
  const anchor = GATE_POINTS[gate];
  if (!anchor) throw new Error(`No geometry for gate ${gate}`);

  const solved = GATE_MARKER_OVERRIDES[gate];
  if (solved && distance === undefined) return solved;

  const inset = distance ?? GATE_INSET[center];
  const polygon = centerPolygon(center);
  const centroid = polygon.reduce(
    (acc, p) => ({ x: acc.x + p.x / polygon.length, y: acc.y + p.y / polygon.length }),
    { x: 0, y: 0 },
  );

  /*
   * A gate ON A VERTEX has no single edge to come in from: the perpendicular
   * of either edge runs almost parallel to the other, so the marker slides
   * along the boundary instead of entering the shape. The G's 1, 2, 10 and 25
   * sit on its four points and cleared 0.7 that way. They take the angle
   * bisector, which is the only direction that leaves both edges at once.
   */
  const VERTEX_TOLERANCE = 2;
  for (let i = 0; i < polygon.length; i += 1) {
    const v = polygon[i]!;
    if (Math.hypot(anchor.x - v.x, anchor.y - v.y) > VERTEX_TOLERANCE) continue;
    const before = polygon[(i - 1 + polygon.length) % polygon.length]!;
    const after = polygon[(i + 1) % polygon.length]!;
    const toBefore = { x: before.x - v.x, y: before.y - v.y };
    const toAfter = { x: after.x - v.x, y: after.y - v.y };
    const lb = Math.hypot(toBefore.x, toBefore.y) || 1;
    const la = Math.hypot(toAfter.x, toAfter.y) || 1;
    let bx = toBefore.x / lb + toAfter.x / la;
    let by = toBefore.y / lb + toAfter.y / la;
    const lbi = Math.hypot(bx, by) || 1;
    bx /= lbi;
    by /= lbi;
    // Half-angle between the bisector and either edge sets how far along the
    // bisector the marker has to travel to clear both edges by `inset`.
    const sinHalf = Math.abs((toAfter.x / la) * by - (toAfter.y / la) * bx) || 1;
    return { x: v.x + (bx * inset) / sinHalf, y: v.y + (by * inset) / sinHalf };
  }

  // Otherwise: straight in from the edge this gate sits on.
  let nearest = { distance: Infinity, nx: 0, ny: 0 };
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i]!;
    const b = polygon[(i + 1) % polygon.length]!;
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const lengthSquared = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, ((anchor.x - a.x) * vx + (anchor.y - a.y) * vy) / lengthSquared));
    const d = Math.hypot(anchor.x - (a.x + t * vx), anchor.y - (a.y + t * vy));
    if (d < nearest.distance) {
      let nx = -vy;
      let ny = vx;
      const length = Math.hypot(nx, ny) || 1;
      nx /= length;
      ny /= length;
      // Point it into the centre.
      if ((centroid.x - a.x) * nx + (centroid.y - a.y) * ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      nearest = { distance: d, nx, ny };
    }
  }

  return { x: anchor.x + nearest.nx * inset, y: anchor.y + nearest.ny * inset };
}

export function getGatePoint(gate: number): Point {
  const point = GATE_POINTS[gate];
  if (!point) throw new Error(`No geometry for gate ${gate}`);
  return point;
}

/* -------------------------------------------------------------------------- */
/*  Paths                                                                      */
/* -------------------------------------------------------------------------- */

/** Corner rounding applied to every centre. */
export const CORNER_RADIUS = 26;

function roundedPolygonPath(points: readonly Point[], radius: number): string {
  const n = points.length;
  let d = "";

  for (let i = 0; i < n; i += 1) {
    const previous = points[(i - 1 + n) % n] as Point;
    const current = points[i] as Point;
    const next = points[(i + 1) % n] as Point;

    const toPrevious = { x: previous.x - current.x, y: previous.y - current.y };
    const toNext = { x: next.x - current.x, y: next.y - current.y };
    const lengthPrevious = Math.hypot(toPrevious.x, toPrevious.y) || 1;
    const lengthNext = Math.hypot(toNext.x, toNext.y) || 1;

    // Never round away more than half of either adjacent edge, or a sharp
    // vertex (the triangle apexes) would swallow its own sides.
    const r = Math.min(radius, lengthPrevious / 2, lengthNext / 2);

    const entry = {
      x: current.x + (toPrevious.x / lengthPrevious) * r,
      y: current.y + (toPrevious.y / lengthPrevious) * r,
    };
    const exit = {
      x: current.x + (toNext.x / lengthNext) * r,
      y: current.y + (toNext.y / lengthNext) * r,
    };

    d += `${i === 0 ? "M" : " L"} ${entry.x.toFixed(2)} ${entry.y.toFixed(2)}`;
    d += ` Q ${current.x} ${current.y} ${exit.x.toFixed(2)} ${exit.y.toFixed(2)}`;
  }

  return `${d} Z`;
}

export function shapeToPath(shape: CenterShape, radius = CORNER_RADIUS): string {
  if (shape.kind === "rect") {
    const { x, y, width, height } = shape;
    return roundedPolygonPath(
      [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ],
      radius,
    );
  }
  return roundedPolygonPath(shape.points, radius);
}

/**
 * A channel's path from gate A to gate B.
 *
 * Short channels between stacked centres stay straight. Longer ones bow
 * OUTWARD, away from the figure's centre of mass, so that a channel spanning
 * the chart (16-48, 12-22, 26-44) sweeps around the intervening centres
 * instead of cutting through them. The bow is perpendicular to the chord and
 * scales with length, so the whole set reads as one family of curves rather
 * than a handful of special cases.
 */
/**
 * Channels are CIRCULAR ARCS, and the radii come off the reference artwork.
 *
 * They used to be quadratic Beziers with a bow proportional to length. That is
 * not what the reference draws, and it is why the two charts did not match: a
 * family of Beziers whose bow scales with the chord does not nest — each one
 * bulges hardest at its own midpoint, so arcs sharing a corridor cross and
 * splay. The reference draws concentric circles, which nest by construction.
 *
 * Each radius below is solved from HOW FAR the artwork's own track for that
 * channel reaches — the extreme of its bounding box in the file, pulled in by
 * 7 to get from the track's outer edge to its centre-line — by binary search
 * on the radius of an arc through this drawing's two gate anchors.
 *
 * Solving from the reach rather than from a circle fit matters because the
 * gate anchors here are not pixel-identical to the artwork's junctions, and an
 * arc that borrowed the artwork's radius but not its endpoints missed the
 * envelope by fifty units and tangled with its neighbours.
 *
 * The check that it is right: the left and right families were solved
 * INDEPENDENTLY, from separate bounding boxes, and landed on the same numbers
 * — 134/134, 162/162, 191/191 down to the Root, 116/115 around the Sacral.
 * Two independent measurements agreeing to the unit is what rules out the
 * solver having invented them.
 */
const CHANNEL_ARC_RADIUS: Readonly<Record<string, number>> = {
  // Throat out to the Spleen and the Solar Plexus — the widest sweeps.
  "16-48": 348,
  "35-36": 348,
  "20-57": 346,
  "12-22": 346,
  // Spleen and Solar Plexus down to the Root, nested three deep.
  "32-54": 134,
  "19-49": 134,
  "28-38": 162,
  "39-55": 162,
  "18-58": 191,
  "30-41": 191,
  // The two that skirt the Sacral.
  "27-50": 116,
  "6-59": 116,
  /*
   * 21-45 has no entry. Its radius was solved when the Heart was thought to be
   * a different shape 100 units to the left; against the real one the chord is
   * longer than that circle can span, so it clamped to a half-circle and swung
   * across 12-22. The artwork draws this one almost straight — its track
   * reaches x = 606.6 and gate 21 already sits at 608 — which is what the
   * fallback gives.
   */
};

/**
 * Anything shorter than this is drawn straight, which is what the reference
 * does with the stacked bundles — Head to Ajna, Ajna to Throat, Throat to G, G
 * to Sacral, Sacral to Root are all dead straight in the artwork.
 */
const STRAIGHT_BELOW = 180;

/**
 * The fallback for a long channel with no measured radius: 3 chords.
 *
 * Only the left-hand reaches use it — 10-20, 10-34, 10-57, 20-34 and 34-57,
 * whose tracks the artwork splits into fragments where other channels cross
 * them, so no single circle could be fitted to them with confidence.
 *
 * The value is measured, not chosen: swept from 0.8 to 4.0 against the
 * measured radii, the whole set is free of crossings from 2.7 to 3.8, and 3
 * sits in the middle of that band. Below 2.7 the unmeasured reaches curve
 * harder than their measured neighbours and cut across them.
 */
const FALLBACK_RADIUS_PER_CHORD = 3;

interface ChannelGeometry {
  straight: boolean;
  /** Unit normal pointing away from the figure's centre. */
  nx: number;
  ny: number;
  chordMid: Point;
  radius: number;
  /** How far the arc's midpoint stands off the chord. */
  sagitta: number;
  sweep: 0 | 1;
}

function channelGeometry(a: Point, b: Point, id?: string): ChannelGeometry {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const chordMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

  // Unit normal to the chord, flipped so it always points away from the
  // figure's centre of mass: channels bow outward, around what they pass.
  let nx = -dy / length;
  let ny = dx / length;
  const towardCenter = { x: FIGURE_CENTER.x - chordMid.x, y: FIGURE_CENTER.y - chordMid.y };
  if (nx * towardCenter.x + ny * towardCenter.y > 0) {
    nx = -nx;
    ny = -ny;
  }

  if (length <= STRAIGHT_BELOW) {
    return { straight: true, nx, ny, chordMid, radius: 0, sagitta: 0, sweep: 0 };
  }

  const measured = id === undefined ? undefined : CHANNEL_ARC_RADIUS[id];
  // A circle cannot pass through both ends with a radius under half the chord.
  const radius = Math.max(measured ?? length * FALLBACK_RADIUS_PER_CHORD, length / 2 + 0.5);

  // Centre sits on the far side from the bulge, at h from the chord midpoint.
  const h = Math.sqrt(Math.max(radius * radius - (length * length) / 4, 0));
  const sagitta = radius - h;

  /*
   * Which way SVG has to sweep to bulge along +n rather than -n.
   *
   * The circle's centre sits at chordMid - n*h, so the cross product of the
   * two radius vectors works out to -h * (dx*ny - dy*nx). SVG's sweep flag is
   * 1 when that cross product is POSITIVE, which is the opposite sign, and
   * getting this backwards silently bows every arc the wrong way — the whole
   * set still draws, it just tangles. Fourteen crossings, when it was wrong.
   */
  const sweep: 0 | 1 = dx * ny - dy * nx > 0 ? 0 : 1;

  return { straight: false, nx, ny, chordMid, radius, sagitta, sweep };
}

export function channelPath(a: Point, b: Point, id?: string): string {
  const g = channelGeometry(a, b, id);
  if (g.straight) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const r = g.radius.toFixed(2);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 0 ${g.sweep} ${b.x} ${b.y}`;
}

/** The point halfway along a channel, where its two coloured halves meet. */
export function channelMidpoint(a: Point, b: Point, id?: string): Point {
  const g = channelGeometry(a, b, id);
  if (g.straight) return g.chordMid;
  return { x: g.chordMid.x + g.nx * g.sagitta, y: g.chordMid.y + g.ny * g.sagitta };
}

/**
 * Half of a channel, from one gate to the midpoint, following the same curve.
 *
 * Both halves are arcs of the SAME circle, so each is drawn with the parent's
 * radius; only the sweep flag has to be worked out again, because the two
 * halves run in opposite directions around it.
 */
export function channelHalfPath(from: Point, to: Point, mid: Point, id?: string): string {
  const g = channelGeometry(from, to, id);
  if (g.straight) return `M ${from.x} ${from.y} L ${mid.x} ${mid.y}`;

  const r = g.radius.toFixed(2);
  // Centre of the parent circle, then the sweep for this half around it.
  const cx = g.chordMid.x - g.nx * (g.radius - g.sagitta);
  const cy = g.chordMid.y - g.ny * (g.radius - g.sagitta);
  const cross =
    (from.x - cx) * (mid.y - cy) - (from.y - cy) * (mid.x - cx);
  const sweep = cross > 0 ? 1 : 0;

  return `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${mid.x.toFixed(2)} ${mid.y.toFixed(2)}`;
}

/* -------------------------------------------------------------------------- */
/*  Variable arrows                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Where the four Variable arrows sit: two either side of the head, in the
 * space the Head and Ajna triangles leave empty at the top of the graph.
 *
 * The POSITION of each arrow is fixed — Determination is always top-left,
 * whichever way it happens to point. Only the glyph's direction varies. The
 * arrow is drawn outboard of its numbers, so the pair reads outward from the
 * head exactly as it does on a conventional chart.
 */
export const VARIABLE_SLOTS: Record<
  VariablePosition,
  { arrow: Point; value: Point; textAnchor: "start" | "end" }
> = {
  determination: { arrow: { x: 128, y: 96 }, value: { x: 188, y: 96 }, textAnchor: "start" },
  environment: { arrow: { x: 128, y: 190 }, value: { x: 188, y: 190 }, textAnchor: "start" },
  motivation: { arrow: { x: 683, y: 96 }, value: { x: 623, y: 96 }, textAnchor: "end" },
  perspective: { arrow: { x: 683, y: 190 }, value: { x: 623, y: 190 }, textAnchor: "end" },
};

/** Half the shaft length of an arrow glyph. */
const ARROW_REACH = 34;
const ARROW_HEAD = 18;
const ARROW_WING = 12;

/**
 * An arrow glyph centred on a point: one shaft and two head strokes.
 *
 * Returned as a single stroked path with no fill so it keeps its weight when
 * the chart is scaled down on a phone.
 */
export function variableArrowPath(at: Point, direction: "left" | "right"): string {
  const sign = direction === "left" ? -1 : 1;
  const tip = at.x + sign * ARROW_REACH;
  const tail = at.x - sign * ARROW_REACH;
  const back = tip - sign * ARROW_HEAD;

  return [
    `M ${tail} ${at.y} L ${tip} ${at.y}`,
    `M ${tip} ${at.y} L ${back} ${at.y - ARROW_WING}`,
    `M ${tip} ${at.y} L ${back} ${at.y + ARROW_WING}`,
  ].join(" ");
}
