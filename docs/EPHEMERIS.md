# Ephemeris provider

Why `astronomy-engine` was chosen, what was rejected, and the evidence for the
accuracy claim.

## The requirement

Human Design needs geocentric **apparent** ecliptic longitude, referred to the
**true equinox and ecliptic of date** (tropical, including light-time,
aberration and nutation) for thirteen bodies including Pluto and the lunar
nodes.

Accuracy budget: a gate is 5.625° (20,250 arcsec) and a **line is 0.9375°
(3,375 arcsec)**. Errors matter only insofar as they can flip a gate or line for
an activation sitting near a boundary.

## The architecture

```ts
interface EphemerisProvider {
  readonly id: string;
  readonly nodeConvention: NodeConvention;
  getPositions(timestampUtc: Date): Promise<PlanetaryPositions>;
  getSunLongitude(timestampUtc: Date): Promise<number>;
}
```

The Human Design engine depends only on this interface. Nothing in
`lib/human-design/calculate` or `lib/human-design/derive` knows which library is
behind it, so the provider can be replaced without rewriting any Human Design
logic. `calculationMeta.ephemerisProvider` records which one produced each
chart.

---

## Candidates evaluated

### Swiss Ephemeris — **rejected on licensing**

Technically the strongest option and the de facto standard in astrological
software (Jovian Archive's own Maia Mechanics Imaging uses it with the JPL
database).

**It is dual-licensed: AGPL-3.0 or a paid commercial licence.**

This matters commercially and was not ignored:

- Under **AGPL**, the copyleft reaches across a network boundary. Deploying this
  application as a hosted web service would oblige Inclarity to offer the
  *entire* application's corresponding source to its users. Bundling it would
  silently impose that obligation on the whole product.
- The alternative is a **paid commercial licence** from Astrodienst.

Neither is acceptable as a default for a product that may be commercially
deployed, so Swiss Ephemeris is not a dependency of this repository — not even a
development one.

Node bindings (`sweph`, `swisseph`) also require a native build step, which is
awkward on serverless platforms.

### `astronomia` (MIT) — **rejected on correctness**

Pure JavaScript, MIT, implements VSOP87 and ELP/MPP02 from Meeus. It looked like
a strong candidate and is used by at least one other Human Design engine.

**It was rejected after its bundled VSOP87D data was found to be broken for the
outer planets.** Computing heliocentric longitude directly from the shipped
series for 1990-03-01:

| Body | `astronomia` heliocentric longitude | Correct value |
| --- | --- | --- |
| Saturn | 287.9100° | 287.913° ✓ |
| Earth | 160.3317° | 160.335° ✓ |
| **Uranus** | **0.0000°** | 276.212° ✗ |
| **Neptune** | **0.0000°** | 282.434° ✗ |

The radius vectors are correct (19.3906 AU and 30.2090 AU), so only the
longitude series is affected. Geocentric errors reached **158°**.

This is a defect in the published package's data, not in our usage — the term
counts look plausible (Uranus L has 1,579 terms) but the summation returns
exactly zero.

`astronomia` is retained as a **development-time cross-check only**, for the
bodies where it is sound (Sun through Saturn, and the Moon). It is not a runtime
dependency.

### `astronomy-engine` (MIT) — **selected**

- **MIT licensed.** Imposes no obligations on the Inclarity product.
- **Pure TypeScript**, no native build step and no ephemeris data files, so it
  runs unchanged on serverless platforms and adds no deployment complexity.
- Provides **Pluto** (its own numerical integration) and, critically,
  `Rotation_EQJ_ECT` — a correct rotation into the **true ecliptic of date**,
  which is exactly the frame Swiss Ephemeris returns by default. Many libraries
  offer only J2000 ecliptic coordinates, which would be wrong here.
- Actively maintained, and validated by its author against JPL Horizons.
- Retrograde is available by differencing longitude, so no extra data is needed.

---

## Accuracy evidence

JPL Horizons is blocked by this build environment's network policy, so
`astronomy-engine` was cross-validated against `astronomia`'s independent
VSOP87D + Meeus implementation for the bodies where the latter is sound.

Six epochs spanning 1937–2018 (1990-03-01, 1955-07-14, 2001-11-23, 1972-01-03,
2018-05-30, 1937-09-09). Worst absolute difference in apparent geocentric
ecliptic longitude:

| Body | Worst difference | As a fraction of one line |
| --- | --- | --- |
| Sun | 1.13″ | 0.03 % |
| Moon | 6.27″ | 0.19 % |
| Mercury | 2.04″ | 0.06 % |
| Venus | 8.44″ | 0.25 % |
| Mars | 4.70″ | 0.14 % |
| Jupiter | 3.84″ | 0.11 % |
| Saturn | 12.87″ | 0.38 % |

Two independent implementations agreeing to within **13 arcseconds** — under
0.4 % of a line — is strong evidence that both are correct to well inside the
accuracy this product needs.

Uranus, Neptune and Pluto could not be cross-checked this way because
`astronomia`'s data is broken for them. Their `astronomy-engine` values were
instead sanity-checked against known positions: for 1990-03-01 the engine gives
Uranus 8.78° Capricorn, Neptune 13.99° Capricorn and Pluto 17.76° Scorpio, all
correct. The outer planets also move slowly, so they are the least likely to sit
near a boundary in a way a small error could flip.

**Residual risk, stated plainly:** an activation sitting within ~13 arcseconds of
a line boundary could in principle be reported one line out. That is roughly a
0.4 % chance per activation, and it applies to *any* implementation not using
full JPL ephemerides. It is one reason Colour, Tone and Base — which subdivide a
line a further 180 times — are not shipped.

## Lunar nodes

See [HUMAN_DESIGN_CALCULATION.md §5](./HUMAN_DESIGN_CALCULATION.md#5-lunar-node-convention).
`astronomy-engine` has no node function, so the osculating ("true") node is
derived here from the Moon's geocentric state vector, matching Swiss Ephemeris'
`SE_TRUE_NODE` definition. Verified stable to seven decimals across
differentiation steps from 0.1 s to 900 s, and agreeing with Meeus' truncated
true-node series to within 0.107°.

## Deployment consequences

Because the selected provider is MIT and pure JavaScript:

- No AGPL obligation attaches to the Inclarity application.
- No licence fee is required.
- No native compilation, no `postinstall` build, no ephemeris data files to ship.
- Runs on Vercel/Netlify/Cloudflare-style runtimes without special handling.
- Chart calculation runs server-side in the API route, so no ephemeris code is
  shipped to the browser.

## If Swiss Ephemeris is ever wanted

Implement a second class against `EphemerisProvider` in
`lib/human-design/astronomy/`, and select it at composition time. Nothing in the
Human Design engine changes. Before doing so, resolve the licence: either accept
AGPL for the whole deployed application, or buy a commercial licence from
Astrodienst.
