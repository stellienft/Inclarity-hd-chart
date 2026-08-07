# Licensing and intellectual property

Everything in the dependency tree and the content of this product that has
licensing or IP consequences for Inclarity.

## Summary

**No dependency imposes a copyleft obligation on the Inclarity application.**
Every runtime dependency is MIT or Apache-2.0 style. Swiss Ephemeris — the
obvious astronomical choice — was deliberately **not** used, precisely because
its licence would have.

---

## Runtime dependencies

| Package | Licence | Role | Consequence |
| --- | --- | --- | --- |
| `next` | MIT | Framework | None |
| `react`, `react-dom` | MIT | UI | None |
| `astronomy-engine` | MIT | Ephemeris | None |
| `luxon` | MIT | Timezone/DST | None |
| `tz-lookup` | MIT (data: CC BY 4.0, OpenStreetMap-derived) | Coordinates → IANA zone | Attribution advisable |
| `zod` | MIT | Schema validation | None |
| `clsx`, `tailwind-merge` | MIT | Class utilities | None |

### Development-only

| Package | Licence | Role |
| --- | --- | --- |
| `typescript`, `vitest`, `@playwright/test`, `tailwindcss`, `eslint` | MIT / Apache-2.0 | Tooling |
| `astronomia` | MIT | **Cross-validation only.** Not imported at runtime. |

---

## Swiss Ephemeris — considered and rejected

Swiss Ephemeris is the de facto standard for astrological software and is what
Jovian Archive's own Maia Mechanics Imaging uses. It was evaluated seriously and
**rejected on licensing grounds**, not on technical ones.

**It is dual-licensed:**

1. **AGPL-3.0** — the copyleft reaches across a network boundary. Section 13
   means that deploying this application as a hosted service would oblige
   Inclarity to offer the **entire application's** corresponding source code to
   every user of the site. That would apply to all Inclarity code linked with
   it, not just the astronomy layer.
2. **A paid commercial licence** from Astrodienst AG, which removes that
   obligation.

Since the Inclarity product may be commercially deployed, silently taking on
AGPL obligations for the whole application was not acceptable, and a licence fee
was not assumed. Swiss Ephemeris is therefore **not a dependency of this
repository at all** — not even a development one, so no derived data from it
exists here either.

**If it is ever wanted**, `EphemerisProvider` exists precisely so it can be
dropped in behind the interface. Resolve the licence first: either accept AGPL
for the deployed application, or purchase a commercial licence.

---

## Geocoding

**Default provider: Open-Meteo Geocoding API.**

- No API key, so there is no secret that could leak into a client bundle.
- Data derived from **GeoNames**, licensed **CC BY 4.0**.
- Open-Meteo's own APIs are offered free for non-commercial use under CC BY 4.0;
  **commercial use requires a paid subscription tier.**

> **Action before commercial launch:** confirm which Open-Meteo tier applies to
> Inclarity's use and subscribe if required, or switch the provider. Attribution
> for GeoNames/OpenStreetMap-derived data should appear in the site footer or a
> credits page.

`LocationProvider` is an interface (`lib/location/types.ts`) with an
Open-Meteo implementation, a built-in offline gazetteer, and a fallback wrapper,
so swapping to Google Places, Mapbox or a self-hosted Nominatim needs no
front-end change.

Alternatives considered:

| Provider | Note |
| --- | --- |
| Google Places | Commercial-friendly but keyed, metered, and ToS restricts caching/storage of results |
| Mapbox | Keyed and metered; no timezone in the geocoding response |
| Nominatim (OSM) | Free, but a strict usage policy discourages autocomplete traffic, and it returns no timezone |
| GeoNames | The underlying source; free tier is rate-limited and unreliable for production |

All keyed providers would be called **server-side only** (`/api/locations`), so
no credential ever reaches the browser.

## Timezone data

IANA tzdata via the platform (Luxon reads the host ICU), plus `tz-lookup` for
coordinates → zone. Public domain / CC BY as applicable. See
[HUMAN_DESIGN_CALCULATION.md §1](./HUMAN_DESIGN_CALCULATION.md#1-birth-data-conversion)
for the pre-1970 accuracy limitation.

---

## Human Design intellectual property

This is the area with the most risk, and it was handled conservatively.

### What this repository does NOT contain

- **No text from Human Design books or courses.**
- **No Jovian Archive description text**, gate meanings, or interpretive copy.
- **No content scraped from any paid or free calculator.**
- **No proprietary chart graphics.** The BodyGraph is original SVG geometry
  drawn from coordinates defined in `components/bodygraph/geometry.ts`. Nothing
  was traced, screenshotted, or copied from another provider's artwork.

  A third-party chart was used as a *visual style reference* — for proportions,
  the warm terracotta-on-cream palette, rounded centre shapes, circular gate
  markers and curved channel routing. Those are unprotectable ideas and visual
  conventions, not copied expression: every coordinate, path, colour value and
  curve rule in this repository was derived and written here. The nine-centre
  arrangement itself is the standard diagram of the system and is drawn the same
  way by every implementation.
- **No Incarnation Cross name table.** We do not hold one that is both verified
  and lawfully usable, so cross **names are not shipped** — only the four gate
  activations and the structurally derived angle. This is a deliberate omission,
  documented in the UI itself.
- **No other provider's branding.**

### What it does contain, and why that is defensible

- **Structural mechanics** — the gate wheel, channel pairs, centre assignments,
  and the derivation rules for Type, Authority, Profile and Definition. These
  are facts about a system, widely published across many independent sources,
  and are calculated here from first principles rather than copied from any one
  source's expression of them.
- **I Ching hexagram names** (e.g. "The Creative", "Difficulty at the
  Beginning") as gate names. These are ancient and long in the public domain.
- **Channel names** (e.g. "The Beat", "Rhythm") in general circulation in the
  Human Design community as short descriptive labels.
- **Original Inclarity copy** — every word of orientation and interface text was
  written for this product.

### Trademark considerations

> **Note for review.** "Human Design", "BodyGraph", "Rave" and related terms are
> associated with Jovian Archive / the International Human Design School, and
> some may be registered marks in some jurisdictions.
>
> This product uses them **descriptively**, to name the system being calculated,
> and does not use Jovian Archive's branding, claim affiliation, or imply
> endorsement. This is the ordinary nominative-use position and is how the
> broader Human Design community operates, but it is **not legal advice.**
> Inclarity should take its own advice before a significant commercial launch,
> particularly regarding the product name and any paid offering.

### Scientific claims

The footer disclaimer states plainly that Human Design is not scientifically
validated and is not a substitute for medical, psychological, legal or financial
advice. No copy anywhere in the product makes a scientific claim about the
system.

Note the distinction the product is careful to maintain: the **astronomical
calculations are deterministic and verifiable**, while the **interpretive
framework is not scientifically validated**. Those are separate claims and the
copy never conflates them.

---

## Privacy

Birth data is personal data. See [PRIVACY.md](./PRIVACY.md).
