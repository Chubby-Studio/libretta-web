// Renders the social preview of every language into public/assets/og/<code>.png at 1200x630,
// with the lede of src/i18n/<code>.json. English is also copied to public/assets/og.png.
// Needs Playwright with Chromium. Run from the repository root: node tools/og.mjs
// Scripts other than Latin use the system fonts; OG_FONTS can list extra stylesheets, comma separated.
import { createRequire } from "node:module";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const root = resolve(".");
const assets = pathToFileURL(join(root, "public/assets")).href;
const out = join(root, "public/assets/og");
mkdirSync(out, { recursive: true });

const rtl = new Set(["ar", "he"]);
const families = {
  ja: '"Hiragino Sans", "Noto Sans JP"',
  ko: '"Apple SD Gothic Neo", "Noto Sans KR"',
  "zh-hans": '"PingFang SC", "Noto Sans SC"',
  "zh-hant": '"PingFang TC", "Noto Sans TC"',
  "zh-hk": '"PingFang HK", "Noto Sans TC"',
  ar: '"SF Arabic", "Geeza Pro", "Noto Sans Arabic"',
  he: '"SF Hebrew", "Noto Sans Hebrew"',
  th: '"Thonburi", "Noto Sans Thai"',
  hi: '"Kohinoor Devanagari", "Noto Sans Devanagari"',
};
const extra = (process.env.OG_FONTS ?? "").split(",").filter(Boolean).map((css) => `<link rel="stylesheet" href="${pathToFileURL(resolve(css)).href}">`).join("\n");

function page(code, lede) {
  // Long ledes and scripts with tall marks get a smaller size and more leading, so nothing collides.
  const long = lede.replace(/<[^>]+>/g, "").length > 120;
  const tall = ["ar", "he", "hi", "th"].includes(code);
  const latin = !families[code] && !["el", "bg", "ru", "uk", "vi"].includes(code);
  const family = `${latin ? '"Instrument Sans", ' : ""}${families[code] ?? ""}${families[code] ? ", " : ""}-apple-system, "Noto Sans", sans-serif`;
  return `<!doctype html>
<html lang="${code}" dir="${rtl.has(code) ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8">
${extra}
<style>
  @font-face { font-family: "Instrument Sans"; font-weight: 400 700; font-stretch: 75% 100%; src: url("${assets}/instrument-sans-latin.woff2") format("woff2"); }
  @font-face { font-family: "Instrument Sans"; font-weight: 400 700; font-stretch: 75% 100%; src: url("${assets}/instrument-sans-latin-ext.woff2") format("woff2"); unicode-range: U+0100-02BA, U+1E00-1E9F; }
  body { font-family: ${family}; -webkit-font-smoothing: antialiased; }
  html, body { margin: 0; width: 1200px; height: 630px; background: #FFFFFF; color-scheme: light; }
  .card { box-sizing: border-box; width: 1200px; height: 630px; padding: 80px 96px 88px; display: flex; flex-direction: column; justify-content: space-between; }
  .top { display: flex; align-items: center; justify-content: space-between; }
  .icon { width: 112px; height: 112px; }
  .url { font-family: "Instrument Sans", sans-serif; font-stretch: 75%; font-weight: 500; font-size: 26px; letter-spacing: 0.04em; color: #6B6B70; }
  .wm { width: 440px; height: auto; display: block; margin-bottom: 44px; }
  p { margin: 0; font-size: 38px; line-height: 1.32; color: #3A3A3C; max-width: 960px; }
  strong { color: #0A0A0A; font-weight: 600; }
  p { font-size: ${long ? 33 : 38}px; line-height: ${tall ? 1.6 : 1.32}; }
  mark { background: color(display-p3 1 0.302 0); color: #0A0A0A; padding: 0 0.12em; }
</style>
</head>
<body>
  <div class="card">
    <div class="top">
      <img class="icon" src="${assets}/icon-512.png" alt="">
      <span class="url">LIBRETTA.APP</span>
    </div>
    <div>
      <img class="wm" src="${assets}/wordmark.svg" alt="Libretta">
      <p>${lede}</p>
    </div>
  </div>
</body>
</html>`;
}

const work = mkdtempSync(join(tmpdir(), "og-"));
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const tab = await context.newPage();
for (const file of readdirSync(join(root, "src/i18n")).filter((f) => f.endsWith(".json")).sort()) {
  const code = file.replace(".json", "");
  const { home_lede } = JSON.parse(readFileSync(join(root, "src/i18n", file), "utf8"));
  const html = join(work, `${code}.html`);
  writeFileSync(html, page(code, home_lede));
  await tab.goto(pathToFileURL(html).href);
  await tab.evaluate(() => document.fonts.ready);
  await tab.waitForTimeout(300);
  await tab.screenshot({ path: join(out, `${code}.png`) });
  console.log(code);
}
await browser.close();
copyFileSync(join(out, "en.png"), join(root, "public/assets/og.png"));
