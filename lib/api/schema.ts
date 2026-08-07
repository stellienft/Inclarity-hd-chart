import { z } from "zod";

/**
 * Request validation for the public calculation endpoint.
 *
 * Bounds are deliberately tight: this is an unauthenticated public endpoint,
 * so every field is length- and range-checked before any work is done.
 */

/** astronomy-engine is accurate over a far wider span, but this is the range we test and support. */
const MIN_YEAR = 1800;
const MAX_YEAR = 2100;

export const locationSchema = z.object({
  displayName: z.string().min(1).max(200),
  city: z.string().max(120).optional().default(""),
  region: z.string().max(120).optional().default(""),
  country: z.string().max(120).optional().default(""),
  countryCode: z.string().max(8).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  /**
   * Accepted but not trusted: the server re-derives the zone from the
   * coordinates and only honours this when the two agree.
   */
  timezone: z.string().min(1).max(80),
});

export const chartRequestSchema = z.object({
  name: z.string().trim().max(80).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be in YYYY-MM-DD format")
    .refine((value) => {
      const [y, m, d] = value.split("-").map(Number) as [number, number, number];
      if (y < MIN_YEAR || y > MAX_YEAR) return false;
      const date = new Date(Date.UTC(y, m - 1, d));
      // Rejects 2001-02-30 and friends, which Date would silently roll over.
      return (
        date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
      );
    }, `Birth date must be a real date between ${MIN_YEAR} and ${MAX_YEAR}`),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Birth time must be in 24-hour HH:mm format"),
  location: locationSchema,
});

export type ChartRequest = z.infer<typeof chartRequestSchema>;

export const locationSearchSchema = z.object({
  q: z.string().trim().min(2, "Enter at least two characters").max(120),
});

/** Shape returned for any failed request. Never contains a stack trace. */
export interface ApiError {
  error: {
    message: string;
    code: "invalid_request" | "rate_limited" | "calculation_failed";
    details?: Array<{ path: string; message: string }>;
  };
}

export function zodErrorToApiError(error: z.ZodError): ApiError {
  return {
    error: {
      code: "invalid_request",
      message: "Some of the birth details could not be read.",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    },
  };
}
