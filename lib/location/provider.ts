import { resolveTimezone } from "../birth/timezone";
import { searchStaticCities } from "./static-cities";
import type { LocationProvider, LocationResult } from "./types";

/**
 * ============================================================================
 *  LOCATION SEARCH
 * ============================================================================
 *
 * Provider choice and its trade-offs are documented in docs/LICENSING.md.
 *
 * Open-Meteo's geocoding API is the default because it needs no API key (so
 * there is no secret to leak), returns an IANA timezone alongside the
 * coordinates, and is generous with rate limits. Its data is derived from
 * GeoNames (CC BY 4.0).
 *
 * Whatever the provider says about timezone is treated as a HINT only: every
 * result is re-stamped with the zone derived from its own coordinates, so a
 * provider bug or a tampered client payload cannot steer the chart into the
 * wrong timezone.
 */

const OPEN_METEO_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

interface OpenMeteoResult {
  name?: string;
  admin1?: string;
  admin2?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

function normalise(raw: OpenMeteoResult): LocationResult | null {
  const { name, latitude, longitude } = raw;
  if (!name || typeof latitude !== "number" || typeof longitude !== "number") return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  const region = raw.admin1 ?? raw.admin2 ?? "";
  const country = raw.country ?? "";

  // Authoritative zone from coordinates, not from the provider's field.
  const { timezone } = resolveTimezone(latitude, longitude, raw.timezone);

  return {
    displayName: [name, region, country].filter(Boolean).join(", "),
    city: name,
    region,
    country,
    ...(raw.country_code ? { countryCode: raw.country_code } : {}),
    latitude,
    longitude,
    timezone,
  };
}

export class OpenMeteoLocationProvider implements LocationProvider {
  readonly id = "open-meteo";

  constructor(private readonly timeoutMs = 5000) {}

  async search(query: string, signal?: AbortSignal): Promise<LocationResult[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const url = new URL(OPEN_METEO_ENDPOINT);
    url.searchParams.set("name", trimmed);
    url.searchParams.set("count", "8");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    signal?.addEventListener("abort", () => controller.abort(), { once: true });

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Geocoder responded ${response.status}`);

      const payload = (await response.json()) as { results?: OpenMeteoResult[] };
      return (payload.results ?? [])
        .map(normalise)
        .filter((result): result is LocationResult => result !== null);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export class StaticLocationProvider implements LocationProvider {
  readonly id = "static";

  async search(query: string): Promise<LocationResult[]> {
    return searchStaticCities(query).map((result) => ({
      ...result,
      timezone: resolveTimezone(result.latitude, result.longitude, result.timezone).timezone,
    }));
  }
}

/**
 * Tries the primary provider, then falls back to the built-in gazetteer.
 *
 * The fallback also runs when the primary returns nothing, so a visitor typing
 * "Brisbane" still gets a usable result during a geocoder outage instead of an
 * empty box and a dead end.
 */
export class FallbackLocationProvider implements LocationProvider {
  readonly id: string;

  constructor(
    private readonly primary: LocationProvider,
    private readonly fallback: LocationProvider = new StaticLocationProvider(),
  ) {
    this.id = `${primary.id}+${fallback.id}`;
  }

  async search(query: string, signal?: AbortSignal): Promise<LocationResult[]> {
    try {
      const results = await this.primary.search(query, signal);
      if (results.length > 0) return results;
    } catch {
      // Fall through — a geocoder outage must not break chart creation.
    }
    return this.fallback.search(query, signal);
  }
}

export function createLocationProvider(): LocationProvider {
  if (process.env.LOCATION_PROVIDER === "static") return new StaticLocationProvider();
  return new FallbackLocationProvider(new OpenMeteoLocationProvider());
}
