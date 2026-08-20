/**
 * ============================================================================
 *  THE REFERENCE BODYGRAPH, USED VERBATIM
 * ============================================================================
 *
 * The client's Illustrator export (813 x 1370.3), split into its 74 subpaths
 * and used AS THE DRAWING rather than as a reference to reconstruct from. Every
 * path string below is copied out of that file unedited.
 *
 * It is line art, so what it contains are white regions between strokes. Two
 * facts make it usable as a live chart:
 *
 *  - The nine centre interiors are single regions, so a centre can be filled to
 *    show it defined. The Heart is subpath 33; subpath 32, which sits beside
 *    it and has a similar bounding box, is the background wedge between the G,
 *    the Heart and the Sacral. Filling that one instead put the Heart's colour
 *    and its four numbers outside the shape.
 *  - A bundle of n channels leaves 2n-1 regions, n track interiors alternating
 *    with n-1 gaps, so the tracks can be picked out and filled to show a
 *    channel defined. Every region touching every centre was ordered around
 *    that centre's perimeter and alternate ones taken; the result maps 32 of
 *    the 36 channels.
 *
 * The four it does not map are the integration group — 10-20, 10-34, 10-57 and
 * 20-34. The drawing merges them into one web at the G's left vertex, where
 * only a single track junction exists rather than three, so there is no region
 * that belongs to any one of them alone. Those four are drawn as strokes over
 * the artwork instead; INTEGRATION_GROUP names them.
 */

export const ARTWORK_VIEWBOX = { width: 813, height: 1370.3 } as const;

/** The nine centre interiors. */
export const CENTRE_REGION = {
  head: "M337.6,155.4l140.8-.5c10.1,0,17.8-13.1,13-21.2L419.8,12.4c-7.1-6.9-20.4-8.3-25.9,1l-51.5,87.4-18.1,32c-5.4,9.5,2.2,20.1,13.3,22.6Z",
  ajna: "M422.9,349.4l68.5-111.6c3-5,1.8-10.7-1.3-15.4s-7-7-12.5-7h-139.7c-5.6,0-10.3,3.7-12.6,7.1s-4.4,9.7-1.9,14l22.6,38.5,44.9,74.9c3.9,6.4,8.9,10.7,16.4,10.5,7.1-.2,11.5-4.3,15.6-11Z",
  throat: "M458.4,608.4c14.1,0,28.2-9.7,28.3-24.3l.5-107.9c-2.9-14.7-15.4-24.3-30.3-22.8l-102-.4c-17,0-31.2,10.4-31.2,28.2v101.8c.2,13.6,11.4,23,24.3,25.2l110.4.2Z",
  g: "M421.6,849.3l77.8-75.5c10.3-10,14-26.5,2.9-37.5l-74.6-74c-11.8-11.7-28.6-14.5-41.2-2.2l-78.4,76.3c-8.5,8.3-9.8,24.2-1.2,32.6l80.8,79c9.4,9.2,23,8.9,33.8,1.3Z",
  heart: "M640.8,914.7c6.9,1.3,12.6.2,17.1-4.2s7.5-10.5,4.9-16.2l-37.6-82.2c-3.1-6.7-7.2-11.8-13.1-13.2s-13.8,1.2-19.4,6.2l-64.6,58.2c-5.8,5.2-8.8,11.7-6.4,19.2s8,10.6,15.2,12l103.9,20.2Z",
  spleen: "M161.2,1050.2c5.9-3.4,8.5-9,8.9-14.8s-1.6-12.1-6.7-15.1l-129.9-74.9c-6-3.5-12.5-2.8-18.3.6-4,2.3-9,8-9,14.3v147.7c0,6.6,5.4,12.4,9.6,14.7s11.9,3.2,17.6,0l127.7-72.4Z",
  solarPlexus: "M776.7,1121.5c6.8,3.8,13,5.2,19.5,1.7s10.2-8.1,10.2-15.1v-148.8c0-6.6-6-12.1-10.1-14.2-6.4-3.3-12.3-2-18.3,1.4l-126.7,71.9c-6.1,3.5-10,8.8-10.2,15.3s2.7,12.9,8.9,16.4l126.7,71.4Z",
  sacral: "M486.9,1100.8v-106.7c0-13.3-11.7-25.4-25.1-25.5l-110-.3c-14.6,0-27.9,10.8-28,25.9l-.3,104.9c0,14.7,9.7,25.7,24.4,27.8l112.8-.2c13.8,0,26.2-11.6,26.2-25.9Z",
  root: "M463.2,1363.8c13.7-3,23.7-13,23.7-26.8v-114.9c0-14.8-12.5-27.1-27.1-27.1h-109.9c-14.6.1-26.2,12.6-26.2,27.1v116.8c1.8,13,11.3,24.5,25.2,24.6l114.3.3Z",
} as const;

/**
 * The track interior for each channel the artwork draws separately.
 *
 * Several are more than one region: where another channel crosses, the drawing
 * splits the track it crosses into fragments, and the channel is all of them.
 */
export const CHANNEL_REGION: Readonly<Record<string, readonly string[]>> = {
  "47-64": ["M369.4,208.2v-46.3s-14.9,0-14.9,0v46.6c5.2.2,9.6.6,14.9-.4Z"],
  "24-61": ["M413.9,208.2v-46.4s-15.7,0-15.7,0v46.6c5.7.3,10.4.7,15.7-.2Z"],
  "4-63": ["M454.2,208.2v-46.4c0,0-15.1,0-15.1,0v46.6c5.4.2,9.9.7,15.1-.2Z"],
  "17-62": ["M369.4,446.1l.2-119.8-14.9-23.8v144c4.9.4,9.5,1.1,14.7-.4Z"],
  "23-43": ["M413.6,446.6l.3-80.7c-5.3,1.4-10,1.4-15.4-.4v81.1c-.1,0,15.1,0,15.1,0Z"],
  "11-56": ["M439.2,446.6h15c0-.1-.2-135.2-.2-135.2l-14.9,23.6v111.7Z"],
  "7-31": ["M369.5,667l-.2-52.3h-15.2s.2,66.2.2,66.2l15.2-14Z"],
  "1-8": ["M413.6,645.3v-30.6c-.1,0-15.5,0-15.5,0v31c0,0,15.5-.4,15.5-.4Z"],
  "13-33": ["M453.9,678.5l.3-63.8h-15.2c0,.1-.2,49.9-.2,49.9l15.1,14Z"],
  "35-36": ["M792.8,937c-6.2-111.5-38.2-213.5-104.6-302.3-48.5-64.8-118.5-114-194.4-141.5v14.2c60.8,23.8,116.4,60.4,160.4,109.3,78.7,87.5,118.7,204.3,124.6,321.8,4.7-1.5,9.1-2.1,14-1.5Z"],
  "12-22": ["M746.6,956.8c-.1-20.5-2-38.9-4.7-58.7-7.2-54-21.6-106.1-44.4-155.7-41.1-89.7-112.3-165.5-203.8-204.7v14.5c42,19.6,79,46.5,111.3,79.7,84.8,87.3,125.5,211.2,127.4,332.5l14.2-7.7Z"],
  "21-45": ["M592.8,795.6c5.4-2.2,9-3.5,13.8-4.1-6.2-31.1-13.5-60.5-24.5-89.6-18-48.6-47.9-90.7-88.3-123.5-.4,6.5-.9,11.4-2.9,16.4,24.7,22,45.8,46.8,61.1,75.9,9.4,17.8,15.6,36,22.1,55,7.8,23,12.9,45.7,18.8,69.9Z"],
  "16-48": ["M164.6,608c42.5-44.9,95.3-78.1,152.6-100.4l-.4-14.1c-56.2,20.6-107.1,51.5-150.3,92.3-28.6,27.1-52.2,57.9-72.5,91.4l-24.2,44.2c-31.9,67.7-49.8,140.5-53.7,216.2,5.1-.6,9.3-1.7,14.1-.5,6.1-119.6,51.6-241.8,134.4-329.2Z"],
  "20-57": ["M100.6,815.1c4.3-9.4,13.4-16.1,21.2-21.8,42.9-31.5,119.9-35.2,173.3-34l.3-13.4c-39.5-1.5-77.4.4-115.3,8.3-25.2,5.3-47.8,14.3-70,29.2,12-31,26-60.2,44-87.8,15-23.1,30.8-44.4,49.9-64.1,21.4-22.1,44.3-41.3,70.5-57.4,14.1-8.7,27.6-16.8,42.7-23.4l-.5-13.8c-19,7.7-36,17.2-53.3,28-31.2,19.5-58.9,43.1-83,71-23.8,27.5-43.9,57.1-60.4,89.7-21,41.5-36.6,84.9-46.5,130.4-7.1,32.6-10.3,64.8-12,97.8l14.1,8c.9-20.8,1.8-40,5-60.2,10.7,23.5,26.3,41.4,47.1,55.5l10-9.2c-26.9-18.6-55.4-52.3-50.1-85.6,2.5-16,6.1-32,13-47.2Z"],
  "5-15": ["M369.4,961v-121.6s-15.1-13.8-15.1-13.8l-.2,135.8c5.5.5,10,1,15.3-.3Z"],
  "2-14": ["M413.2,889.6v-20.5c-.1,0,.2-8.7.2-8.7-5.9,1.5-10.4,1.1-15.6.1v101.2c.1,0,15.8-.3,15.8-.3l-.3-71.8Z"],
  "29-46": ["M439,961.5h15.1c0,0-.1-134.1-.1-134.1l-15,13.8v120.3Z"],
  "25-51": ["M578.4,808.9c-15.5-22.3-37.8-39.5-62.9-51.8l-5,13.5c23.2,11.1,43.1,26.6,57.7,47.7l10.2-9.4Z"],
  "42-53": ["M354.2,1188.4h15.2s0-55.1,0-55.1l-15.2.4v54.7Z"],
  "3-60": ["M398.2,1188.4h15.2c0,0,0-54.8,0-54.8l-15.4.2v54.6Z"],
  "9-52": ["M439.1,1188.5h15c0-.1,0-55.1,0-55.1l-15,.4v54.7Z"],
  "32-54": ["M316.7,1246c-17.4-3.8-32.5-8.6-48.3-14.6-71.2-27.2-124.8-75-155.6-145.8l-11.7,6.5,11.6,24.1c18,32.7,41.4,60.9,71.3,83.7,39,29.7,84.2,49.4,132.8,59.5.3-4.7.9-8.9-.2-13.4Z"],
  "28-38": ["M316.7,1296.2c1.1-6.7.7-8.9.1-12.9-24.5-5.1-47-13-69.9-22.4-18.2-7.4-34.7-16.2-51.3-26.7-52.9-33.4-88.7-72.9-114.7-130.6l-11.6,6.5c27.2,59.6,65.5,101.5,120.6,135.9,39.7,24.8,81.2,39.6,126.8,50.2Z"],
  "18-58": ["M316.8,1333.2l.2-13.3c-26.3-6.4-51.5-13.1-76.7-22.5-86.3-32.4-156.4-88.9-195-173.8l-12.4,6.7c22.3,48.9,56.4,91,99.3,123.4,56.2,42.5,116.2,64.1,184.7,79.5Z"],
  "19-49": ["M493.7,1258.9c95.9-21.3,175.8-76.6,212-169.9l-12.1-6.7c-18.6,49-50.6,89.4-93.7,118-32.5,21.5-68.4,36.7-106.3,45.4v13.1Z"],
  "39-55": ["M494.2,1296.6c44-10.1,84.8-25.7,122.5-48.5,55-32.7,98.4-81.2,124.2-139.5l-11.2-6.3c-10.3,21.3-21.3,41-35.5,59.3-50.1,64.3-121.8,103.7-200.5,122.2-.4,4.6-1.1,8.4.5,12.9Z"],
  "30-41": ["M494.3,1334.1c34.8-7.6,67.8-16.9,99.7-30.6,81.2-32.9,146.7-95,184-174.1l-12.5-6.9c-36.3,78.7-101.5,139.3-182.1,171.2-29.2,11.5-58.8,20.8-89.7,27-.4,4.8-1.2,8.3.6,13.4Z"],
  "6-59": ["M494.3,1099.9c51.5-9.6,99.7-25.6,145.8-49.7-2.5-3.4-4.1-6.7-5.4-11.6-44.8,23.2-91.8,39-141.1,47.8,0,5-1,8.8.7,13.5Z"],
  "27-50": ["M317,1099.4v-13.6s-52.2-12.1-52.2-12.1c-30.6-9.3-59.4-20.9-88-35.8-1.3,4.7-2.9,8.4-5.8,12.3,31.5,16.3,63,28.7,96.5,38.2l49.5,10.9Z"],
  /*
   * The second region is the quadrilateral on the Spleen's upper edge, where
   * this channel and 20-57 leave the centre through ONE merged mouth. It is
   * 20.8 units across where a plain track is 12.6 to 16, which is why it was
   * taken for a gap and dropped; walking the corridor out of gate 57's junction
   * finds it 75 units along, before anything else belonging to 34-57, so it is
   * this channel's and the extra width is the junction it shares.
   */
  "34-57": [
    "M316.7,1015.7l-68.9-16.8c-31-9.6-60.3-21.3-88.6-36.9l-10,9.3c53.1,30.8,108.3,46.2,167.7,58.5.4-5.1.7-9.1-.2-14Z",
    "M107.3,980.2l16.7-19.1c-15.9-11.2-29-23.6-39.7-40.7l-2.9,44.9,25.9,14.9Z",
  ],
  /*
   * Four regions, in a row at y 877: the arc in from the Spleen, then two small
   * squares, then the bar into the Heart. The squares are the corridor showing
   * between the three tracks that cross it on their way from the G to the
   * Sacral — 5-15 at x 354-369, 2-14 at 398-414, 29-46 at 439-454, with this
   * channel's pieces filling 349-354, 375-392, 419-433 and 460-515 between
   * them. Without them the channel drew with two holes punched in it.
   */
  "26-44": [
    "M514.2,882.7c-.3-5.7.2-7.8.8-12.3h-55.3s0,13,0,13l54.5-.7Z",
    "M419.5,884.7l13.8-.5-.2-12.9-13.9.5c0,4.5-.7,8.2.4,12.9Z",
    "M375.5,886l16.8-.7v-13c-.1,0-17,.8-17,.8-.3,4.6-.5,8.7.3,13Z",
    "M348.8,888v-13.2c-90.7,8.5-178.3,34.8-236.5,108l11.9,7.1c57.2-69.2,137.5-92.5,224.6-101.9Z",
  ],
  "37-40": ["M699.3,983.8l11.6-6.7c-11.8-24.3-25.6-46.5-44.5-66.3-2.8,3-5.5,6.1-9.8,8.5l21.3,25.7c8.5,12.4,15,25.5,21.5,38.7Z"],
};

/** The four the drawing merges, which cannot have a track of their own. */
/**
 * The drawing's line work: the outline of every region the chart can paint,
 * and nothing else.
 *
 * The file's own path has 74 subpaths — an outer contour and 73 regions — and
 * only 45 of those regions are a centre or a channel. The other 28 are the GAPS
 * the drawing leaves between neighbouring channels, plus the one large region
 * of negative space in the middle of the graph. Stroking all 73 outlined the
 * gaps too, and a gap here is the same width as a track (between the Head and
 * the Ajna: tracks of 14.9, 15.7 and 15.1, gaps of 17.3 and 14.3), so three
 * channels drew as five identical bars. It also put a second line beside every
 * first one — each ink stroke is about 5.5 wide and its two edges were both
 * being drawn — which read as a double stroke everywhere, gates included.
 *
 * Deriving it from the two maps rather than keeping a separate copy makes that
 * exact: what is outlined is what can be filled, and a region dropped from one
 * cannot linger in the other.
 */
export const ARTWORK_INK: string = [
  ...Object.values(CENTRE_REGION),
  ...Object.values(CHANNEL_REGION).flat(),
].join(" ");


export const INTEGRATION_GROUP: readonly string[] = ["10-20", "10-34", "10-57", "20-34"];

/**
 * Two of the four DO run along a drawn track — they just share it.
 *
 * The drawing takes one band from the Throat's left edge, past the G's left
 * vertex, out and down to the Spleen. That band is 20-57 end to end; 10-20 is
 * the part of it above gate 10 and 10-57 the part below. Splitting it at gate
 * 10's height and filling the relevant half puts each of them exactly on the
 * line the drawing draws, instead of a chord cutting straight across the arcs
 * beneath — which is what a circular arc between those two points does, and no
 * radius fixes it: the drawing routes the channel out to the left and back,
 * and the best arc lies 18% inside the track.
 *
 * 10-34 and 20-34 have no such band and stay stroked.
 */
export const MERGED_CORRIDOR: Readonly<
  Record<string, { region: string; from: number; to: number }>
> = {
  "10-20": { region: "M100.6,815.1c4.3-9.4,13.4-16.1,21.2-21.8,42.9-31.5,119.9-35.2,173.3-34l.3-13.4c-39.5-1.5-77.4.4-115.3,8.3-25.2,5.3-47.8,14.3-70,29.2,12-31,26-60.2,44-87.8,15-23.1,30.8-44.4,49.9-64.1,21.4-22.1,44.3-41.3,70.5-57.4,14.1-8.7,27.6-16.8,42.7-23.4l-.5-13.8c-19,7.7-36,17.2-53.3,28-31.2,19.5-58.9,43.1-83,71-23.8,27.5-43.9,57.1-60.4,89.7-21,41.5-36.6,84.9-46.5,130.4-7.1,32.6-10.3,64.8-12,97.8l14.1,8c.9-20.8,1.8-40,5-60.2,10.7,23.5,26.3,41.4,47.1,55.5l10-9.2c-26.9-18.6-55.4-52.3-50.1-85.6,2.5-16,6.1-32,13-47.2Z", from: 536.9, to: 760.1 },
  "10-57": { region: "M100.6,815.1c4.3-9.4,13.4-16.1,21.2-21.8,42.9-31.5,119.9-35.2,173.3-34l.3-13.4c-39.5-1.5-77.4.4-115.3,8.3-25.2,5.3-47.8,14.3-70,29.2,12-31,26-60.2,44-87.8,15-23.1,30.8-44.4,49.9-64.1,21.4-22.1,44.3-41.3,70.5-57.4,14.1-8.7,27.6-16.8,42.7-23.4l-.5-13.8c-19,7.7-36,17.2-53.3,28-31.2,19.5-58.9,43.1-83,71-23.8,27.5-43.9,57.1-60.4,89.7-21,41.5-36.6,84.9-46.5,130.4-7.1,32.6-10.3,64.8-12,97.8l14.1,8c.9-20.8,1.8-40,5-60.2,10.7,23.5,26.3,41.4,47.1,55.5l10-9.2c-26.9-18.6-55.4-52.3-50.1-85.6,2.5-16,6.1-32,13-47.2Z", from: 760.1, to: 961.8 },
};
