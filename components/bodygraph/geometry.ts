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
 * The artwork's own channel bars are NOT used as channels. It draws five bars
 * between the Head and the Ajna where Human Design has three, and similar
 * decorative bundles elsewhere, so its bars cannot be mapped one-to-one onto
 * the 36 channels; colouring them would light up lines that do not exist.
 * Channels are routed here instead, from the gate anchors below, and the
 * artwork's bar centre-lines are what set those anchors' columns — the three
 * real channels in each vertical bundle land on the columns the drawing uses.
 */

export const VIEWBOX = { width: 813, height: 1370.3 } as const;

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
 * The Heart is the one centre enlarged beyond what the artwork draws. The
 * reference gives it 104 x 90, which is fine for line art carrying no
 * numbers, but four markers of radius 14 will not sit inside a triangle that
 * small once its corners are rounded. 130 x 114 is the smallest that holds
 * them a full radius clear of every edge and a full diameter apart; it keeps
 * the left vertex where the drawing puts it, against the G, and still leaves
 * 55 units of gap to the Solar Plexus for the 37-40 channel.
 */
const HEART = {
  left: { x: 455, y: 820 },
  topRight: { x: 585, y: 763 },
  bottomRight: { x: 585, y: 877 },
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
  20: { x: 323.8, y: 543 },
  35: { x: 487.2, y: 496 },
  12: { x: 487.2, y: 543 },
  45: { x: 487.2, y: 582 },
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
  21: { x: 585, y: 763 },
  51: { x: 500.5, y: 800 },
  26: { x: 491.4, y: 835.9 },
  40: { x: 585, y: 877 },

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
  34: { x: 323.8, y: 1010 },
  27: { x: 323.8, y: 1080 },
  59: { x: 487.2, y: 1080 },
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
  54: { x: 323.9, y: 1236 },
  38: { x: 323.9, y: 1279 },
  58: { x: 323.9, y: 1322 },
  19: { x: 487.1, y: 1236 },
  39: { x: 487.1, y: 1279 },
  41: { x: 487.1, y: 1322 },
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
  48: { x: 48.5, y: 982.9 },
  57: { x: 81.2, y: 1001 },
  44: { x: 114.2, y: 1019.3 },
  50: { x: 140.9, y: 1034.1 },
  32: { x: 114.2, y: 1048.9 },
  28: { x: 81.2, y: 1067.1 },
  18: { x: 48.4, y: 1085.3 },
  // Solar Plexus — the exact mirror of the Spleen about AXIS_X.
  36: { x: 762.5, y: 982.9 },
  22: { x: 729.8, y: 1001 },
  37: { x: 696.8, y: 1019.3 },
  6: { x: 670.1, y: 1034.1 },
  49: { x: 696.8, y: 1048.9 },
  55: { x: 729.8, y: 1067.1 },
  30: { x: 762.6, y: 1085.3 },
  // Heart — 21 and 40 on their corner's angle bisector, which is the only
  // direction that clears both edges of a vertex at once; 51 and 26 straight
  // in along the normal of the edge they sit on.
  21: { x: 570.5, y: 785.2 },
  51: { x: 524.7, y: 805.3 },
  26: { x: 504.1, y: 825.7 },
  40: { x: 570.5, y: 854.8 },
  /*
   * The Ajna's apex, and only the apex. A vertex needs its marker on the angle
   * bisector, and the Ajna's is sharp enough that the inset the rest of the
   * centre can afford leaves 43 straddling its edges.
   *
   * It has to clear the ROUNDED apex, not the sharp one. With CORNER_RADIUS
   * 26 the drawn boundary there is an arc of radius 26 centred at (405.5,
   * 309.2), so the marker's centre has to stay within 12 of that point for its
   * own 14 to fit inside. At the clearance the sharp polygon alone asks for it
   * sat at y = 332.8 and spilled over the curve; the e2e disc check is what
   * measures this.
   */
  43: { x: 405.5, y: 320 },
};

const CENTER_MIDPOINTS: Record<CenterId, Point> = {
  head: { x: 405.5, y: 105.9 },
  ajna: { x: 405.5, y: 263.7 },
  throat: { x: 405.5, y: 530.7 },
  g: { x: 405.5, y: 753.5 },
  heart: { x: 529.2, y: 820 },
  spleen: { x: 61.2, y: 1034.1 },
  solarPlexus: { x: 749.8, y: 1034.1 },
  sacral: { x: 405.5, y: 1047.6 },
  root: { x: 405.5, y: 1279.4 },
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
  head: 22,
  ajna: 20,
  throat: 20,
  g: 28,
  heart: 14,
  spleen: 14,
  solarPlexus: 14,
  sacral: 28,
  root: 28,
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
const STRAIGHT_BELOW = 180;
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
const BOW_FACTOR = 0.9;
/**
 * A ceiling so a future long channel cannot swing outside the figure.
 *
 * Clamping flattens the longest arcs onto the medium ones and re-creates
 * exactly the crossings this is here to avoid, which is what a ceiling of 46
 * was doing. At 88 it binds on only the two longest channels, and the sweep
 * shows the crossing count is flat from here upward.
 */
const MAX_BOW = 220;

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
