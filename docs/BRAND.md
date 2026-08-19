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

The four it does not map are the integration group — 10-20, 10-34, 10-57 and
20-34. The drawing merges them into one web at the G's left vertex, where a
single track junction exists rather than three, so no region belongs to any one
of them alone. Those four are stroked over the artwork instead.

### What the artwork costs

- **The Heart's markers shrank to radius 11.** A centre cannot be resized to
  suit its numbers any more; the numbers give way. The artwork fillets the
  Heart's corners so hard that its bbox corners are not its vertices, so the
  polygon the geometry uses is *smaller* than the drawn shape — its four
  markers are solved against the rendered path instead, and the unit clearance
  test exempts it.
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
