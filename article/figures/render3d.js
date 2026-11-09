// Renders the core picture to figures/3d/fig2-core.png and writes figures/3d/fig2-core-anchors.json.
// Usage: node figures/render3d.js <modules directory>
const path = require("path");
const fs = require("fs");
const nm = path.resolve(process.argv[2]);
const { chromium } = require(path.join(nm, "playwright"));
const FIGS = { "fig2-core": [730, 820] };
(async () => {
  const browser = await chromium.launch({ args: ["--allow-file-access-from-files", "--font-render-hinting=none"] });
  for (const [name, [w, h]] of Object.entries(FIGS)) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e)));
    page.on("console", (msg) => { if (msg.type() === "error") errs.push(msg.text()); });
    await page.goto(require("url").pathToFileURL(path.resolve(__dirname, "fig3d.html")).href + "?fig=" + name + "&w=" + w + "&h=" + h);
    await page.waitForFunction(() => window.figDone === true, null, { timeout: 60000 });
    if (errs.length) throw new Error(errs.join("\n"));
    const anchors = await page.evaluate(() => window.figAnchors);
    fs.mkdirSync(path.join(__dirname, "3d"), { recursive: true });
    fs.writeFileSync(path.join(__dirname, "3d", name + "-anchors.json"), JSON.stringify(anchors, null, 2) + "\n");
    await page.screenshot({ path: path.join(__dirname, "3d", name + ".png"), omitBackground: false, scale: "device" });
    console.log("3d figure", name, w, h);
    await page.close();
  }
  await browser.close();
})();
