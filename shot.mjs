import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("file:///home/user/Inclarity-hd-chart/dist/inclarity-chart.html");
await page.evaluate(() => document.fonts.ready);
const info = await page.evaluate(() => {
  const b = document.querySelector("button[type=submit]");
  const cs = getComputedStyle(b);
  return { cls: b.className, bg: cs.backgroundColor, color: cs.color, weight: cs.fontWeight, family: cs.fontFamily };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
