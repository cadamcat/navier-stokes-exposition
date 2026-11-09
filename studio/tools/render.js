const { DEFAULT_FPS } = require("./frame-rate");
const fs = require("fs");
const path = require("path");
const { launch, openScene, seek, shotAt } = require("./browser");
const { averagePNGs } = require("./png");

function args(argv) {
  const positional = [];
  const opt = { fps: DEFAULT_FPS, every: 1, workers: 3, scale: 1, shutter: 0.5, subframes: 1 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--from") opt.from = Number(argv[++i]);
    else if (a === "--to") opt.to = Number(argv[++i]);
    else if (a === "--fps") opt.fps = Number(argv[++i]);
    else if (a === "--every") opt.every = Number(argv[++i]);
    else if (a === "--scale") opt.scale = Number(argv[++i]);
    else if (a === "--workers") opt.workers = Math.max(1, Math.min(3, Number(argv[++i])));
    else if (a === "--shutter") opt.shutter = Number(argv[++i]);
    else if (a === "--subframes") opt.subframes = Number(argv[++i]);
    else if (a === "--stats") opt.stats = argv[++i];
    else if (a.startsWith("--")) throw new Error("unknown option " + a);
    else positional.push(a);
  }
  if (!(opt.fps > 0 && Number.isFinite(opt.fps))) throw new Error("fps must be positive");
  for (const key of ["every", "workers", "scale", "subframes"]) {
    if (!Number.isInteger(opt[key]) || opt[key] < 1) throw new Error(key + " must be a positive integer");
  }
  if (opt.scale > 2 || opt.subframes > 64) throw new Error("scale must be 1 or 2; subframes must be at most 64");
  if (!(opt.shutter >= 0 && opt.shutter <= 1)) throw new Error("shutter must be between 0 and 1");
  return { positional, opt };
}

function frameList(from, to, fps, every) {
  const i0 = Math.round(from * fps);
  const i1 = Math.round(to * fps);
  const out = [];
  for (let i = i0; i <= i1; i++) {
    if (every > 1 && i % every !== 0) continue;
    out.push(i);
  }
  return out;
}

function pad(i) {
  return String(i).padStart(5, "0");
}

function sampleTimes(i, fps, shutter, subframes, duration) {
  const t = i / fps;
  if (subframes === 1 || shutter === 0) return [t];
  // Equal-weight midpoint quadrature across a centred exposure. Clamp to the
  // scene, not a cropped render range, so re-rendering one frame agrees with a film.
  return Array.from({ length: subframes }, function (_, k) {
    return Math.max(0, Math.min(duration, t + ((k + 0.5) / subframes - 0.5) * shutter / fps));
  });
}

async function renderFrame(page, i, opt, duration) {
  const samples = [];
  for (const t of sampleTimes(i, opt.fps, opt.shutter, opt.subframes, duration)) {
    await seek(page, t);
    samples.push(await page.screenshot(shotAt(opt.scale)));
  }
  const result = averagePNGs(samples);
  return { ...result, samples: samples.length };
}

async function renderGroup(page, frames, opt, outDir, duration) {
  const stats = { samples: 0, averagedFrames: 0, identicalFrames: 0 };
  for (let k = 0; k < frames.length; k++) {
    const i = frames[k];
    const result = await renderFrame(page, i, opt, duration);
    fs.writeFileSync(path.join(outDir, "f" + pad(i) + ".png"), result.buffer);
    stats.samples += result.samples;
    if (result.samples > 1) stats[result.identical ? "identicalFrames" : "averagedFrames"]++;
  }
  return stats;
}

async function main() {
  const { positional, opt } = args(process.argv.slice(2));
  if (positional.length < 3) {
    console.error("usage: node tools/render.js <scene.html> <beats.json> <outDir> [--from s --to s --fps 60 --every n --scale 1|2 --workers 1|2|3 --shutter 0.5 --subframes 1 --stats file.json]");
    process.exit(2);
  }
  const scene = positional[0];
  const beats = JSON.parse(fs.readFileSync(positional[1], "utf8"));
  const outDir = positional[2];
  fs.mkdirSync(outDir, { recursive: true });

  const t0 = process.hrtime.bigint();
  const browser = await launch(opt.scale);
  try {
    const probe = await openScene(browser, scene, beats, opt.scale);
    const sceneDuration = await probe.evaluate(function () { return window.sceneDuration; });
    await probe.close();
    const from = opt.from == null ? 0 : opt.from;
    const to = opt.to == null ? Number(sceneDuration) : opt.to;
    if (![from, to, Number(sceneDuration)].every(Number.isFinite) || from < 0 || to < from || to > Number(sceneDuration)) {
      throw new Error("render range must lie within the finite scene duration");
    }
    const frames = frameList(from, to, opt.fps, opt.every);
    const workers = Math.min(opt.workers, Math.max(1, frames.length));
    const groups = [];
    for (let w = 0; w < workers; w++) groups.push([]);
    frames.forEach(function (frame, i) { groups[i % workers].push(frame); });
    const pages = [];
    for (let w = 0; w < workers; w++) pages.push(await openScene(browser, scene, beats, opt.scale));
    const renderStart = process.hrtime.bigint();
    const groupsStats = await Promise.all(pages.map(function (page, w) {
      return renderGroup(page, groups[w], opt, outDir, Number(sceneDuration));
    }));
    const renderSeconds = Number(process.hrtime.bigint() - renderStart) / 1e9;
    const sec = Number(process.hrtime.bigint() - t0) / 1e9;
    const rate = frames.length / Math.max(sec, 1e-6);
    console.log(frames.length + " frames in " + sec.toFixed(2) + "s (" + rate.toFixed(2) + " fps)");
    const stats = { frames: frames.length, fps: opt.fps, scale: opt.scale, workers, shutter: opt.shutter,
      subframes: opt.subframes, renderSeconds, totalSeconds: sec,
      msPerFrame: renderSeconds * 1000 / frames.length, samples: 0, averagedFrames: 0, identicalFrames: 0 };
    for (const group of groupsStats) for (const key of ["samples", "averagedFrames", "identicalFrames"]) stats[key] += group[key];
    console.log(stats.msPerFrame.toFixed(2) + " ms/output frame; " + stats.averagedFrames + " averaged, " + stats.identicalFrames + " identical");
    if (opt.stats) fs.writeFileSync(opt.stats, JSON.stringify(stats, null, 2) + "\n");
  } finally {
    await browser.close();
  }
}

if (require.main === module) main().catch(function (err) {
  console.error(err);
  process.exit(1);
});

module.exports = { args, frameList, sampleTimes, renderFrame };
