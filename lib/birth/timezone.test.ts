import { describe, expect, it } from "vitest";

import { localBirthToUtc, pre1970DataWarning, resolveTimezone } from "./timezone";

const at = (latitude: number, longitude: number, timezone: string) => ({
  latitude,
  longitude,
  timezone,
});

const BRISBANE = at(-27.4698, 153.0251, "Australia/Brisbane");
const LONDON = at(51.5074, -0.1278, "Europe/London");
const NEW_YORK = at(40.7128, -74.006, "America/New_York");
const KATHMANDU = at(27.7172, 85.324, "Asia/Kathmandu");

describe("localBirthToUtc — historical DST", () => {
  /**
   * Queensland ran a daylight-saving trial from 1989 to 1992. A chart for
   * 1 March 1990 in Brisbane is therefore UTC+11, not the "obvious" UTC+10.
   * This is exactly the failure a hard-coded offset table would produce.
   */
  it("applies Queensland's 1989-92 daylight saving trial", () => {
    const result = localBirthToUtc({
      localDate: "1990-03-01",
      localTime: "14:32",
      location: BRISBANE,
    });
    expect(result.offsetMinutes).toBe(660);
    expect(result.birthUtc.toISOString()).toBe("1990-03-01T03:32:00.000Z");
  });

  it("uses standard time for the same place outside the trial", () => {
    const result = localBirthToUtc({
      localDate: "1990-06-01",
      localTime: "14:32",
      location: BRISBANE,
    });
    expect(result.offsetMinutes).toBe(600);
    expect(result.birthUtc.toISOString()).toBe("1990-06-01T04:32:00.000Z");
  });

  it("applies British Standard Time (1968-71, UTC+1 all year)", () => {
    const winter = localBirthToUtc({
      localDate: "1969-01-15",
      localTime: "10:00",
      location: LONDON,
    });
    expect(winter.offsetMinutes).toBe(60);
    expect(winter.birthUtc.toISOString()).toBe("1969-01-15T09:00:00.000Z");
  });

  it("uses GMT for a London winter birth outside that period", () => {
    const result = localBirthToUtc({
      localDate: "1975-01-15",
      localTime: "10:00",
      location: LONDON,
    });
    expect(result.offsetMinutes).toBe(0);
  });

  it("applies US wartime year-round DST", () => {
    const result = localBirthToUtc({
      localDate: "1945-01-15",
      localTime: "10:00",
      location: NEW_YORK,
    });
    expect(result.offsetMinutes).toBe(-240);
  });

  it("handles Nepal's change from +05:30 to +05:45 in 1986", () => {
    const before = localBirthToUtc({
      localDate: "1985-01-01",
      localTime: "06:00",
      location: KATHMANDU,
    });
    const after = localBirthToUtc({
      localDate: "1990-01-01",
      localTime: "06:00",
      location: KATHMANDU,
    });
    expect(before.offsetMinutes).toBe(330);
    expect(after.offsetMinutes).toBe(345);
  });
});

describe("localBirthToUtc — DST discontinuities", () => {
  it("flags a local time that never existed (clocks sprang forward)", () => {
    // US 2019: 2am -> 3am on 10 March. 02:30 did not exist.
    const result = localBirthToUtc({
      localDate: "2019-03-10",
      localTime: "02:30",
      location: NEW_YORK,
    });
    expect(result.ambiguity).toBe("skipped");
    expect(result.birthUtc).toBeInstanceOf(Date);
  });

  it("flags a local time that happened twice (clocks fell back)", () => {
    // US 2019: 2am -> 1am on 3 November. 01:30 happened twice.
    const result = localBirthToUtc({
      localDate: "2019-11-03",
      localTime: "01:30",
      location: NEW_YORK,
    });
    expect(result.ambiguity).toBe("repeated");
    // The earlier, pre-transition instant (EDT, UTC-4).
    expect(result.birthUtc.toISOString()).toBe("2019-11-03T05:30:00.000Z");
  });

  it("reports no ambiguity for an ordinary time", () => {
    const result = localBirthToUtc({
      localDate: "2019-06-15",
      localTime: "12:00",
      location: NEW_YORK,
    });
    expect(result.ambiguity).toBe("none");
  });
});

describe("resolveTimezone", () => {
  it("derives the zone from coordinates", () => {
    expect(resolveTimezone(-27.4698, 153.0251).timezone).toBe("Australia/Brisbane");
    expect(resolveTimezone(51.5074, -0.1278).timezone).toBe("Europe/London");
  });

  it("accepts a client claim that matches the coordinates", () => {
    const result = resolveTimezone(-27.4698, 153.0251, "Australia/Brisbane");
    expect(result.timezone).toBe("Australia/Brisbane");
    expect(result.claimAccepted).toBe(true);
  });

  it("overrides a client claim that contradicts the coordinates", () => {
    // A hostile or stale client asking for a wildly different zone.
    const result = resolveTimezone(-27.4698, 153.0251, "America/New_York");
    expect(result.timezone).toBe("Australia/Brisbane");
    expect(result.claimAccepted).toBe(false);
  });

  it("overrides an invalid claim", () => {
    const result = resolveTimezone(51.5074, -0.1278, "Not/AZone");
    expect(result.timezone).toBe("Europe/London");
    expect(result.claimAccepted).toBe(false);
  });

  it("does not use the process timezone", () => {
    // Whatever TZ the server runs in must never leak into the result.
    expect(resolveTimezone(35.6762, 139.6503).timezone).toBe("Asia/Tokyo");
  });
});

describe("pre-1970 timezone data warnings", () => {
  it("warns for a merged zone before 1970", () => {
    const warning = pre1970DataWarning("Europe/Amsterdam", new Date("1935-06-15T09:00:00Z"));
    expect(warning).toContain("Europe/Amsterdam");
    expect(warning).toContain("approximate");
  });

  it("does not warn for the same zone after 1970", () => {
    expect(pre1970DataWarning("Europe/Amsterdam", new Date("1985-06-15T09:00:00Z"))).toBeNull();
  });

  it("does not warn for zones with reliable pre-1970 history", () => {
    expect(pre1970DataWarning("America/New_York", new Date("1945-01-15T15:00:00Z"))).toBeNull();
    expect(pre1970DataWarning("Australia/Brisbane", new Date("1950-01-15T02:00:00Z"))).toBeNull();
  });
});

describe("birthLocalIso", () => {
  it("carries the birth place's offset, not the server's", () => {
    const result = localBirthToUtc({
      localDate: "1990-03-01",
      localTime: "14:32",
      location: BRISBANE,
    });
    expect(result.birthLocalIso).toBe("1990-03-01T14:32:00+11:00");
  });
});
