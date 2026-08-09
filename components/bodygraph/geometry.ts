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
 * PROPORTIONS: the figure is deliberately wide (content is roughly 0.62 as
 * wide as it is tall) rather than the narrow column an obvious layout
 * produces. The Spleen and Solar Plexus sit well out to the sides, which is
 * what gives the long channels room to curve.
 */

export const VIEWBOX = { width: 620, height: 840 } as const;

/** Vertical axis of the figure. Long channels bow away from it. */
export const AXIS_X = 310;
/** Visual centre of mass, used to decide which way a channel bows. */
const FIGURE_CENTER = { x: 310, y: 470 } as const;

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

const HEAD = { apex: { x: 310, y: 20 }, left: { x: 248, y: 108 }, right: { x: 372, y: 108 } };
const AJNA = { left: { x: 248, y: 120 }, right: { x: 372, y: 120 }, apex: { x: 310, y: 208 } };
const THROAT = { x: 250, y: 240, width: 120, height: 112 };
const G = {
  top: { x: 310, y: 366 },
  right: { x: 382, y: 430 },
  bottom: { x: 310, y: 494 },
  left: { x: 238, y: 430 },
};
const HEART = {
  left: { x: 394, y: 478 },
  topRight: { x: 472, y: 440 },
  bottomRight: { x: 472, y: 516 },
};
const SPLEEN = { top: { x: 42, y: 540 }, apex: { x: 149, y: 596 }, bottom: { x: 42, y: 652 } };
const SOLAR = { top: { x: 578, y: 540 }, apex: { x: 471, y: 596 }, bottom: { x: 578, y: 652 } };
const SACRAL = { x: 250, y: 540, width: 120, height: 112 };
const ROOT = { x: 250, y: 700, width: 120, height: 112 };

export const CENTERS: readonly CenterGeometry[] = [
  { id: "head", shape: { kind: "polygon", points: [HEAD.apex, HEAD.right, HEAD.left] } },
  { id: "ajna", shape: { kind: "polygon", points: [AJNA.left, AJNA.right, AJNA.apex] } },
  { id: "throat", shape: { kind: "rect", ...THROAT } },
  { id: "g", shape: { kind: "polygon", points: [G.top, G.right, G.bottom, G.left] } },
  {
    id: "heart",
    shape: { kind: "polygon", points: [HEART.left, HEART.topRight, HEART.bottomRight] },
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
  // Head — bottom edge, facing the Ajna.
  64: { x: 272, y: 108 },
  61: { x: 310, y: 108 },
  63: { x: 348, y: 108 },

  // Ajna — top edge faces the Head; the lower slopes face the Throat.
  47: { x: 272, y: 120 },
  24: { x: 310, y: 120 },
  4: { x: 348, y: 120 },
  17: { x: 285, y: 173 },
  43: { x: 310, y: 203 },
  11: { x: 335, y: 173 },

  // Throat — top to the Ajna, bottom to the G, sides outward.
  62: { x: 274, y: 240 },
  23: { x: 310, y: 240 },
  56: { x: 346, y: 240 },
  16: { x: 250, y: 272 },
  20: { x: 250, y: 316 },
  31: { x: 274, y: 352 },
  8: { x: 310, y: 352 },
  33: { x: 346, y: 352 },
  35: { x: 370, y: 268 },
  12: { x: 370, y: 300 },
  45: { x: 370, y: 332 },

  // G — diamond; upper edges to the Throat, lower to the Sacral.
  1: { x: 310, y: 366 },
  7: { x: 274, y: 398 },
  13: { x: 346, y: 398 },
  25: { x: 382, y: 430 },
  46: { x: 346, y: 462 },
  2: { x: 310, y: 494 },
  15: { x: 274, y: 462 },
  10: { x: 238, y: 430 },

  // Heart / Ego.
  51: { x: 394, y: 478 },
  21: { x: 433, y: 459 },
  26: { x: 433, y: 497 },
  40: { x: 472, y: 498 },

  // Spleen — upper edge to Heart/Throat, lower edge to the Root.
  44: { x: 61, y: 550 },
  48: { x: 90, y: 565 },
  57: { x: 122, y: 582 },
  50: { x: 122, y: 610 },
  32: { x: 90, y: 627 },
  28: { x: 58, y: 644 },
  18: { x: 42, y: 610 },

  // Solar Plexus — upper edge to Throat/Heart, lower edge to the Root.
  36: { x: 559, y: 550 },
  22: { x: 530, y: 565 },
  37: { x: 498, y: 582 },
  6: { x: 471, y: 596 },
  49: { x: 498, y: 610 },
  55: { x: 530, y: 627 },
  30: { x: 562, y: 644 },

  // Sacral — top edge upward, sides outward, bottom to the Root.
  34: { x: 262, y: 540 },
  5: { x: 294, y: 540 },
  14: { x: 326, y: 540 },
  29: { x: 358, y: 540 },
  27: { x: 250, y: 596 },
  59: { x: 370, y: 596 },
  9: { x: 268, y: 652 },
  3: { x: 310, y: 652 },
  42: { x: 352, y: 652 },

  // Root — top edge to the Sacral, sides to the Spleen and Solar Plexus.
  53: { x: 268, y: 700 },
  60: { x: 310, y: 700 },
  52: { x: 352, y: 700 },
  58: { x: 250, y: 724 },
  38: { x: 250, y: 756 },
  54: { x: 250, y: 788 },
  19: { x: 370, y: 724 },
  39: { x: 370, y: 756 },
  41: { x: 370, y: 788 },
};

const CENTER_MIDPOINTS: Record<CenterId, Point> = {
  head: { x: 310, y: 75 },
  ajna: { x: 310, y: 155 },
  throat: { x: 310, y: 296 },
  g: { x: 310, y: 430 },
  heart: { x: 446, y: 478 },
  spleen: { x: 90, y: 596 },
  solarPlexus: { x: 530, y: 596 },
  sacral: { x: 310, y: 596 },
  root: { x: 310, y: 756 },
};

/**
 * How far each centre pulls its gate markers inward.
 *
 * This is per-centre rather than a single constant because the nudge is a
 * fraction of the centre's size: on the small triangles a uniform 11 units
 * dragged gates on opposite edges into one another (21 and 26 ended up 18
 * apart, closer than two markers are wide). The tighter the centre, the
 * smaller its nudge.
 */
const GATE_INSET: Record<CenterId, number> = {
  head: 11,
  ajna: 11,
  throat: 11,
  g: 11,
  heart: 8,
  spleen: 8,
  solarPlexus: 8,
  sacral: 11,
  root: 11,
};

/**
 * Where a gate's marker is drawn: just INSIDE its own centre, nudged from the
 * anchor toward that centre's midpoint.
 *
 * Inward placement is what conventional BodyGraphs do, and it is the only
 * arrangement that avoids collisions. Pushing markers outward sends the two
 * gates of a short channel — 1 and 8, 43 and 23, 25 and 51, 59 and 6 — directly
 * into one another, because "away from my centre" means "toward yours".
 */
export function gateLabelPoint(gate: number, center: CenterId, distance?: number): Point {
  const anchor = GATE_POINTS[gate];
  if (!anchor) throw new Error(`No geometry for gate ${gate}`);
  const mid = CENTER_MIDPOINTS[center];
  const inset = distance ?? GATE_INSET[center];

  const dx = mid.x - anchor.x;
  const dy = mid.y - anchor.y;
  const length = Math.hypot(dx, dy) || 1;

  return {
    x: anchor.x + (dx / length) * inset,
    y: anchor.y + (dy / length) * inset,
  };
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
export const CORNER_RADIUS = 14;

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
const STRAIGHT_BELOW = 90;
const BOW_FACTOR = 0.18;
/** Beyond this the arc would swing outside the figure. */
const MAX_BOW = 46;

export function channelPath(a: Point, b: Point): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);

  if (length <= STRAIGHT_BELOW) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;

  const bow = Math.min((length - STRAIGHT_BELOW) * BOW_FACTOR, MAX_BOW);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

  // Unit normal to the chord.
  let nx = -dy / length;
  let ny = dx / length;

  // Flip it if it points toward the figure's centre; we always bow away.
  const towardCenter = { x: FIGURE_CENTER.x - mid.x, y: FIGURE_CENTER.y - mid.y };
  if (nx * towardCenter.x + ny * towardCenter.y > 0) {
    nx = -nx;
    ny = -ny;
  }

  const control = { x: mid.x + nx * bow, y: mid.y + ny * bow };
  return `M ${a.x} ${a.y} Q ${control.x.toFixed(2)} ${control.y.toFixed(2)} ${b.x} ${b.y}`;
}

/** The point halfway along a channel, where its two coloured halves meet. */
export function channelMidpoint(a: Point, b: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

  if (length <= STRAIGHT_BELOW) return mid;

  const bow = Math.min((length - STRAIGHT_BELOW) * BOW_FACTOR, MAX_BOW);
  let nx = -dy / length;
  let ny = dx / length;
  const towardCenter = { x: FIGURE_CENTER.x - mid.x, y: FIGURE_CENTER.y - mid.y };
  if (nx * towardCenter.x + ny * towardCenter.y > 0) {
    nx = -nx;
    ny = -ny;
  }

  // A quadratic Bezier at t = 0.5 sits halfway between the chord midpoint and
  // the control point, not at the control point itself.
  return { x: mid.x + (nx * bow) / 2, y: mid.y + (ny * bow) / 2 };
}

/** Half of a channel, from one gate to the midpoint, following the same curve. */
export function channelHalfPath(from: Point, to: Point, mid: Point): string {
  // de Casteljau: the control point of each half of a quadratic split at
  // t = 0.5 is the midpoint of the original control point and that endpoint.
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length <= STRAIGHT_BELOW) return `M ${from.x} ${from.y} L ${mid.x} ${mid.y}`;

  const chordMid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const bow = Math.min((length - STRAIGHT_BELOW) * BOW_FACTOR, MAX_BOW);
  let nx = -dy / length;
  let ny = dx / length;
  const towardCenter = { x: FIGURE_CENTER.x - chordMid.x, y: FIGURE_CENTER.y - chordMid.y };
  if (nx * towardCenter.x + ny * towardCenter.y > 0) {
    nx = -nx;
    ny = -ny;
  }
  const control = { x: chordMid.x + nx * bow, y: chordMid.y + ny * bow };
  const halfControl = { x: (from.x + control.x) / 2, y: (from.y + control.y) / 2 };

  return `M ${from.x} ${from.y} Q ${halfControl.x.toFixed(2)} ${halfControl.y.toFixed(2)} ${mid.x.toFixed(2)} ${mid.y.toFixed(2)}`;
}

/* -------------------------------------------------------------------------- */
/*  Variable arrows                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Where the four Variable arrows sit: two either side of the head, in the
 * space the silhouette's shoulders leave empty.
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
  determination: { arrow: { x: 96, y: 62 }, value: { x: 140, y: 62 }, textAnchor: "start" },
  environment: { arrow: { x: 96, y: 132 }, value: { x: 140, y: 132 }, textAnchor: "start" },
  motivation: { arrow: { x: 524, y: 62 }, value: { x: 480, y: 62 }, textAnchor: "end" },
  perspective: { arrow: { x: 524, y: 132 }, value: { x: 480, y: 132 }, textAnchor: "end" },
};

/** Half the shaft length of an arrow glyph. */
const ARROW_REACH = 25;
const ARROW_HEAD = 13;
const ARROW_WING = 9;

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

/**
 * The figure behind the graph: a person sitting cross-legged, seen from the
 * front — bobbed hair, a narrow neck, sloping shoulders, short sleeves, arms
 * down the sides, and the crossed legs spreading into a wide low base.
 *
 * Purely decorative; carries no chart information and is marked aria-hidden.
 * It gives the centres something to sit within, which is what stops the graph
 * reading as a floating circuit diagram.
 *
 * DRAWN FROM SCRATCH to the reference's pose and proportions. The reference is
 * a watermarked stock silhouette, so its outline was measured and rebuilt, not
 * traced — this is original geometry, like the rest of the BodyGraph.
 *
 * Defined as HALF a figure. Only the right-hand outline is written out, from
 * the crown down to the hem; the left is generated by mirroring, so the figure
 * cannot go lopsided and the shape stays editable as a list of points rather
 * than as a wall of bezier control numbers.
 */
const FIGURE_RIGHT_OUTLINE: Point[] = [
  { x: 310, y: 4 }, // crown, on the axis
  { x: 351, y: 9 },
  { x: 381, y: 30 },
  { x: 399, y: 64 },
  { x: 405, y: 100 }, // widest of the hair, at the ear
  { x: 403, y: 132 },
  { x: 398, y: 164 },
  { x: 389, y: 190 },
  { x: 381, y: 212 }, // the bob comes to a point beside the jaw, hanging DOWN
  { x: 373, y: 178 }, // and back up into the notch behind it
  { x: 370, y: 190 }, // jaw
  { x: 360, y: 205 },
  { x: 352, y: 218 }, // neck — about 45% of the head's width, as on a person
  { x: 350, y: 232 },
  { x: 370, y: 242 }, // trapezius, sloping away fast
  { x: 414, y: 256 },
  { x: 460, y: 278 },
  { x: 491, y: 302 }, // deltoid
  { x: 505, y: 330 },
  { x: 510, y: 356 },
  { x: 507, y: 374 }, // hem of the sleeve
  { x: 493, y: 380 }, // stepping in to the bare arm
  { x: 487, y: 404 },
  { x: 483, y: 448 },
  { x: 479, y: 490 },
  { x: 476, y: 524 }, // waist
  { x: 482, y: 554 },
  { x: 502, y: 580 }, // hip, opening out into the crossed legs
  { x: 536, y: 602 },
  { x: 572, y: 628 },
  { x: 597, y: 658 },
  { x: 611, y: 694 }, // knee, the widest point of the whole figure
  { x: 614, y: 732 },
  { x: 606, y: 772 },
  { x: 590, y: 800 },
  { x: 566, y: 818 },
  { x: 521, y: 828 },
  { x: 444, y: 834 },
  { x: 368, y: 836 },
  { x: 310, y: 837 }, // hem, on the axis
];

/**
 * Smooth a closed loop of points into a cubic path.
 *
 * Centripetal Catmull-Rom (alpha = 0.5). The centripetal variant matters here:
 * the uniform one overshoots and self-intersects wherever points bunch up,
 * which is exactly what happens at the point of the bob and the sleeve hem.
 */
function closedCurveThrough(points: Point[]): string {
  const ALPHA = 0.5;
  const at = (index: number): Point => points[(index + points.length) % points.length]!;
  const knot = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y) ** ALPHA;

  const first = at(0);
  const segments: string[] = [`M ${first.x} ${first.y}`];

  for (let i = 0; i < points.length; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    // Guard against coincident points, which would divide by zero.
    const d1 = knot(p0, p1) || 1e-6;
    const d2 = knot(p1, p2) || 1e-6;
    const d3 = knot(p2, p3) || 1e-6;

    const outgoing = d2 / (3 * (d1 + d2));
    const incoming = d2 / (3 * (d2 + d3));

    const c1 = {
      x: p1.x + (p2.x - p0.x) * outgoing,
      y: p1.y + (p2.y - p0.y) * outgoing,
    };
    const c2 = {
      x: p2.x - (p3.x - p1.x) * incoming,
      y: p2.y - (p3.y - p1.y) * incoming,
    };

    const round = (value: number) => Number(value.toFixed(2));
    segments.push(
      `C ${round(c1.x)} ${round(c1.y)}, ${round(c2.x)} ${round(c2.y)}, ${round(p2.x)} ${round(p2.y)}`,
    );
  }

  return `${segments.join(" ")} Z`;
}

/**
 * The full outline: the right half, then the left half mirrored and reversed.
 *
 * The two points that sit ON the axis — the crown and the hem — belong to both
 * halves, so they are dropped from the mirrored run to avoid a zero-length
 * segment at the join.
 */
export const FIGURE_OUTLINE: Point[] = [
  ...FIGURE_RIGHT_OUTLINE,
  ...FIGURE_RIGHT_OUTLINE.slice(1, -1)
    .reverse()
    .map((point) => ({ x: 2 * AXIS_X - point.x, y: point.y })),
];

export const BODY_SILHOUETTE_PATH = closedCurveThrough(FIGURE_OUTLINE);
