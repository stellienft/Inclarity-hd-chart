import { chromium } from "playwright";
const SP = process.env.SP;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1400, height: 1400 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:3211/");
await page.fill("#name", "Example");
await page.fill("#date", "1990-03-01");
await page.fill("#time", "14:32");
await page.getByRole("combobox").fill("Brisbane");
await page.getByRole("option").first().click();
await page.getByRole("button", { name: /generate my chart/i }).click();
await page.getByTestId("design-column").waitFor({ timeout: 30000 });
await page.waitForTimeout(900);
const svg = await page.locator("svg[role='img']").boundingBox();
await page.screenshot({
  path: `${SP}/colours.png`,
  clip: { x: 0, y: Math.max(0, svg.y - 40), width: 1400, height: Math.min(2600, svg.height + 80) },
});
await browser.close();
