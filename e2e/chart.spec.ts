import { expect, test, type Page } from "@playwright/test";

import { VIEWBOX } from "../components/bodygraph/geometry";
import { GATE_DEFINITIONS } from "../lib/human-design/constants/gates";

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
    await expect(svg.locator("[data-center-shape]")).toHaveCount(9);
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
 * Every gate marker has to sit inside the shape it belongs to, as DRAWN.
 *
 * The unit tests can only check the sharp-cornered polygons the geometry is
 * defined by. What actually gets painted is those polygons with 26 units of
 * corner rounding applied, and rounding removes real area — most of it exactly
 * where the gates cluster, in the corners. Whether a point falls inside a
 * rounded path is a question about fill rules, so it is asked here, of the
 * browser, rather than approximated.
 */
test.describe("gate markers against the drawn centres", () => {
  /**
   * How much of each marker's DISC falls outside its own centre.
   *
   * Testing the centre point alone is not enough: gate 43 sits on the Ajna's
   * apex and passed a centre-point check while a fifth of its disc hung over
   * the rounded tip. Forty-eight points around the circumference is what
   * caught it.
   */
  async function discOutside(page: Page): Promise<Record<number, number>> {
    await generateChart(page);
    return page.evaluate(() => {
      const svg = document.querySelector("svg[role='img']")!;
      const result: Record<number, number> = {};
      for (const element of svg.querySelectorAll("[data-gate]")) {
        const gate = Number(element.getAttribute("data-gate"));
        const shape = svg.querySelector(
          `[data-center-shape="${element.getAttribute("data-center")}"]`,
        ) as SVGGeometryElement | null;
        if (!shape) {
          result[gate] = 48;
          continue;
        }
        const label = element.querySelector("text")!;
        const x = Number(label.getAttribute("x"));
        const y = Number(label.getAttribute("y"));
        const radius = Number(element.getAttribute("data-marker-radius"));
        let outside = 0;
        for (let k = 0; k < 48; k += 1) {
          const a = (k / 48) * 2 * Math.PI;
          const on = shape.isPointInFill(
            new DOMPoint(x + radius * Math.cos(a), y + radius * Math.sin(a)),
          );
          if (!on) outside += 1;
        }
        result[gate] = outside;
      }
      return result;
    });
  }

  test("keeps all 64 marker discs wholly inside their own centre", async ({ page }) => {
    const outside = await discOutside(page);
    expect(Object.keys(outside)).toHaveLength(64);
    const spilling = Object.entries(outside)
      .filter(([, count]) => count > 0)
      .map(([gate, count]) => `${gate}: ${count}/48 outside`);
    expect(spilling, "gate markers overhanging their drawn centre").toEqual([]);
  });

  /**
   * The Spleen and Solar Plexus are laid out as exact mirrors, so anything
   * true of one must be true of the other. Checked against the rendered paths
   * rather than the coordinates, which catches a drawing that has drifted off
   * the axis as well as geometry that has.
   */
  test("draws the Spleen and Solar Plexus as mirrors", async ({ page }) => {
    await generateChart(page);
    const boxes = await page.evaluate(() => {
      const svg = document.querySelector("svg[role='img']")!;
      const read = (id: string) => {
        const el = svg.querySelector(`[data-center-shape="${id}"]`) as SVGGraphicsElement;
        const b = el.getBBox();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      };
      const view = (svg as SVGSVGElement).viewBox.baseVal;
      return { left: read("spleen"), right: read("solarPlexus"), width: view.width };
    });

    const WOBBLE = 2;
    expect(Math.abs(boxes.left.w - boxes.right.w)).toBeLessThanOrEqual(WOBBLE);
    expect(Math.abs(boxes.left.h - boxes.right.h)).toBeLessThanOrEqual(WOBBLE);
    expect(Math.abs(boxes.left.y - boxes.right.y)).toBeLessThanOrEqual(WOBBLE);
    // Outer edges mirror about the axis.
    expect(
      Math.abs(boxes.left.x + (boxes.right.x + boxes.right.w) - boxes.width),
    ).toBeLessThanOrEqual(WOBBLE);
  });

  /**
   * Every region assigned to a channel must be a TRACK, not one of the gaps
   * between them.
   *
   * The drawing leaves 2n-1 white regions where n channels run side by side:
   * n track interiors alternating with n-1 gaps. Picking a gap by mistake fills
   * a shape that belongs to no channel — which is what put a stray wedge above
   * the Spleen, mapped as a second region of 34-57.
   *
   * A track is a ribbon of constant width; a gap is a wedge. Modelling each
   * region as a rectangle of the same area and perimeter recovers that width
   * exactly: solving 2(w + l) = P and wl = A gives w = (P - sqrt(P^2 - 16A))/4.
   * Every track in the file measures 12.6 to 16 units across. The one region
   * that did not — 34-57's 20.8-unit mouth on the Spleen, which the drawing
   * merges with 20-57's — is no longer drawn; see the note in artwork.ts.
   */
  test("gives every channel a track of the drawing's own width, never a gap", async ({
    page,
  }) => {
    await generateChart(page);
    const widths = await page.evaluate(() => {
      const svg = document.querySelector("svg[role='img']")!;
      const out: Array<{ id: string; index: number; width: number }> = [];
      for (const group of svg.querySelectorAll("[data-channel]")) {
        const id = group.getAttribute("data-channel")!;
        const regions = [...group.querySelectorAll("path")].filter(
          (p) => p.getAttribute("fill") !== null,
        );
        regions.forEach((path, index) => {
          const geometry = path as unknown as SVGGeometryElement;
          const perimeter = geometry.getTotalLength();
          const SAMPLES = 400;
          let twiceArea = 0;
          for (let k = 0; k < SAMPLES; k += 1) {
            const a = geometry.getPointAtLength((k * perimeter) / SAMPLES);
            const b = geometry.getPointAtLength((((k + 1) % SAMPLES) * perimeter) / SAMPLES);
            twiceArea += a.x * b.y - b.x * a.y;
          }
          const area = Math.abs(twiceArea) / 2;
          const discriminant = perimeter * perimeter - 16 * area;
          out.push({
            id,
            index,
            // A square is the extremal case, where the discriminant is zero;
            // the two small fragments of 26-44 are 13.8 x 12.9 and 16.8 x 13,
            // close enough that rounded corners tip it just negative. There the
            // answer is the square's own side, P / 4.
            width: discriminant > 0 ? (perimeter - Math.sqrt(discriminant)) / 4 : perimeter / 4,
          });
        });
      }
      return out;
    });

    expect(widths.length).toBeGreaterThan(30);
    const wrong = widths
      .filter(({ width }) => !(width >= 12 && width <= 17))
      .map(({ id, index, width }) => `${id}[${index}] is ${width.toFixed(1)} across`);
    expect(wrong, "a gap between tracks has been mapped as a channel").toEqual([]);
  });

  /**
   * Every channel runs unbroken from one of its gates to the other.
   *
   * The width check above catches a gap wrongly taken for a track. This is the
   * other half of the same problem — a real fragment of a track left OUT — and
   * it needs a different measure, because a missing piece leaves a hole rather
   * than a wrong shape. Two ways it shows up:
   *
   *  - the regions never reach a gate. The ONE known break is 34-57 at gate 57,
   *    and it is deliberate: the drawing's mouth there is 20.8 units wide
   *    because it is shared with 20-57, and filled it read as a blob on the
   *    Spleen rather than a channel leaving it, so the client asked for it to
   *    go. Nothing narrower sits behind it, so the corridor stops 75 units
   *    short. Anything else reaching this list is a piece that was missed.
   *  - a fragment sits too far from the rest of its own channel. 26-44 crosses
   *    the three tracks running from the G to the Sacral, and the drawing shows
   *    it between them as two small squares; without them the channel drew with
   *    two holes punched in it.
   *
   * The thresholds are the drawing's own dimensions: an ink line is about 5.5
   * across, so a region that reaches its gate stops within about 8 of the
   * junction, and a fragment separated by ONE crossing track sits about 15 + 11
   * away. Anything beyond is a piece that is not there.
   */
  test("runs every channel unbroken from one gate to the other", async ({ page }) => {
    await generateChart(page);
    const breaks = await page.evaluate(() => {
      const svg = document.querySelector("svg[role='img']")!;
      const dist = (a: DOMPoint, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
      const out: Array<{ id: string; what: string; value: number }> = [];

      for (const group of svg.querySelectorAll("[data-channel]")) {
        const id = group.getAttribute("data-channel")!;
        const regions = [...group.querySelectorAll("path")].filter(
          (p) => p.getAttribute("fill") !== null,
        );
        // De-duplicate: an activated end re-draws its regions inside a clip.
        const seen = new Set<string>();
        const outlines: DOMPoint[][] = [];
        for (const path of regions) {
          const d = path.getAttribute("d")!;
          if (seen.has(d)) continue;
          seen.add(d);
          const geometry = path as unknown as SVGGeometryElement;
          const L = geometry.getTotalLength();
          const pts: DOMPoint[] = [];
          for (let k = 0; k < 300; k += 1) pts.push(geometry.getPointAtLength((k * L) / 300));
          outlines.push(pts);
        }
        if (!outlines.length) continue; // stroked over the artwork, no track of its own

        for (const gate of id.split("-").map(Number)) {
          const marker = svg.querySelector(`[data-gate="${gate}"] text`)!;
          const at = {
            x: Number(marker.getAttribute("x")),
            y: Number(marker.getAttribute("y")),
          };
          // Measure to the CENTRE, not the junction: the marker is inset, so
          // this is a generous bound that still catches a channel that never
          // arrives. A track that reaches its gate lands within ~35.
          const near = Math.min(...outlines.flat().map((q) => dist(q, at)));
          const KNOWN_BREAK = id === "34-57" && gate === 57;
          if (near > 40 && !KNOWN_BREAK) {
            out.push({ id, what: `never reaches gate ${gate}`, value: near });
          }
        }

        for (let i = 0; i < outlines.length; i += 1) {
          let closest = Infinity;
          for (let j = 0; j < outlines.length; j += 1) {
            if (i === j) continue;
            for (const a of outlines[i]!) {
              for (const b of outlines[j]!) closest = Math.min(closest, dist(a, b));
            }
          }
          if (outlines.length > 1 && closest > 30) {
            out.push({ id, what: `fragment ${i} is adrift`, value: closest });
          }
        }
      }
      return out;
    });

    expect(
      breaks.map((b) => `${b.id}: ${b.what} (${b.value.toFixed(1)})`),
      "a channel has a piece of its track missing",
    ).toEqual([]);
  });
});

/**
 * Where the figure is actually PAINTED.
 *
 * The silhouette has holes in it — the gaps between the arms and the body, and
 * the slivers between locks of hair — so "is this gate on the figure" is a
 * question about fill rules that only a browser can answer. The path is mapped
 * back into its own coordinates through the rendered matrices rather than by
 * re-deriving the transform, so the test cannot drift from the drawing.
 */
test.describe("the figure behind the graph", () => {
  async function paintedGates(page: Page): Promise<Record<number, boolean>> {
    await generateChart(page);
    return page.evaluate(() => {
      const svg = document.querySelector("svg[role='img']")! as SVGSVGElement;
      const path = svg.querySelector(
        "[data-figure='silhouette'] path",
      ) as SVGGeometryElement;
      // Exact: compose the path's screen matrix inverse with the root's, so a
      // point in viewBox coordinates lands in the artwork's own space.
      const toLocal = path.getScreenCTM()!.inverse().multiply(svg.getScreenCTM()!);

      const result: Record<number, boolean> = {};
      for (const element of svg.querySelectorAll("[data-gate]")) {
        const label = element.querySelector("text")!;
        const at = new DOMPoint(
          Number(label.getAttribute("x")),
          Number(label.getAttribute("y")),
        ).matrixTransform(toLocal);
        result[Number(element.getAttribute("data-gate"))] = path.isPointInFill(at);
      }
      return result;
    });
  }

  const gatesOf = (centre: string) =>
    GATE_DEFINITIONS.filter((g) => g.center === centre).map((g) => g.gate);

  test("backs the centres down the middle, from the Head to the Sacral", async ({ page }) => {
    const painted = await paintedGates(page);

    for (const centre of ["head", "ajna", "throat", "g"]) {
      const bare = gatesOf(centre).filter((gate) => !painted[gate]);
      expect(bare, `${centre} gates sitting on bare page`).toEqual([]);
    }
  });

  /**
   * The figure is fitted to the width, so it ends at its own base rather than
   * at the foot of the graph. The Root standing clear below it is the intended
   * composition, not an oversight — asserted so a future refit cannot bury it
   * without someone deciding to.
   */
  test("leaves the Root standing clear below the figure", async ({ page }) => {
    const painted = await paintedGates(page);
    const onFigure = gatesOf("root").filter((gate) => painted[gate]);
    expect(onFigure, "Root gates have ended up on the figure").toEqual([]);
  });

  /**
   * The Spleen and Solar Plexus are exact mirrors, so whatever the figure
   * covers on one side it must cover on the other. This catches a figure that
   * has drifted off the axis as well as wings that have.
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
