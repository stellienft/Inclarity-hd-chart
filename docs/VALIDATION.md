# Validation

Every reference comparison performed against this engine, including what could
**not** be checked.

## Method and honesty note

Expectations recorded in the regression suite come from **published charts**,
never from this engine's own output. Recording our own results as "expected"
would make the suite self-confirming and worthless.

### One established calculator has now been compared

The brief asks for comparison against at least two established calculators.
**One has now been done** — a full 26-activation comparison against Genetic
Matrix (Swiss Ephemeris + JPL), reproduced below, supplied by the user as a
screenshot. Every activation matches.

A **second** independent calculator is still outstanding. The build
environment's network egress policy blocks every relevant service, verified
directly:

| Target | Result |
| --- | --- |
| `jovianarchive.com` | blocked by egress proxy |
| `geneticmatrix.com` | blocked |
| `myhumandesign.com` | blocked |
| `bodygraphchart.com` | blocked |
| `humdes.com` | blocked |
| `app.humandesign.ai` | blocked |
| `flowwithhumandesign.com` | blocked |
| `ssd.jpl.nasa.gov` (JPL Horizons) | blocked (403 from proxy) |
| `geocoding-api.open-meteo.com` | blocked |
| `nominatim.openstreetmap.org` | blocked |

Only web *search* was available, so reference chart values were gathered from
published descriptions rather than by driving a calculator directly.

**This gap should be closed before launch:** run the fixtures below against two
established calculators from an unrestricted network and record the results
here. Until then, the strongest evidence is the Ra Uru Hu fixture, which matches
on all four Incarnation Cross gates — a result that is very unlikely to occur by
chance if any part of the pipeline were wrong.

---

## Reference chart 1 — Ra Uru Hu

The strongest fixture in the suite.

**Birth data:** Robert Alan Krakower, 9 April 1948, 00:05, Montreal, Quebec,
Canada. Per Astro-Databank, sourced from Jovian Archive — the founder's own
organisation. Astro-Databank notes time variants of 0:05, 0:14 and 0:20.

**Published chart:** Manifestor · Splenic authority · 5/1 profile ·
Left Angle Cross of The Clarion (51/57 | 61/62).

| Property | Published | This engine | |
| --- | --- | --- | --- |
| Type | Manifestor | Manifestor | ✅ |
| Authority | Splenic | Splenic | ✅ |
| Profile | 5/1 (Heretic Investigator) | 5/1 (Heretic / Investigator) | ✅ |
| Personality Sun gate | 51 | 51 | ✅ |
| Personality Earth gate | 57 | 57 | ✅ |
| Design Sun gate | 61 | 61 | ✅ |
| Design Earth gate | 62 | 62 | ✅ |
| Cross angle | Left Angle | Left Angle | ✅ |

**Why this fixture carries so much weight.** The Incarnation Cross is built from
the Personality Sun/Earth (the birth moment) *and* the Design Sun/Earth (the
solved 88° moment). Matching all four gates simultaneously validates, in one
shot:

- timezone conversion for 1948 Montreal,
- the ephemeris,
- the gate wheel origin **and** direction,
- the 88° solar-arc solver,
- the Sun/Earth opposition construction.

Getting three of four right by luck is implausible; four is effectively
conclusive for the pipeline as a whole.

The engine also produces the same result for all three published time variants,
and derives Manifestor through a genuine motor-to-Throat path (Heart → G →
Throat) rather than by observing that the Throat is coloured.

**A false lead worth recording.** An initial search returned "4/6" for Ra Uru
Hu's profile, which disagreed with our 5/1. Rather than adjust the engine, the
claim was re-checked: it came from a general article *about* the 4/6 profile that
merely carried a "Ra Uru Hu" tag, not from his chart. Targeted follow-up
confirmed 5/1 Heretic Investigator, along with the cross that our engine
matches. **The engine was not changed.** This is exactly the discipline the
brief asks for — investigate a disagreement rather than assume either side.

Fixture: `lib/human-design/__tests__/reference-charts.test.ts`.

---

## Reference chart 2 — Genetic Matrix, 5 June 1989 Brisbane

**The strongest fixture in the suite**, and the only one checked against a live
established calculator rather than a published description.

**Source:** a Genetic Matrix "Foundation Chart" for 5 June 1989, 17:58,
Brisbane (UTC+10). Genetic Matrix computes with **Swiss Ephemeris against the
JPL planetary database** — the reference implementation of the field, and the
same stack Jovian Archive's own software uses.

### All 26 activations

| Body | Design (ref / ours) | Personality (ref / ours) |
| --- | --- | --- |
| Sun | 63.6 / 63.6 ✅ | 35.4 / 35.4 ✅ |
| Earth | 64.6 / 64.6 ✅ | 5.4 / 5.4 ✅ |
| North Node | 55.6 / 55.6 ✅ | 30.5 / 30.5 ✅ |
| South Node | 59.6 / 59.6 ✅ | 29.5 / 29.5 ✅ |
| Moon | 37.4 / 37.4 ✅ | 52.1 / 52.1 ✅ |
| Mercury | 30.1 / 30.1 ✅ | 8.4 / 8.4 ✅ |
| Venus | 37.4 / 37.4 ✅ | 15.3 / 15.3 ✅ |
| Mars | 8.4 / 8.4 ✅ | 62.3 / 62.3 ✅ |
| Jupiter | 8.6 / 8.6 ✅ | 45.1 / 45.1 ✅ |
| Saturn | 38.3 / 38.3 ✅ | 38.4 / 38.4 ✅ |
| Uranus | 58.2 / 58.2 ✅ | 58.1 / 58.1 ✅ |
| Neptune | 38.3 / 38.3 ✅ | 38.3 / 38.3 ✅ |
| Pluto | 1.2 / 1.2 ✅ | 44.6 / 44.6 ✅ |

**26 / 26 exact.**

### Derived properties

| Property | Genetic Matrix | This engine | |
| --- | --- | --- | --- |
| Birth UTC | 05 June 1989, 07:58 | 1989-06-05T07:58:00Z | ✅ |
| Design UTC | 07 March 1989, 05:46:55 | 07 March 1989, 05:46:44.8 | ✅ (10.2 s) |
| Type | Pure Manifesting Generator | Manifesting Generator | see note |
| Profile | 4/6 | 4/6 | ✅ |
| Definition | Single | Single Definition | ✅ |
| Inner Authority | Sacral | Sacral | ✅ |
| Strategy | Respond | To Respond | ✅ |
| Channels | 0108 Inspiration, 0515 Rhythm | 1-8 Inspiration, 5-15 Rhythm | ✅ |
| Cross angle | RAX (Right Angle Cross) | Right Angle | ✅ |

### Why this fixture is decisive

Twenty-six gate.line values are not something a wrong wheel offset, a wrong node
convention or a broken Design solver can produce by luck. In particular:

- **The gate wheel** is confirmed at 26 independent longitudes, not just the six
  published boundary checkpoints.
- **The node convention** is confirmed: North and South Node match on both
  imprints. A mean-node engine would differ by up to 1.5°, which is enough to
  move a line — so this is direct evidence for the true-node choice recorded in
  HUMAN_DESIGN_CALCULATION.md §5.
- **The 88° solver** is confirmed to **10.2 seconds** against Swiss
  Ephemeris/JPL. That residual is the ephemeris difference between
  astronomy-engine and JPL, and is ~0.0001° of solar arc — four orders of
  magnitude below a line.
- **Queensland's timezone history** is confirmed: June 1989 is before the
  1989-92 DST trial began in late October, so plain UTC+10, matching.

### The one difference, and why it is not an error

Genetic Matrix labels the type **"Pure Manifesting Generator"**; we say
**"Manifesting Generator"**. "Pure" is Genetic Matrix's own sub-label, not one
of the five types, and we could not establish the rule it uses — this chart's
motor reaches the Throat *indirectly* (Sacral -5-15- G -1-8- Throat), so it is
not the common "direct 20-34" definition of a pure MG. Rather than guess at
another vendor's sub-classification, we report the standard type. The
underlying mechanics agree completely.

Fixture: `lib/human-design/__tests__/reference-charts.test.ts`.

---

## Reference chart 3 — Princess Diana

**Birth data:** 1 July 1961, 19:45 BST, Sandringham, Norfolk, England. Rodden
rating AA (birth certificate) — among the most reliable public birth data
available.

**Published claims:** a Projector; Gate 39 carries **both** her Personality Sun
and her Design Mars.

| Property | Published | This engine | |
| --- | --- | --- | --- |
| Type | Projector | Projector | ✅ |
| Personality Sun gate | 39 | 39 | ✅ |
| Design Mars gate | 39 | 39 | ✅ |
| Birth UTC | 18:45 (BST = UTC+1) | 1961-07-01T18:45:00Z | ✅ |

The Design Mars check is unusually valuable: it is an independently stated claim
about a **non-Sun body in the Design imprint**, so it tests the solved Design
moment against something other than the Sun that defined it.

Also confirmed: no motor reaches her Throat, which is what makes the Projector
derivation correct rather than coincidental.

---

## Reference chart 4 — Nelson Mandela

**Birth data:** 18 July 1918, Mvezo, South Africa. Birth **time is not reliably
recorded**, so only claims robust to the unknown time are asserted (noon is used).

**Published claims:** a Projector with no defined motor centres.

| Property | Published | This engine | |
| --- | --- | --- | --- |
| Type | Projector | Projector | ✅ |
| Defined motors | none | none (Head, Ajna, Throat, G, Spleen defined) | ✅ |

Weaker than the other two by construction, and labelled as such.

---

## Ephemeris cross-validation

Two independent MIT implementations compared across six epochs spanning
1937–2018. Full table in [EPHEMERIS.md](./EPHEMERIS.md).

Worst disagreement: **12.87″** (Saturn) — 0.38 % of a line's width.

This also surfaced a genuine defect in the comparison library: `astronomia`'s
bundled VSOP87D series returns heliocentric longitude exactly `0.0000°` for
Uranus and Neptune. That finding is why `astronomy-engine` is the production
provider and `astronomia` is used only as a development cross-check for the
bodies where it is sound.

---

## Structural and boundary coverage

Beyond the reference charts, correctness is pinned by tests that do not depend
on any external source.

### Gate wheel — 6 published checkpoints

Gates 41, 19, 25, 17, 21 and 51 verified against published gate/degree tables.
Two of the six straddle 0° Aries, so they pin direction as well as origin. See
[HUMAN_DESIGN_CALCULATION.md §6](./HUMAN_DESIGN_CALCULATION.md#6-the-gate-wheel).

### Boundary conditions

- All **64 gate boundaries**: at the boundary, one ulp before, one ulp after.
- All **384 line boundaries**: same three positions each.
- The 359.999° → 0.000° wrap, including that 0° Aries falls inside gate 25.
- Longitudes supplied outside `[0, 360)` (−58°, 662°).
- `lineDecimal` agreement with the integer line across the whole circle.

### Design solver

Ten birth moments across all seasons, including four whose 88° span crosses
0° Aries, plus a leap day and epochs in the 1930s and 2030s.

- Achieved solar arc equals 88° to 7 decimal places in every case.
- Residual below 1e-7° in every case.
- Elapsed time measured at **86.61–91.99 days**, proving the fixed-88-day
  shortcut wrong by up to ~4 days.
- The monotonicity precondition bisection relies on is itself asserted.

### Derivations — all five types, all eight authorities, all five definitions

Synthetic charts with exactly known gate composition:

| Category | Covered |
| --- | --- |
| Type | Reflector, Generator, Manifesting Generator (direct **and** indirect motor path), Manifestor, Projector |
| Authority | Emotional, Sacral, Splenic, Ego Manifested, Ego Projected, Self-Projected (all four G–Throat channels), Mental/Environmental, Lunar |
| Definition | No, Single, Split, Triple Split, Quadruple Split |

Plus negative cases that catch the classic mistakes:

- A hanging gate does **not** define its centre.
- A Throat defined only from the Ajna does **not** make a Manifestor.
- Sacral authority outranks Splenic; Splenic outranks Ego.
- A motor cannot connect through an undefined centre.

### Substructure — Colour, Tone and Base

- The subdivision arithmetic: 6 colours × 6 tones × 5 bases, and
  `GATE_WIDTH / BASE_WIDTH = 1080` exactly.
- A **full walk of one gate's 1080 positions**, asserting they appear in order
  with no gaps and no repeats, and that the gate opens at 1.1.1.1 and closes at
  6.6.6.5.
- Boundary behaviour at colour and tone edges, matching the gate/line
  convention.
- Range checks (`colour 1-6`, `tone 1-6`, `base 1-5`, `tonePhase [0,1)`) swept
  across the whole circle.
- The **180° pair invariant**: a body and its opposite share line, colour, tone
  and base, checked at ~1000 positions round the wheel. This is why the
  literature can quote "Sun and Earth" as one value.

### Variable arrows

- Position and side of all four arrows.
- Each arrow reads its own source: Determination from the Design Sun,
  Environment from the Design Nodes, Motivation from the Personality Sun,
  Perspective from the Personality Nodes.
- Every direction is derived from its own Tone; tones 1-3 left, 4-6 right.
- Reading the Earth or the South Node instead would give identical arrows —
  asserted, not assumed.
- The near-boundary warning fires on an edge case and stays silent mid-band,
  and reaches `calculationMeta.warnings` rather than staying internal.

**Corroboration.** The project owner's reference chart prints all four arrows
with their Colour and Tone: 1₃ and 4₃ on the Design side, both pointing left;
6₄ and 3₆ on the Personality side, both pointing right. All four agree with the
tones-1-3-left rule. That validates the *rule*; it does not validate our Colour
and Tone *values*, because the chart does not print its birth data. See
[HUMAN_DESIGN_CALCULATION.md §16.2](./HUMAN_DESIGN_CALCULATION.md#162-colour-tone-and-base--calculated-arrow-rule-corroborated-numbers-not-independently-verified).

### Timezone

Queensland's 1989–92 DST trial (the spec's own Brisbane example is UTC+11, not
+10), British Standard Time 1968–71, US wartime year-round DST, Nepal's 1986
+05:30 → +05:45 change, skipped and repeated DST hours, and rejection of a
client-supplied timezone that contradicts the coordinates.

---

## Current totals

- **216** unit/integration tests (`npm test`)
- **21** end-to-end tests × 2 device profiles (`npm run test:e2e`)

## Open items

1. **Cross-compare against a SECOND established calculator.** Genetic Matrix
   now matches on all 26 activations; one more independent tool would close
   this out entirely.
2. **Obtain a Reflector reference chart.** Reflectors are ~1 % of the
   population; the type is covered synthetically but not by a published chart.
3. **Confirm the node convention against a chart with a node near a gate or line
   boundary** — the case where true vs mean actually diverges in output.
4. **Verify pre-1970 births** in zones affected by the tzdata merge.
5. **Verify Colour and Tone values against an external calculator.** Needs one
   published chart that prints *both* its birth data and its arrows. The
   reference we have prints arrows without birth data; the Genetic Matrix
   fixture we validated 26 activations against was captured without its arrows.
   Re-capturing that same chart with the arrows visible would close this.
