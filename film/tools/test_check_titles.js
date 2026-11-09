#!/usr/bin/env node
/* Named failing case for check_titles.js: "title measured from its transformed box".
   Usage (from film/scenes): node ../tools/test_check_titles.js SCRATCH_DIR
   In a scratch copy of chapter 10 the wrapper ns/title.js is taken out of scene.html, so the title uses the plain
   label, which measures the box on screen (already scaled by the frame before) and drifts off the left edge of the
   picture. The check must fail on that copy and pass on the unchanged one. Exit status 0 when both hold. */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const scratch = path.resolve(process.argv[2] || "");
if (!process.argv[2]) { console.error("usage: node ../tools/test_check_titles.js SCRATCH_DIR"); process.exit(2); }
const scenes = process.cwd();
const check = path.join(__dirname, "check_titles.js");

function tree(name, strip) {
  const root = path.join(scratch, name);
  fs.mkdirSync(path.join(root, "c10"), { recursive: true });
  ["lib", "tools", "node_modules", "jx", "ns", "three3d"].forEach(function (d) {
    const link = path.join(root, d);
    if (!fs.existsSync(link)) fs.symlinkSync(path.join(scenes, d), link);
  });
  ["scene.js", "beats.json"].forEach(function (f) { fs.copyFileSync(path.join(scenes, "c10", f), path.join(root, "c10", f)); });
  let html = fs.readFileSync(path.join(scenes, "c10", "scene.html"), "utf8");
  if (strip) html = html.replace('<script src="../ns/title.js"></script>\n', "");
  fs.writeFileSync(path.join(root, "c10", "scene.html"), html);
  return spawnSync("node", [check, "c10"], { cwd: root, encoding: "utf8", env: process.env });
}

const broken = tree("broken", true);
const fixed = tree("fixed", false);
const brokenFails = broken.status === 1 && /FAIL c10 .*outside the picture/.test(broken.stdout);
const fixedPasses = fixed.status === 0;
console.log("plain label, measured from the transformed box: exit " + broken.status + (brokenFails ? " (caught)" : " (NOT CAUGHT)"));
console.log((broken.stdout.split("\n").find(function (l) { return /outside the picture/.test(l); }) || "").trim());
console.log("wrapped label: exit " + fixed.status + (fixedPasses ? " (passes)" : " (FAILS)"));
if (!fixedPasses) console.log(fixed.stdout.split("\n").slice(0, 5).join("\n"));
process.exit(brokenFails && fixedPasses ? 0 : 1);
