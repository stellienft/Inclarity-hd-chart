import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/api/rate-limit";
import { chartRequestSchema, zodErrorToApiError, type ApiError } from "@/lib/api/schema";
import { BirthTimeError } from "@/lib/birth/timezone";
import { calculateChart } from "@/lib/human-design";

export const runtime = "nodejs";
/** Personal birth data must never be cached at the edge or in a CDN. */
export const dynamic = "force-dynamic";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const MAX_BODY_BYTES = 4096;

const PRIVATE_HEADERS = {
  "cache-control": "no-store, no-cache, must-revalidate, private",
  "x-robots-tag": "noindex",
} as const;

export async function POST(request: Request): Promise<NextResponse> {
  const limit = rateLimit(clientKey(request), RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) {
    const body: ApiError = {
      error: {
        code: "rate_limited",
        message: "Too many charts requested. Please wait a moment and try again.",
      },
    };
    return NextResponse.json(body, {
      status: 429,
      headers: {
        ...PRIVATE_HEADERS,
        "retry-after": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
      },
    });
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        {
          error: { code: "invalid_request", message: "Request body is too large." },
        } satisfies ApiError,
        { status: 413, headers: PRIVATE_HEADERS },
      );
    }
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json(
      {
        error: { code: "invalid_request", message: "Request body must be valid JSON." },
      } satisfies ApiError,
      { status: 400, headers: PRIVATE_HEADERS },
    );
  }

  const parsed = chartRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(zodErrorToApiError(parsed.error), {
      status: 400,
      headers: PRIVATE_HEADERS,
    });
  }

  try {
    const { chart } = await calculateChart(parsed.data);
    return NextResponse.json(chart, { headers: PRIVATE_HEADERS });
  } catch (error) {
    // Birth-time problems are the visitor's to act on, so they are reported
    // specifically. Everything else is logged server-side and returned as a
    // generic message — no stack traces reach the client.
    if (error instanceof BirthTimeError) {
      return NextResponse.json(
        {
          error: { code: "invalid_request", message: error.message },
        } satisfies ApiError,
        { status: 400, headers: PRIVATE_HEADERS },
      );
    }

    // Logged WITHOUT the request body: it contains personal birth data.
    console.error("[chart] calculation failed:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      {
        error: {
          code: "calculation_failed",
          message: "The chart could not be calculated. Please check the birth details and try again.",
        },
      } satisfies ApiError,
      { status: 500, headers: PRIVATE_HEADERS },
    );
  }
}
