import { describe, expect, it } from "vitest";

import { FIGURE_ARTWORK_BOX, FIGURE_ARTWORK_PATH, FIGURE_TRANSFORM, placeFigurePoint } from "./figure";
import { VIEWBOX } from "./geometry";

/**
 * Nothing about a supplied drawing's SHAPE is worth asserting — it is the
 * client's artwork and it is right by definition. What is worth asserting is
 * that it has not been quietly edited, and that the arithmetic placing it in
 * the BodyGraph still does what the comments say.
 */
describe("the figure behind the graph", () => {
  it("carries the artwork unedited", () => {
    // Nine subpaths: the outer contour, six hair slivers, two arm gaps.
    expect(FIGURE_ARTWORK_PATH.match(/M/g) ?? []).toHaveLength(9);
    expect(FIGURE_ARTWORK_PATH.startsWith("M512.8,1156.2")).toBe(true);
    expect(FIGURE_ARTWORK_PATH.endsWith("Z")).toBe(true);
  });

  /**
   * The scale must stay UNIFORM. It was not when the graph was 620 x 840 — a
   * 10% vertical stretch was the least-bad way to fill a space of nearly the
   * same aspect. The reference BodyGraph is 0.593 against the artwork's 0.820,
   * and stretching a figure by 38% makes a different person, so the figure is
   * fitted to the width and allowed to end where it ends.
   */
  it("scales uniformly", () => {
    const placedAspect = FIGURE_TRANSFORM.placedWidth / FIGURE_TRANSFORM.placedHeight;
    const artworkAspect = FIGURE_ARTWORK_BOX.width / FIGURE_ARTWORK_BOX.height;
    expect(placedAspect).toBeCloseTo(artworkAspect, 6);
  });

  it("fits the width exactly and leaves the Root standing clear below it", () => {
    const { translateX, translateY, scale, placedWidth, placedHeight } = FIGURE_TRANSFORM;

    const left = translateX + FIGURE_ARTWORK_BOX.minX * scale;
    const top = translateY + FIGURE_ARTWORK_BOX.minY * scale;

    expect(left).toBeCloseTo(0, 6);
    expect(top).toBeCloseTo(0, 6);
    expect(placedWidth).toBeCloseTo(VIEWBOX.width, 6);

    // Nothing is clipped sideways, and the base lands above the Root's top
    // edge (y = 1195) so the Root reads as standing clear of the figure.
    expect(placedHeight).toBeGreaterThan(900);
    expect(placedHeight).toBeLessThan(1195);
    expect(placedHeight).toBeLessThan(VIEWBOX.height);
  });

  it("maps a BodyGraph point back into the artwork's own coordinates", () => {
    const { translateX, translateY, scale } = FIGURE_TRANSFORM;
    const back = placeFigurePoint(translateX + 100 * scale, translateY + 250 * scale);
    expect(back.x).toBeCloseTo(100, 6);
    expect(back.y).toBeCloseTo(250, 6);
  });
});
