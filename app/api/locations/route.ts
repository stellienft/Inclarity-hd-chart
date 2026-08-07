import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/api/rate-limit";
import { locationSearchSchema, type ApiError } from "@/lib/api/schema";
import { createLocationProvider } from "@/lib/location/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

const provider = createLocationProvider();

/**
 * Location search runs server-side so the browser never talks to the geocoder
 * directly. That keeps any future keyed provider's credentials out of the
 * client bundle and means swapping providers needs no front-end change.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const limit = rateLimit(`loc:${clientKey(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: { code: "rate_limited", message: "Too many searches. Please slow down." },
      } satisfies ApiError,
      { status: 429, headers: { "cache-control": "no-store" } },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = locationSearchSchema.safeParse({ q: searchParams.get("q") ?? "" });

  if (!parsed.success) {
    return NextResponse.json({ results: [] }, { headers: { "cache-control": "no-store" } });
  }

  try {
    const results = await provider.search(parsed.data.q);
    return NextResponse.json(
      { results },
      {
        headers: {
          // Place names are not personal data, so a short shared cache is safe
          // and keeps autocomplete responsive.
          "cache-control": "public, max-age=300, s-maxage=3600",
        },
      },
    );
  } catch (error) {
    console.error("[locations] search failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ results: [] }, { headers: { "cache-control": "no-store" } });
  }
}
