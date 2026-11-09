/* Whole space, the periodic cube and four alternatives. */
import { stage3d } from "../three3d/stage3d.js";
import { makeFlow } from "../ns/flow.js";

installBeats(window.__BEATS__);

const D = {
  intro: need("c3b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word"),
  space: need("c3b1", "space", 0.6, "lattice of space"),
  torus: need("c3b1", "torus", 0.6, "cube and identified faces"),
  fade: need("c3b1", "four", 0.6, "3D picture fades"),
  grid: need("c3b1", "alternatives", 0.7, "four-cell grid builds"),
  visc: need("c3b1", "viscosity", 0.45, "viscosity header"),
  cellA: need("c3b2", "A", 0.45, "cell A"),
  cellB: need("c3b2", "B", 0.45, "cell B"),
  every: need("c3b2", "every", 0.4, "every underlined"),
  decay: need("c3b2", "decay", 0.45, "rapidly decaying"),
  bound: need("c3b2", "bounded", 0.4, "bounded energy underlined"),
  cd: need("c3b3", "opposite", 0.5, "cells C and D"),
  flash: need("c3b3", "chosen", 0.6, "some and every contrast"),
  strip: need("c3b3", "breakdown", 0.6, "force through the breakdown"),
  foot: need("c3b4", "any", 0.45, "official footer"),
  settle: need("c3b5", "settle", 0.5, "claimed border and open tags"),
  pulse: need("c3b5", "forever", 0.6, "A and B pulse"),
  out: need("c3b5", "tail", 0.8, "picture fades out"),
};

const T = {
  b1: beatStart("c3b1"),
  space: cue("c3b1", "space"),
  torus: cue("c3b1", "torus"),
  identified: cue("c3b1", "identified"),
  four: cue("c3b1", "four"),
  alt: cue("c3b1", "alternatives"),
  visc: cue("c3b1", "viscosity"),
  A: cue("c3b2", "A"),
  B: cue("c3b2", "B"),
  every: cue("c3b2", "every"),
  decay: cue("c3b2", "decay"),
  bounded: cue("c3b2", "bounded"),
  opp: cue("c3b3", "opposite"),
  chosen: cue("c3b3", "chosen"),
  break: cue("c3b3", "breakdown"),
  any: cue("c3b4", "any"),
  settle: cue("c3b5", "settle"),
  forever: cue("c3b5", "forever"),
  tail: beatEnd("c3b5"),
};

const { op, powerOut, powerIn, sineInOut, gate, swap } = KIT;
const END = beatHoldEnd("c3b5");
const content = KIT.layer();
const svg = KIT.overlay(content);
const chapter = chapterLabel({ n: 3, title: "Four alternatives", intro: 2.0 });
const strip = mountStripJX(document.body, { labels: { c3b5: "Proved: forced breakdown does not settle the unforced alternatives" } });
const subs = mountSubtitles(document.body, window.__BEATS__);
const map = magnitudeMap();
const node = (tag, attrs, parent = svg) => KIT.svgEl(parent, tag, attrs);
const domains = node("g", {});
const spaceDots = node("g", {}, domains);
for (let i = 0; i < 15; i++) for (let j = 0; j < 20; j++) {
  const x = 132 + i * 34, y = 170 + j * 32;
  const edge = Math.min(x - 120, 650 - x, y - 150, 810 - y);
  node("circle", { cx: x, cy: y, r: 1.9, fill: "var(--ink-muted)", opacity: 0.62 * powerOut(edge, 0, 110) }, spaceDots);
}
const torus = stage3d({ left: 696, top: 170, width: 536, height: 580, fov: 28 });
const cube = [];
for (let axis = 0; axis < 3; axis++) for (const a of [-1, 1]) for (const b of [-1, 1]) {
  const p = [0, 0, 0], q = [0, 0, 0]; p[axis] = -1; q[axis] = 1;
  p[(axis + 1) % 3] = q[(axis + 1) % 3] = a;
  p[(axis + 2) % 3] = q[(axis + 2) % 3] = b;
  cube.push({ p, q, el: node("line", { stroke: "var(--ink-muted)", "stroke-width": 2 }, domains) });
}
const circles = [-1, 1].map(sign => ({ sign, el: node("path", { fill: "none", stroke: "var(--ink-muted)", "stroke-width": 2 }, domains) }));
const otherPairs = [];
for (const sign of [-1, 1]) {
  otherPairs.push({ points: [[-0.16, sign * 1.025, -0.12], [0.16, sign * 1.025, -0.12], [0, sign * 1.025, 0.17], [-0.16, sign * 1.025, -0.12]], el: node("path", { fill: "none", stroke: "var(--rule)", "stroke-width": 2 }, domains) });
  otherPairs.push({ points: [[-0.14, -0.14, sign * 1.025], [0.14, -0.14, sign * 1.025], [0.14, 0.14, sign * 1.025], [-0.14, 0.14, sign * 1.025], [-0.14, -0.14, sign * 1.025]], el: node("path", { fill: "none", stroke: "var(--rule)", "stroke-width": 2 }, domains) });
}
const wrapTrail = node("path", { fill: "none", stroke: map.css(0.55), "stroke-width": 2.4, "stroke-linecap": "round" }, domains);
const parcel = node("circle", { r: 4, fill: map.css(0.55), stroke: "var(--paper)", "stroke-width": 2 }, domains);
const text = (name, words, x, y, kind = "aux") => KIT.text(content, name, words, { x, y, kind });
const spaceLabel = text("whole-space", "all of space $\\mathbb{R}^3$", 120, 132, "label");

const torusLabel = text("torus", "torus $\\mathbb{T}^3$", 736, 132, "label");
const faceLabel = text("faces", "opposite faces identified", 736, 768);
const source = KIT.note(content, "source", "Fefferman, official problem description");



const m = KIT.matrix(content, {size: "full", box: "alternatives", x: 120, y: 128,
  dims: {rowW: 80, cellW: 508, cellH: 252, headH: 108, gap: 16}, rows: ["", ""]});
KIT.fill(m.heads[0], "whole space $\\mathbb{R}^3$");
KIT.fill(m.heads[1], "periodic cube $\\mathbb{T}^3$");
const headers = node("g", {});
for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++)
  node("circle", {cx: 380 + i * 16, cy: 186 + j * 14, r: 1.9, fill: "var(--ink-muted)", opacity: 0.5}, headers);
node("path", {d: "M 960 198 l 28 -16 l 36 10 v 28 l -28 16 l -36 -10 Z M 960 198 l 36 10 l 28 -16 M 996 208 v 28", fill: "none", stroke: "var(--ink-muted)", "stroke-width": 2}, headers);
const small = {}, calm = [];
for (const id of ["A", "B"]) {
  const c = m.cells[id], ds = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  ds.setAttribute("width", 508); ds.setAttribute("height", 172); c.pic.appendChild(ds);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 8; i++) {
    const x = 104 + i * 43, y = 42 + j * 21;
    const el = node("path", {fill: "none", stroke: map.css(0.25 + j * 0.025), "stroke-width": 1.8, "stroke-linecap": "round"}, ds);
    calm.push({el, x, y, i, j});
  }
}
for (const id of ["C", "D"]) {
  const st = stage3d({left: 70, top: 4, width: 420, height: 170, fov: 30, parent: m.cells[id].pic});
  const flow = makeFlow(st, {force: T.b1 - D.intro, tightens: T.b1 - D.intro, tightDuration: D.intro, duration: END, peak: END + 1}, map, {left: 0, top: 0, rail: false, count: 150, width: 2.6});
  small[id] = {st, flow};
}
const cellLabels = {};
for (const id of ["A", "B", "C", "D"]) {
  const c = m.cells[id];
  Object.assign(c.body.style, {top: "160px", whiteSpace: "nowrap"});
  const name = KIT.text(c.pic, "flow-" + id, id === "A" || id === "B" ? "calm flow" : "vortex", {x: 18, y: 60, kind: "aux"});
  cellLabels[id] = name;
  const focus = document.createElement("div");
  Object.assign(focus.style, {position: "absolute", inset: "0", border: "2px solid var(--ink-muted)", borderRadius: "6px", pointerEvents: "none", opacity: "0"});
  c.el.appendChild(focus); c.focus = focus;
}
const b2 = beatStart("c3b2"), b3 = beatStart("c3b3"), b4 = beatStart("c3b4"), b5 = beatStart("c3b5");
const forceStart = cue("c3b3", "must");
const ledger = [];
function entry(name, words, y, at, next, strong = false) {
  const el = text(name, words, 1256, y, strong ? "strong" : "aux");
  el.style.paddingRight = "6px";
  ledger.push({el, at, next}); return el;
}
entry("viscosity", "every viscosity $\\nu>0$", 136, T.visc, T.A);
entry("ab-heading", "$A$, $B$ · unforced", 202, T.A, T.opp, true);
entry("all-data", "every smooth, divergence-free $u_0$", 256, T.every, T.opp);
entry("zero-force", "$f=0$", 304, cue("c3b2", "with"), T.opp);
entry("rapid-decay", "$\\mathbb{R}^3$: rapidly decaying data", 352, T.decay, T.opp);
entry("energy-bound", "$\\mathbb{R}^3$: bounded energy", 396, cue("c3b2", "energy"), T.opp);
entry("cd-heading", "$C$, $D$ · forced", 482, T.opp, b4, true);
entry("some-data", "some admissible $u_0$", 536, cue("c3b3", "admissible"), b4);
const forceEntry = entry("smooth-force", "smooth force $f$", 580, cue("c3b3", "smooth"), b4);
forceEntry.style.color = "var(--force)";
entry("chosen-together", "$u_0$, $f$: chosen together", 624, T.chosen, b4);
entry("c-bound", "$C$: bounded energy", 676, cue("c3b3", "no"), b4);
entry("d-periodic", "$D$: periodic velocity and pressure", 720, cue("c3b3", "no"), b4);
entry("one-alternative", "any one alternative", 808, T.any, b5, true);
const diagramNote = KIT.note(content, "schematic-flows", "schematic flows");
diagramNote.style.top = "838px";
const forceChart = KIT.chart(content, svg, {box: "force", x: 280, y: 786, w: 660, h: 44, xr: [0, 1.2], yr: [0, 1.2], yAxis: false});
const forceCurve = forceChart.curve({token: "--force", fn: s => { const u = (s - 0.04) / 1.12; return u <= 0 || u >= 1 ? 0 : Math.exp(4 - 1 / (u * (1 - u))); }, from: 0, to: 1.2});
const breakdownTick = node("line", {x1: forceChart.X(0.55), x2: forceChart.X(0.55), y1: 782, y2: 834, stroke: "var(--ink)", "stroke-width": 2});
const forceWords = text("force-smooth", "smooth, decaying $f$", 500, 838);
forceWords.style.color = "var(--force)";
const breakdownWords = text("breakdown-time", "breakdown", 530, 752);
const allTimeWords = text("all-time", "all $t\\geq0$", 966, 806);
function path(points, st) {
  return points.map((p, i) => { const q = st.project(p); return `${i ? "L" : "M"}${q.x},${q.y}`; }).join("");
}
const cameraStart = T.b1 - 0.25, cameraDuration = 3;
const cellStart = T.alt + D.grid, cellDuration = 2.6;
window.sceneDuration = END;
window.sceneEvents = [...Object.entries(T).map(([what, t]) => ({ t, what, beat: beatAt(t).id })), ...ledger.map(c => ({ t: c.at, what: c.el.textContent, beat: beatAt(c.at).id }))];
window.setTime = function (t) {
  const open = 1, stay = 1 - powerIn(t, END - 0.5, 0.5);
  chapter.setTime(t); if (t >= 2) op(chapter.el, stay); op(content, open * stay); strip.setTime(t, stay); subs.setTime(t);
  const domainK = swap(t, T.four).oldK;
  domains.setAttribute("opacity", domainK);
  torus.orbit([0, 0, 0], 24 + 12 * sineInOut(t, cameraStart, cameraDuration), 22, 7.4);
  torus.setOpacity(open * stay * domainK); torus.render();
  cube.forEach(e => { const a = torus.project(e.p), b = torus.project(e.q); for (const [key, v] of Object.entries({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })) e.el.setAttribute(key, v); });
  circles.forEach(({ sign, el }) => {
    const pts = Array.from({ length: 65 }, (_, i) => [sign * 1.025, 0.22 * Math.cos(i * Math.PI / 32), 0.22 * Math.sin(i * Math.PI / 32)]);
    el.setAttribute("d", path(pts, torus)); el.setAttribute("opacity", powerOut(t, T.torus, D.torus));
  });
  otherPairs.forEach(({ points, el }) => { el.setAttribute("d", path(points, torus)); el.setAttribute("opacity", powerOut(t, T.torus, D.torus)); });
  const travel = Math.max(0, t - T.torus - D.torus), xx = s => ((-0.5 + 0.55 * s + 1) % 2 + 2) % 2 - 1;
  const headX = xx(travel), q = torus.project([headX, 0, 0]);
  const parcelK = powerOut(t, T.torus, D.torus) * powerOut(1 - Math.abs(headX), 0, 0.1);
  parcel.setAttribute("cx", q.x); parcel.setAttribute("cy", q.y); parcel.setAttribute("opacity", parcelK);
  let d = "", prev = null;
  for (let s = Math.max(0, travel - 3); s <= travel; s += 0.015) {
    const x = xx(s), p = torus.project([x, 0, 0]);
    d += `${prev == null || Math.abs(x - prev) > 1 ? "M" : "L"}${p.x},${p.y}`; prev = x;
  }
  wrapTrail.setAttribute("d", d); wrapTrail.setAttribute("opacity", powerOut(t, T.torus, D.torus));
  op(spaceLabel, domainK); op(torusLabel, domainK);
  op(faceLabel, powerOut(t, T.identified, 0.35) * domainK); op(source, domainK);
  const gridK = powerOut(t, T.alt, D.grid);
  headers.setAttribute("opacity", gridK);
  const forceK = KIT.textIn(t, forceStart, 0.45);
  const statusK = powerOut(t, b5, D.settle);
  const setting = {k: gridK, head: 1, rows: 0};
  const smoothAt = cue("c3b2", "smooth"), noAt = cue("c3b3", "no");
  for (const id of ["A", "B", "C", "D"]) {
    const upper = id === "A" || id === "B";
    const appear = powerOut(t, upper ? T.A : T.opp, 0.5);
    setting[id] = {k: 0.3 + 0.7 * appear, dim: 0,
      text: upper ? "smooth forever" : "no global smooth solution",
      textK: KIT.textIn(t, upper ? smoothAt : noAt, 0.4),
      frame: upper ? 0 : statusK,
      status: upper ? "open ($f=0$)" : "announced 2026 · claimed",
      statusK: upper ? powerOut(t, cue("c3b5", "Without"), 0.4) : statusK};
    op(cellLabels[id], appear);
  }
  m.set(setting);
  calm.forEach(({el, x, y, i, j}) => {
    const shift = (t * 8 + i * 7 + j * 5) % 43;
    el.setAttribute("opacity", powerOut(shift, 0, 8) * (1 - powerIn(shift, 35, 8)));
    el.setAttribute("d", `M ${x + shift} ${y} q 13 -6 28 0`);
  });
  const slot = (b5 - b4) / 4;
  for (const [i, id] of ["A", "B", "C", "D"].entries())
    op(m.cells[id].focus, gate(t, b4 + i * slot, b4 + (i + 1) * slot - 0.25, 0.3));
  for (const id of ["C", "D"]) {
    const {st, flow} = small[id];
    st.orbit([0, 0, 0], -12 + 10 * sineInOut(t, cellStart, cellDuration), 22, 9.8);
    flow.setTime(t, 1); st.setOpacity(1); st.render();
  }
  ledger.forEach(({el, at, next}) => op(el, KIT.entryIn(t, el, at)));
  op(diagramNote, gridK);
  forceChart.setK(forceK); forceCurve.set(null, forceK);
  breakdownTick.setAttribute("opacity", forceK * powerOut(t, T.break, 0.3));
  op(forceWords, forceK);
  op(breakdownWords, forceK * powerOut(t, T.break, 0.3));
  op(allTimeWords, forceK * powerOut(t, cue("c3b3", "after"), 0.35));
};
