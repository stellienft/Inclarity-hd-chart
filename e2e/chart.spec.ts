import { expect, test, type Page } from "@playwright/test";

import { GATE_DEFINITIONS } from "../lib/human-design/constants/gates";
import { VIEWBOX } from "../components/bodygraph/geometry";

/**
 * End-to-end coverage of the visitor journey, plus the public API contract.
 *
 * The chart used throughout is 1 March 1990, 14:32, Brisbane — deliberately a
 * date inside Queensland's 1989-92 daylight-saving trial, so a regression in
 * timezone handling shows up as a changed chart rather than passing silently.
 */

async function generateChart(page: Page, name = "Example"): Promise<void> {
  await page.goto("/");
  if (name) await page.fill("#name", name);
  await page.fill("#date", "1990-03-01");
  await page.fill("#time", "14:32");

  const place = page.getByRole("combobox");
  await place.fill("Brisbane");
  await page.getByRole("option").first().click();

  await page.getByRole("button", { name: /generate my chart/i }).click();
  await expect(page.getByTestId("design-column")).toBeVisible({ timeout: 30_000 });
}

test.describe("chart generation", () => {
  test("generates a chart from birth details", async ({ page }) => {
    await generateChart(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Example");

    // Scoped to the core panel: the same words legitimately appear again in
    // the BodyGraph's <desc>, which is the accessibility description working
    // as intended rather than a duplicate rendering.
    const core = page.getByTestId("core-panel");
    await expect(core.getByText("Generator", { exact: true })).toBeVisible();
    await expect(core.getByText("To Respond", { exact: true })).toBeVisible();
    await expect(core.getByText("Emotional", { exact: true })).toBeVisible();
    await expect(core.getByText(/^5\/1 — /)).toBeVisible();
    await expect(core.getByText("Split Definition", { exact: true })).toBeVisible();
  });

  test("applies the birth place's historical timezone, not the browser's", async ({ page }) => {
    await generateChart(page);
    const core = page.getByTestId("core-panel");

    // Queensland was observing daylight saving on this date, so the offset is
    // +11:00 and the UTC time is 03:32 — not the +10:00 an offset table would give.
    await expect(core.getByText("05 March 1990", { exact: false })).toHaveCount(0);
    await expect(core.getByText(/01 March 1990, 14:32 \(UTC\+11:00\)/)).toBeVisible();
    await expect(core.getByText(/01 March 1990, 03:32/)).toBeVisible();
    await expect(core.getByText("Brisbane, Queensland, Australia")).toBeVisible();
  });

  test("renders the BodyGraph with all nine centres, 64 gates and 36 channels", async ({ page }) => {
    await generateChart(page);

    const svg = page.locator("svg[role='img']");
    await expect(svg).toBeVisible();
    await expect(svg.locator("[data-center]")).toHaveCount(9);
    await expect(svg.locator("[data-gate]")).toHaveCount(64);
    await expect(svg.locator("[data-channel]")).toHaveCount(36);
  });

  test("draws the four Variable arrows and repeats them as text", async ({ page }) => {
    await generateChart(page);

    const arrows = page.locator("[data-testid='variable-arrows'] [data-variable]");
    await expect(arrows).toHaveCount(4);

    for (const position of ["determination", "environment", "motivation", "perspective"]) {
      const arrow = arrows.filter({ has: page.locator(`:scope[data-variable='${position}']`) });
      await expect(arrow).toHaveCount(1);
      // Direction is a real result, but it is always one of the two.
      await expect(arrow).toHaveAttribute("data-direction", /^(left|right)$/);
    }

    // The drawing is never the only carrier: the same four appear as rows in
    // the Foundation Chart, with their Colour and Tone spelled out.
    const core = page.getByTestId("core-panel");
    for (const label of ["Determination", "Environment", "Motivation", "Perspective"]) {
      await expect(core.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(core).toContainText(/Colour \d, Tone \d/);
  });

  test("shows both planetary activation columns with real values", async ({ page }) => {
    await generateChart(page);

    const design = page.getByTestId("design-column");
    const personality = page.getByTestId("personality-column");

    // 13 bodies. The table also carries a screen-reader-only header row, so
    // the body rows are counted rather than every row in the table.
    await expect(design.locator("tbody tr")).toHaveCount(13);
    await expect(personality.locator("tbody tr")).toHaveCount(13);

    // Personality Sun for this birth is gate 37, line 5.
    await expect(personality.locator("tbody tr").first()).toContainText("37.5");
    // Design Sun is gate 5, line 1.
    await expect(design.locator("tbody tr").first()).toContainText("5.1");
  });

  test("can create another chart", async ({ page }) => {
    await generateChart(page);
    await page.getByRole("button", { name: /create another chart/i }).click();
    await expect(page.getByTestId("birth-form")).toBeVisible();
    await expect(page.getByRole("heading", { name: /create your human design chart/i })).toBeVisible();
  });

  test("falls back to a generic heading when no name is given", async ({ page }) => {
    await generateChart(page, "");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your Human Design");
  });
});

test.describe("validation and accessibility", () => {
  test("reports missing fields without submitting", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /generate my chart/i }).click();

    await expect(page.getByRole("alert").filter({ hasText: /birth date/i })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /birth time/i })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /birth place/i })).toBeVisible();
    await expect(page.getByTestId("birth-form")).toBeVisible();
  });

  test("location search is a keyboard-operable combobox", async ({ page }) => {
    await page.goto("/");
    const place = page.getByRole("combobox");
    await place.fill("Brisbane");
    await expect(page.getByRole("option").first()).toBeVisible();

    await place.press("ArrowDown");
    await place.press("Enter");

    await expect(place).toHaveValue(/Brisbane/);
    await expect(page.getByText(/Selected: Brisbane/)).toBeVisible();
  });

  test("every form control has an associated label", async ({ page }) => {
    await page.goto("/");
    for (const id of ["#name", "#date", "#time"]) {
      const input = page.locator(id);
      const inputId = await input.getAttribute("id");
      await expect(page.locator(`label[for="${inputId}"]`)).toHaveCount(1);
    }
  });

  test("the BodyGraph exposes an accessible name and description", async ({ page }) => {
    await generateChart(page);
    const svg = page.locator("svg[role='img']");
    await expect(svg.locator("title").first()).toContainText("BodyGraph");
    await expect(svg.locator("desc")).toContainText("Generator");
  });

  test("chart information is available as text, not only as a drawing", async ({ page }) => {
    await generateChart(page);
    await expect(page.getByRole("heading", { name: /centres and channels/i })).toBeVisible();
    await expect(page.getByText("Defined", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Undefined", { exact: true }).first()).toBeVisible();
  });

  test("has a skip link and a single h1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /skip to content/i })).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });
});

/**
 * The figure behind the graph is supplied artwork with holes in it — the gaps
 * between the arms and the body, and the slivers between locks of hair. Where
 * it is actually PAINTED can only be answered by something that understands
 * fill rules, so it is asked here, of the browser, rather than approximated by
 * flattening the path in a unit test.
 */
test.describe("the figure behind the graph", () => {
  const SPINE = ["head", "ajna", "throat", "g", "sacral", "root"];
  const WINGS = ["heart", "spleen", "solarPlexus"];

  /** Which gates the figure is painted under, keyed by gate number. */
  async function paintedGates(page: Page): Promise<Record<number, boolean>> {
    await generateChart(page);
    return page.evaluate(() => {
      const svg = document.querySelector("svg[role='img']")!;
      const group = svg.querySelector("g[transform]")!;
      const path = group.querySelector("path") as SVGPathElement;

      // Undo the placement transform: isPointInFill works in the path's own
      // coordinates, which are the artwork's, not the BodyGraph's.
      const [tx, ty, sx, sy] = (group
        .getAttribute("transform")!
        .match(/translate\((-?[\d.]+) (-?[\d.]+)\) scale\(([\d.]+) ([\d.]+)\)/) ?? [])
        .slice(1)
        .map(Number) as [number, number, number, number];

      const result: Record<number, boolean> = {};
      for (const element of svg.querySelectorAll("[data-gate]")) {
        const label = element.querySelector("text")!;
        const x = (Number(label.getAttribute("x")) - tx) / sx;
        const y = (Number(label.getAttribute("y")) - ty) / sy;
        result[Number(element.getAttribute("data-gate"))] = path.isPointInFill(
          new DOMPoint(x, y),
        );
      }
      return result;
    });
  }

  const gatesOf = (centre: string) =>
    GATE_DEFINITIONS.filter((g) => g.center === centre).map((g) => g.gate);

  test("backs every centre running down the middle", async ({ page }) => {
    const painted = await paintedGates(page);

    for (const centre of SPINE) {
      const missing = gatesOf(centre).filter((gate) => !painted[gate]);
      expect(missing, `${centre} gates sitting on bare page`).toEqual([]);
    }
  });

  test("lets the outer centres graze its edge without floating free", async ({ page }) => {
    const painted = await paintedGates(page);

    for (const centre of WINGS) {
      const gates = gatesOf(centre);
      const on = gates.filter((gate) => painted[gate]);
      expect(on.length, `${centre} has nothing over the figure`).toBeGreaterThan(0);
      expect(on.length, `${centre} is entirely swallowed by the figure`).toBeLessThan(
        gates.length,
      );
    }
  });

  /**
   * The Spleen and Solar Plexus are laid out as mirrors of each other, so the
   * gates that fall past the figure should mirror too. If they stop matching,
   * either the wings have drifted apart or the artwork is no longer sitting
   * square in the frame — and this catches both without measuring either.
   */
  test("drops the same gates either side, proving the figure sits square", async ({ page }) => {
    const painted = await paintedGates(page);
    const MIRROR: Array<[number, number]> = [
      [48, 36],
      [57, 22],
      [44, 37],
      [50, 6],
      [32, 49],
      [28, 55],
      [18, 30],
    ];

    for (const [left, right] of MIRROR) {
      expect(painted[left], `gate ${left} against its mirror ${right}`).toBe(painted[right]);
    }
  });
});

test.describe("layout", () => {
  test("does not scroll horizontally", async ({ page }) => {
    await generateChart(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keeps Design and Personality either side of the chart, at every width", async ({
    page,
  }) => {
    // The mobile project runs this at 412px. Stacking the columns below the
    // chart would break the arrangement a Human Design reader expects, so the
    // three-across layout is asserted rather than left to a breakpoint.
    await generateChart(page);
    // Webfonts change metrics as they swap in, which moves the columns. Wait
    // for them before measuring, or this races on a cold load.
    await page.evaluate(() => document.fonts.ready);

    const chart = await page.locator("svg[role='img']").boundingBox();
    const design = await page.getByTestId("design-column").boundingBox();
    const personality = await page.getByTestId("personality-column").boundingBox();
    if (!chart || !design || !personality) throw new Error("missing layout boxes");

    expect(design.x + design.width).toBeLessThanOrEqual(chart.x + 1);
    expect(personality.x).toBeGreaterThanOrEqual(chart.x + chart.width - 1);

    // And they sit alongside it, not above or below.
    expect(design.y).toBeLessThan(chart.y + chart.height);
    expect(personality.y).toBeLessThan(chart.y + chart.height);
  });

  test("the BodyGraph scales rather than using a fixed size", async ({ page }) => {
    await generateChart(page);
    const svg = page.locator("svg[role='img']");
    // Read from the geometry module so a deliberate redesign does not need a
    // hand-edited magic string here.
    await expect(svg).toHaveAttribute("viewBox", `0 0 ${VIEWBOX.width} ${VIEWBOX.height}`);
    expect(await svg.getAttribute("width")).toBeNull();
  });

  test("print layout keeps the chart on the page and hides interactive controls", async ({
    page,
  }) => {
    await generateChart(page);
    await page.emulateMedia({ media: "print" });

    await expect(page.getByRole("button", { name: /explore a 1:1/i })).toBeHidden();
    await expect(page.locator("svg[role='img']")).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("API", () => {
  test("returns a typed chart", async ({ request }) => {
    const response = await request.post("/api/chart", {
      data: {
        name: "Example",
        date: "1990-03-01",
        time: "14:32",
        location: {
          displayName: "Brisbane, Queensland, Australia",
          city: "Brisbane",
          region: "Queensland",
          country: "Australia",
          latitude: -27.4698,
          longitude: 153.0251,
          timezone: "Australia/Brisbane",
        },
      },
    });

    expect(response.ok()).toBe(true);
    const chart = await response.json();

    expect(chart.type).toBe("Generator");
    expect(chart.authority).toBe("Emotional");
    expect(chart.profile).toBe("5/1");
    expect(chart.subject.birthUtc).toBe("1990-03-01T03:32:00.000Z");
    expect(chart.calculationMeta.designSolverResidualDeg).toBeLessThan(1e-7);
    expect(chart.channels.length).toBeGreaterThan(0);
    // Personal data must never be cached.
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("rejects a malformed request with structured errors and no stack trace", async ({
    request,
  }) => {
    const response = await request.post("/api/chart", {
      data: { date: "not-a-date", time: "99:99", location: {} },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_request");
    expect(Array.isArray(body.error.details)).toBe(true);
    expect(JSON.stringify(body)).not.toContain("at ");
  });

  test("rejects an impossible calendar date", async ({ request }) => {
    const response = await request.post("/api/chart", {
      data: {
        date: "2001-02-30",
        time: "12:00",
        location: {
          displayName: "Brisbane",
          latitude: -27.4698,
          longitude: 153.0251,
          timezone: "Australia/Brisbane",
        },
      },
    });
    expect(response.status()).toBe(400);
  });

  test("overrides a client timezone that contradicts the coordinates", async ({ request }) => {
    const response = await request.post("/api/chart", {
      data: {
        date: "1990-03-01",
        time: "14:32",
        location: {
          displayName: "Brisbane",
          latitude: -27.4698,
          longitude: 153.0251,
          // A hostile or stale client claim.
          timezone: "America/New_York",
        },
      },
    });

    expect(response.ok()).toBe(true);
    const chart = await response.json();
    expect(chart.subject.timezone).toBe("Australia/Brisbane");
    expect(chart.calculationMeta.warnings.join(" ")).toContain("Australia/Brisbane");
  });

  test("location search returns results", async ({ request }) => {
    const response = await request.get("/api/locations?q=brisb");
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.results[0].timezone).toBe("Australia/Brisbane");
  });
});
