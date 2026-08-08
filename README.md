# Inclarity Space — Human Design Chart Generator

A free Human Design chart generator: birth details in, an accurate BodyGraph and
the core chart properties out.

The calculation engine is the product; the BodyGraph is its visualisation.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

```bash
npm test               # unit + integration (Vitest)
npm run test:e2e       # end-to-end (Playwright)
npm run typecheck      # tsc --noEmit
npm run build          # production build
```

## What it does

- Converts local birth time at the birth place into UTC using **historical**
  IANA timezone rules, including long-gone daylight-saving experiments.
- Solves the Design moment as **88° of solar arc** before birth — not 88 days.
- Maps thirteen bodies onto the Rave Mandala for both imprints.
- Derives channels, centres, Definition, Type, Strategy, Authority, Profile and
  the Incarnation Cross activations, using graph logic rather than special cases.
- Renders an original SVG BodyGraph — warm terracotta on cream, rounded
  centres, circular gate markers and curved channel routing — that prints at
  full vector quality.

## Architecture

Four layers, deliberately decoupled. A function that computes a planetary
longitude does not know what a Projector is; a function that derives Type does
not know where a centre sits on the page.

```
lib/birth/          A. Birth data  — place, coordinates, IANA zone, UTC instant
lib/location/       A. Location search behind a provider interface
lib/human-design/
  astronomy/        B. Ephemeris behind a provider interface
  constants/           gates, channels, centres, strategies
  calculate/           design-date (88° solver), gate-line, activations
  derive/           C. channels, centers, definition, type, authority, profile
  types/               the chart data model
components/         D. Presentation — BodyGraph, planetary columns, form
app/                D. Routes, API, print styles
```

Both boundaries are real interfaces, so either dependency can be replaced
without touching Human Design logic:

```ts
interface EphemerisProvider { getPositions(t: Date): Promise<PlanetaryPositions>; … }
interface LocationProvider  { search(query: string): Promise<LocationResult[]>; }
```

## Key decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Ephemeris | `astronomy-engine` (MIT) | Swiss Ephemeris is AGPL-or-commercial; `astronomia`'s bundled data returns 0° longitude for Uranus and Neptune |
| Frame | Apparent geocentric, true ecliptic of date | Matches the Swiss Ephemeris default, i.e. the Human Design convention |
| Lunar node | True (osculating) | Confirmed against Genetic Matrix — all four node activations match; mean node would differ by up to 1.5° |
| Wheel origin | Gate 41 at **302.0°**, ascending | Verified against six published gate/degree checkpoints |
| Boundaries | Half-open `[start, end)` | Deterministic; all 64 gate and 384 line boundaries tested |
| Cross names | **Not shipped** | No verified, lawfully usable table — gates and angle only |
| Colour/Tone/Base | **Not shipped** | Not independently verified; accuracy first |

Full reasoning in the docs below.

## Documentation

| Document | Contents |
| --- | --- |
| [HUMAN_DESIGN_CALCULATION.md](docs/HUMAN_DESIGN_CALCULATION.md) | Every calculation step, the conventions chosen, and the **unresolved questions** |
| [EPHEMERIS.md](docs/EPHEMERIS.md) | Provider comparison, licensing consequences, accuracy evidence |
| [VALIDATION.md](docs/VALIDATION.md) | Reference-chart comparisons and what could not be checked |
| [LICENSING.md](docs/LICENSING.md) | Dependency licences, geocoding terms, Human Design IP position |
| [PRIVACY.md](docs/PRIVACY.md) | What is stored, logged, cached and shared (short answer: almost nothing) |

## Shared standalone build

`npm run build:standalone` bundles the whole generator — engine, BodyGraph,
styles and fonts — into one self-contained HTML file at
`dist/inclarity-chart.html`, with no external requests. Useful for sharing a
testable build where a server isn't available.

It imports the same modules the app does, so the calculation is identical. Two
things necessarily differ: the chart is computed in the browser rather than in
`/api/chart`, and birth-place search falls back to the offline gazetteer
(~70 cities) because there is no server to proxy the geocoder through.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_INCLARITY_BOOKING_URL` | `https://inclarity.space` | Where "Explore a 1:1" points |
| `LOCATION_PROVIDER` | `open-meteo` | `static` uses the built-in offline gazetteer |
| `ENABLE_CHART_DEBUG` | unset | Exposes `/dev/chart-debug` in production builds |

## API

```
POST /api/chart      → HumanDesignChart
GET  /api/locations?q=… → { results: LocationResult[] }
```

Zod-validated, rate-limited, `no-store`, and errors are sanitised — no stack
trace ever reaches a client.

```bash
curl -X POST http://localhost:3000/api/chart \
  -H 'content-type: application/json' \
  -d '{"name":"Example","date":"1990-03-01","time":"14:32",
       "location":{"displayName":"Brisbane, Queensland, Australia",
                   "latitude":-27.4698,"longitude":153.0251,
                   "timezone":"Australia/Brisbane"}}'
```

The server re-derives the timezone from the coordinates and only honours the
supplied `timezone` when the two agree.

## Debug inspector

`/dev/chart-debug` shows every intermediate value — local time, resolved zone,
UTC, birth Sun longitude, target longitude, solved Design timestamp, achieved
solar arc and residual, raw longitudes for all 26 activations, the centre graph,
and the Type/Authority/Profile derivations. Development-only unless
`ENABLE_CHART_DEBUG=true`.

```
/dev/chart-debug?date=1948-04-09&time=00:05&lat=45.5019&lon=-73.5674&tz=America/Toronto
```

## Testing

185 unit/integration tests, and 21 end-to-end tests run across both a desktop
and a mobile device profile (42 runs).

The suite deliberately includes cases that catch the classic errors: a hanging
gate must not define its centre; a Throat defined only from the Ajna must not
produce a Manifestor; Brisbane on 1 March 1990 is UTC+11, not +10; and the
elapsed time to the Design moment must vary across the year rather than sitting
at 88 days.

## Status

The engine reproduces **all 26 activations** of a Genetic Matrix chart (Swiss
Ephemeris + JPL) exactly, along with Type, Profile, Definition, Authority and
both channels, and solves the Design moment to within 10.2 seconds of it. It
also matches three further published reference charts. See
[VALIDATION.md](docs/VALIDATION.md).

Outstanding before launch: a comparison against a *second* established
calculator, and confirmation of the Open-Meteo commercial tier.

---

Human Design is a framework for personal reflection and experimentation. It is
not scientifically validated and should not replace medical, psychological,
legal or financial advice.
