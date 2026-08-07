# Human Design calculation

How this engine turns birth details into a chart, and why each convention was
chosen. Every value that could reasonably be disputed is recorded here with the
evidence behind it.

The guiding rule for this document: **never hide uncertainty.** Where a
convention could not be established to our satisfaction, it is listed in
§16 (Unresolved questions) and the corresponding feature is omitted rather than
guessed at.

---

## 1. Birth data conversion

**Input:** local calendar date, local wall-clock time, and a place.

**Output:** a UTC instant.

The birth time must be interpreted in the timezone the **birth place** was
using **on the birth date**. Three failure modes are specifically guarded
against:

1. **Using the visitor's browser timezone.** Never done. The zone comes from
   the birth location only.
2. **Hard-coding an offset** ("Brisbane = UTC+10"). Never done. Queensland ran a
   daylight-saving trial from 1989 to 1992, so a Brisbane birth on 1 March 1990
   is UTC**+11**. This exact case is a regression test
   (`lib/birth/timezone.test.ts`).
3. **Trusting a client-supplied zone.** The server re-derives the IANA zone from
   the coordinates using `tz-lookup`, and only honours a client-supplied zone
   when it matches, or is a benign alias with an identical offset.

Conversion uses Luxon over the platform IANA database, so historical offsets and
DST rules apply correctly. Covered by tests: Queensland 1989–92, British
Standard Time (1968–71, UTC+1 year-round), US wartime year-round DST, and
Nepal's 1986 change from +05:30 to +05:45.

### DST discontinuities

- **Skipped time** (clocks sprang forward, the given time never existed) — the
  chart is still produced, resolved forwards, and a warning is attached.
- **Repeated time** (clocks fell back, the given time happened twice) — the
  earlier, pre-transition instant is used, and a warning is attached.

Detected by round-tripping the wall-clock string through the zone; the repeated
case is found by advancing the *instant* an hour and checking whether the wall
clock repeats.

### A known limitation: pre-1970 zone merges

Since tzdata 2022b, zones that have agreed since 1970 were merged into a single
representative zone, **discarding their earlier divergences**. `Europe/Amsterdam`
now resolves to Brussels' history and reports GMT+00:00 for 1935 instead of the
Netherlands' actual +00:19:32.

This is a property of the database, not a bug in this engine. Restoring full
accuracy requires tzdata compiled with its `backzone` file, which Node's bundled
ICU does not ship.

**Mitigation:** births before 1970 in an affected zone carry an explicit warning
on the chart (`lib/birth/timezone.ts`, `PRE_1970_APPROXIMATED_ZONES`). Errors are
tens of minutes — immaterial for the Sun (and therefore for Type, Authority and
Profile), but up to roughly a fifth of a line for the Moon.

---

## 2. The Personality moment

The exact birth timestamp in UTC. No adjustment.

---

## 3. The Design moment — 88° of solar arc

**The Design moment is NOT "birth minus 88 days."** It is the earlier moment at
which the Sun's apparent geocentric tropical longitude was exactly 88° less than
at birth.

Earth's orbit is elliptical, so its angular velocity varies (about 1.019°/day
near perihelion in early January, 0.953°/day near aphelion in early July). The
elapsed time to cover 88° therefore varies. Measured by this engine across the
year:

| Birth month (15th, 1990) | Elapsed days |
| --- | --- |
| January | 86.995 |
| February | 86.607 |
| March | 86.910 |
| April | 87.861 |
| May | 89.145 |
| June | 90.504 |
| July | 91.521 |
| August | 91.990 |
| September | 91.726 |
| October | 90.818 |
| November | 89.447 |
| December | 88.070 |

Range **86.61 – 91.99 days**, a spread of **5.38 days**. Substituting a fixed 88
days would misplace the Design imprint by up to ~4 days ≈ 4° ≈ two-thirds of a
gate.

### Method

1. Read the Sun's longitude at birth.
2. `target = normalise360(birthSunLongitude - 88)`
3. Bracket the crossing between 84 and 95 days before birth, widening
   defensively if the bracket does not straddle the root.
4. Refine by bisection to a residual below 1e-9°.

### The 0°/360° wrap

Comparing raw longitudes breaks whenever the 88° span crosses 0° Aries — which
it does for anyone born between roughly late March and late June. The error
function therefore never compares raw longitudes. It measures the **signed
shortest separation** between the Sun's longitude at a candidate time and the
target:

```
error(t) = signedAngularDifference(target, sunLongitude(t))
```

Over the ~11-day search window the Sun moves under 12°, so this separation is
unambiguous, continuous, monotonic in `t`, and completely wrap-agnostic.
Monotonicity — the precondition bisection needs — is itself asserted by a test.

Achieved residual is below 1e-7° for every fixture, including births whose span
straddles 0° Aries.

---

## 4. Ephemeris convention

Positions are **geocentric, apparent, referred to the true equinox and ecliptic
of date** — i.e. tropical positions including light-time, aberration and
nutation. This is the frame Swiss Ephemeris returns by default, and therefore
the frame mainstream Human Design software uses.

Implemented with `astronomy-engine`'s `GeoVector(body, t, aberration = true)`
rotated through `Rotation_EQJ_ECT`.

**No sidereal zodiac, no ayanamsha, no Vedic offset, and no house system** is
applied anywhere. Astrological houses are not required for this product.

Provider selection and accuracy evidence: see [EPHEMERIS.md](./EPHEMERIS.md).

---

## 5. Lunar node convention

**Decision: the TRUE (osculating) node.**

### Evidence

- Jovian Archive's own Maia Mechanics Imaging is built on Swiss Ephemeris with
  the JPL planetary database.
- `rave-engine`, a pure-JS Human Design engine, documents using "the **true
  node** (oscillating), matching mainstream Human Design calculators."
- Community technical writing notes the true node "oscillates… In Human Design,
  this difference can affect Color, Tone, and Base decoding — and occasionally
  Line or Gate."

### Why it matters

Measured across six epochs spanning 1937–2018, true and mean node differ by up
to **1.51°** — about 1.6 lines. This is not a cosmetic choice.

### Implementation

The osculating node is derived from the Moon's instantaneous geocentric state
vector: the orbital-plane normal is `h = r × v`, so the ascending-node direction
is `ẑ × h = (−h_y, h_x, 0)`. This is the same quantity Swiss Ephemeris returns
for `SE_TRUE_NODE`. Nodes are geometric constructs, so they are computed from
unaberrated positions.

Velocity comes from central differencing at ±60 s. The result was verified to be
stable to seven decimal places for steps from 0.1 s to 900 s, so the step sits
well inside the plateau where truncation and round-off are both negligible.

Cross-checked against Meeus' truncated true-node series (via `astronomia`):
agreement within **0.107°** worst case. The residual is Meeus' truncation error,
not ours — his formula is explicitly an approximation to the osculating node.

The mean node is also implemented (Meeus eq. 47.7) and the convention is
switchable via `AstronomyEngineProvider({ nodeConvention })`, so the decision can
be revisited without touching Human Design logic.

**Caveat, stated plainly:** we could not obtain a first-party statement from
Jovian Archive confirming which node their software uses. The choice rests on
the secondary evidence above plus agreement with the reference charts in
[VALIDATION.md](./VALIDATION.md). Recorded in §16.

---

## 6. The gate wheel

All longitude-to-gate constants live in exactly one file:
`lib/human-design/constants/gates.ts`. No magic longitude appears anywhere else
in the codebase.

| Property | Value |
| --- | --- |
| Zodiac | Tropical, geocentric, apparent, true equinox of date |
| Origin | Gate 41 begins at **302.0°** (2°00'00" Aquarius) |
| Direction | Gates advance with **increasing** ecliptic longitude |
| Gate width | 360 / 64 = **5.625°** |
| Line width | 5.625 / 6 = **0.9375°** |
| Boundaries | Half-open `[start, end)` |

### Sequence

```
41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42,  3,
27, 24,  2, 23,  8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
31, 33,  7,  4, 29, 59, 40, 64, 47,  6, 46, 18, 48, 57, 32, 50,
28, 44,  1, 43, 14, 34,  9,  5, 26, 11, 10, 58, 38, 54, 61, 60
```

### How the origin and direction were verified

The published sequence alone does **not** establish the rotational offset — this
is the single most commonly fudged constant in amateur implementations. Six
independent published checkpoints were used, all of which satisfy
`start(i) = 302.0 + i × 5.625 (mod 360)`:

| Gate | Wheel index | Published range | Computed start |
| --- | --- | --- | --- |
| 41 | 0 | 2°00'00" – 7°37'30" Aquarius | 302.000 |
| 19 | 1 | begins 7°37'30" Aquarius | 307.625 |
| 25 | 10 | 28°15'00" Pisces – 3°52'30" Aries | 358.250 |
| 17 | 11 | begins 3°52'30" Aries | 3.875 |
| 21 | 12 | begins 9°30'00" Aries | 9.500 |
| 51 | 13 | begins 15°07'30" Aries | 15.125 |

Corroborating fact: the "Rave New Year" is the Sun's entry into Gate 41,
observed on ~22 January — precisely when the tropical Sun reaches 2° Aquarius.

Note that checkpoints 3 and 4 straddle 0° Aries, so they pin the direction of
travel as well as the offset.

These six values are locked in by `__tests__/constants.test.ts`. If any breaks,
every chart the engine produces is wrong.

---

## 7. Gate calculation

```
offset     = normalise360(longitude - 302.0)
wheelIndex = floor(offset / 5.625)
gate       = SEQUENCE[wheelIndex]
```

Because `offset` is normalised to `[0, 360)` before flooring, the mapping is
continuous across the 359.999° → 0.000° wrap with no special-casing.

## 8. Line calculation

```
withinGate = offset - wheelIndex × 5.625
line       = floor(withinGate / 0.9375) + 1        // 1..6
lineDecimal = withinGate / 0.9375 + 1              // 1.0 .. <7.0
```

**Boundary convention: half-open `[start, end)`.** A longitude falling exactly
on a gate or line boundary belongs to the gate/line that *begins* there.

All 64 gate boundaries and all 384 line boundaries are tested at the boundary
itself, one ulp before, and one ulp after
(`__tests__/gate-line.test.ts`).

### Colour, Tone and Base

Deliberately **not calculated or displayed**. They subdivide each line a further
6 × 6 × 5 and are extremely sensitive to ephemeris error — the node convention
alone can flip a Tone. The `Activation` type reserves the fields so the return
shape stays stable when they are added, but shipping unverified values would be
worse than omitting them.

---

## 9. Channel derivation

A channel is defined when **both** of its gates are activated across the union
of the Personality and Design activations. The source does not matter:
Personality+Design, Personality+Personality and Design+Design all define the
channel equally.

Per-gate activation sides are retained purely so the BodyGraph can render the
distinction; they play no part in whether the channel exists.

All 36 channels are modelled. Channel centres are **derived** from the gate
table at module load rather than hard-coded, so a gate can never disagree with
its channel about which centre it belongs to.

## 10. Centre definition

A centre is defined **only** by completed channels.

An activated gate sitting alone in a centre — a "hanging gate" — colours the
gate but leaves the centre open. `deriveDefinedCenters` takes only the active
channel list as input and never sees the gate list, so this rule cannot be
violated by accident.

---

## 11. Definition

Build a graph: **nodes** = defined centres, **edges** = defined channels. Count
connected components by traversal.

| Components | Definition |
| --- | --- |
| 0 | No Definition |
| 1 | Single Definition |
| 2 | Split Definition |
| 3 | Triple Split Definition |
| 4 | Quadruple Split Definition |

Derived by traversal rather than by enumerating centre combinations, so it stays
correct for every possible chart. Components are retained on the chart object to
support future bridge-gate analysis.

---

## 12. Type

Derived from the definition graph, never from "is the Throat coloured".

```
no centre defined                          -> Reflector
Sacral defined + motor reaches Throat      -> Manifesting Generator
Sacral defined, no motor reaches Throat    -> Generator
Sacral undefined + motor reaches Throat    -> Manifestor
Sacral undefined, ≥1 centre, no motor path -> Projector
```

**Motor centres:** Sacral, Heart/Ego, Solar Plexus, Root. The Throat is never
treated as a motor.

**`hasMotorToThroatConnection`** is a breadth-first search from the Throat across
defined channels. The connection may be direct (34–20) or **indirect**
(Sacral —2-14— G —1-8— Throat). Both are tested. A Throat defined only by
Ajna–Throat channels correctly yields *no* motor connection, which is what makes
a Projector a Projector rather than a Manifestor.

---

## 13. Inner Authority

A strict hierarchy over the defined centres, with the Ego split resolved by
Type. The **order** is what makes it correct; these are not independent tests.

| # | Condition | Authority |
| --- | --- | --- |
| 1 | Solar Plexus defined | Emotional |
| 2 | else Sacral defined | Sacral |
| 3 | else Spleen defined | Splenic |
| 4 | else Heart defined | Ego Manifested (Manifestor) / Ego Projected (otherwise) |
| 5 | else G defined | Self-Projected |
| 6 | else ≥1 centre defined | Mental / Environmental |
| 7 | nothing defined | Lunar |

### Why step 5 needs no explicit "G connects to Throat" test

Self-Projected authority is conventionally described as a defined G connected to
the Throat. That condition is *implied* by the hierarchy. The G centre has ten
channels; six of them (10-34, 10-57, 2-14, 5-15, 29-46, 25-51) terminate in the
Sacral, Spleen or Heart. If any of those defined the G, that centre would also
be defined and an earlier branch would already have fired. So by the time
control reaches step 5, the only channels that can be defining the G are the
four G–Throat channels: **1-8, 7-31, 13-33, 10-20**.

Rather than rely on that reasoning silently, `deriveAuthority` **verifies the
invariant at runtime** and reports the connecting channels. If it were ever
violated, the chart carries a warning instead of a confident wrong answer.

Every one of the eight authorities has a dedicated fixture, plus a test that
walks the whole hierarchy in order and a test asserting that a chart with a
defined Spleen never returns Ego.

---

## 14. Profile

`Personality Sun line / Design Sun line`, in that order.

Derived purely from the two calculated Sun activations. **There is no birth-date
lookup table anywhere in this codebase.**

---

## 15. Incarnation Cross

Stored as four gate/line pairs: Personality Sun, Personality Earth, Design Sun,
Design Earth — displayed in the conventional notation
`(pSun/pEarth | dSun/dEarth)`.

**Angle** *is* structurally derivable and is calculated:

- profile 4/1 → Juxtaposition
- personality Sun line 5 or 6 → Left Angle
- otherwise → Right Angle

**Name is deliberately absent.** We do not hold a verified, lawfully usable
naming table for the 192 crosses, and generating names from a loose lookup would
be worse than omitting them. `IncarnationCross.name` is reserved as the drop-in
point once a verified source exists. No proprietary description text is
reproduced anywhere in this repository.

---

## 16. Unresolved questions

Recorded openly rather than papered over.

### 16.1 Lunar node convention — *decided, with residual uncertainty*

True (osculating) node chosen on secondary evidence (§5). We could not obtain a
first-party statement from Jovian Archive. The reference charts in
VALIDATION.md are consistent with this choice, but none of them turns on a node
being near a boundary, so they do not *prove* it. Switchable via
`nodeConvention`.

### 16.2 Colour, Tone and Base — *deferred*

Not calculated. Requires an ephemeris accuracy budget we have not established,
and independent verification we do not have. See §8.

### 16.3 Incarnation Cross names — *deferred*

No verified, lawfully usable table. See §15.

### 16.4 Pre-1970 timezone merges — *known limitation, mitigated by warning*

See §1. Affects some pre-1970 births by tens of minutes. Fixing it properly
needs tzdata compiled with `backzone`.

### 16.5 External calculator cross-comparison — *incomplete*

The brief asks for comparison against at least two established calculators. The
build environment's network policy blocks every Human Design calculator and
ephemeris service (including JPL Horizons), so live cross-comparison could not
be performed. What *was* done instead is documented in
[VALIDATION.md](./VALIDATION.md): validation against three independently
published reference charts, and cross-validation of the ephemeris against a
second independent implementation. This gap should be closed before launch.

---

## Sources consulted

- Published Human Design gate/degree tables (used for the six wheel checkpoints
  in §6) — bonniesorsby.com, barneyandflow.com, thelightlines.com,
  embodyyourdesign.com.
- Jovian Archive — chart calculation knowledge base and Maia Mechanics Imaging
  description (Swiss Ephemeris + JPL).
- `adamblvck/rave-engine` — MIT pure-JS Human Design engine; node convention
  statement.
- `CReizner/SharpAstrology.HumanDesign` — notes on analytic vs file-based node
  precision.
- humdes.com knowledge base — lunar nodes, inner authority.
- Jean Meeus, *Astronomical Algorithms*, 2nd ed. — nutation, obliquity, mean and
  true lunar node (ch. 47), Pluto (ch. 37).
- `astronomy-engine` and `astronomia` documentation and source.
- Reference chart sources are cited individually in [VALIDATION.md](./VALIDATION.md).
