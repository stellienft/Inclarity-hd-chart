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
 * Coordinate space is the SVG viewBox below; the component scales it
 * responsively.
 */

export const VIEWBOX = { width: 540, height: 920 } as const;

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
  /** Where the centre's name/label anchor sits. */
  labelAt: Point;
}

/* -------------------------------------------------------------------------- */
/*  Centres                                                                    */
/* -------------------------------------------------------------------------- */

const HEAD_APEX: Point = { x: 270, y: 24 };
const HEAD_LEFT: Point = { x: 210, y: 104 };
const HEAD_RIGHT: Point = { x: 330, y: 104 };

const AJNA_LEFT: Point = { x: 210, y: 150 };
const AJNA_RIGHT: Point = { x: 330, y: 150 };
const AJNA_APEX: Point = { x: 270, y: 230 };

const THROAT = { x: 210, y: 276, width: 120, height: 120 };

const G_TOP: Point = { x: 270, y: 418 };
const G_RIGHT: Point = { x: 332, y: 480 };
const G_BOTTOM: Point = { x: 270, y: 542 };
const G_LEFT: Point = { x: 208, y: 480 };

const HEART_LEFT: Point = { x: 338, y: 478 };
const HEART_TOP_RIGHT: Point = { x: 424, y: 428 };
const HEART_BOTTOM_RIGHT: Point = { x: 424, y: 528 };

const SPLEEN_TOP: Point = { x: 72, y: 598 };
const SPLEEN_BOTTOM: Point = { x: 72, y: 722 };
const SPLEEN_APEX: Point = { x: 198, y: 660 };

const SOLAR_TOP: Point = { x: 468, y: 598 };
const SOLAR_BOTTOM: Point = { x: 468, y: 722 };
const SOLAR_APEX: Point = { x: 342, y: 660 };

const SACRAL = { x: 210, y: 600, width: 120, height: 120 };
const ROOT = { x: 210, y: 776, width: 120, height: 120 };

export const CENTERS: readonly CenterGeometry[] = [
  {
    id: "head",
    shape: { kind: "polygon", points: [HEAD_APEX, HEAD_RIGHT, HEAD_LEFT] },
    labelAt: { x: 270, y: 66 },
  },
  {
    id: "ajna",
    shape: { kind: "polygon", points: [AJNA_LEFT, AJNA_RIGHT, AJNA_APEX] },
    labelAt: { x: 270, y: 188 },
  },
  {
    id: "throat",
    shape: { kind: "rect", ...THROAT },
    labelAt: { x: 270, y: 340 },
  },
  {
    id: "g",
    shape: { kind: "polygon", points: [G_TOP, G_RIGHT, G_BOTTOM, G_LEFT] },
    labelAt: { x: 270, y: 486 },
  },
  {
    id: "heart",
    shape: { kind: "polygon", points: [HEART_LEFT, HEART_TOP_RIGHT, HEART_BOTTOM_RIGHT] },
    labelAt: { x: 396, y: 478 },
  },
  {
    id: "spleen",
    shape: { kind: "polygon", points: [SPLEEN_TOP, SPLEEN_APEX, SPLEEN_BOTTOM] },
    labelAt: { x: 116, y: 666 },
  },
  {
    id: "solarPlexus",
    shape: { kind: "polygon", points: [SOLAR_TOP, SOLAR_APEX, SOLAR_BOTTOM] },
    labelAt: { x: 424, y: 666 },
  },
  {
    id: "sacral",
    shape: { kind: "rect", ...SACRAL },
    labelAt: { x: 270, y: 666 },
  },
  {
    id: "root",
    shape: { kind: "rect", ...ROOT },
    labelAt: { x: 270, y: 842 },
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Gate anchor points                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Every gate sits on its centre's boundary, positioned on the side facing the
 * centre its channel travels to. Channels are then drawn as straight lines
 * between the two anchors, which is why the anchors must face each other.
 */
export const GATE_POINTS: Readonly<Record<number, Point>> = {
  // Head — bottom edge, facing the Ajna.
  64: { x: 228, y: 104 },
  61: { x: 270, y: 104 },
  63: { x: 312, y: 104 },

  // Ajna — top edge faces the Head, lower slopes face the Throat.
  47: { x: 228, y: 150 },
  24: { x: 270, y: 150 },
  4: { x: 312, y: 150 },
  17: { x: 240, y: 200 },
  43: { x: 270, y: 228 },
  11: { x: 300, y: 200 },

  // Throat — top edge to the Ajna, bottom to the G, sides outward.
  62: { x: 234, y: 276 },
  23: { x: 270, y: 276 },
  56: { x: 306, y: 276 },
  16: { x: 210, y: 312 },
  20: { x: 210, y: 360 },
  31: { x: 234, y: 396 },
  8: { x: 270, y: 396 },
  33: { x: 306, y: 396 },
  35: { x: 330, y: 306 },
  12: { x: 330, y: 342 },
  45: { x: 330, y: 378 },

  // G — diamond; upper edges to the Throat, lower to the Sacral.
  7: { x: 239, y: 449 },
  1: { x: 270, y: 418 },
  13: { x: 301, y: 449 },
  25: { x: 332, y: 480 },
  46: { x: 301, y: 511 },
  2: { x: 270, y: 542 },
  15: { x: 239, y: 511 },
  10: { x: 208, y: 480 },

  // Heart / Ego.
  51: { x: 338, y: 478 },
  21: { x: 378, y: 450 },
  26: { x: 378, y: 508 },
  40: { x: 424, y: 514 },

  // Spleen — upper edge to Heart/Throat, lower edge to the Root.
  44: { x: 104, y: 614 },
  48: { x: 135, y: 629 },
  57: { x: 170, y: 646 },
  50: { x: 170, y: 674 },
  32: { x: 135, y: 691 },
  28: { x: 107, y: 705 },
  18: { x: 72, y: 690 },

  // Solar Plexus — upper edge to Throat/Heart, lower edge to the Root.
  36: { x: 437, y: 614 },
  22: { x: 405, y: 629 },
  37: { x: 373, y: 645 },
  6: { x: 342, y: 660 },
  49: { x: 373, y: 675 },
  55: { x: 405, y: 691 },
  30: { x: 437, y: 706 },

  // Sacral — top edge upward, sides outward, bottom to the Root.
  34: { x: 222, y: 600 },
  5: { x: 254, y: 600 },
  14: { x: 286, y: 600 },
  29: { x: 318, y: 600 },
  27: { x: 210, y: 650 },
  59: { x: 330, y: 650 },
  9: { x: 228, y: 720 },
  3: { x: 270, y: 720 },
  42: { x: 312, y: 720 },

  // Root — top edge to the Sacral, sides to the Spleen and Solar Plexus.
  53: { x: 228, y: 776 },
  60: { x: 270, y: 776 },
  52: { x: 312, y: 776 },
  58: { x: 210, y: 800 },
  38: { x: 210, y: 836 },
  54: { x: 210, y: 872 },
  19: { x: 330, y: 800 },
  39: { x: 330, y: 836 },
  41: { x: 330, y: 872 },
};

const CENTER_MIDPOINTS: Record<CenterId, Point> = {
  head: { x: 270, y: 77 },
  ajna: { x: 270, y: 177 },
  throat: { x: 270, y: 336 },
  g: { x: 270, y: 480 },
  heart: { x: 396, y: 478 },
  spleen: { x: 114, y: 660 },
  solarPlexus: { x: 426, y: 660 },
  sacral: { x: 270, y: 660 },
  root: { x: 270, y: 836 },
};

/**
 * Where a gate's NUMBER is drawn: just INSIDE its own centre, offset from the
 * anchor toward that centre's midpoint.
 *
 * Inward placement is what conventional BodyGraphs do, and it is also the only
 * arrangement that avoids collisions. Pushing labels outward sends the two
 * gates of a short channel — 1 and 8, 43 and 23, 25 and 51, 59 and 6 — directly
 * into one another, because "away from my centre" means "toward yours".
 */
export function gateLabelPoint(gate: number, center: CenterId, distance = 14): Point {
  const anchor = GATE_POINTS[gate];
  if (!anchor) throw new Error(`No geometry for gate ${gate}`);
  const mid = CENTER_MIDPOINTS[center];

  const dx = mid.x - anchor.x;
  const dy = mid.y - anchor.y;
  const length = Math.hypot(dx, dy) || 1;

  return {
    x: anchor.x + (dx / length) * distance,
    y: anchor.y + (dy / length) * distance,
  };
}

export function getGatePoint(gate: number): Point {
  const point = GATE_POINTS[gate];
  if (!point) throw new Error(`No geometry for gate ${gate}`);
  return point;
}

export function shapeToPath(shape: CenterShape): string {
  if (shape.kind === "rect") {
    const { x, y, width, height } = shape;
    return `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`;
  }
  const [first, ...rest] = shape.points;
  if (!first) return "";
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(" ")} Z`;
}
