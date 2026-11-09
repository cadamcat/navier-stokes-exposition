// Text margins, text size, text-on-text overlap, and geometry inside the viewBox.
// Usage: node figures/check_layout.js <modules directory>
const path = require("path");
const fs = require("fs");
const nm = path.resolve(process.argv[2]);
const { chromium } = require(path.join(nm, "playwright"));
const dir = __dirname;
const f = (p) => JSON.stringify(require("url").pathToFileURL(path.join(nm, p)).href);
const css = `
@font-face{font-family:"Source Sans 3";font-weight:400;src:url(${f("@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff2")})}
@font-face{font-family:"Source Sans 3";font-weight:400;src:url(${f("@fontsource/source-sans-3/files/source-sans-3-latin-ext-400-normal.woff2")});unicode-range:U+0100-02AF,U+1E00-1EFF,U+2000-206F}
@font-face{font-family:"Source Sans 3";font-weight:400;src:url(${f("@fontsource/source-sans-3/files/source-sans-3-greek-400-normal.woff2")});unicode-range:U+0370-03FF}
@font-face{font-family:"Source Sans 3";font-weight:600;src:url(${f("@fontsource/source-sans-3/files/source-sans-3-latin-600-normal.woff2")})}
@font-face{font-family:"Source Sans 3";font-weight:600;src:url(${f("@fontsource/source-sans-3/files/source-sans-3-greek-600-normal.woff2")});unicode-range:U+0370-03FF}
@font-face{font-family:"KaTeX_Math";font-style:italic;src:url(${f("katex/dist/fonts/KaTeX_Math-Italic.woff2")})}
@font-face{font-family:"KaTeX_Math";font-style:normal;src:url(${f("katex/dist/fonts/KaTeX_Main-Regular.woff2")})}
@font-face{font-family:"KaTeX_Caligraphic";src:url(${f("katex/dist/fonts/KaTeX_Caligraphic-Regular.woff2")})}
@font-face{font-family:"JetBrains Mono";src:url(${f("@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2")})}
html,body{margin:0}svg{display:block}`;
function area(a, b) {
  const x = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return x * y;
}
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const svgs = fs.readdirSync(dir).filter((n) => n.endsWith(".svg")).sort();
  let fail = 0;
  for (const name of svgs) {
    const src = fs.readFileSync(path.join(dir, name), "utf8");
    const w = +src.match(/width="(\d+)"/)[1], h = +src.match(/height="(\d+)"/)[1];
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${src}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const boxes = await page.evaluate(() => [...document.querySelectorAll("text")].map((el) => {
      const b = el.getBBox();
      return { t: el.textContent.replace(/\s+/g, " ").trim(), x: b.x, y: b.y, w: b.width, h: b.height };
    }));
    const margin = 8;
    boxes.forEach((b) => {
      if (b.x < margin || b.y < margin || b.x + b.w > w - margin || b.y + b.h > h - margin) {
        console.log("FAIL margin", name, JSON.stringify(b.t), b.x.toFixed(1), b.y.toFixed(1), (b.x + b.w).toFixed(1), (b.y + b.h).toFixed(1));
        fail++;
      }
    });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const overlap = area(boxes[i], boxes[j]);
        if (overlap > 8) {
          console.log("FAIL overlap", name, overlap.toFixed(0), JSON.stringify(boxes[i].t), JSON.stringify(boxes[j].t));
          fail++;
        }
      }
    }
    const small = await page.evaluate(() => [...document.querySelectorAll("text")].filter((el) => {
      const s = parseFloat(el.getAttribute("font-size"));
      return !(s >= 20);
    }).length);
    if (small) { console.log("FAIL size", name, small); fail++; }
    const outside = await page.evaluate(({ W, H }) => {
      const tags = ["rect", "line", "path", "circle", "polyline", "polygon", "image", "ellipse"];
      const bad = [];
      for (const tag of tags) {
        for (const el of document.querySelectorAll(tag)) {
          const b = el.getBBox();
          const sw = parseFloat(el.getAttribute("stroke-width") || "0") || 0;
          const pad = sw / 2;
          const x0 = b.x - pad, y0 = b.y - pad, x1 = b.x + b.width + pad, y1 = b.y + b.height + pad;
          if (x0 < -0.6 || y0 < -0.6 || x1 > W + 0.6 || y1 > H + 0.6) {
            bad.push(tag + " " + [x0, y0, x1, y1].map((v) => v.toFixed(1)).join(","));
          }
        }
      }
      return bad;
    }, { W: w, H: h });
    if (outside.length) {
      console.log("FAIL outside", name, outside.slice(0, 8).join(" | "));
      fail += outside.length;
    }
    console.log("PASS file", name, boxes.length, "texts");
  }
  await browser.close();
  if (fail) {
    console.log("FAIL total", fail);
    process.exit(1);
  }
  console.log("PASS layout");
})();
