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
`brand.test.ts` checks both imprints stay clear of the white channel track and
of the ink used for inactive numerals.

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

The layout comes from the reference BodyGraph the project owner supplied as an
Illustrator SVG export (813 × 1370.3, one path of 74 subpaths). Its nine centre
shapes were measured off the file and are reproduced in
`components/bodygraph/geometry.ts`: bounding boxes, vertices, and the ~30-unit
corner rounding, symmetrised about the vertical axis because the drawing wobbles
a unit or two either side of centre and the Spleen and Solar Plexus have to
mirror each other exactly. The three vertical columns the gates sit on — the
axis and 42.3 either side — are the centre-lines of the artwork's own bars.

### Reading the channels out of it

The reference is line art, so what it contains are white regions between
strokes. A bundle of *n* channels leaves *2n − 1* of them: *n* track interiors
alternating with *n − 1* gaps. Counted that way the file holds exactly 36
channels — five regions between the Head and the Ajna is three channels, not
five.

Channels are drawn as **circular arcs**, which is what makes the two drawings
match. Each radius is solved from how far the artwork's own track for that
channel reaches — the extreme of its bounding box in the file, pulled in by 7
to get from the track's outer edge to its centre-line — by binary search on the
radius of an arc through this drawing's two gate anchors. Solving from the
reach rather than from a circle fit matters, because the gate anchors here are
not pixel-identical to the artwork's junctions, and an arc that borrowed the
radius but not the endpoints missed the envelope by fifty units and tangled.

The check is that the left and right families were solved **independently**,
from separate bounding boxes, and landed on the same numbers: 134/134, 162/162
and 191/191 down to the Root, 116/115 around the Sacral. Arcs also fixed a
problem the previous quadratic Béziers could not: concentric circles nest by
construction, where a family of Béziers each bulging hardest at its own
midpoint splays apart and crosses. The only crossings left are the six the
reference itself draws, all of them 26-44.

Two things were changed deliberately:

- **The Heart is enlarged**, from the artwork's 104 × 90 to 130 × 114. Four
  markers of radius 14 will not sit inside a triangle that small once its
  corners are rounded. It keeps its left vertex where the drawing puts it.
- **Corner rounding is 26, not 30.** Rounding removes area exactly where the
  gates cluster, and 30 left markers overhanging the curves.

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
