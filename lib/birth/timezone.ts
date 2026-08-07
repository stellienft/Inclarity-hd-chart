import { DateTime } from "luxon";
import tzLookup from "tz-lookup";

import type { LocationResult } from "../location/types";

/**
 * ============================================================================
 *  LOCAL BIRTH TIME -> UTC
 * ============================================================================
 *
 * The birth timestamp must be interpreted in the timezone THE BIRTH PLACE was
 * using ON THE BIRTH DATE. Never the visitor's browser timezone, and never a
 * hard-coded offset: "Brisbane = UTC+10" is wrong for anyone born during the
 * 1971-72 or 1989-92 Queensland daylight-saving experiments.
 *
 * Luxon delegates to the platform's IANA database, so historical offset and
 * DST rules are applied correctly for the given instant.
 */

export interface BirthInput {
  /** "YYYY-MM-DD" in the birth place's local calendar. */
  localDate: string;
  /** "HH:mm" (24h) in the birth place's local clock. */
  localTime: string;
  location: Pick<LocationResult, "latitude" | "longitude" | "timezone">;
}

export type AmbiguityKind = "none" | "skipped" | "repeated";

export interface BirthConversion {
  birthUtc: Date;
  /** ISO string carrying the birth place's offset, e.g. "1990-03-01T14:32:00+10:00". */
  birthLocalIso: string;
  /** The IANA zone actually used. */
  timezone: string;
  /** Offset in minutes east of UTC that applied at the birth instant. */
  offsetMinutes: number;
  /**
   * Whether the local time fell in a DST discontinuity.
   *
   *   "skipped"  — the clock jumped over this time (spring forward). Luxon
   *                resolves it forwards; the chart is still computed.
   *   "repeated" — the clock passed this time twice (autumn back). The earlier
   *                (pre-transition) instant is used, matching Luxon's default
   *                and the usual astrological convention.
   */
  ambiguity: AmbiguityKind;
}

/**
 * Resolve the authoritative IANA timezone for a coordinate pair.
 *
 * The server always re-derives the zone from latitude/longitude rather than
 * trusting a client-supplied string. A caller-supplied zone is accepted only
 * when it is a valid IANA name AND agrees with the coordinate lookup, which
 * keeps a hostile or stale client from steering the calculation.
 */
export function resolveTimezone(
  latitude: number,
  longitude: number,
  claimed?: string,
): { timezone: string; claimAccepted: boolean } {
  const derived = tzLookup(latitude, longitude);

  if (!claimed) return { timezone: derived, claimAccepted: false };
  if (claimed === derived) return { timezone: derived, claimAccepted: true };

  // A different but valid zone that agrees on the offset for "now" is almost
  // always a benign alias (e.g. Australia/Canberra vs Australia/Sydney).
  const claimedZone = DateTime.now().setZone(claimed);
  const derivedZone = DateTime.now().setZone(derived);
  if (claimedZone.isValid && claimedZone.offset === derivedZone.offset) {
    return { timezone: claimed, claimAccepted: true };
  }

  return { timezone: derived, claimAccepted: false };
}

/**
 * Zones whose PRE-1970 history the IANA database deliberately approximates.
 *
 * Since tzdata 2022b many zones that have agreed since 1970 were merged into a
 * single representative zone, discarding their earlier divergences. The data is
 * accurate from 1970 onward but can be wrong before then — for example
 * Europe/Amsterdam resolves to Brussels' history, losing the Netherlands'
 * +00:19:32 standard time and reporting GMT+00:00 for 1935 instead.
 *
 * Errors are typically tens of minutes, which is immaterial for the Sun but can
 * shift the Moon by a fifth of a line. Rather than silently absorb that, births
 * before 1970 in these zones carry a warning on the chart.
 *
 * (Restoring full accuracy needs tzdata compiled with its `backzone` file,
 * which Node's bundled ICU does not ship. See docs/HUMAN_DESIGN_CALCULATION.md.)
 */
const PRE_1970_APPROXIMATED_ZONES = new Set([
  "Europe/Amsterdam",
  "Europe/Luxembourg",
  "Europe/Monaco",
  "Europe/Oslo",
  "Europe/Stockholm",
  "Europe/Copenhagen",
  "Europe/Zurich",
  "Europe/Vaduz",
  "Europe/San_Marino",
  "Europe/Vatican",
  "Europe/Ljubljana",
  "Europe/Zagreb",
  "Europe/Sarajevo",
  "Europe/Skopje",
  "Europe/Belgrade",
  "Europe/Bratislava",
  "Europe/Podgorica",
  "Arctic/Longyearbyen",
  "Atlantic/Reykjavik",
  "America/Montreal",
  "America/Toronto",
]);

const PRE_1970_CUTOFF = Date.UTC(1970, 0, 1);

/**
 * Returns a warning when the birth instant falls in a period the timezone
 * database only approximates, or null when the conversion is fully trustworthy.
 */
export function pre1970DataWarning(timezone: string, birthUtc: Date): string | null {
  if (birthUtc.getTime() >= PRE_1970_CUTOFF) return null;
  if (!PRE_1970_APPROXIMATED_ZONES.has(timezone)) return null;
  return (
    `The timezone database stores only an approximate pre-1970 history for ${timezone}, ` +
    "so the UTC conversion for this birth date may be off by up to about half an hour. " +
    "The Sun, and therefore Type, Authority and Profile, are unaffected; the Moon's line " +
    "is the value most worth double-checking."
  );
}

export class BirthTimeError extends Error {}

/** Convert a local birth date/time at a location into a UTC instant. */
export function localBirthToUtc(input: BirthInput): BirthConversion {
  const { timezone } = resolveTimezone(
    input.location.latitude,
    input.location.longitude,
    input.location.timezone,
  );

  const local = DateTime.fromISO(`${input.localDate}T${input.localTime}`, { zone: timezone });

  if (!local.isValid) {
    throw new BirthTimeError(
      `Could not interpret ${input.localDate} ${input.localTime} in ${timezone}: ${local.invalidReason}`,
    );
  }

  // Detect DST discontinuities by round-tripping through the zone: if the
  // local wall-clock time we get back differs, the input time did not exist.
  const roundTripped = local.toFormat("yyyy-MM-dd'T'HH:mm");
  const requested = `${input.localDate}T${input.localTime}`;
  let ambiguity: AmbiguityKind = roundTripped === requested ? "none" : "skipped";

  if (ambiguity === "none") {
    // A repeated hour has two distinct instants sharing one wall-clock time.
    // Advancing the INSTANT by an hour and landing on the same wall clock is
    // exactly that condition. (Comparing offsets of the neighbouring wall-clock
    // hour does not work: Luxon resolves the ambiguous time to the earlier
    // instant, whose offset matches the hour before it.)
    const hourLater = local.plus({ hours: 1 });
    if (hourLater.toFormat("yyyy-MM-dd'T'HH:mm") === requested) ambiguity = "repeated";
  }

  return {
    birthUtc: local.toUTC().toJSDate(),
    birthLocalIso: local.toISO({ suppressMilliseconds: true }) ?? requested,
    timezone,
    offsetMinutes: local.offset,
    ambiguity,
  };
}

/** Render a UTC instant in a given zone, for the debug view and print layout. */
export function formatInZone(instant: Date, timezone: string, format = "yyyy-MM-dd HH:mm:ss ZZZZ"): string {
  return DateTime.fromJSDate(instant, { zone: timezone }).toFormat(format);
}
