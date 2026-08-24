# Brand implementation

Source of truth: **Inclarity Mini Brand Guide / Cheat Sheet**, Indeko Creative,
April 2026. This file records how that sheet is applied in code and — more
usefully — the three places it could not be applied literally, and why.

## Colour

Declared once, in `app/globals.css`. Every hex is quoted from the guide.

| | Name | Hex | Token |
|---|---|---|---|
| Primary | Dusk | `#6A5960` | `--color-dusk` |
| Primary | Skylight | `#C7E0DF` | `--color-skylight` |
| Primary | Linen | `#F4F2ED` | `--color-linen` |
| Primary | Ochre | `#A17D6C` | `--color-ochre` |
| Primary | Pebble | `#ECE7E4` | `--color-pebble` |
| Accent | Rose Clay | `#D7B5A9` | `--color-roseclay` |
| Accent | White | `#FFFFFF` | used literally |
| Accent | Espresso | `#40393B` | `--color-espresso` |

Three shades are derived. Each keeps its parent's hue and saturation and only
drops lightness; none is a new colour.

| Shade | Hex | Why it exists |
|---|---|---|
| `ochre-deep` | `#916D5D` | White numerals on Ochre measure **3.71:1**, below the 4.5:1 small text needs. Design gate markers and planetary chips both put white directly on this fill. The shade measures 4.62:1. |
| `skylight-edge` | `#A0CAC8` | An outline for defined centres; Skylight has no edge against itself. |
| `pebble-edge` | `#DBD2CC` | The same, for undefined centres and channel tracks. |

**Personality and Design.** The two imprints are **Dusk** (`#6A5960`) and
`ochre-deep` — the guide's cool primary against a shade of its warm one, which
is how the client's reference chart separates them. Espresso carried
Personality until that reference arrived; it reads as black at the width of a
channel. White on Dusk measures 6.49:1, so the gate markers and the planetary
chips still clear AA. Because the separation is now hue rather than light-dark,
`brand.test.ts` checks both imprints stay clear of every ground they can be read
against and of the ink used for inactive numerals.

**A hanging gate colours its own half.** A gate can be activated while its
partner is not, and every published chart paints that gate's half of the channel
anyway. Only when BOTH ends are activated is the channel *defined* — which is
what `data-active`, the centre states and the text summary report — so the
drawing and the definition deliberately disagree. Painting only defined channels
made a chart with two of them look like a chart with none, and hid activations
the planetary columns were listing.

Each end is painted by clipping the channel's own regions to a **half-plane**,
perpendicular to the chord through the arc's midpoint (`channelHalfPlane`).
Stroking the half *arc* was tried and cannot be relied on: several corridors in
this file are fragmented or routed too far off a circle for that. Clipping the
real regions cannot miss. Four gates — 10, 20, 34 and 57 — belong to three
channels each, so activation is read from the gate, not from the channel.

**Two colours, in solid blocks.** A gate carrying BOTH imprints splits its half
again, into Personality out at the gate and Design in toward the middle. A
dashed Personality stroke was laid over a Design fill before, and at channel
width a repeating stripe reads as a texture rather than as a colour — a
barber's pole, and on the long arcs it looked like a third thing rather than the
two imprints. Nothing in the drawing is now made of more than the two.

**Nothing is drawn free-hand over the artwork.** All four integration channels
take a ROUTE through the regions they share (`MERGED_ROUTE`): spans of 20-57's
band, of the mouth it shares with 34-57 on the Spleen's upper edge, and of
34-57's track in from the Sacral. 10-34 and 20-34 used to be stroked as circular
arcs between their gates, and those arcs belong to no track — gate 10 or gate 20
activated on its own put a stray line straight down the middle of the drawing,
cutting across everything in its way.

**An inactive channel is not filled.** White was tried and it cost the drawing
twice. The gaps the artwork leaves *between* neighbouring tracks are unfilled,
so they show Pebble — and white on Pebble is 1.14:1. A reader could not tell a
track from the space beside it, only that the whole area was pale and fenced in
by outlines, and the figure the client asked to keep was invisible underneath
it. It also left an activated channel as one plum bar among thirty-four white
ones, so a chart with two defined channels read as a chart with none. Unfilled,
the graph is line work over the figure — which is what the client's file draws —
and the only filled channels are the defined ones. The imprints are then read
against Pebble, Linen or White rather than against a track; the binding measure
is `ochre-deep` on Pebble at 3.76:1, which clears WCAG 1.4.11's 3:1 for
non-text. The 4.5:1 that governs the numerals reversed out of those colours is
unchanged and asserted separately.

**Undefined centres are White, not Linen.** Linen is the page's own ground, so
filling an undefined centre with it left the outline doing all the work. White
puts them a shade lighter than everything around them, as the reference does.
Inactive gate numerals are Espresso on both centre fills — 11.2:1 on white,
8.1:1 on Skylight — which also keeps a plain numeral from being the same ink as
an activated Personality marker.

**Colours that cannot carry body text.** Ochre reaches only 3.31:1 on Linen and
Rose Clay 1.70:1. Both are real brand colours and both are used — as fills,
strokes and accents, never as small text. `brand.test.ts` asserts this so
nobody reaches for one and quietly ships 3.3:1.

Form errors use Dusk for the message (5.85:1) and `ochre-deep` for the input
border (4.62:1 against the white field, comfortably clear of a Pebble border).
The palette has no red; the message also carries `role="alert"` and
`aria-invalid`, so colour was never the only signal.

## Type

One family: **Bricolage Grotesque**, loaded as the variable font so Light and
Extra Light arrive in a single file. Inter has been removed — it was never a
brand font.

| Role | Weight | Tracking | Case | Line |
|---|---|---|---|---|
| Titles | Light (300) | -0.01em | Upper or Title | 1.1 |
| Headings | Light (300) | -0.01em | Title or Sentence | 1.1 |
| Body | Extra Light (200) | 0 | Sentence | see below |
| Navigation / buttons | Light (300) | 0.05em | Upper | 1.0 |

Canva states tracking in thousandths of an em, so the guide's -10 and +50 are
-0.01em and 0.05em. Both are applied exactly.

### Two deliberate adaptations for screen

1. **Sizes.** The guide's 14/12/8pt is a print scale — 8pt body is about 11px
   and unreadable on a display. The *ratios* are kept instead (1.75 : 1.5 : 1),
   off a 16px body, giving 28px titles and 24px headings.
2. **Paragraph leading.** Canva line spacing 1.0 is roughly 1.2 in CSS, far too
   tight for running text. Headings take the specified 1.1 exactly and compact
   UI rows stay tight, but paragraphs are set at 1.6, which is what WCAG 1.4.12
   expects body copy to survive.

A third, narrower exception: gate numerals inside the chart are 10px reversed
out of a 19px disc, where Extra Light strokes disappear. They are set at 500 —
the legibility floor for reversed micro-type — and nowhere else in the product
uses that weight.

### Not implemented

**Avanti Script Bold**, the guide's Quote / Highlight face. It is a commercial
font and we have no licensed file. Rather than substitute something that merely
looks scripty, no element currently uses that role. Supply the woff2 and it can
be wired to pull quotes in one change.

## Why there are tests for this

Two stale duplicates of the styling were live when the guide arrived:
`demo/_tw.css` carried its own `@theme` block — still building a
`--color-design: #a2622f` the app had long since dropped — and `demo/main.tsx`
its own copy of the form markup. Both were internally consistent, so nothing
failed; the shared preview link had simply stopped matching the application.

`components/bodygraph/brand.test.ts` now asserts the exact hex of every brand
colour, that no other colour reaches the theme, that every text-on-brand pair
clears 4.5:1, and that no source file references a retired token or declares a
second theme.


## The BodyGraph drawing

**The drawing IS the client's file.** `components/bodygraph/artwork.ts` holds
their Illustrator export (813 × 1370.3) split into its 74 subpaths, used
verbatim. It was reconstructed from measurements for a while — centre shapes,
then circular arcs with radii solved from it — and reconstruction kept landing
close but not identical. Now the file itself is the line work.

Rendering order is: centre fills, then channel fills, then the artwork's ink on
top. The ink is the whole file as one path; filled with the default nonzero rule
it covers everything except its holes, so the fills beneath show through exactly
the regions the drawing leaves open.

### Reading the channels out of it

It is line art, so what it contains are white regions between strokes. A bundle
of *n* channels leaves *2n − 1* of them: *n* track interiors alternating with
*n − 1* gaps. Five regions between the Head and the Ajna is three channels, not
five.

Every region touching every centre was ordered around that centre's perimeter
and alternate ones taken. That maps **32 of the 36 channels**. Several are more
than one region: where a channel crosses another, the drawing splits the track
it crosses into fragments, and the channel is all of them — which is why an
activated track is **filled** rather than stroked. 37-40 is a single fragment
out by the Solar Plexus that an approximate arc misses entirely.

Taking a gap by mistake is the failure mode this invites, and it is caught by
measurement rather than by eye. A track is a ribbon of constant width and a gap
is a wedge, so modelling each region as a rectangle of the same area and
perimeter recovers the width: solving `2(w + l) = P` and `wl = A` gives
`w = (P − √(P² − 16A)) / 4`. Every plain track in the file measures **12.6 to 16**
units across. The one exception is named: 34-57's mouth on the Spleen, which the
drawing merges with 20-57's, so one opening carries two channels and measures
20.8.

Leaving a real fragment OUT is the same problem from the other side, and needs a
different measure, because a missing piece leaves a hole rather than a wrong
shape. Two checks cover it. Every channel's regions must **reach both of its
gates** — 34-57's merged mouth is 75 units out from gate 57's junction, so
dropping it left the channel starting in mid-air — and no fragment may sit more
than 30 from the rest of its own channel. 26-44 crosses the three tracks running
from the G to the Sacral and the drawing shows it between them as two small
squares (13.8 × 12.9 and 16.8 × 13); without them the channel drew with two
holes punched in it. Both checks are in the e2e suite, along with the widths.

### Only the outlines that mean something

The line work is **derived** from the two maps rather than kept as a separate
copy of the file's path: what is outlined is exactly what can be filled.

Outlining all 73 regions drew the gaps too, and a gap here is the same width as
a track — between the Head and the Ajna the tracks measure 14.9, 15.7 and 15.1
and the gaps 17.3 and 14.3 — so three channels drew as five identical bars, five
times over down the spine and again in every arc bundle. It also put a second
line beside every first one, because each ink stroke in the file is about 5.5
wide and both of its edges were being drawn; that read as a double stroke
everywhere, gate stubs included.

The four it does not map are the integration group — 10-20, 10-34, 10-57 and
20-34. The drawing merges them into one web at the G's left vertex, where a
single track junction exists rather than three, so no region belongs to any one
of them alone. Those four are stroked over the artwork instead, and their radii
were found by sweeping each in turn against the crossing count for the whole
set until no arrangement improved. They now cross nothing. (Clipping them to
the artwork's corridors was tried first and abandoned: the best circular arc
between 10 and 20 lies only 18% inside the track it should follow, because the
drawing routes it out to the left and back.)

### Composition

The graph is drawn at full size in its own coordinates (`GRAPH_BOX`, the
artwork's 813 × 1370.3) and then scaled down as a group inside a shorter frame
(`VIEWBOX`, 813 × 1010). One value, `GRAPH_SCALE`, governs the whole
composition. At 1.0 the graph filled the frame and dwarfed the silhouette; at
0.68 it is 932 tall against the figure's 992, so the head and shoulders stand
clear above and around it and the Root sits just inside the base.

The artwork's line work is **stroked, not filled**, and its **outer contour is
dropped** — stroking subpath 0 drew a ring right round the chart that no
conventional BodyGraph has. What is left is every interior boundary, which is
all the line work the drawing needs. Filling it made every line
as thick as the gap the file leaves between its two edges, and that weight is
baked in — there is no way to lighten it. Stroking the same subpaths draws just
their outlines, at a width set here, and leaves the space between them clear so
the figure shows through.

### Gates sit on the artwork's own junctions

The Spleen's and Solar Plexus's seven gates were spaced evenly along their
edges, which put 48 a third of the way down when its channel arrives at the top
corner, and left 57 and 44 off the tracks running into them. They now sit where
each channel track actually meets the triangle. 57 is the one exception: two
channels arrive there — 20-57 and 34-57 — so it takes the point between them.

### Gate numerals sit square on their channels

Markers come in **perpendicular to the edge** a gate sits on, not toward the
centre's midpoint. The midpoint rule moved a marker sideways as well as inward,
so the Throat's 62, 23 and 56 drifted together and stopped lining up with the
three tracks running to the Ajna. Perpendicular keeps each gate on its own
column.

The cost is that gates on *adjacent* edges converge at a corner, so the Throat's
and Root's side gates were respaced to stay a full marker-diameter from the rows
above and below them, and a gate sitting exactly ON a vertex takes the angle
bisector instead — the perpendicular of either edge runs almost parallel to the
other, and the G's 1, 2, 10 and 25 cleared 0.7 that way.

### What the artwork costs

- **The Heart is subpath 33, not 32.** Subpath 32 sits beside it with a similar
  bounding box and is the background wedge between the G, the Heart and the
  Sacral. Filling that one put the Heart's colour and all four of its numbers
  outside the shape. The real Heart is a *tilted* triangle, well right of and
  below where this had it; its vertices are the intersections of the three
  straight edges, recovered from where each corner fillet begins and ends,
  because the drawing rounds them and a bounding box does not give the corners.
- **The Heart's markers shrank to radius 11** and are solved against the
  rendered path, since the polygon and the drawn shape disagree at the rounded
  corners. The unit clearance test exempts it; the e2e disc check holds it.
- **The Spleen and Solar Plexus are no longer exact mirrors.** The drawing is
  hand-made and wobbles: 163.9 wide against 165.3, outer edges 1.6 apart about
  the axis. The e2e mirror test allows two units of that and no more.

### The figure behind it

`components/bodygraph/figure.ts` holds the seated silhouette the project owner
supplied as an Illustrator SVG export. The path is used **verbatim** — nine
subpaths, the outer contour plus six hair slivers and two arm gaps, cut by
winding direction, so it must take the **default nonzero fill rule**; forcing
`evenodd` inverts the hair.

**The scale is uniform.** It was not when the graph was 620 × 840: the artwork
is 0.820 wide-to-tall against a space of 0.735, close enough that a 10%
vertical stretch was the least-bad way to fill it. The reference BodyGraph is
0.593, and stretching a figure by 38% makes a different person. So it is fitted
to the **width** and allowed to end at its own base — the crossed legs — around
y = 992.

That leaves the Root standing clear below it, which is the composition the
client's reference uses rather than a compromise: head and torso behind the
graph, Root at or past the lower edge. `figure.test.ts` pins the arithmetic and
that the scale stays uniform; `e2e/chart.spec.ts` asks the browser which gates
are actually painted, using `isPointInFill` through the rendered matrices, and
requires the Head, Ajna, Throat and G fully backed, the Root fully clear, and
the Spleen and Solar Plexus to drop the same gates as each other.

### How it is tested

- `bodygraph.test.tsx` checks every marker sits a full radius inside its
  centre's polygon and a full diameter from its neighbours, that the Spleen and
  Solar Plexus mirror exactly, and that the rendered curves cross in exactly the
  two places the layout forces.
- `e2e/chart.spec.ts` asks the **browser** the questions a polygon cannot
  answer. `SVGGeometryElement.isPointInFill()` understands the rounded paths, so
  it samples 48 points around each marker's circumference and requires the whole
  disc inside its centre — a centre-point check passed gate 43 while a fifth of
  its disc hung over the Ajna's rounded apex. It also compares the rendered
  Spleen and Solar Plexus bounding boxes, which catches a drawing that has
  drifted off the axis as well as geometry that has.
