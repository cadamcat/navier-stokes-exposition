/* Successive correction orders and the smooth realization of the forcing. */
installBeats(window.__BEATS__);
const INTRO = need("c8b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word");
const LEAVE = need("c8b1", "creates", 0.8, "token leaves the first correction");
const LOOP = need("c8b1", "four", 2.5, "token travels the correction loop");
const CLIMB = need("c8b2", "raises", 1.2, "marker climbs one rung");
const PASS = need("c8b2", "passes", 0.6, "marker passes the fixed loss");
const JOIN = need("c8b3", "cutoffs", 1.0, "cutoffs join into one field");
const OUT = need("c8b3", "tail", 0.8, "picture fades out");
const { powerOut, powerIn, sineInOut, gate, swap, mix, op } = KIT;
const chapter = chapterLabel({ n: 8, title: "Every derivative", intro: 2.0 });
const content = KIT.layer();
const cycle = KIT.layer(content), later = KIT.layer(content);
const svg = KIT.overlay(cycle), finalSvg = KIT.overlay(later);
const strip = mountStripJX(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);
const tCreates = cue("c8b1", "creates"), tFour = cue("c8b1", "four"), tPressure = cue("c8b1", "pressure");
const tRaises = cue("c8b2", "raises"), tLoss = cue("c8b2", "losses"), tPass = cue("c8b2", "passes");
const tRung = cue("c8b2", "rung"), tCut = cue("c8b3", "cutoffs"), tExt = cue("c8b3", "extended");
const tCompact = cue("c8b3", "compact"), B2 = beatStart("c8b2"), B3 = beatStart("c8b3");
const END = beatHoldEnd("c8b3");
const mergeDuration = Math.min(3, tExt - tCut - 0.75);
const mergeEnd = tCut + mergeDuration;
function text(parent, id, words, x, y, w, kind = "aux", align) {
  return KIT.text(parent, id, words, { x, y, w, kind, align });
}
function line(parent, x1, y1, x2, y2, token = "--ink-muted", width = 2) {
  return KIT.svgEl(parent, "line", { x1, y1, x2, y2, stroke: "var(" + token + ")", "stroke-width": width });
}
function path(parent, token, width = 3.5) {
  return KIT.svgEl(parent, "path", { fill: "none", stroke: "var(" + token + ")", "stroke-width": width,
    "stroke-linecap": "round", "stroke-linejoin": "round" });
}

/* Equal rung spacing represents the exact linear order sequence. The upper continuation fades into paper. */
const LX = 900, RX = 1050, BASE = 800, STEP = 64;
const rungY = j => BASE - j * STEP;
const ladder = KIT.svgEl(svg, "g", {});
const rungs = [], rungLabels = [];
for (let j = 0; j <= 10; j++) {
  const opacity = j < 8 ? 1 : [0.62, 0.24, 0.05][j - 8];
  const y = rungY(j);
  rungs.push(line(ladder, LX - 20, y, RX + 20, y));
  op(rungs[j], opacity);
  if (j < 10) {
    const left = line(ladder, LX, y, LX, rungY(j + 1));
    const right = line(ladder, RX, y, RX, rungY(j + 1));
    op(left, opacity); op(right, opacity);
  }
  rungLabels.push(text(cycle, "rung-" + j, "$\\sigma_{" + j + "}=" +
    (j === 0 ? "\\tfrac15" : "\\tfrac{" + (j + 2) + "}{10}") + "$", 1080, y - 21, 150));
}
const sigmaEq = KIT.formula(cycle, "order-law", "\\sigma_j=\\tfrac15+\\tfrac{j}{10}", { x: 1256, y: 150, w: 544, h: 100 });
const marker = KIT.svgEl(svg, "circle", { cx: (LX + RX) / 2, cy: BASE, r: 12, fill: "var(--force)" });
const markerHalo = KIT.svgEl(svg, "circle", { cx: (LX + RX) / 2, cy: BASE, r: 20, fill: "none", stroke: "var(--force)", "stroke-width": 1.5 });
const lossGroup = KIT.svgEl(svg, "g", {});
const lossLines = [3.5, 6.5].map(j => {
  const ln = line(lossGroup, 880, rungY(j), 1210, rungY(j));
  ln.setAttribute("stroke-dasharray", "7 6");
  return ln;
});
const lossA = text(cycle, "loss-a", "loss for $k$ derivatives\n(fixed; height\nschematic)", 640, 596, 240);
const lossB = text(cycle, "loss-b", "more derivatives:\nhigher fixed loss\n(schematic)", 640, 400, 240);

/* The loop is built in place, with the travelling residual inside its track. */
const CX = 410, CY = 440, HALF = 160;
const PTS = [[CX - HALF, CY - HALF], [CX + HALF, CY - HALF], [CX + HALF, CY + HALF], [CX - HALF, CY + HALF]];
const names = ["angular modes", "tangential stress", "zero mean", "moment solve"];
const shortLabels = [
  text(cycle, "node-angular", names[0], 140, 224, 236, "aux", "center"),
  text(cycle, "node-stress", names[1], 450, 224, 256, "aux", "center"),
  text(cycle, "node-mean", names[2], 450, 632, 160, "aux", "center"),
  text(cycle, "node-moment", names[3], 140, 632, 236, "aux", "center"),
];
const edges = PTS.map((p, i) => {
  const q = PTS[(i + 1) % 4], dx = q[0] - p[0], dy = q[1] - p[1];
  const len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  const edge = line(svg, p[0] + ux * 18, p[1] + uy * 18, q[0] - ux * 22, q[1] - uy * 22);
  const head = KIT.svgEl(svg, "path", { d: "M" + (q[0] - ux * 32 - uy * 6) + " " + (q[1] - uy * 32 + ux * 6) +
    "L" + (q[0] - ux * 18) + " " + (q[1] - uy * 18) + "L" + (q[0] - ux * 32 + uy * 6) + " " + (q[1] - uy * 32 - ux * 6),
    fill: "none", stroke: "var(--ink-muted)", "stroke-width": 2 });
  const node = KIT.svgEl(svg, "circle", { cx: p[0], cy: p[1], r: 8, fill: "var(--paper)", stroke: "var(--ink-muted)", "stroke-width": 2 });
  return { edge, head, node };
});
const token = KIT.svgEl(svg, "circle", { r: 9, fill: "var(--force)" });
const sparks = [0, 1].map(() => KIT.svgEl(svg, "circle", { r: 4, fill: "var(--force)" }));
const newErrors = text(cycle, "new-errors", "new errors", 300, 330, 190);
const loopNote = KIT.note(cycle, "loop-schematic", "loop: schematic · loss heights schematic");
const entries = [];
function entry(id, words, y, at, next = B2, parent = cycle, strong = false) {
  const el = text(parent, id, words, 1256, y, 544, strong ? "strong" : "aux");
  entries.push({el, at, next}); return el;
}
entry("manuscript-status", "manuscript · claimed", 100, 2, B2, cycle, true);
const detailTimes = [2, tCreates + LEAVE, cue("c8b1", "force"), cue("c8b1", "manuscript")];
entry("detail-angular", "supported nonzero angular modes", 278, detailTimes[0]);
entry("detail-stress", "averaged tangential stress", 320, detailTimes[1]);
entry("detail-mean", "residual: zero auxiliary mean", 362, detailTimes[2]);
entry("detail-moment", "five-equation moment correction", 404, detailTimes[3]);
entry("constraints", "keeps 2 constraints", 450, tFour);
entry("linear-defects", "cancels linear parts of 3 defects", 490, tFour);
entry("defects", "$(P,J_\\theta,J_z)$", 528, tFour);
entry("error-terms", "cross terms, $(w\\cdot\\nabla)w$", 574, tCreates);
entry("pressure", "pressure rebuilt after each", 616, tPressure);
entry("residual-update", "full residual updated", 658, tPressure);
entry("all-orders", "force: smooth to every order", 700, cue("c8b1", "smooth"));
entry("fixed-derivatives", "fixed derivative count → fixed losses", 754, tLoss, tPass);
entry("passes-losses", "order eventually passes them", 796, tPass, tRung);
const unbounded = text(cycle, "no-last-rung", "no last rung", 900, 104, 320);

/* A locally finite smooth assembly before the singular time. */
const waves = [0, 1, 2, 3].map(() => path(finalSvg, "--velocity"));
function waveD(i, join) {
  let d = "";
  for (let k = 0; k <= 420; k++) {
    const u = k / 420, envelope = Math.exp(-Math.pow((u - 0.5) * 2.5, 2));
    const amp = mix(150 + i * 10, 166, join), phase = mix((i - 1.5) * 0.5, 0.2, join);
    const y = 470 + amp * Math.sin(u * 7 + phase) * envelope + (1 - join) * (i - 1.5) * 72;
    d += (k ? "L" : "M") + (120 + u * 1112).toFixed(2) + " " + y.toFixed(2);
  }
  return d;
}
entry("assembly-status", "manuscript · claimed", 100, B3, tExt, later, true);
const assemblyCaps = [entry("smooth-cutoffs", "smooth cutoffs", 178, tCut, mergeEnd, later)];
const oneField = entry("one-field", "one smooth field", 240, mergeEnd, tExt, later, true);
assemblyCaps.push(oneField, entry("pre-singular", "before the singular time", 288, mergeEnd, tExt, later));
const schem = KIT.note(later, "final-schematic", "schematic");

/* A genuine smooth bump, extended by zero, illustrates compact support. */
const A = 0.35, D = 1.45, TMAX = 1.7;
const forceChart = KIT.chart(later, finalSvg, { box: "force", x: 180, y: 272, w: 980, h: 400,
  xr: [0, TMAX], yr: [0, 1], yAxis: false, xTicks: [{ v: 0, text: "0" }, { v: 1, text: "1" }] });
const bump = s => {
  const z = (s - (A + D) / 2) / ((D - A) / 2);
  return Math.abs(z) < 1 ? Math.exp(1 - 1 / (1 - z * z)) : 0;
};
const forceCurve = forceChart.curve({ token: "--force", from: 0, to: TMAX, n: 600, fn: bump });
const forceFill = KIT.svgEl(finalSvg, "path", { fill: "var(--force)", opacity: 0.055 });
const bracket = path(finalSvg, "--ink-muted", 2);
bracket.setAttribute("d", "M" + forceChart.X(A) + " 740v18H" + forceChart.X(D) + "v-18");
const compact = text(later, "compact", "compact support", forceChart.X(A), 770, forceChart.X(D) - forceChart.X(A), "label", "center");
entry("force-name", "force: smooth through $t=1$", 416, tExt + 0.35, tCompact, later, true);
entry("support-space", "compact support in space", 506, tExt + 0.35, END, later);
entry("support-time", "and time", 548, tExt + 0.35, END, later);
const source = KIT.note(later, "citation", "schematic · manuscript, Lemmas 10.2–10.3");
window.sceneDuration = window.__BEATS__.duration;
window.sceneEvents = [
  { t: tCreates, beat: "c8b1", what: "new errors next to the travelling residual" },
  { t: tRaises, beat: "c8b2", what: "one rung per completed correction lap" },
  { t: tPass, beat: "c8b2", what: "the order passes fixed schematic losses" },
  { t: mergeEnd, beat: "c8b3", what: "four curves have become one pre-singular field" },
  { t: tExt, beat: "c8b3", what: "smooth force through time one" },
];

/* One continuous clock drives both the loop and the ladder. */
function progress(t) {
  if (t < tFour) return powerOut(t, tCreates, LEAVE) * 0.25;
  if (t < tRaises - CLIMB) return 0.25 + KIT.linear(t, tFour, tRaises - CLIMB - tFour) * 1.75;
  if (t < tRaises) return 2 + KIT.linear(t, tRaises - CLIMB, CLIMB);
  if (t < tPass) return 3 + KIT.linear(t, tRaises, tPass - tRaises) * 2.5;
  return 5.5 + KIT.linear(t, tPass, beatEnd("c8b2") - tPass) * 4.5 + Math.max(0, t - beatEnd("c8b2")) / CLIMB;
}
/* State captions wait for the corresponding picture. */
["passes-losses", "one-field", "pre-singular", "force-name", "support-space", "support-time"].forEach(name => { content.querySelector(`[data-box="${name}"]`).dataset.stateArrival = "true"; });
window.setTime = function (t) {
  const stay = 1 - powerIn(t, END - 0.5, 0.5);
  chapter.setTime(t); if (t >= 2) op(chapter.el, stay);
  strip.setTime(t, stay); subs.setTime(t); op(content, stay);
  op(cycle, t >= 2 && t < B3 ? 1 : 0); op(later, t >= B3 ? 1 : 0);
  const p = progress(t), lap = Math.floor(p), edge = Math.floor((p % 1) * 4), along = (p * 4) % 1;
  const a = PTS[edge], b = PTS[(edge + 1) % 4];
  token.setAttribute("cx", mix(a[0], b[0], along)); token.setAttribute("cy", mix(a[1], b[1], along)); op(token, 1);
  edges.forEach((e, i) => {
    const ek = i === 0 ? 1 : powerOut(t, tFour + (i - 1) * LOOP / 4, 0.35);
    op(e.edge, ek); op(e.head, ek); op(e.node, powerOut(t, detailTimes[i], 0.35));
    op(shortLabels[i], KIT.textIn(t, detailTimes[i]));
  });
  const sparkK = gate(t, tCreates, tFour - 0.25);
  const tx = mix(a[0], b[0], along), ty = mix(a[1], b[1], along);
  sparks.forEach((s, i) => { s.setAttribute("cx", tx + 22 + i * 16); s.setAttribute("cy", ty + 16 + i * 8); op(s, sparkK); });
  newErrors.style.left = (tx - 50) + "px"; newErrors.style.top = (ty + 48) + "px"; op(newErrors, sparkK);
  op(loopNote, 1);
  /* The assembly captions describe the pre-singular field; they leave with its curves when the force picture replaces it. */
  const assemblyOut = swap(t, tExt).oldK;
  entries.forEach(({el, at, next}) => op(el,
    KIT.entryIn(t, el, at) * (assemblyCaps.includes(el) ? assemblyOut : 1)));

  const order = Math.min(8, Math.max(0, p - 2));
  const completed = Math.floor(order), fraction = order - completed;
  const climb = sineInOut(fraction, 0.72, 0.28);
  const height = Math.min(8, completed + climb);
  marker.setAttribute("cy", rungY(height)); markerHalo.setAttribute("cy", rungY(height));
  op(marker, 1); op(markerHalo, 0.45);
  rungLabels.forEach((el, j) => {
    const near = powerOut(1.4 - Math.abs(j - height), 0, 0.6);
    const reached = powerOut(height, j - 0.25, 0.25);
    op(el, j === 0 ? 1 : reached);
  });
  op(unbounded, KIT.textIn(t, cue("c8b2", "no")));
  sigmaEq.setTime(t); op(sigmaEq.el, powerOut(t, B2, 0.4));
  op(lossLines[0], powerOut(t, tLoss, 0.35));
  op(lossLines[1], powerOut(t, tPass + PASS, 0.35));
  op(lossA, KIT.textIn(t, tLoss));
  op(lossB, powerOut(t, tPass + PASS, 0.35));

  const join = sineInOut(t, tCut, mergeDuration), ext = swap(t, tExt);
  waves.forEach((w, i) => { w.setAttribute("d", waveD(i, join)); op(w, ext.oldK * (i === 0 ? 1 : 1 - join)); });
  op(schem, ext.oldK);
  const forceK = ext.newK;
  forceChart.setK(forceK); forceCurve.set(TMAX, forceK);
  forceFill.setAttribute("d", forceCurve.el.getAttribute("d") + "L1160 672L180 672Z"); op(forceFill, forceK * 0.055);
  op(bracket, powerOut(t, tCompact, 0.35) * forceK);
  op(compact, powerOut(t, tCompact, 0.35) * forceK); op(source, forceK);
};
window.setTime(0);
