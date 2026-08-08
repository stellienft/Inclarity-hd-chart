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

/**
 * The figure behind the graph: a head in LEFT-FACING PROFILE — forehead, brow,
 * nose, mouth, chin — on a body wide enough to enclose the whole BodyGraph,
 * Spleen and Solar Plexus included.
 *
 * Purely decorative; carries no chart information and is marked aria-hidden.
 * It gives the centres something to sit within, which is what stops the graph
 * reading as a floating circuit diagram.
 *
 * Three properties matter and are easy to lose:
 *   1. The profile must read as a face. A plain oval reads as a mummy case.
 *      The nose tip at x=224 is the single feature doing most of that work.
 *   2. The torso must be WIDER than the widest centres. The Spleen reaches
 *      x=42 and the Solar Plexus x=578, so the body spans roughly 14 to 606
 *      and contains them rather than letting them float outside it.
 *   3. The shoulders have to crest HIGH — just under the neck, level with the
 *      Throat — and the sides then run close to vertical. Pushing the widest
 *      point down to the Sacral instead turns the body into an egg.
 */
export const BODY_SILHOUETTE_PATH = [
  // Crown, then down the back of the head on the right.
  "M 310 6",
  "C 352 6, 384 32, 390 72",
  "C 394 104, 392 134, 384 158",
  // Nape into the right of the neck.
  "C 378 176, 370 194, 366 212",
  "C 364 220, 363 226, 362 230",
  // Right shoulder, cresting level with the Throat, then a near-vertical side.
  "C 402 234, 456 254, 498 300",
  "C 546 352, 582 424, 596 502",
  "C 604 560, 606 622, 600 674",
  // Hip into the base.
  "C 592 738, 556 790, 500 812",
  "C 448 830, 380 834, 310 834",
  "C 240 834, 172 830, 120 812",
  // Left side of the body, then the left shoulder rising to the neck.
  "C 64 790, 28 738, 20 674",
  "C 14 622, 16 560, 24 502",
  "C 38 424, 74 352, 122 300",
  "C 164 254, 218 234, 258 230",
  "C 257 226, 256 220, 254 212",
  // Up the throat to the chin.
  "C 252 198, 250 186, 248 178",
  // Chin, jaw, mouth.
  "C 240 174, 233 168, 236 161",
  "C 240 156, 246 154, 246 149",
  // Under the nose, out to the tip, back to the bridge.
  "C 245 144, 240 142, 238 139",
  "C 230 136, 221 131, 224 126",
  "C 227 121, 236 119, 240 114",
  // Brow, forehead, back to the crown.
  "C 242 108, 240 102, 238 96",
  "C 234 74, 244 38, 268 18",
  "C 280 10, 295 6, 310 6",
  "Z",
].join(" ");
