#!/usr/bin/env node
/* Check a chapter's title card on every frame of its opening: it must lie inside the picture and must not depend
   on the frames rendered before it. The scene checks sample beats only, so they do not see the opening.

   Usage (from film/scenes): node ../tools/check_titles.js c2 c3 ...   Exit status 0 when all pass, 1 otherwise.
   The opening is walked in the orders a render can use: every frame, every third frame (as each of the three parallel render pages does), and
   each frame reached from the start and from the end of the chapter. The named failing case is
   tools/test_check_titles.js. */
const fs = require("fs");
const path = require("path");
const { launch, openScene } = require(path.resolve("tools/browser"));

const FPS = 60;
const MARGIN = 40;      // the box stays this far from the left and right edges of the picture
const SAME = 0.25;      // pixels: boxes of one frame reached in different orders must agree

async function chapter(browser, ch) {
  const beats = JSON.parse(fs.readFileSync(ch + "/beats.json", "utf8"));
  const page = await openScene(browser, ch + "/scene.html", beats, 1);
  const found = await page.evaluate(function () { return !!document.querySelector('[data-box="chapter"]'); });
  if (!found) {
    await page.close();
    console.log("PASS " + ch + " has no title card");
    return 0;
  }
  const n = Math.ceil(2.3 * FPS);
  const rows = await page.evaluate(function (a) {
    const label = document.querySelector('[data-box="chapter"]');
    const card = document.querySelector('[data-box="title-card"]');
    const end = window.sceneDuration;
    function box() {
      // while the title card shows, the card's title is the box; afterwards the small chapter label
      const showing = card && card.closest(".title-cover").style.display !== "none";
      const el = showing ? card : label;
      const r = el.getBoundingClientRect();
      return [r.left, r.top, r.right, r.bottom, parseFloat(getComputedStyle(el).opacity)];
    }
    function at(t, before) {
      before.forEach(function (x) { window.setTime(x); });
      window.setTime(t);
      return box();
    }
    const out = [];
    for (let i = 0; i <= a.n; i++) {
      const t = i / a.fps;
      out.push({
        t: t,
        boxes: {
          "every frame": at(t, [Math.max(0, t - 1 / a.fps)]),
          "every third frame": at(t, [Math.max(0, t - 3 / a.fps)]),
          "from the start": at(t, [0]),
          "from the end": at(t, [end]),
        },
      });
    }
    return out;
  }, { n: n, fps: FPS });
  await page.close();
  let bad = 0;
  rows.forEach(function (row) {
    const names = Object.keys(row.boxes);
    const first = row.boxes[names[0]];
    names.forEach(function (name) {
      const b = row.boxes[name];
      const stamp = ch + " t=" + row.t.toFixed(3) + " (" + name + ")";
      if (b[4] > 0.02 && (b[0] < MARGIN || b[2] > 1920 - MARGIN || b[1] < 0 || b[3] > 1080)) {
        bad++;
        console.log("FAIL " + stamp + " title box outside the picture: x " + b[0].toFixed(1) + " to " + b[2].toFixed(1) + ", y " + b[1].toFixed(1) + " to " + b[3].toFixed(1));
      }
      for (let i = 0; i < 4; i++) {
        if (Math.abs(b[i] - first[i]) > SAME) {
          bad++;
          console.log("FAIL " + stamp + " title box depends on the frame before: " + Math.abs(b[i] - first[i]).toFixed(1) + " px");
          break;
        }
      }
    });
  });
  if (!bad) {
    const big = rows.reduce(function (m, r) { const b = r.boxes["every frame"]; return b[2] - b[0] > m[2] - m[0] ? b : m; }, [0, 0, 0, 0]);
    console.log("PASS " + ch + " title card inside the picture on " + rows.length + " frames, in 4 orders; largest box x " + big[0].toFixed(0) + " to " + big[2].toFixed(0));
  }
  return bad;
}

async function main() {
  const chapters = process.argv.slice(2);
  if (!chapters.length) { console.error("usage: node ../tools/check_titles.js c2 c3 ..."); process.exit(2); }
  const browser = await launch(1);
  let bad = 0;
  try {
    for (const ch of chapters) bad += await chapter(browser, ch);
  } finally {
    await browser.close();
  }
  console.log(bad ? bad + " failures" : "title cards: all pass");
  process.exit(bad ? 1 : 0);
}

main().catch(function (e) { console.error(e); process.exit(2); });
