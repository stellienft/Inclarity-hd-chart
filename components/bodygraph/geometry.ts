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
 * what gives the long channels room to curve, and they land either side of
 * the seated figure's arms.
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
/*
 * The three triangles are larger than the obvious layout makes them, and the
 * reason is arithmetic rather than taste: seven gates fit around the Spleen
 * only if the triangle is big enough to hold seven markers a full diameter
 * apart AND a marker's radius clear of every edge. At the size these were
 * before, every one of their eighteen gates crossed its own boundary. See the
 * clearance test in bodygraph.test.tsx.
 */
const HEART = {
  left: { x: 386, y: 478 },
  topRight: { x: 478, y: 436 },
  bottomRight: { x: 478, y: 520 },
};
const SPLEEN = { top: { x: 30, y: 536 }, apex: { x: 152, y: 596 }, bottom: { x: 30, y: 656 } };
const SOLAR = { top: { x: 590, y: 536 }, apex: { x: 468, y: 596 }, bottom: { x: 590, y: 656 } };
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
  // The side gates pair off across the centre: 16 opposite 35, 20 opposite 12.
  // 45 hangs below them with nothing facing it, which is how a conventional
  // chart draws the Throat.
  16: { x: 250, y: 274 },
  20: { x: 250, y: 304 },
  31: { x: 274, y: 352 },
  8: { x: 310, y: 352 },
  33: { x: 346, y: 352 },
  35: { x: 370, y: 274 },
  12: { x: 370, y: 304 },
  45: { x: 370, y: 334 },

  // G — diamond; upper edges to the Throat, lower to the Sacral.
  1: { x: 310, y: 366 },
  7: { x: 274, y: 398 },
  13: { x: 346, y: 398 },
  25: { x: 382, y: 430 },
  46: { x: 346, y: 462 },
  2: { x: 310, y: 494 },
  15: { x: 274, y: 462 },
  10: { x: 238, y: 430 },

  /*
   * Heart / Ego — read around the triangle the way the reference template
   * draws it: 21 at the top vertex, 51 partway down the upper-left edge, then
   * 26 and 40 on the two lower edges.
   *
   * That order is what keeps the four channels untangled. 21 meets the Throat
   * at 45 (370, 334) and 51 the G at 25 (382, 430) — both up and to the left,
   * but 45 sits a hundred units higher, so the gate reaching it has to start
   * higher too or the two arcs swap sides. Below them 26 leaves for the
   * Spleen's 44, far out to the left, and 40 for the Solar Plexus's 37, out to
   * the right, so they part company at once.
   *
   * 26 is the one gate that cannot take the template's position. The template
   * puts it on the left vertex, at (386, 478); from there its channel to 44
   * has to cross x = 346 — where 29-46 runs as a straight vertical from y 462
   * to 540 — and it only has forty units of width in which to drop below 540.
   * Swept: no bow value clears it. Every position from t = 0.27 down the lower
   * edge is clean, so 26 sits at the first of them, as far toward the vertex
   * as the drawing allows.
   */
  21: { x: 478, y: 436 },
  51: { x: 436.6, y: 454.9 },
  26: { x: 411.8, y: 489.8 },
  40: { x: 478, y: 520 },

  /*
   * Spleen — the exact mirror of the Solar Plexus, and it has to be. Read
   * around the perimeter from the top corner: 48, 57, 44 down the upper edge,
   * 50 at the apex, then 32, 28, 18 back along the lower edge.
   *
   * That order is forced by the channels, not chosen. Going up: 48 meets the
   * Throat at 16, 57 the Throat at 20, 44 the Heart at 26 — targets that get
   * progressively lower, so the gates must too or their channels cross. Going
   * down: 32 meets the Root at 54, 28 at 38, 18 at 58, which sit in that order
   * down the Root's left edge. An earlier layout put 44 at the top and 18 out
   * on the left edge, and the crossings were visible in the drawing.
   */
  48: { x: 52, y: 546.8 },
  57: { x: 84.8, y: 562.9 },
  44: { x: 121.3, y: 580.9 },
  50: { x: 152, y: 596 },
  32: { x: 121.3, y: 611.1 },
  28: { x: 84.8, y: 629.1 },
  18: { x: 48.3, y: 647 },

  // Solar Plexus — upper edge to Throat/Heart, lower edge to the Root.
  36: { x: 568, y: 546.8 },
  22: { x: 535.2, y: 562.9 },
  37: { x: 498.7, y: 580.9 },
  6: { x: 468, y: 596 },
  49: { x: 498.7, y: 611.1 },
  55: { x: 535.2, y: 629.1 },
  30: { x: 571.7, y: 647 },

  /*
   * Sacral — 34 belongs on the LEFT edge, not in the top row: all three of its
   * channels (57, 10, 20) run up and to the left.
   *
   * The bottom row reads 42, 3, 9 left to right so that it lines up with the
   * Root's 53, 60, 52 and the three channels drop straight down. Reversed, as
   * it was, they cross in an X below the centre.
   */
  5: { x: 274, y: 540 },
  14: { x: 310, y: 540 },
  29: { x: 346, y: 540 },
  34: { x: 250, y: 572 },
  27: { x: 250, y: 616 },
  59: { x: 370, y: 616 },
  42: { x: 274, y: 652 },
  3: { x: 310, y: 652 },
  9: { x: 346, y: 652 },

  /*
   * Root — the left edge runs 54, 38, 58 downward to meet the Spleen's 32, 28,
   * 18, mirroring 19, 39, 41 against the Solar Plexus's 49, 55, 30. Swapping
   * 54 and 58, as an earlier layout did, crosses all three channels.
   */
  53: { x: 274, y: 700 },
  60: { x: 310, y: 700 },
  52: { x: 346, y: 700 },
  54: { x: 250, y: 724 },
  38: { x: 250, y: 756 },
  58: { x: 250, y: 788 },
  19: { x: 370, y: 724 },
  39: { x: 370, y: 756 },
  41: { x: 370, y: 788 },
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
  // Spleen
  48: { x: 57.2, y: 560.6 },
  57: { x: 80.8, y: 572.4 },
  44: { x: 107.1, y: 585.1 },
  50: { x: 129.2, y: 596 },
  32: { x: 107.1, y: 606.9 },
  28: { x: 80.8, y: 619.6 },
  18: { x: 54.6, y: 632.6 },
  // Solar Plexus
  36: { x: 562.8, y: 560.6 },
  22: { x: 539.2, y: 572.4 },
  37: { x: 512.9, y: 585.1 },
  6: { x: 490.8, y: 596 },
  49: { x: 512.9, y: 606.9 },
  55: { x: 539.2, y: 619.6 },
  30: { x: 565.4, y: 632.6 },
  // Heart — 21 and 40 sit on their corner's angle bisector, which is the only
  // direction that clears both edges of a vertex at once; 51 and 26 come
  // straight in along the normal of the edge they sit on.
  21: { x: 468.5, y: 450.8 },
  51: { x: 441, y: 464.5 },
  26: { x: 416.2, y: 480.2 },
  40: { x: 468.5, y: 505.2 },
};

const CENTER_MIDPOINTS: Record<CenterId, Point> = {
  head: { x: 310, y: 75 },
  ajna: { x: 310, y: 155 },
  throat: { x: 310, y: 296 },
  g: { x: 310, y: 430 },
  heart: { x: 447, y: 478 },
  spleen: { x: 71, y: 596 },
  solarPlexus: { x: 549, y: 596 },
  sacral: { x: 310, y: 596 },
  root: { x: 310, y: 756 },
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
  head: 18,
  ajna: 16,
  throat: 18,
  g: 18,
  heart: 9,
  spleen: 9,
  solarPlexus: 9,
  sacral: 18,
  root: 18,
};

/**
 * Where a gate's marker is drawn: just INSIDE its own centre, nudged from the
 * anchor toward that centre's midpoint.
 *
 * Inward placement is what conventional BodyGraphs do, and it is the only
 * arrangement that avoids collisions. Pushing markers outward sends the two
 * gates of a short channel — 1 and 8, 43 and 23, 25 and 51, 59 and 6 — directly
 * into one another, because "away from my centre" means "toward yours".
 *
 * Toward the midpoint, NOT perpendicular to the edge. Perpendicular is the
 * tempting alternative — it would keep gates sharing an edge exactly as far
 * apart however deep the inset — but it drives gates on ADJACENT edges
 * together instead, and every centre has corners: measured, it put the
 * Throat's 33 and 45 eight units apart, and the Spleen's 32 and 44 the same.
 * Aiming everything at the midpoint converges gates gently and uniformly, so
 * one number per centre controls it.
 */
export function gateLabelPoint(gate: number, center: CenterId, distance?: number): Point {
  const anchor = GATE_POINTS[gate];
  if (!anchor) throw new Error(`No geometry for gate ${gate}`);

  const solved = GATE_MARKER_OVERRIDES[gate];
  if (solved && distance === undefined) return solved;

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
/**
 * How far a channel bows, per unit of its length.
 *
 * The value is set by where channels stop crossing each other, not by taste.
 * Swept against the current gate positions: five pairs cross below 0.32, two
 * at 0.32, and one — the pair the layout forces — from 0.36 upward. It has
 * been re-swept twice, because enlarging the three triangles moved their
 * anchors and re-tangled arcs that had been clear. See the crossing test in
 * bodygraph.test.tsx.
 * Because every arc scales by the same factor, a longer channel always bows
 * further than a shorter one sharing its corridor, so the set nests instead
 * of tangling.
 */
const BOW_FACTOR = 0.36;
/**
 * A ceiling so a future long channel cannot swing outside the figure.
 *
 * Clamping flattens the longest arcs onto the medium ones and re-creates
 * exactly the crossings this is here to avoid, which is what a ceiling of 46
 * was doing. At 88 it binds on only the two longest channels, and the sweep
 * shows the crossing count is flat from here upward.
 */
const MAX_BOW = 88;

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

/*
 * The seated figure that sits behind the graph lives in ./figure.ts — it is
 * supplied artwork, used verbatim, and is placed by a transform rather than by
 * coordinates written here. This module stays what it says it is: the
 * BodyGraph's own geometry.
 */
