/* Energy, weak solutions and continuation criteria. All diagrams are functions of time. */
installBeats(window.__BEATS__);
const INTRO = need("c4b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word");
const DRAW = need("c4b1", "total", 0.45, "wide profile draws");
const MORPH = need("c4b1", "total", 1.0, "narrow profile grows through the family");
const CLEAR = need("c4b1", "peak", 0.7, "energy picture clears");
const OUT = need("c4b5", "tail", 0.8, "picture fades out");
const { powerOut, powerIn, sineInOut, swap, mix, op } = KIT;
const chapter = chapterLabel({ n: 4, title: "What was known", intro: 2.0 });
const content = KIT.layer();
const strip = mountStripJX(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);
const B = n => beatStart("c4b" + n);
const C = (n, w) => cue("c4b" + n, w);
const END = beatHoldEnd("c4b5");
const tTotal = C(1, "total"), tMorph = tTotal + DRAW, morphRun = MORPH * 0.8;
const tAvg = C(2, "averaged"), tFK = C(3, "Fujita"), tCKN = C(3, "Caffarelli");
const tSing = C(3, "singular"), tPoint = C(3, "point");
const tBKM = C(4, "vorticity"), tESS = C(4, "L");
const tTao = B(5), tChen = C(5, "Chen"), tComputer = C(5, "computer");
const tWall = C(5, "cylinder's"), tNeither = C(5, "Neither");

function layer() { const el = KIT.layer(content); return { el, svg: KIT.overlay(el) }; }
function line(svg, x1, y1, x2, y2, token = "--ink-muted", width = 2) {
  return KIT.svgEl(svg, "line", { x1, y1, x2, y2, stroke: "var(" + token + ")", "stroke-width": width });
}
function path(svg, token = "--velocity", width = 3.5, dashed = false) {
  return KIT.svgEl(svg, "path", { fill: "none", stroke: "var(" + token + ")", "stroke-width": width,
    "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": dashed ? "9 8" : "none" });
}
function txt(parent, id, words, x, y, kind = "aux", w) { return KIT.text(parent, id, words, { x, y, kind, w }); }
function formula(parent, id, tex, y = 126) { return KIT.formula(parent, id, tex, { x: 1256, y, w: 544, h: 130 }); }
const ledger = [];
function entry(id, words, y, at, next, group, strong = false) {
  const el = txt(content, id, words, 1256, y, strong ? "strong" : "aux", 544);
  ledger.push({el, at, next, group}); return el;
}
const historyK = t => t >= B(2) && t < B(4) ? 1 : 0;
const criteriaK = t => t >= B(4) && t < B(5) ? 1 : 0;
const nearbyK = t => t >= B(5) ? 1 : 0;
function sample(fn, x0, x1, n = 320) {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const p = fn(x0 + (x1 - x0) * i / n);
    d += (i ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2);
  }
  return d;
}

/* The profile's square integral is independent of sigma. Ordinary profile area is not energy. */
const energy = layer();
const ec = KIT.chart(energy.el, energy.svg, { box: "profiles", x: 180, y: 180, w: 980, h: 480,
  xr: [-3.4, 3.4], yr: [0, 3], yAxis: false });
const fills = [0, 1].map(() => KIT.svgEl(energy.svg, "path", { fill: "var(--velocity)", opacity: 0.06 }));
const wide = path(energy.svg, "--velocity", 2, true), narrow = path(energy.svg);
function profile(sigma) {
  return sample(x => [ec.X(x), ec.Y((48 / Math.sqrt(sigma)) * Math.exp(-x * x / (sigma * sigma)) / 48)], -3.4, 3.4, 720);
}
wide.setAttribute("d", profile(1));
const baseFill = d => d + "L" + ec.X(3.4) + " " + ec.Y(0) + "L" + ec.X(-3.4) + " " + ec.Y(0) + "Z";
fills[0].setAttribute("d", baseFill(profile(1)));
const peakOne = txt(energy.el, "peak-one", "$1$", 716, ec.Y(1) - 34);
const peakNow = txt(energy.el, "peak-now", "$1$", 716, ec.Y(1) - 34);
const profileNote = KIT.note(energy.el, "profile-note", "1D illustration; identity: smooth $u,p$, spatially compact or periodic");
const same = txt(energy.el, "same-energy", "same energy · peak $\\times 3$", 180, 710, "label");
const eqE = formula(energy.el, "energy-law", "\\begin{aligned} E(t)&=\\tfrac12\\!\\int |u|^2\\,dx \\end{aligned}", 150);
const eqD = formula(energy.el, "energy-decay", "\\begin{aligned}\\frac{dE}{dt}&=-\\nu\\!\\int |\\nabla u|^2\\,dx\\\\&\\leq 0\\end{aligned}", 320);
const unforced = txt(energy.el, "energy-unforced", "$f = 0$", 1256, 104);

/* Weak formulation: the test field carries the derivative. */
const weak = layer();
const wc = KIT.chart(weak.el, weak.svg, { box: "weak-chart", x: 180, y: 290, w: 980, h: 400,
  xr: [0, 1], yr: [-1.4, 1.4], y0: 0, yAxis: false });
const rough = wc.curve({ token: "--velocity", from: 0, to: 1,
  fn: x => 0.6 * Math.sin(16 * x) + 0.15 * Math.sin(105 * x) });
const test = wc.curve({ token: "--viscosity", dashed: true, from: 0, to: 1,
  fn: x => 1.15 * Math.exp(-Math.pow((x - 0.52) * 5, 2)) });
entry("leray", "Leray · 1934", 100, C(2, "Leray"), C(2, "Hopf"), historyK, true);
entry("hopf", "Hopf · 1950", 142, C(2, "Hopf"), tFK, historyK, true);
entry("weak-result", "global weak solutions", 188, C(2, "global"), tFK, historyK);
entry("energy-inequality", "energy inequality", 226, C(2, "solutions"), tFK, historyK);
entry("weak-averaged", "averaged formulation", 264, tAvg, tFK, historyK);
entry("weak-smoothness", "need not be smooth", 302, C(2, "need"), tFK, historyK);
const weakEq = KIT.formula(weak.el, "weak-integrand", "\\int u_i u_j\\,\\partial_j\\phi_i\\,dx\\,dt", {x: 180, y: 122, w: 980, h: 100});
const weakNote = txt(weak.el, "weak-test-note", "derivatives on smooth test fields", 500, 234, "label");
const weakSchem = txt(weak.el, "weak-schematic", "schematic", 180, 724);

/* Small data and the possible singular set have separate pictures. */
const small = layer();
const sc = KIT.chart(small.el, small.svg, { box: "small-chart", x: 180, y: 280, w: 980, h: 400,
  xr: [-3, 3], yr: [0, 1], yAxis: false });
let smallStage = 0;
const initial = sc.curve({ token: "--velocity", dashed: true, from: -3, to: 3, fn: x => 0.9 * Math.exp(-x * x * 2) });
const diffused = sc.curve({ token: "--velocity", from: -3, to: 3,
  fn: x => (0.9 / (1 + smallStage)) * Math.exp(-x * x * 2 / Math.pow(1 + smallStage, 2)) });
entry("fujita-kato", "Fujita–Kato · 1964", 382, tFK, tCKN, historyK, true);
entry("small-unforced", "$f=0$; small critical norm", 430, C(3, "small"), tCKN, historyK);
entry("small-viscosity", "relative to $\\nu$", 470, C(3, "relative"), tCKN, historyK);
entry("small-result", "smooth forever", 510, C(3, "viscosity"), tCKN, historyK);
const smallSchem = txt(small.el, "small-schematic", "schematic", 180, 724);

const singular = layer();
KIT.svgEl(singular.svg, "rect", { x: 400, y: 220, width: 520, height: 520,
  fill: "var(--paper-raised)", stroke: "var(--ink-muted)", "stroke-width": 2 });
const singularDot = KIT.svgEl(singular.svg, "circle", { cx: 660, cy: 480, r: 7, fill: "var(--force)" });
const space = txt(singular.el, "space", "space", 838, 746);
const time = txt(singular.el, "time", "time", 324, 230);
const pointCaption = txt(singular.el, "point-caption", "a single point: not excluded", 400, 182, "label");
entry("caffarelli-kohn-nirenberg", "Caffarelli–Kohn–\nNirenberg · 1982", 592, tCKN, B(4), historyK, true);
entry("suitable-unforced", "unforced suitable weak solutions", 678, tCKN, B(4), historyK);
entry("partial-regularity", "partial regularity", 722, tSing, B(4), historyK);
entry("measure-result", "$\\mathcal P^1(S)=0$", 766, tSing, B(4), historyK);
const singularName = txt(singular.el, "singular-name", "singular set $S$", 940, 450, "label");
const measureName = txt(singular.el, "measure-name", "one-dimensional parabolic\nHausdorff measure", 400, 100, "label");
const cknSchem = txt(singular.el, "ckn-schematic", "schematic", 1010, 716);

/* Schematic traces accompany exact continuation criteria. */
const criteria = layer();
const cc = KIT.chart(criteria.el, criteria.svg, { box: "criteria-chart", x: 180, y: 290, w: 980, h: 400,
  xr: [0, 1.1], yr: [0, 4.5], xTicks: [{ v: 1, text: "T", tex: true }], yAxis: false });
const growing = cc.curve({ token: "--stress", from: 0, to: 0.985, clipTop: 4.5, fn: x => 0.24 / (1 - x) - 0.24 });
const bounded = cc.curve({ token: "--velocity", from: 0, to: 1, fn: x => 2.2 + 1.6 * Math.sin(8 * x) * Math.sin(Math.PI * x) });
const tip = txt(criteria.el, "criterion-infinity", "$\\to\\infty$", cc.X(0.947) + 12, 266, "label");
const traceDot = KIT.svgEl(criteria.svg, "circle", { r: 7, fill: "var(--stress)" });
const criteriaSchem = txt(criteria.el, "criteria-schematic", "schematic", 180, 736);
entry("beale-kato-majda", "Beale–Kato–Majda · 1984", 100, B(4), tESS, criteriaK, true);
entry("bkm-equation", "Euler, $f=0$", 152, B(4), tESS, criteriaK);
entry("bkm-class", "$\\mathbb R^3$, $H^s$ class; integer $s\\geq3$", 194, B(4), tESS, criteriaK);
entry("bkm-trigger", "breakdown at $T$", 252, tBKM, tESS, criteriaK);
entry("escauriaza-seregin-sverak", "Escauriaza–Seregin–\nŠverák · 2003", 518, tESS, B(5), criteriaK, true);
entry("ess-equation", "Navier–Stokes on $\\mathbb R^3$, $f=0$", 612, tESS, B(5), criteriaK);
entry("ess-class", "Leray–Hopf", 656, tESS, B(5), criteriaK);
const bkmEq = formula(criteria.el, "bkm-integral", "\\begin{gathered}\\Longrightarrow\\;\\int_0^T\\!\\|\\omega\\|_{L^\\infty}\\,dt\\\\=\\infty\\end{gathered}", 310);
const essEq = formula(criteria.el, "ess-criterion", "\\begin{gathered}\\|u\\|_{L^\\infty_t L^3_x}<\\infty\\\\\\Longrightarrow\\;\\text{regular}\\end{gathered}", 706);

/* An averaged cascade, then a meridional section at the cylinder wall. */
const nearby = layer();
const cascade = KIT.svgEl(nearby.svg, "g", {});
const cascadePaths = [];
for (let i = 0; i < 15; i++) {
  const off = (i - 7) / 7;
  const p = path(cascade, "--velocity", i % 3 === 0 ? 3.5 : 2);
  p.setAttribute("opacity", i % 3 === 0 ? 0.65 : 0.24);
  p.setAttribute("d", sample(x => [200 + x * 920, 480 + off * (200 * Math.pow(1 - x, 1.3) + 12) + Math.sin(x * 15 + off) * 18 * (1 - x)], 0, 1));
  cascadePaths.push(p);
}
const cascadeDot = KIT.svgEl(cascade, "circle", { r: 7, fill: "var(--force)" });
entry("tao", "Tao · 2016", 100, C(5, "Tao"), tChen, nearbyK, true);
entry("averaged-equation", "averaged equation", 150, C(5, "averaged"), tChen, nearbyK);
entry("averaged-blowup", "blowup", 194, C(5, "blowup"), tChen, nearbyK);
entry("keeps-energy", "energy identity kept", 238, C(5, "identity"), tChen, nearbyK);
const nearbySchem = txt(nearby.el, "nearby-schematic", "schematic", 180, 736);
const section = KIT.svgEl(nearby.svg, "g", {});
line(section, 340, 260, 1000, 260, "--rule");
line(section, 340, 700, 1000, 700, "--rule");
line(section, 1000, 260, 1000, 700, "--ink-muted");
const sectionPaths = [];
for (let i = 0; i < 13; i++) {
  const p = path(section, "--velocity", i % 3 === 0 ? 3.5 : 2);
  p.setAttribute("opacity", i % 3 === 0 ? 0.65 : 0.23);
  p.setAttribute("d", sample(s => [380 + s * 590, 300 + i * 29 + 18 * Math.sin(s * Math.PI * 2) * Math.sin(s * Math.PI)], 0, 1));
  sectionPaths.push(p);
}
const wallPoint = KIT.svgEl(section, "circle", { cx: 1000, cy: 480, r: 8, fill: "var(--force)" });
const wallName = txt(nearby.el, "wall-label", "cylinder wall", 1016, 453, "aux");
const sectionNote = txt(nearby.el, "section-note", "section · schematic", 340, 736);
entry("chen-hou", "Chen–Hou · 2025", 366, tChen, tNeither, nearbyK, true);
entry("computations", "after Luo–Hou computations, 2014", 418, tComputer, tNeither, nearbyK);
entry("computer-assistance", "computer-assisted blowup", 462, tComputer, tNeither, nearbyK);
entry("euler-no-viscosity", "Euler: no viscosity", 506, C(5, "Euler"), tNeither, nearbyK);
entry("cylinder-wall", "at a cylinder’s wall", 550, tWall, tNeither, nearbyK);
entry("neither", "not Navier–Stokes with\n$\\nu>0$ in $\\mathbb R^3$ or $\\mathbb T^3$", 702, tNeither, END, nearbyK, true);

/* Dates retain their positions while the theorem entries accumulate beside the pictures. */
const timeline = layer();
line(timeline.svg, 180, 820, 1160, 820);
const yearX = y => 180 + (y - 1930) / 100 * 980;
for (let y = 1930; y <= 2030; y += 10) line(timeline.svg, yearX(y), 820, yearX(y), 813, "--rule");
const specs = [
  {year: 1934, text: "1934 / 1950", x: 180, y: 778, on: C(2, "Leray"), group: historyK},
  {year: 1964, text: "1964", x: 476, y: 778, on: tFK, group: historyK},
  {year: 1982, text: "1982", x: 656, y: 778, on: tCKN, group: historyK},
  {year: 1984, text: "1984", x: 678, y: 778, on: B(4), group: criteriaK},
  {year: 2003, text: "2003", x: 864, y: 778, on: tESS, group: criteriaK},
  {year: 2016, text: "2016", x: 972, y: 754, on: C(5, "Tao"), group: nearbyK},
  {year: 2025, text: "2025", x: 1078, y: 784, on: tChen, group: nearbyK},
].map((s, i) => {
  const x = yearX(s.year);
  const stem = line(timeline.svg, x, 820, x, s.y + 30);
  const dot = KIT.svgEl(timeline.svg, "circle", {cx: x, cy: 820, r: 4, fill: "var(--ink-muted)"});
  const lab = txt(timeline.el, "event-" + i, s.text, s.x, s.y);
  return {...s, stem, dot, lab};
});
/* Chapter lengths lie on a 1/30 s grid; the last frame may fall just after the last beat. */
window.sceneDuration = Math.ceil(window.__BEATS__.duration * 30 - 1e-6) / 30;
window.sceneEvents = [
  { t: tMorph + morphRun, beat: "c4b1", what: "equal-energy profiles reach peak ratio three" },
  { t: tCKN, beat: "c4b3", what: "space-time square" },
  { t: tPoint, beat: "c4b3", what: "isolated point remains possible" },
  { t: tNeither, beat: "c4b5", what: "positive-viscosity whole-space and torus exclusion" },
];
window.setTime = function (t) {
  const stay = 1 - powerIn(t, END - 0.5, 0.5);
  chapter.setTime(t); if (t >= 2) op(chapter.el, stay);
  strip.setTime(t, stay); subs.setTime(t); op(content, stay);
  const first = t >= 2 && t < B(2) ? 1 : 0;
  op(energy.el, first); ec.setK(1);
  const m = sineInOut(t, tMorph, morphRun), sigma = mix(1, 1 / 9, m);
  const d = profile(sigma), nk = powerOut(t, tMorph, 0.3);
  narrow.setAttribute("d", d); op(narrow, nk); fills[1].setAttribute("d", baseFill(d)); op(fills[1], 0.05 * nk);
  op(peakOne, Math.max(1 - powerIn(t, tMorph - 0.25, 0.25), powerOut(t, tMorph + morphRun, 0.3)));
  peakNow.style.top = (ec.Y((48 / Math.sqrt(sigma)) / 48) - 34) + "px";
  KIT.fill(peakNow, "$" + (1 / Math.sqrt(sigma)).toFixed(2) + "$"); op(peakNow, nk);
  op(profileNote, 1); op(same, powerOut(t, tMorph + morphRun, 0.3));
  eqE.setTime(t); eqD.setTime(t);
  op(eqE.el, KIT.textIn(t, C(1, "energy")));
  op(eqD.el, KIT.textIn(t, C(1, "decrease")));
  op(unforced, KIT.textIn(t, C(1, "force")));

  op(weak.el, t >= B(2) && t < B(3) ? 1 : 0);
  wc.setK(1); rough.set(KIT.linear(t, B(2), 2.5), 1); test.set(1, powerOut(t, tAvg, 0.4));
  weakEq.setTime(t); op(weakEq.el, powerOut(t, tAvg, 0.35));
  op(weakNote, powerOut(t, tAvg, 0.35)); op(weakSchem, 1);
  op(small.el, t >= B(3) && t < tCKN ? 1 : 0);
  sc.setK(1); initial.set(3, 0.5);
  smallStage = 0.9 * sineInOut(t, tFK, Math.max(1, C(3, "viscosity") - tFK));
  diffused.el.setAttribute("d", sample(x => [sc.X(x), sc.Y((0.9 / (1 + smallStage)) * Math.exp(-x * x * 2 / Math.pow(1 + smallStage, 2)))], -3, 3));
  op(diffused.el, powerOut(t, tFK, 0.35)); op(smallSchem, 1);
  op(singular.el, t >= tCKN && t < B(4) ? 1 : 0);
  op(measureName, powerOut(t, tSing, 0.35)); op(singularName, powerOut(t, tSing, 0.35));
  op(singularDot, powerOut(t, tPoint - 0.35, 0.35));
  op(pointCaption, powerOut(t, C(3, "excluded"), 0.3));
  op(space, 1); op(time, 1); op(cknSchem, 1);

  op(criteria.el, criteriaK(t)); cc.setK(1);
  const es = swap(t, tESS);
  growing.set(0.985, es.oldK); bounded.set(KIT.linear(t, tESS, 1.0), es.newK);
  op(tip, es.oldK * powerOut(t, C(4, "blow") + 2.0, 0.3)); op(criteriaSchem, 1);
  const traceX = mix(0, 0.947, sineInOut(t, C(4, "blow"), 2.0));
  traceDot.setAttribute("cx", cc.X(traceX)); traceDot.setAttribute("cy", cc.Y(0.24 / (1 - traceX) - 0.24));
  op(traceDot, es.oldK * powerOut(t, C(4, "blow"), 0.3));
  bkmEq.setTime(t); essEq.setTime(t);
  op(bkmEq.el, KIT.textIn(t, tBKM));
  op(essEq.el, KIT.textIn(t, tESS));

  op(nearby.el, nearbyK(t));
  const ch = swap(t, tChen);
  op(cascade, ch.oldK); op(nearbySchem, ch.oldK);
  const clock = KIT.linear(t, tTao, Math.max(1, tChen - tTao));
  cascadeDot.setAttribute("cx", 200 + 920 * clock); cascadeDot.setAttribute("cy", 480);
  op(section, ch.newK); op(sectionNote, ch.newK);
  op(wallPoint, powerOut(t, tWall, 0.35)); op(wallName, powerOut(t, tWall, 0.35));
  op(timeline.el, t >= B(2) ? 1 : 0);
  specs.forEach(s => {
    const k = powerOut(t, s.on, 0.35) * s.group(t);
    op(s.lab, k); op(s.stem, k); op(s.dot, k);
  });
  ledger.forEach(({el, at, next, group}) => op(el,
    group(t) * KIT.entryIn(t, el, at)));
};
window.setTime(0);
