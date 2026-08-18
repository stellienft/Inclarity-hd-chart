import { describe, expect, it } from "vitest";

import {
  FIGURE_ARTWORK_BOX,
  FIGURE_ARTWORK_PATH,
  FIGURE_TRANSFORM,
  figureTransformAttr,
  placeFigurePoint,
} from "./figure";
import { VIEWBOX } from "./geometry";

/**
 * The figure is supplied artwork used verbatim, so there is nothing to test
 * about its shape — only about where it is put. These are the placement
 * arithmetic; whether the painted result actually backs the chart is checked
 * in the browser, in e2e/chart.spec.ts, where the real fill rule and the holes
 * are available.
 */
describe("figure artwork", () => {
  it("is used verbatim: one path, nine subpaths, untouched", () => {
    // Outer contour, six slivers between locks of hair, two arm gaps.
    const subpaths = FIGURE_ARTWORK_PATH.match(/M/g) ?? [];
    expect(subpaths).toHaveLength(9);
    expect(FIGURE_ARTWORK_PATH.startsWith("M512.8,1156.2")).toBe(true);
    expect(FIGURE_ARTWORK_PATH.endsWith("Z")).toBe(true);
  });

  it("lands its bounding box exactly inside the frame", () => {
    const topLeft = placeFigurePoint(FIGURE_ARTWORK_BOX.minX, FIGURE_ARTWORK_BOX.minY);
    const bottomRight = placeFigurePoint(
      FIGURE_ARTWORK_BOX.minX + FIGURE_ARTWORK_BOX.width,
      FIGURE_ARTWORK_BOX.minY + FIGURE_ARTWORK_BOX.height,
    );

    expect(topLeft.x).toBeCloseTo(4, 6);
    expect(topLeft.y).toBeCloseTo(4, 6);
    expect(bottomRight.x).toBeCloseTo(616, 6);
    expect(bottomRight.y).toBeCloseTo(836, 6);

    // A 4-unit margin all round, and nothing clipped.
    expect(bottomRight.x).toBeLessThan(VIEWBOX.width);
    expect(bottomRight.y).toBeLessThan(VIEWBOX.height);
  });

  /**
   * The scale is deliberately non-uniform — see the note in figure.ts for why
   * the two uniform options are worse. What matters is that the distortion
   * stays small enough to be invisible on a flat silhouette, so it is measured
   * rather than left to drift.
   */
  it("stretches the artwork by about a tenth, and no more", () => {
    const distortion = FIGURE_TRANSFORM.scaleY / FIGURE_TRANSFORM.scaleX;
    expect(distortion).toBeGreaterThan(1);
    expect(distortion).toBeLessThan(1.15);
  });

  it("emits a transform SVG can parse", () => {
    expect(figureTransformAttr()).toMatch(
      /^translate\(-?\d+\.\d+ -?\d+\.\d+\) scale\(\d+\.\d+ \d+\.\d+\)$/,
    );
  });
});
