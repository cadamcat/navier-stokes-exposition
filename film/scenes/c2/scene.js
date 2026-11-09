/* The velocity field, a parcel and the Navier–Stokes balance. */
import { stage3d } from "../three3d/stage3d.js";
import { FIELD, FEAT_INDEX, PATH, FACE_ARROWS, H } from "./field.js";
import { makeABC } from "./flowfield.js";
import { heightAt } from "./plot.js";

installBeats(window.__BEATS__);

const D = {
  intro: need("c2b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word"),
  field: need("c2b1", "At", 0.5, "field settles in view"),
  point: need("c2b1", "point", 0.5, "ring and label x"),
  vel: need("c2b1", "velocity", 0.5, "arrow thickens"),
  pressure: need("c2b1", "pressure", 0.45, "pressure label"),
  parcel: need("c2b1", "parcel", 0.5, "parcel appears"),
  acc: need("c2b1", "acceleration", 0.8, "change of u and the material derivative"),
  cam: need("c2b1", "number", 1.0, "camera turns toward the parcel"),
  lhs: need("c2b2", "The", 0.6, "left side of the equation"),
  cmpOut: need("c2b2", "The", 0.4, "path arrows leave"),
  term: need("c2b2", "pressure", 0.45, "pressure term"),
  visc: need("c2b2", "viscous", 0.5, "viscosity term"),
  force: need("c2b2", "force", 0.45, "force term"),
  div: need("c2b2", "incompressible", 0.5, "incompressible line"),
  tiny: need("c2b2", "tiny", 0.6, "tiny volume and its flux"),
  fade3d: need("c2b3", "Viscosity", 0.5, "3D picture fades"),
  plot: need("c2b3", "to", 0.45, "smoothing plot appears"),
  spread: need("c2b3", "smooth", 2.5, "velocity profile spreads"),
  ul: need("c2b3", "Transport", 0.45, "nonlinear term underlined"),
  line: need("c2b4", "Smooth", 0.5, "smooth line appears"),
  ask: need("c2b4", "lose", 0.6, "question line"),
  out: need("c2b4", "tail", 0.8, "picture fades out"),
};

const T = {
  b1: beatStart("c2b1"),
  point: cue("c2b1", "point"),
  vel: cue("c2b1", "velocity"),
  pressure: cue("c2b1", "pressure"),
  number: cue("c2b1", "number"),
  parcel: cue("c2b1", "parcel"),
  acc: cue("c2b1", "acceleration"),
  b1end: beatEnd("c2b1"),
  b1hold: beatHoldEnd("c2b1"),
  b2: beatStart("c2b2"),
  the: cue("c2b2", "The"),
  pressure2: cue("c2b2", "pressure"),
  visc2: cue("c2b2", "viscous"),
  force: cue("c2b2", "force"),
  inco: cue("c2b2", "incompressible"),
  tiny: cue("c2b2", "tiny"),
  b2end: beatEnd("c2b2"),
  b3: beatStart("c2b3"),
  visc3: cue("c2b3", "Viscosity"),
  to: cue("c2b3", "to"),
  smooth: cue("c2b3", "smooth"),
  transport: cue("c2b3", "Transport"),
  b4: beatStart("c2b4"),
  smooth4: cue("c2b4", "Smooth"),
  every4: cue("c2b4", "every"),
  space4: cue("c2b4", "space"),
  exists4: cue("c2b4", "exists"),
  continuous4: cue("c2b4", "continuous"),
  lose: cue("c2b4", "lose"),
  finite: cue("c2b4", "finite"),
  tail: beatEnd("c2b4"),
};

const { powerOut, powerIn, sineInOut, gate, swap, op, mix } = KIT;
const END = beatHoldEnd("c2b4");
const content = KIT.layer();
const svg = KIT.overlay(content);
const chapter = chapterLabel({ n: 2, title: "The equations", intro: 2.0 });
const strip = mountStripJX(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);
const map = magnitudeMap();
const st = stage3d({ left: 120, top: 80, width: 1112, height: 750, fov: 26 });
const flow = makeABC(st, END, map);
const node = (tag, attrs, parent = svg) => KIT.svgEl(parent, tag, attrs);
const fieldInk = node("g", {});
function edges(half, token) {
  const list = [];
  for (let axis = 0; axis < 3; axis++) for (const a of [-1, 1]) for (const b of [-1, 1]) {
    const p = [0, 0, 0], q = [0, 0, 0]; p[axis] = -half; q[axis] = half;
    p[(axis + 1) % 3] = q[(axis + 1) % 3] = a * half;
    p[(axis + 2) % 3] = q[(axis + 2) % 3] = b * half;
    list.push({ p, q, el: node("line", { stroke: `var(${token})`, "stroke-width": 2 }, fieldInk) });
  }
  return list;
}
const box = edges(1.5, "--ink-muted"), tiny = edges(0.25, "--ink");
function line(el, a, b, k = 1) {
  for (const [key, value] of Object.entries({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, opacity: k })) el.setAttribute(key, value);
}
function arrow(parent, token, width = 3.5) {
  const group = node("g", { opacity: 0 }, parent);
  const shaft = node("line", { stroke: `var(${token})`, "stroke-width": width, "stroke-linecap": "round" }, group);
  const head = node("polygon", { fill: `var(${token})` }, group);
  return { set(a, b, k) {
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
    const n = Math.min(12, length * 0.3), ux = dx / (length || 1), uy = dy / (length || 1);
    line(shaft, a, { x: b.x - ux * n * 0.65, y: b.y - uy * n * 0.65 });
    head.setAttribute("points", `${b.x},${b.y} ${b.x - ux * n - uy * n * 0.45},${b.y - uy * n + ux * n * 0.45} ${b.x - ux * n + uy * n * 0.45},${b.y - uy * n - ux * n * 0.45}`);
    group.setAttribute("opacity", length < 0.01 ? 0 : k);
  } };
}
const bold = arrow(fieldInk, "--velocity", 5);
const point = node("circle", { r: 5, fill: "var(--ink)", stroke: "var(--paper)", "stroke-width": 3 }, fieldInk);
const parcelTrail = node("path", { fill: "none", stroke: "var(--ink)", "stroke-width": 2, "stroke-linecap": "round" }, fieldInk);
const parcel = node("circle", { r: 9, fill: "var(--ink)", stroke: "var(--paper)", "stroke-width": 4 }, fieldInk);
const flux = FACE_ARROWS.map(() => arrow(fieldInk, "--velocity", 2));
const text = (name, words, x, y, kind = "aux", color) => KIT.text(content, name, words, { x, y, kind, color });
const cap = KIT.note(content, "field-exact", "a smooth, divergence-free field (exact formula)");
const labX = text("point-name", "$x$", 0, 0, "label");
const labU = text("velocity-name", "$u(x,t)$", 0, 0, "label", "--velocity");
const velocityEntry = text("velocity", "velocity $u(x,t)$ · an arrow", 1256, 112, "label", "--velocity");
const labP = text("pressure-name", "pressure $p(x,t)$: a number", 1256, 190, "label");
const parcelEntry = text("parcel-path", "parcel · along its own path", 1256, 270);
const parcelLabel = text("parcel-name", "parcel", 0, 0);
const volumeLabel = text("tiny-volume", "tiny volume", 0, 0);
const velocityLeader = KIT.leader(svg, "--velocity");
const parcelLeader = KIT.leader(svg);
const volumeLeader = KIT.leader(svg);
const legend = KIT.legend(content, { map, y: 742, label: "speed", unit: "", ticks: [{ u: 0, text: "0" }, { u: 1, text: "" }] });
legend.el.style.left = "120px";   // bottom-left of the picture zone, away from the rail formulas

katex.render("\\sqrt{6}", legend.el.querySelectorAll(".colorbar-tick")[1], KIT.KX);
legend.el.querySelectorAll(".colorbar-tick")[1].style.right = "4px";

/* The invariant diagonal has a fixed direction: parallel rows use one common scale. */
const inset = node("g", {});
const previousArrow = arrow(inset, "--ink-muted", 3);
const nowArrow = arrow(inset, "--velocity", 3.5);
const differenceArrow = arrow(inset, "--ink", 3.5);
const earlyLabel = text("earlier", "$u$ earlier", 1520, 352);
const nowLabel = text("now", "$u$ now", 1520, 412);
const differenceLabel = text("difference", "$=$ $u$ now $-$ $u$ earlier", 1256, 526);
const zoomLabel = text("zoom", "(enlarged sketch)", 1256, 566);
const accelLabel = text("acceleration", "acceleration", 1256, 610);
/* One line, clear of the legend. */
const material = KIT.formula(content, "material", "\\frac{Du}{Dt}=\\partial_tu+(u\\cdot\\nabla)u", { x: 1256, y: 660, w: 544, h: 110 });
const lhs = KIT.formula(content, "balance-left", "\\htmlClass{term-v}{\\partial_tu+(u\\cdot\\nabla)u}", { x: 1256, y: 140, w: 544, h: 100 });
const rhs = KIT.formula(content, "balance-right", "\\htmlClass{term-p}{=-\\nabla p}\\htmlClass{term-n}{+\\nu\\Delta u}\\htmlClass{term-f}{+f}", { x: 1256, y: 250, w: 544, h: 100 });
const div = KIT.formula(content, "incompressibility", "\\nabla\\cdot\\htmlClass{term-u}{u}=0", { x: 1256, y: 500, w: 544, h: 100 });
material.el.style.color = "var(--velocity)";
colorTerm(lhs, "v", "--velocity"); colorTerm(rhs, "n", "--viscosity"); colorTerm(rhs, "f", "--force"); colorTerm(div, "u", "--velocity");
const pressureLabel = text("pressure-term", "pressure", 1256, 375);
const viscosityLabel = text("viscosity-term", "viscosity $\\nu>0$", 1420, 375, "aux", "--viscosity");
const forceLabel = text("force-term", "force", 1690, 375, "aux", "--force");
const incompressibleLabel = text("incompressible", "incompressible", 1256, 600);
const fluxLabel = text("flux", "flux in = flux out", 1256, 665);
const nonlinearLabel = text("nonlinear", "nonlinear: $u$ carries itself", 1256, 758);
const underline = node("line", { stroke: "var(--velocity)", "stroke-width": 2 });
const smoothTitle = text("smooth", "smooth", 1256, 140, "label");
const derivative = KIT.formula(content, "all-derivatives", "\\partial_x^\\alpha\\partial_t^m u", { x: 1256, y: 240, w: 544, h: 100 });
const allOrders = text("all-orders", "for all orders", 1256, 370, "label");
const exist = text("derivatives-exist", "exist", 1256, 430, "label");
const continuous = text("derivatives-continuous", "and are continuous", 1256, 490, "label");
const question = text("smoothness-question", "lose smoothness?", 1256, 634, "label");
const finite = text("finite-time-question", "in finite time?", 1256, 692, "label");
const chart = KIT.chart(content, svg, { box: "heat", x: 225, y: 195, w: 920, h: 505, xr: [-3.2, 3.2], yr: [0, 2.6] });
const heatGhosts = [0, 0.18, 0.4].map(s => ({ s, curve: chart.curve({ token: "--velocity", fn: x => heightAt(x, s), from: -3.2, to: 3.2, dashed: true }) }));
const heatLive = chart.curve({ token: "--velocity", fn: x => heightAt(x, 0), from: -3.2, to: 3.2 });
const smoothingArrows = [-1, 1].map(() => arrow(svg, "--viscosity", 3.5));
const axisVelocity = text("axis-velocity", "velocity", 225, 145);
const axisPosition = text("axis-position", "position", 1040, 720);
const smoothingLabel = text("smoothing", "smoothing", 700, 500, "aux", "--viscosity");
const heatNote = KIT.note(content, "heat-analogy", "heat-equation analogy");
const getPath = s => {
  const v = Math.max(0, Math.min(PATH.samples.at(-1).s, s)), j = Math.min(PATH.samples.length - 2, Math.floor(v / H)), f = v / H - j;
  const a = PATH.samples[j], b = PATH.samples[j + 1];
  return { world: a.world.map((x, i) => mix(x, b.world[i], f)), u: a.u.map((x, i) => mix(x, b.u[i], f)) };
};
function term(name, k) { rhs.el.querySelectorAll(".term-" + name).forEach(el => op(el, k)); }
const cameraStart = T.point + D.point;
const cameraDuration = T.vel - cameraStart;
window.sceneDuration = END;
window.sceneEvents = Object.entries(T).map(([what, t]) => ({ t, what, beat: beatAt(t).id }));
window.setTime = function (t) {
  const open = t >= 2 ? 1 : 0, stay = 1 - powerIn(t, END - 0.5, 0.5);
  chapter.setTime(t); if (t >= 2) op(chapter.el, stay);
  op(content, open * stay); strip.setTime(t, stay); subs.setTime(t);
  st.orbit([0, 0, 0], 30 + 12 * sineInOut(t, cameraStart, cameraDuration), 22, 11.9);
  const chartSwap = swap(t, T.b3), restore = powerOut(t, T.b4, 0.45);
  const fieldK = chartSwap.oldK + 0.4 * restore;
  st.setOpacity(open * stay * fieldK); flow.setTime(Math.max(T.b1, t)); st.render();
  fieldInk.setAttribute("opacity", fieldK);
  box.forEach(e => line(e.el, st.project(e.p), st.project(e.q), 0.7));
  const feat = FIELD[FEAT_INDEX], x = st.project(feat.world);
  const pointK = gate(t, T.point, T.parcel - 0.25, D.point);
  point.setAttribute("cx", x.x); point.setAttribute("cy", x.y); point.setAttribute("opacity", pointK);
  labX.style.left = (x.x + 18) + "px"; labX.style.top = (x.y + 16) + "px"; op(labX, pointK * fieldK);
  const vectorTip = st.project(feat.world.map((v, i) => v + feat.vec[i]));
  const vectorK = gate(t, T.vel, T.parcel - 0.25, D.vel);
  bold.set(x, vectorTip, vectorK);
  labU.style.left = (vectorTip.x + 60) + "px"; labU.style.top = (vectorTip.y - 24) + "px";
  op(labU, vectorK); velocityLeader.set(vectorTip.x, vectorTip.y, vectorTip.x + 48, vectorTip.y, vectorK);
  const firstK = swap(t, T.b2).oldK;
  const seen = (el, at, next, k = 1, duration = 0.4) => op(el, k * KIT.textIn(t, at, duration));
  seen(velocityEntry, T.vel, T.pressure, firstK, D.vel);
  seen(labP, T.pressure, T.parcel, firstK, D.pressure);
  seen(parcelEntry, T.parcel, T.acc, firstK, D.parcel);
  op(cap, open * (chartSwap.oldK + restore));
  const parcelK = gate(t, T.parcel, T.b2 - 0.25, D.parcel), travel = Math.max(0, t - T.parcel), here = getPath(travel), earlier = getPath(Math.max(0, travel - 0.6));
  const q = st.project(here.world);
  parcel.setAttribute("cx", q.x); parcel.setAttribute("cy", q.y); parcel.setAttribute("opacity", parcelK);
  parcelLabel.style.left = (q.x + 60) + "px"; parcelLabel.style.top = (q.y - 64) + "px";
  op(parcelLabel, parcelK); parcelLeader.set(q.x + 14, q.y - 4, q.x + 48, q.y - 40, parcelK);
  let path = "";
  for (let s = Math.max(0, Math.min(travel, 8) - 2); s <= Math.min(travel, 8); s += H * 2) {
    const p = st.project(getPath(s).world); if (Math.hypot(p.x - q.x, p.y - q.y) < 14) continue;
    path += `${path ? "L" : "M"}${p.x},${p.y}`;
  }
  parcelTrail.setAttribute("d", path); parcelTrail.setAttribute("opacity", parcelK);
  const cmp = gate(t, KIT.sentenceStart(T.acc), T.b2 - 0.25, D.acc);
  const magnitudes = [Math.hypot(...earlier.u), Math.hypot(...here.u)], scale = 210 / Math.max(...magnitudes, 1e-12);
  const vp = magnitudes[0] * scale, vn = magnitudes[1] * scale;
  previousArrow.set({ x: 1280, y: 376 }, { x: 1280 + vp, y: 376 }, cmp);
  nowArrow.set({ x: 1280, y: 436 }, { x: 1280 + vn, y: 436 }, cmp);
  differenceArrow.set({ x: 1280 + vp, y: 496 }, { x: 1280 + vn, y: 496 }, cmp);
  [earlyLabel, nowLabel, differenceLabel, zoomLabel, accelLabel].forEach(el => op(el, cmp));
  op(material.el, cmp); material.setTime(t);
  const balanceK = gate(t, T.the, T.b4 - 0.25, D.lhs);
  op(lhs.el, balanceK); op(rhs.el, balanceK);
  term("p", KIT.textIn(t, T.pressure2, D.term));
  term("n", KIT.textIn(t, T.visc2, D.visc));
  term("f", KIT.textIn(t, T.force, D.force));
  const balanceStay = swap(t, T.b4).oldK;
  seen(pressureLabel, T.pressure2, T.visc2, balanceStay, D.term);
  seen(viscosityLabel, T.visc2, T.force, balanceStay, D.visc);
  seen(forceLabel, T.force, T.inco, balanceStay, D.force);
  const divK = KIT.textIn(t, T.inco, D.div) * balanceStay;
  op(div.el, divK); seen(incompressibleLabel, T.inco, T.tiny, balanceStay, D.div);
  const tinyK = gate(t, T.tiny, T.b3 - 0.25, D.tiny);
  tiny.forEach(e => line(e.el, st.project(e.p), st.project(e.q), tinyK));
  FACE_ARROWS.forEach((f, i) => flux[i].set(st.project(f.world), st.project(f.world.map((v, j) => v + f.vec[j])), tinyK));
  seen(fluxLabel, T.tiny, T.visc3, balanceStay, D.tiny);
  const volumeAnchor = st.project([0.25, 0.25, 0]);
  volumeLabel.style.left = (volumeAnchor.x + 80) + "px"; volumeLabel.style.top = (volumeAnchor.y + 8) + "px";
  op(volumeLabel, tinyK); volumeLeader.set(volumeAnchor.x, volumeAnchor.y, volumeAnchor.x + 68, volumeAnchor.y + 24, tinyK);
  const plotK = chartSwap.newK * swap(t, T.b4).oldK;
  chart.setK(plotK);
  const heatS = 0.65 * Math.min(1, Math.max(0, (t - T.smooth) / D.spread));
  let d = "";
  for (let i = 0; i <= 180; i++) { const x = -3.2 + 6.4 * i / 180; d += `${i ? "L" : "M"}${chart.X(x)},${chart.Y(heightAt(x, heatS))}`; }
  heatLive.el.setAttribute("d", d); heatLive.el.setAttribute("opacity", plotK);
  heatGhosts.forEach(({ s, curve }) => curve.set(null, plotK * 0.35 * powerOut(heatS, s + 0.04, 0.08)));
  [axisVelocity, axisPosition].forEach(el => op(el, plotK));
  op(heatNote, plotK);
  const spreadK = powerOut(t, T.smooth, 0.45) * plotK, w = Math.sqrt(0.42 ** 2 + 4 * 0.3 * heatS);
  [-1, 1].forEach((sign, i) => { const x = sign * w, y = chart.Y(heightAt(x, heatS)); smoothingArrows[i].set({ x: chart.X(x), y }, { x: chart.X(x + sign * 0.55), y }, spreadK); });
  smoothingLabel.style.left = chart.X(w + 0.6) + "px"; smoothingLabel.style.top = (chart.Y(heightAt(w, heatS)) - 46) + "px"; op(smoothingLabel, spreadK);
  const nlK = gate(t, T.transport, T.b4 - 0.25); op(nonlinearLabel, nlK);
  const r = lhs.el.querySelector(".term-v").getBoundingClientRect(); line(underline, { x: r.left + r.width * 0.43, y: r.bottom + 4 }, { x: r.right, y: r.bottom + 4 }, nlK);
  seen(smoothTitle, T.smooth4, T.every4, 1, D.line);
  seen(derivative.el, T.space4, T.exists4);
  seen(allOrders, T.every4, T.exists4);
  seen(exist, T.exists4, T.continuous4);
  seen(continuous, T.continuous4, T.lose);
  seen(question, T.lose, T.finite, 1, D.ask);
  op(finite, KIT.textIn(t, T.finite, 0.3));
  legend.setOpacity(chartSwap.oldK + restore);
  window.c2State = {t, camera: {az: 30 + 12 * sineInOut(t, cameraStart, cameraDuration), el: 22, dist: 11.9},
    comparison: {earlier: magnitudes[0], now: magnitudes[1], scale, previousPixels: vp, nowPixels: vn,
      differencePixels: vn - vp}, cube: box.map(e => [st.project(e.p), st.project(e.q)])};
};
