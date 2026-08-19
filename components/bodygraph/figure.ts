/**
 * ============================================================================
 *  THE FIGURE BEHIND THE GRAPH
 * ============================================================================
 *
 * The seated silhouette, supplied by the project owner as an Illustrator SVG
 * export and used VERBATIM. The path below is the artwork's own `d` attribute,
 * unedited — no points moved, nothing simplified. Everything needed to place
 * it in the BodyGraph's coordinate system lives in the transform beneath it,
 * so the artwork and the placement can be reasoned about separately and the
 * artwork can be swapped by replacing one string.
 *
 * It is purely decorative: no chart information rides on it, and it is marked
 * aria-hidden where it is drawn.
 *
 * The path holds nine subpaths — the outer contour, six slivers between locks
 * of hair, and the two gaps between the arms and the body. The holes are cut
 * by winding direction, so it must be filled with the DEFAULT nonzero rule.
 * Forcing evenodd here inverts the hair slivers.
 */
export const FIGURE_ARTWORK_PATH =
  "M512.8,1156.2l-27.7-3.4-29,3.6-151,22.8c-30.3,4.6-59.5,6-90.1,5.3-49.3-1.2-111.5-13-153-39.4-28.6-18.2-46.9-52.2-40.1-85.8l-8.1,7.8c-1.1,1.1-5.1,1-6.2,0s-1.9-4.8-1.2-6.5l17.3-43.8,7.3-16.8c-6,5.7-8.8,13-11.4,20.7l-6.1,18c-2.9,8.6-12,11.7-12.7,9.2l-.9-3.6,8.2-43.8,20.7-41.4c1.5-7.3,6.5-12.5,13.5-14.7l39.4-12.5c13.3-4.2,23.6-11,32.1-22,20.6-26.5,38-54.3,53.6-84.2,14.6-27.9,30.1-54,48.9-79.1,7.1-9.5,10.9-20.2,13.1-32,6.2-34.9,11-69.1,15.4-104.4,3.3-26,4.3-50.9,4.2-77,0-21.7.9-42.4,4.1-63.7s12.7-51.1,37.2-65.9c-14.2-33.6-6.2-57.7,14.2-84.7s26.6-36.5,26.7-54.6c0-12.2-1.3-23.8,1-35.7,3.8-19.9,9.9-38.3,16.4-57.6,12.9-38.2,26.3-75.5,44.3-111.6S427.4,5.3,456.5.7c10.5-1.7,20.5-.2,29.5,5.2,13-7.4,28.2-7.5,42.1-1.5,27.4,11.8,44.8,41.6,56.1,68.8,9.6,23.2,17.7,46.2,26,70l19.9,57.1c6.7,21.5,9.7,42.6,6.5,65,3.1,16.1,9.9,30.2,19.5,43.1l16.2,22.8c14.9,21,17.1,47.1,6.4,71.5,27.5,14.4,35.7,40.9,39.9,70.4,6.5,45.8,1.1,91,8,138.2l15.1,103.5c2.1,14,8.2,25.5,16.4,36.6,15.7,21.1,28.7,42.7,41,66,17.5,33,36,64.5,59.1,93.7s16,16.1,27.5,19.7l42.4,13.4c7.4,2.3,12.7,7.1,14.2,14.9l20.5,40.8,8.1,43.6c.8,1.9-.6,5.2-2.3,5.3-8.5.6-11.4-11.9-14.5-20.6l-6.9-19.2c-.6-1.7-2.9-5.2-4.3-6.3l-1.6-1.3c-.7-.9-1.2-1.1-.8.3l13.7,31.7,10.9,29.2c.4,1.2-.6,4.1-1.5,4.9-3.4,2.8-8.9-1.5-13.7-6.3,4.7,33.3-12,64.8-39.3,82.9-13.6,9-27.8,15.2-43.3,20.7-40.3,14.2-82.2,20.4-125.2,20.2-27.7-.1-54-1.9-81.4-6l-148-22.5ZM333.6,260c2.7-10.3,3.8-20.3,5.5-30.8s6.3-28.2,10.8-42.1c6.2-18.4,13-35.8,16.9-55.1l-20.9,61.1-8.4,31.6c-3.1,11.7-4.4,23.3-3.9,35.3ZM635.4,261.1c1.3-19.8-3.7-38.4-9.1-57.3l-19.2-54.9c4.7,21.6,13.3,41.1,19.1,62.1l2.1,7.8,7.1,42.3ZM678.5,391.5c4.2-18.5,1.7-38.4-9.5-54.3l-17-24.1c-14-19.6-17.7-37.4-21.8-60l.2,13.7c.2,15.1,2.4,30.5,10.4,43.5l18,29c9.9,16,16.2,33,19.6,52.1ZM290.4,391.1c3.7-19.7,9.6-36.2,19.6-52,7-11,14-21.5,20-32.9s3.4-11.5,3.2-18.6l1.6,4.9c2-6.8,3.5-13.8,3.7-21.2l.4-17.3-3.8,16c-1.4,5.7-1.5,10.9-1.9,17.7l-1.7-3.7c-4,10.6-9,20.8-16,30.4l-16.5,23.5c-10,16.1-13,35.5-8.4,53.2ZM675.7,400.2c-.9-11.7-3.3-20.1-7.3-29.3,1.2,9.4,1.8,17.1.2,26.3l7.1,3ZM300.2,398.3c-1-10.3-.8-17.4,0-26-5,9.8-6.1,19.2-6.7,29.1l6.6-3.1ZM244.6,934.3c26.2-4.7,48-9.4,56.9-35.8,8-23.6,17.3-45.9,28.9-67.9l13.9-26.2c12.4-23.4,18.8-48.2,18.1-74.9-.9-35-8.9-68.5-21.6-101.1l-12.5-32.4c-3.8,33.6-9.1,65.5-16.1,98.2l-14.2,65.7c-3.9,18.2-12,33.2-22.9,48.4-21.5,30.2-45.5,57.8-72.4,83.5l-62.8,60.1c-5.4,5.2-9.8,10.5-13,17.4,38.3-16.2,76.7-27.7,117.7-35.1ZM843.9,969.1c-2.9-7.3-7.1-11.9-12.2-16.7l-55.3-52.6c-25-23.8-48-48.5-69-75.9l-22.2-33c-5.2-7.7-8.3-16.5-10.4-25.6l-13.5-59.6c-8.2-36.4-14-72.3-18.6-109.8l-11.5,29.5c-14.6,34.5-22.6,70.9-22.5,108.6s2.3,37.2,10.5,53.8l17.2,34.8c13.5,24.8,24.4,49.7,33.4,76.4s31.2,30.7,56.1,35.1c40.8,7.1,79.6,18.8,117.8,34.9Z";

/** The artwork's own viewBox, and the bounding box the path fills within it. */
export const FIGURE_ARTWORK_BOX = {
  minX: -0.1,
  minY: 0.04,
  width: 971.23,
  height: 1184.97,
} as const;

/**
 * Where the figure sits in the BodyGraph's 813 x 1370.3 space.
 *
 * THE SCALE IS UNIFORM. It was not, when the graph was 620 x 840: the artwork
 * is 0.820 wide-to-tall and that space was 0.735, close enough that a 10%
 * vertical stretch was the least-bad way to fill it. The reference BodyGraph
 * is 0.593, and stretching a figure by 38% makes a different person. So it is
 * fitted to the WIDTH and allowed to end where it ends.
 *
 * That leaves 378 units of graph below it, which is the correct look rather
 * than a compromise: in the client's reference the silhouette covers the head
 * and torso and the Root sits at or just past its lower edge. Here the figure
 * runs from the top of the Head centre down to y = 992, which puts its widest
 * part — the seated base — behind the Spleen, Sacral and Solar Plexus, and
 * leaves the Root standing clear below it.
 */
const FIGURE_SCALE = 813 / FIGURE_ARTWORK_BOX.width;
const FIGURE_ORIGIN = { x: 0, y: 0 } as const;

export const FIGURE_TRANSFORM = {
  scale: FIGURE_SCALE,
  translateX: FIGURE_ORIGIN.x - FIGURE_ARTWORK_BOX.minX * FIGURE_SCALE,
  translateY: FIGURE_ORIGIN.y - FIGURE_ARTWORK_BOX.minY * FIGURE_SCALE,
  /** The box the figure ends up occupying, for tests and for reasoning. */
  placedWidth: FIGURE_ARTWORK_BOX.width * FIGURE_SCALE,
  placedHeight: FIGURE_ARTWORK_BOX.height * FIGURE_SCALE,
} as const;

/** The transform attribute that places the artwork. */
export function figureTransformAttr(): string {
  const { translateX, translateY, scale } = FIGURE_TRANSFORM;
  return `translate(${translateX.toFixed(3)} ${translateY.toFixed(3)}) scale(${scale.toFixed(6)})`;
}

/** A BodyGraph point expressed in the artwork's own coordinates. */
export function placeFigurePoint(x: number, y: number): { x: number; y: number } {
  const { translateX, translateY, scale } = FIGURE_TRANSFORM;
  return { x: (x - translateX) / scale, y: (y - translateY) / scale };
}
