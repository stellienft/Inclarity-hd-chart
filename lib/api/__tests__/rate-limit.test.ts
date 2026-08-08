import { beforeEach, describe, expect, it, vi } from "vitest";

import { clientKey, rateLimit, resetRateLimits } from "../rate-limit";

/**
 * The API routes read their ceiling from an environment variable so a test run
 * can raise it. These tests deliberately do NOT, so the limiter's behaviour is
 * pinned independently of whatever the app is configured to allow.
 */
describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.useRealTimers();
  });

  it("allows exactly `limit` calls in a window, then refuses", () => {
    for (let call = 1; call <= 3; call += 1) {
      expect(rateLimit("ip", 3, 60_000).allowed).toBe(true);
    }
    expect(rateLimit("ip", 3, 60_000).allowed).toBe(false);
  });

  it("counts down the remaining allowance and never reports a negative one", () => {
    expect(rateLimit("ip", 2, 60_000).remaining).toBe(1);
    expect(rateLimit("ip", 2, 60_000).remaining).toBe(0);
    expect(rateLimit("ip", 2, 60_000).remaining).toBe(0);
  });

  it("keys are independent, so one caller cannot throttle another", () => {
    expect(rateLimit("a", 1, 60_000).allowed).toBe(true);
    expect(rateLimit("a", 1, 60_000).allowed).toBe(false);
    expect(rateLimit("b", 1, 60_000).allowed).toBe(true);
  });

  it("starts a fresh window once the old one has elapsed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    expect(rateLimit("ip", 1, 60_000).allowed).toBe(true);
    expect(rateLimit("ip", 1, 60_000).allowed).toBe(false);

    vi.setSystemTime(new Date("2026-01-01T00:01:01Z"));
    const fresh = rateLimit("ip", 1, 60_000);
    expect(fresh.allowed).toBe(true);
    expect(fresh.resetAt).toBe(Date.now() + 60_000);

    vi.useRealTimers();
  });

  it("reports a resetAt that a retry-after header can be derived from", () => {
    const start = Date.now();
    const { resetAt } = rateLimit("ip", 1, 60_000);
    expect(resetAt).toBeGreaterThanOrEqual(start + 60_000);
  });
});

describe("clientKey", () => {
  const withHeaders = (headers: Record<string, string>) =>
    new Request("https://example.test/api/chart", { headers });

  it("takes the first hop of x-forwarded-for", () => {
    expect(clientKey(withHeaders({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe(
      "203.0.113.7",
    );
  });

  it("falls back to x-real-ip", () => {
    expect(clientKey(withHeaders({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("degrades to a shared bucket rather than throwing when nothing identifies the caller", () => {
    expect(clientKey(withHeaders({}))).toBe("unknown");
  });
});
