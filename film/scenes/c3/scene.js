/* Whole space, the periodic cube and four alternatives. */
import { stage3d } from "../three3d/stage3d.js";
import { makeAlternatives } from "../ns/alternatives.js";

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
  energy: need("c3b3", "bounded", 0.4, "C excludes smooth solutions with bounded energy"),
  periodic: need("c3b3", "periodic", 0.4, "D excludes periodic smooth solutions"),
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
  energy: cue("c3b3", "bounded"), periodic: cue("c3b3", "periodic"),
  break: cue("c3b3", "breakdown"),
  any: cue("c3b4", "any"),
  settle: cue("c3b5", "settle"),
  forever: cue("c3b5", "forever"),
  tail: beatEnd("c3b5"),
};

const { op, powerOut, powerIn, sineInOut, gate, swap, mix } = KIT;
const END = beatHoldEnd("c3b5");
const content = KIT.layer();
const svg = KIT.overlay(content);
const chapter = chapterLabel({ n: 3, title: "Four alternatives", intro: 2.0 });
const strip = mountStripJX(document.body, { labels: { c3b5: "Proved: forced breakdown does not settle the unforced alternatives" } });
const subs = mountSubtitles(document.body, window.__BEATS__);
const map = magnitudeMap();
const node = (tag, attrs, parent = svg) => KIT.svgEl(parent, tag, attrs);
const thin = {"vector-effect": "non-scaling-stroke"};

/* The two domains. Drawn in one group: first across the frame, then moved into the left column beside the table. */
const domains = node("g", {});
const spaceDots = node("g", {}, domains);
for (let i = 0; i < 15; i++) for (let j = 0; j < 20; j++) {
  const x = 132 + i * 34, y = 170 + j * 32;
  const edge = Math.min(x - 120, 650 - x, y - 150, 810 - y);
  node("circle", { cx: x, cy: y, r: 2.4, fill: "var(--ink-muted)", opacity: 0.62 * powerOut(edge, 0, 110) }, spaceDots);
}
const torus = stage3d({ left: 696, top: 170, width: 536, height: 580, fov: 28 });
const cube = [];
for (let axis = 0; axis < 3; axis++) for (const a of [-1, 1]) for (const b of [-1, 1]) {
  const p = [0, 0, 0], q = [0, 0, 0]; p[axis] = -1; q[axis] = 1;
  p[(axis + 1) % 3] = q[(axis + 1) % 3] = a;
  p[(axis + 2) % 3] = q[(axis + 2) % 3] = b;
  cube.push({ p, q, el: node("line", { stroke: "var(--ink-muted)", "stroke-width": 2, ...thin }, domains) });
}
const circles = [-1, 1].map(sign => ({ sign, el: node("path", { fill: "none", stroke: "var(--ink-muted)", "stroke-width": 2, ...thin }, domains) }));
const otherPairs = [];
for (const sign of [-1, 1]) {
  otherPairs.push({ points: [[-0.16, sign * 1.025, -0.12], [0.16, sign * 1.025, -0.12], [0, sign * 1.025, 0.17], [-0.16, sign * 1.025, -0.12]], el: node("path", { fill: "none", stroke: "var(--rule)", "stroke-width": 2, ...thin }, domains) });
  otherPairs.push({ points: [[-0.14, -0.14, sign * 1.025], [0.14, -0.14, sign * 1.025], [0.14, 0.14, sign * 1.025], [-0.14, 0.14, sign * 1.025], [-0.14, -0.14, sign * 1.025]], el: node("path", { fill: "none", stroke: "var(--rule)", "stroke-width": 2, ...thin }, domains) });
}
const wrapTrail = node("path", { fill: "none", stroke: map.css(0.55), "stroke-width": 2.4, "stroke-linecap": "round", ...thin }, domains);
const parcel = node("circle", { r: 4, fill: map.css(0.55), stroke: "var(--paper)", "stroke-width": 2, ...thin }, domains);
const text = (name, words, x, y, kind = "aux", extra = {}) => KIT.text(content, name, words, { x, y, kind, ...extra });
const spaceLabel = text("whole-space", "all of space $\\mathbb{R}^3$", 120, 132, "label");
const torusLabel = text("torus", "torus $\\mathbb{T}^3$", 736, 132, "label");
const faceLabel = text("faces", "opposite faces identified", 736, 768);
const source = KIT.note(content, "source", "Fefferman, official problem description");
/* Domain group placement: an affine map x -> s x + (tx, ty). Wide in c3b1, then the left column (two heights). */
const WIDE = { s: 1, tx: 284, ty: 0 };
const S = 0.58;
const LEFT_MID = { s: S, tx: 120 - 120 * S, ty: 300 - 132 * S };
const LEFT_TOP = { s: S, tx: 120 - 120 * S, ty: 112 - 132 * S };
const lerp = (a, b, k) => ({ s: mix(a.s, b.s, k), tx: mix(a.tx, b.tx, k), ty: mix(a.ty, b.ty, k) });
const place = (el, g, x, y) => { el.style.left = (g.tx + g.s * x).toFixed(2) + "px"; el.style.top = (g.ty + g.s * y).toFixed(2) + "px"; };

/* The table of Figure 1, shared with c1 and c11; c3 builds the official conditions into its cells. */
const alt = makeAlternatives(content, {x: 830, y: 88, w: 970, hAB: 214, hCD: 254, cells: {
  A: {text: "every smooth, divergence-free\ninitial velocity; force = 0", cls: "rapid decay, bounded energy", status: "open"},
  B: {text: "every smooth, divergence-free\ninitial velocity; force = 0", status: "open"},
  C: {text: "admissible data, smooth force,\nchosen together;\nno global smooth solution", cls: "none with bounded energy"},
  D: {text: "admissible data, smooth force,\nchosen together;\nno global smooth solution", cls: "none that is periodic"},
}});

/* The force condition, under the domains in the left column. */
const b2 = beatStart("c3b2"), b3 = beatStart("c3b3"), b4 = beatStart("c3b4"), b5 = beatStart("c3b5");
const forceStart = cue("c3b3", "must");
const SHIFT = KIT.sentenceStart(forceStart) - 0.75;   // the domains rise in the pause after "periodic", before the force sentence
const forceChart = KIT.chart(content, svg, {box: "force", x: 150, y: 646, w: 500, h: 52, xr: [0, 1.2], yr: [0, 1.2], yAxis: false});
const forceCurve = forceChart.curve({token: "--force", fn: s => { const u = (s - 0.04) / 1.12; return u <= 0 || u >= 1 ? 0 : Math.exp(4 - 1 / (u * (1 - u))); }, from: 0, to: 1.2});
const breakdownTick = node("line", {x1: forceChart.X(0.55), x2: forceChart.X(0.55), y1: 636, y2: 708, stroke: "var(--ink)", "stroke-width": 2});
const forceWords = text("force-smooth", "smooth, decaying $f$ (schematic)", 150, 716, "aux", {color: "--force"});
const breakdownWords = KIT.text(content, "breakdown-time", "breakdown", {x: forceChart.X(0.55) - 100, y: 596, w: 200, align: "center", kind: "aux"});
const allTimeWords = text("all-time", "all $t\\geq0$", 664, 670);
const anyOne = text("any-one", "any one alternative is accepted", 120, 776, "strong");
const cameraStart = T.b1 - 0.25, cameraDuration = 3;
window.sceneDuration = END;
window.sceneEvents = Object.entries(T).map(([what, t]) => ({ t, what, beat: beatAt(t).id }));
function path(points, st) {
  return points.map((p, i) => { const q = st.project(p); return `${i ? "L" : "M"}${q.x},${q.y}`; }).join("");
}
window.setTime = function (t) {
  const stay = 1 - powerIn(t, END - 0.5, 0.5);
  chapter.setTime(t); if (t >= 2) op(chapter.el, stay); op(content, stay); strip.setTime(t, stay); subs.setTime(t);
  /* domains: wide, then into the left column as the table arrives, then up to make room for the force */
  const toLeft = sineInOut(t, T.four, 0.9), up = sineInOut(t, SHIFT, 0.8);
  const g = lerp(lerp(WIDE, LEFT_MID, toLeft), LEFT_TOP, up);
  domains.setAttribute("transform", `translate(${g.tx.toFixed(3)} ${g.ty.toFixed(3)}) scale(${g.s.toFixed(4)})`);
  /* labels keep their size: the domain labels stay bottom-aligned with their original baseline */
  place(spaceLabel, g, 120, 172); place(torusLabel, g, 736, 172); place(faceLabel, g, 736, 768);
  for (const el of [spaceLabel, torusLabel]) el.style.top = (parseFloat(el.style.top) - 40).toFixed(2) + "px";
  torus.orbit([0, 0, 0], 24 + 12 * sineInOut(t, cameraStart, cameraDuration), 22, 7.4);
  torus.setOpacity(0); torus.render();
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
  op(spaceLabel, 1); op(torusLabel, 1);
  op(faceLabel, powerOut(t, T.identified, 0.35)); op(source, 1);

  /* the table, sentence by sentence */
  const gridK = KIT.textIn(t, T.alt, D.grid);
  const abK = KIT.textIn(t, T.A, D.cellA), aClass = KIT.textIn(t, T.decay, D.decay);
  const cdK = KIT.textIn(t, T.opp, D.cd);
  const cClass = powerOut(t, cue("c3b3", "whole"), 0.4), dClass = powerOut(t, cue("c3b3", "torus"), 0.4);
  const claimK = KIT.textIn(t, T.settle, D.settle), openK = KIT.textIn(t, cue("c3b5", "Without"), 0.4);
  const slot = (b5 - b4) / 4, focus = id => gate(t, b4 + "ABCD".indexOf(id) * slot, b4 + ("ABCD".indexOf(id) + 1) * slot - 0.25, 0.3);
  alt.set({k: gridK, visc: gridK, heads: gridK, row0: abK, row1: cdK, claim: claimK,
    A: {k: abK, cls: aClass, status: openK, focus: focus("A")},
    B: {k: abK, status: openK, focus: focus("B")},
    C: {k: cdK, cls: cClass, outline: 1 - claimK, focus: focus("C")},
    D: {k: cdK, cls: dClass, outline: 1 - claimK, focus: focus("D")}});

  const forceK = KIT.textIn(t, forceStart, D.strip);
  forceChart.setK(forceK); forceCurve.set(null, forceK);
  breakdownTick.setAttribute("opacity", forceK * powerOut(t, T.break, 0.3));
  op(forceWords, forceK); op(breakdownWords, forceK * powerOut(t, T.break, 0.3)); op(allTimeWords, forceK);
  op(anyOne, KIT.textIn(t, T.any, D.foot));
};
