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
   * Every anchor is a JUNCTION READ OFF THE ARTWORK: the point where that
   * gate's channel track actually meets its centre in the client's file, not a
   * position chosen along the edge. That is what makes a numeral line up with
   * the line running into it.
   *
   * Gates carrying more than one channel take the mean of their junctions —
   * 57, where 20-57 and 34-57 both arrive, is the clearest case.
   *
   * The four gates of the integration group have no mapped junction, because
   * the drawing merges their channels at the G's left vertex; they keep the
   * positions the geometry gives them. They are marked below.
   *
   * SYMMETRISED. The file is hand-drawn and its two halves do not match: gate
   * 48's junction sits at x = 29.2 where 36's mirrors to 16.7, twelve units
   * apart. Each mirror pair is averaged and each on-axis gate snapped to
   * AXIS_X, so the Spleen and Solar Plexus stay exact reflections of one
   * another — which the mirror test requires and a reader notices.
   */

  // Head — where the three channels to the Ajna meet it.
  64: { x: 365.1, y: 155.2 },
  61: { x: 405.5, y: 155.2 },
  63: { x: 445.9, y: 155.2 },

  // Ajna — top edge to the Head, lower slopes to the Throat.
  47: { x: 359.6, y: 215.4 },
  24: { x: 405.5, y: 215.4 },
  4: { x: 451.4, y: 215.4 },
  17: { x: 366.4, y: 311.4 },
  43: { x: 405.5, y: 359.8 },
  11: { x: 444.6, y: 311.4 },

  // Throat — top to the Ajna, bottom to the G, sides outward.
  62: { x: 360.4, y: 453.2 },
  23: { x: 405.5, y: 453.2 },
  56: { x: 450.6, y: 453.2 },
  16: { x: 323.8, y: 501.3 },
  20: { x: 323.9, y: 538.2 },
  35: { x: 487.2, y: 501.3 },
  12: { x: 487.1, y: 538.2 },
  45: { x: 486.4, y: 587.5 },
  31: { x: 355.1, y: 608.3 },
  8: { x: 405.5, y: 608.3 },
  33: { x: 455.9, y: 608.3 },

  // G — 10 and 25 on the side vertices, 1 and 2 top and bottom.
  1: { x: 405.5, y: 652.5 },
  7: { x: 372.3, y: 673.6 },
  13: { x: 438.7, y: 673.6 },
  10: { x: 303.8, y: 760.1 },   // merged in the drawing; not a junction
  25: { x: 507.2, y: 760.1 },
  15: { x: 373.4, y: 834.0 },
  46: { x: 437.6, y: 834.0 },
  2: { x: 405.5, y: 854.9 },

  // Heart / Ego — 21 at the top, 51 and 26 down the left, 40 bottom-right.
  21: { x: 608.0, y: 797.0 },
  51: { x: 562.5, y: 823.1 },
  26: { x: 459.7, y: 863.9 },
  40: { x: 659.0, y: 912.0 },

  // Spleen — 48, 57, 44 down the upper edge, 50 at the apex, 32, 28, 18 back along the lower.
  48: { x: 23.0, y: 943.9 },
  57: { x: 74.4, y: 969.5 },
  44: { x: 108.7, y: 989.2 },
  50: { x: 168.2, y: 1040.9 },
  32: { x: 102.2, y: 1083.5 },
  28: { x: 75.0, y: 1098.8 },
  18: { x: 34.7, y: 1121.6 },

  // Solar Plexus — the mirror of the Spleen.
  36: { x: 788.0, y: 943.9 },
  22: { x: 736.6, y: 969.5 },
  37: { x: 702.3, y: 989.2 },
  6: { x: 642.8, y: 1040.9 },
  49: { x: 708.8, y: 1083.5 },
  55: { x: 736.0, y: 1098.8 },
  30: { x: 776.3, y: 1121.6 },

  // Sacral — 34 and 27 on the left edge, 59 on the right.
  5: { x: 363.2, y: 968.5 },
  14: { x: 405.5, y: 968.4 },
  29: { x: 447.8, y: 968.5 },
  34: { x: 323.7, y: 1016.4 },
  27: { x: 323.8, y: 1091.4 },
  59: { x: 487.2, y: 1091.4 },
  42: { x: 362.7, y: 1126.8 },
  3: { x: 405.5, y: 1126.8 },
  9: { x: 448.3, y: 1126.8 },

  // Root — 54, 38, 58 down the left, 19, 39, 41 down the right.
  53: { x: 360.2, y: 1195.0 },
  60: { x: 405.5, y: 1195.0 },
  52: { x: 450.8, y: 1195.0 },
  54: { x: 323.9, y: 1248.0 },
  38: { x: 323.9, y: 1289.4 },
  58: { x: 323.9, y: 1330.3 },
  19: { x: 487.1, y: 1248.0 },
  39: { x: 487.1, y: 1289.4 },
  41: { x: 487.1, y: 1330.3 },
};


/**
 * Where every gate's marker is drawn — solved, not derived.
 *
 * The anchors above are junctions read off the artwork, so they are wherever
 * the drawing put them: unevenly spaced, some on vertices, some a few units
 * off a corner. No single rule places a marker inside every centre from those.
 * All sixty-four were relaxed instead — pushed in until each cleared its own
 * edges by a marker radius, then apart until no two in a centre overlapped,
 * with the mirror pairs averaged and the on-axis gates snapped to AXIS_X on
 * every iteration so the drawing stays symmetric.
 *
 * The relaxation runs against the *rendered* centre paths — `isPointInFill` on
 * the artwork's own subpaths in a browser — not against `centerPolygon`. The
 * polygons approximate: they take a centre's straight edges and ignore how
 * heavily the drawing fillets its corners, which overstates the Heart's and the
 * Throat's corners by enough to push 21, 26, 40 and 45 outside the shape they
 * are supposed to sit in. Solving against the fill removes the approximation
 * from the placement; `centerPolygon` is still what the unit tests measure
 * against, which is why the Heart stays exempt there.
 *
 * `gateLabelPoint` still carries the rule that produced the starting points
 * (perpendicular to the edge, angle bisector on a vertex), because the solver
 * needs it and because it documents the intent.
 */
const GATE_MARKER_OVERRIDES: Readonly<Record<number, Point>> = {
  // head
  61: { x: 405.5, y: 139.7 },
  63: { x: 445.8, y: 139.7 },
  64: { x: 365.2, y: 139.7 },
  // ajna
  4: { x: 451.4, y: 229.9 },
  11: { x: 424.5, y: 299.6 },
  17: { x: 386.5, y: 299.6 },
  24: { x: 405.5, y: 229.9 },
  43: { x: 405.5, y: 331.8 },
  47: { x: 359.6, y: 229.9 },
  // throat
  8: { x: 405.5, y: 592.7 },
  12: { x: 472.1, y: 538.2 },
  16: { x: 338.9, y: 501.3 },
  20: { x: 338.9, y: 538.2 },
  23: { x: 405.5, y: 468.7 },
  31: { x: 364.0, y: 592.8 },
  33: { x: 447.0, y: 592.8 },
  35: { x: 472.1, y: 501.3 },
  45: { x: 472.0, y: 579.2 },
  56: { x: 450.7, y: 468.7 },
  62: { x: 360.3, y: 468.7 },
  // g
  1: { x: 405.5, y: 672.4 },
  2: { x: 405.5, y: 834.7 },
  7: { x: 384.5, y: 692.9 },
  10: { x: 322.3, y: 753.5 },
  13: { x: 426.5, y: 692.9 },
  15: { x: 384.5, y: 814.2 },
  25: { x: 488.7, y: 753.5 },
  46: { x: 426.5, y: 814.2 },
  // heart
  21: { x: 611.2, y: 812.6 },
  26: { x: 539.5, y: 868.9 },
  40: { x: 647.8, y: 903.1 },
  51: { x: 574.8, y: 836.7 },
  // spleen
  18: { x: 23.5, y: 1101.3 },
  28: { x: 64.0, y: 1078.9 },
  32: { x: 91.3, y: 1063.8 },
  44: { x: 98.2, y: 1008.1 },
  48: { x: 18.9, y: 964.3 },
  50: { x: 145.1, y: 1034.1 },
  57: { x: 63.6, y: 989.0 },
  // solarPlexus
  6: { x: 665.9, y: 1034.1 },
  22: { x: 747.4, y: 989.0 },
  30: { x: 787.5, y: 1101.3 },
  36: { x: 792.1, y: 964.3 },
  37: { x: 712.8, y: 1008.1 },
  49: { x: 719.7, y: 1063.8 },
  55: { x: 747.0, y: 1078.9 },
  // sacral
  3: { x: 405.5, y: 1111.2 },
  5: { x: 363.2, y: 984.0 },
  9: { x: 448.3, y: 1111.2 },
  14: { x: 405.5, y: 984.0 },
  27: { x: 338.9, y: 1091.4 },
  29: { x: 447.8, y: 984.0 },
  34: { x: 338.3, y: 1016.4 },
  42: { x: 362.7, y: 1111.2 },
  59: { x: 472.1, y: 1091.4 },
  // root
  19: { x: 472.0, y: 1248.0 },
  38: { x: 339.0, y: 1289.4 },
  39: { x: 472.0, y: 1289.4 },
  41: { x: 472.0, y: 1330.3 },
  52: { x: 450.8, y: 1209.5 },
  53: { x: 360.2, y: 1209.5 },
  54: { x: 339.0, y: 1248.0 },
  58: { x: 339.0, y: 1330.3 },
  60: { x: 405.5, y: 1209.5 },
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
   *
   * The tolerance is 7 rather than a hair, because these anchors are junctions
   * read off the artwork: a channel meets a vertex a few units off the exact
   * corner, and a tight test missed them.
   */
  const VERTEX_TOLERANCE = 7;
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
