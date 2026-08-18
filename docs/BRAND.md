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


## The figure behind the BodyGraph

`components/bodygraph/figure.ts` holds the seated silhouette the project owner
supplied as an Illustrator SVG export. The path is used **verbatim** — no
points moved, nothing simplified — and everything about placing it lives in a
transform beside it, so the artwork can be swapped by replacing one string.

It is nine subpaths: the outer contour, six slivers between locks of hair, and
the two gaps between the arms and the body. The holes are cut by winding
direction, so it must be filled with the **default nonzero rule**; forcing
`evenodd` inverts the hair slivers.

### The scale is not uniform

The artwork's aspect is 0.820 wide-to-tall and the space it fills is 0.735.
Scaling uniformly leaves two options, both worse:

- fit the **width** and the figure is 747 tall — too short to reach from the
  Head centre past the Root, leaving the bottom of the Root off the lap;
- fit the **height** and it is 682 wide, clipping about 31 units of hand off
  each side.

Widening the BodyGraph viewBox to 682 instead would shrink every centre and
numeral by 9% at the same container width, which costs legibility on a phone.
So the figure is stretched about 10% vertically. On a flat decorative
silhouette that reads as a slightly taller person.

### How it is tested

Nothing about a supplied drawing's *shape* is worth asserting — only where it
lands, and what it ends up backing.

- `figure.test.ts` checks the placement arithmetic: nine subpaths present and
  the path unedited, the bounding box landing exactly at 4,4–616,836, and the
  distortion staying under 15%.
- `e2e/chart.spec.ts` asks the **browser** what is actually painted, using
  `SVGGeometryElement.isPointInFill()`, which understands the fill rule and the
  holes as no flattened approximation would. Every gate of the six centres down
  the middle must sit on the figure; the Heart, Spleen and Solar Plexus must
  each keep at least one gate on it and at least one past it; and the gates
  that fall past it on the left must mirror those on the right, which catches
  both a drifting wing layout and artwork that is no longer square.
