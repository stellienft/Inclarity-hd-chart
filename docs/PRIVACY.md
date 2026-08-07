# Privacy

Birth date, birth time and birth place together are personal data, and in
combination they are effectively identifying. This document records exactly what
the application does with them.

## What is stored

**Nothing.**

There is no database, no ORM, no persistence layer and no session store in this
repository. A chart is calculated in the request that asks for it, returned in
the response, held in React state in the visitor's browser, and forgotten when
they close the tab or press "Create another chart".

## What is logged

The `/api/chart` route logs **only** an error message when a calculation fails:

```ts
console.error("[chart] calculation failed:", error instanceof Error ? error.message : error);
```

The request body is deliberately **not** logged, because it contains birth data.
Note that platform-level access logs may still record IP addresses and request
paths — that is a hosting-provider concern, and the birth details travel in a
POST body rather than a query string precisely so they do not appear in URL logs.

## Caching

`/api/chart` sets:

```
cache-control: no-store, no-cache, must-revalidate, private
x-robots-tag: noindex
```

and is declared `dynamic = "force-dynamic"`. Personal birth data is never cached
at the edge or in a CDN, and chart results are never addressable by a shareable
URL.

`/api/locations` is cacheable (`public, max-age=300`) because place names are not
personal data. Note that a location *query* is only a place name, not a birth
record.

## Analytics

No analytics package is installed.

**If analytics are added later**, the following must hold:

- Do **not** send raw date of birth.
- Do **not** send raw birth time.
- Do **not** send full birth location.
- Do **not** log the chart payload.

Safe to send, if anything is needed at all: that a chart was generated, the
derived Type, and coarse timing. None of those identify a person on their own.
Prefer a privacy-respecting, cookieless analytics provider.

## Third parties

| Recipient | What it receives | When |
| --- | --- | --- |
| Open-Meteo geocoding | The **place-name text typed into the search box** | While the visitor types a birth place |
| Google Fonts | The visitor's IP and user agent | On page load, for webfonts |

The geocoder receives a place-name query only. It never receives the birth date
or birth time, and it is called **server-side** from `/api/locations`, so the
visitor's browser never contacts it directly and their IP is not exposed to it.

> **Consideration for launch:** Google Fonts is loaded from a third-party origin.
> Self-hosting the two fonts would remove that request entirely and is
> recommended for a stricter privacy posture in the EU/UK. The font stack already
> degrades gracefully, so this change is low risk.

## In the interface

A short note sits directly beneath the form and again in the footer:

> Your birth details are used to calculate your chart and are not stored.
> Nothing is saved to a database and your date, time and place of birth are
> never sent to analytics.

## If persistence is ever added

It should be deliberate and opt-in. At minimum: explicit consent at the point of
saving, a stated retention period, a way to delete, encryption at rest, and an
update to this document and the in-product notice.
