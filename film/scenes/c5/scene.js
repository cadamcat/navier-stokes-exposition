/* Exact rescaling of a frozen Gaussian swirl, followed by a schematic contracting core. */
import { stage3d, THREE } from "../three3d/stage3d.js";
import { screenRight } from "../ns/core3d.js";
import { makeParticleCore } from "../ns/trails.js";
import { makeArrow, makeDoubleArrow } from "../ns/arrows.js";
import { makeSwirl } from "./swirl.js";

installBeats(window.__BEATS__);

const INTRO = need("c5b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word");
const D_LAM12 = need("c5b1", "space", 1.2, "scale runs from 1 to 2");
const D_CAM1 = need("c5b1", "Rescale", 12, "fixed comparison view");
const D_CLOCK = need("c5b1", "time", 0.45, "time scale");
const D_VEL = need("c5b1", "velocity", 0.4, "velocity highlight");
const D_EQ = need("c5b1", "equations", 0.5, "pressure and force");
const D_L3 = need("c5b2", "L", 0.45, "L3 bar");
const D_E = need("c5b2", "energy", 0.45, "energy bar");
const D_LAM23 = need("c5b2", "packing", 1.2, "scale runs from 2 to 3");
const D_SUPER = need("c5b2", "supercritical", 0.4, "critical labels");
const D_SWAP = need("c5b3", "Put", 1.2, "field fades, core draws");
const D_TBAR = need("c5b3", "tau", 0.45, "time left bar");
const D_R = need("c5b3", "radius", 0.5, "radius arrow");
const D_LEN = need("c5b3", "length", 0.5, "length arrow");
const D_U = need("c5b3", "speed", 0.5, "speed label");
const D_PROD = need("c5b4", "Multiply", 2.55, "core energy product");
const D_SC = need("c5b4", "scales", 0.45, "exponent");
const D_ZERO = need("c5b4", "zero", 0.45, "tends to zero");
const D_PEAK = need("c5b4", "peak", 0.45, "peak and core energy bars");
const OUT = need("c5b4", "tail", 0.8, "picture fades out");


const { Z, powerOut, powerIn, linear, gate, swap, op } = KIT;
const T = {
  b1: beatStart("c5b1"), b2: beatStart("c5b2"),
  b3: beatStart("c5b3"), b4: beatStart("c5b4"),
  end: beatHoldEnd("c5b4"),
  space: cue("c5b1", "space"), time: cue("c5b1", "time"),
  velocity: cue("c5b1", "velocity"), equations: cue("c5b1", "equations"),
  L3: cue("c5b2", "L"), energy: cue("c5b2", "energy"),
  packing: cue("c5b2", "packing"), super: cue("c5b2", "supercritical"),
  tau: cue("c5b3", "tau"), radius: cue("c5b3", "radius"),
  length: cue("c5b3", "length"), speed: cue("c5b3", "speed"),
  multiply: cue("c5b4", "Multiply"), by: cue("c5b4", "by"),
  volume: cue("c5b4", "volume"), scales: cue("c5b4", "scales"),
  zero: cue("c5b4", "zero"), peak: cue("c5b4", "peak"),
};
const CORE_IN = T.b3 + D_SWAP / 2;
const SLENDER = beatEnd("c5b3") - 1;
const chapter = chapterLabel({ n: 5, title: "Energy and scaling", intro: 2.0 });
const content = KIT.layer();
const svg = KIT.overlay(content);
const speedMap = magnitudeMap();
const KATEX = { throwOnError: true, strict: false, output: "html" };

function text(name, words, y, options = {}) {
  return KIT.text(content, name, words, { x: Z.rail.x, y, w: Z.rail.w, ...options });
}
function formula(name, tex, y, h = 80) {
  return KIT.formula(content, name, tex, { x: Z.rail.x, y, w: Z.rail.w, h });
}
function math(el, tex) {
  if (el.dataset.tex === tex) return;
  el.dataset.tex = tex;
  katex.render(tex, el, KATEX);
}
const ledger = [];
function entry(name, words, y, at, next, topic, options = {}) {
  const el = text(name, words, y, options);
  ledger.push({ el, at, next, topic });
  return el;
}
const fieldNote = KIT.note(content, "exact-field", "smooth, divergence-free Gaussian field · exact formula");
const frozenNote = text("frozen-field", "tracers: frozen-field advection\nexact rescaling", 746, { x: 120, w: 700 });
const fieldReference = text("initial-scale", "faint: $\\lambda=1$ reference", 690, { x: 120, w: 650 });
const lamRead = text("lambda-readout", "$\\lambda=1.0$", 112, { kind: "label" });
const eqU = formula("scale-u", "\\begin{aligned}&\\htmlClass{term-u}{u}_\\lambda(x,t)\\\\&=\\lambda\\,\\htmlClass{term-u}{u}(\\lambda x,\\lambda^2t)\\end{aligned}", 162, 138);
colorTerm(eqU, "u", "--velocity");
entry("velocity-times", "velocity $\\times\\lambda$", 308, T.velocity, T.equations, "field", { color: "--velocity" });
entry("time-correspondence", "input $\\lambda^2t$; event time $/\\lambda^2$", 352, T.time, T.b2, "field");
entry("scale-p", "$p_\\lambda=\\lambda^2p(\\lambda x,\\lambda^2t)$", 400, T.equations, T.b2, "field");
entry("scale-f", "$f_\\lambda=\\lambda^3f(\\lambda x,\\lambda^2t)$", 448, T.equations, T.b2, "field", { color: "--force" });
entry("same-viscosity", "same $\\nu$", 496, cue("c5b1", "same"), T.b2, "field");
entry("norms-whole-space", "norms and energy over $\\mathbb{R}^3$", 548, T.b2, T.packing, "field");
entry("l3-identity", "$\\|u_\\lambda(t)\\|_{L^3}=\\|u(\\lambda^2t)\\|_{L^3}$", 592, T.L3, T.packing, "field", { color: "--velocity" });
entry("energy-identity", "$E_\\lambda(t)=E(\\lambda^2t)/\\lambda$", 640, T.energy, T.packing, "field", { color: "--energy" });
const normRead = text("norm-value", "$\\|u_\\lambda\\|_{L^3}=0$", 686, { color: "--velocity", w: 254 });
const energyRead = text("energy-value", "$E_\\lambda=0$", 686, { color: "--energy", x: 1510, w: 290 });
const critical = entry("critical", "critical", 794, T.super, T.end, "field", { x: 1256, w: 220, color: "--velocity" });
const supercritical = entry("supercritical", "supercritical", 794, T.super, T.end, "field", { x: 1510, w: 290, color: "--energy" });

/* The core laws and their drawing range remain beside the energy calculation. */
entry("model-label", "schematic · not a material volume", 112, CORE_IN, T.radius, "core");
const tauRead = text("time-left", "$\\tau=1-t=1.00$", 156, { kind: "label" });
entry("drawn-h", "drawn $h_{\\mathrm{draw}}=0.2$ · exaggerated", 220, CORE_IN, T.radius, "core");
entry("source-h", "source $0<h<0.01$", 264, CORE_IN, T.radius, "core");
entry("source-conditions", "with further conditions", 302, CORE_IN, T.radius, "core");
entry("radius-law", "radius $R\\sim\\tau^{1/2}$", 356, T.radius, T.length, "core", { kind: "label" });
entry("length-law", "half-length $L\\sim\\tau^{1/2-h}$", 408, T.length, T.speed, "core", { kind: "label" });
entry("speed-law", "speed $U\\sim\\tau^{-1/2-h}$", 460, T.speed, T.b4, "core", { kind: "label", color: "--velocity" });
entry("slender-law", "$R/L\\sim\\tau^h\\to0$", 512, SLENDER, T.b4, "core");
const tagR = text("tag-R", "$R$", 0, { x: 0, w: 50, kind: "label" });
const tagL = text("tag-2L", "$2L$", 0, { x: 0, w: 65, kind: "label" });
const eqProd = formula("core-energy-power", "\\begin{aligned}&\\htmlClass{term-uu}{U^2}\\htmlClass{term-vol}{\\cdot R^2L}\\\\&\\htmlClass{term-exponent}{\\sim\\tau^{1/2-3h}}\\htmlClass{term-zero}{\\to0}\\end{aligned}", 550, 138);
colorTerm(eqProd, "uu", "--velocity");
const peakLimit = formula("peak-limit", "\\htmlClass{term-U}{U}\\to\\infty", 690, 60);
peakLimit.el.style.width = "235px";
colorTerm(peakLimit, "U", "--velocity");
/* The name sits beside the product it names. */
eqProd.el.style.width = "330px";
const coreEnergy = text("core-energy-name", "core energy", 562, { x: 1604, w: 196, color: "--energy", kind: "label" });
entry("exponent-check", "exact exponent check", 754, T.b4 + 3.35, T.peak, "core");
entry("scale-laws-only", "scale laws, not the full solution", 796, T.b4 + 3.35, T.peak, "core");
const clockNote = text("tracer-clock", "tracer clock $\\times0.3$", 746, { x: 120, w: 650 });
const coreReference = text("core-reference", "faint outline:\ncore at $\\tau=1$", 652, { x: 120, w: 280 });
const fullEnergy = KIT.note(content, "full-energy", "full energy bound: claimed (manuscript, Lemma 10.4)");

function svgEl(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  svg.appendChild(el);
  return el;
}
const barL3 = svgEl("rect", { fill: "var(--velocity)", width: 48, height: 0 });
const barE = svgEl("rect", { fill: "var(--energy)", width: 48, height: 0 });
const timeTrack = svgEl("rect", { x: Z.rail.x, y: 200, width: 300, height: 4, fill: "var(--rule)" });
const timeFill = svgEl("rect", { x: Z.rail.x, y: 200, width: 300, height: 4, fill: "var(--ink-muted)" });
function rectBar(el, x, h, k) {
  el.setAttribute("x", x);
  el.setAttribute("y", 782 - h);
  el.setAttribute("height", h);
  el.setAttribute("opacity", k);
}

const st = stage3d({ left: Z.picture.x, top: Z.picture.y, width: Z.picture.w, height: Z.picture.h, fov: 28 });
/* Opening: one slow orbit about the vertical axis (eased in from rest, peak about 4 deg/s) so the frozen field reads
   as 3D; it settles on the comparison view before lambda starts to change, and the camera stays locked after that. */
const cam = t => t < CORE_IN ? { az: KIT.mix(-22, -8, KIT.sineInOut(t, 0, T.space - 0.15)), el: 22, dist: 7.7 } : { az: -10, el: 10, dist: 5.55 };
let swirl, core, radArrow, lenArrow;
const fieldLegend = KIT.legend(content, {
  box: "field-speed-legend", y: 780, map: speedMap, label: "speed", unit: "fixed · log scale",
  ticks: [0, 1.3].map(v => ({ u: Math.log1p(5 * v) / Math.log(7.5), text: String(v) })),
});
const coreLegend = KIT.legend(content, {
  box: "core-speed-legend", y: 780, map: speedMap, label: "speed / U(1)", unit: "fixed · log scale",
  ticks: [0, 9].map(v => ({ u: Math.log1p(v) / Math.log(10), text: String(v) })),
});
/* The normalization U(1) belongs to the same exact mathematical label as speed. */
KIT.fill(coreLegend.el.querySelector(".colorbar-label"), "$|u|/U(1)$");
KIT.fill(fieldLegend.el.querySelector(".colorbar-label"), "$|u|$");
for (const legend of [fieldLegend, coreLegend]) {
  legend.el.style.left = "888px";
  legend.el.style.top = "738px";
}


function lambdaAt(t) {
  if (t >= T.packing) return 2 + linear(t, T.packing, D_LAM23);
  return 1 + linear(t, T.space, D_LAM12);
}
function tauAt(t) {
  const start = cue("c5b3", "shrinks");
  if (t < T.b4) return 1 - 0.9 * linear(t, start, beatHoldEnd("c5b3") - start);
  const resume = cue("c5b4", "grows");
  return 0.1 - 0.05 * linear(t, resume, beatEnd("c5b4") - resume);
}
const strip = mountStripJX(document.body, {
  labels: { c5b4: "Computed: exponents from the claimed schedule; applying them to the profile is heuristic" },
});
const subs = mountSubtitles(document.body, window.__BEATS__);
window.sceneDuration = Math.ceil(window.__BEATS__.duration * 30 - 1e-6) / 30;
window.sceneEvents = Object.entries(T).map(([what, t]) => ({
  t, what, beat: t >= T.b4 ? "c5b4" : t >= T.b3 ? "c5b3" : t >= T.b2 ? "c5b2" : "c5b1",
}));
window.c5Diagnostics = { fieldMoments: null, cacheBytes: 0, camera: cam, lambdaAt, tauAt,
  referenceBounds: () => {
    const points = [];
    for (let i = 0; i <= 256; i++) {
      const a = i * 2 * Math.PI / 256;
      for (const p of [[2.08 * Math.cos(a), 0, 2.08 * Math.sin(a)], [2.08 * Math.cos(a), 1.2 * Math.sin(a), 0]]) {
        points.push(st.project(swirl.group.localToWorld(new THREE.Vector3(...p)).toArray()));
      }
    }
    return { x0: Math.min(...points.map(p => p.x)), x1: Math.max(...points.map(p => p.x)), y0: Math.min(...points.map(p => p.y)), y1: Math.max(...points.map(p => p.y)) };
  },
};
/* State captions wait for the corresponding picture. */
["model-label", "drawn-h", "source-h", "source-conditions", "slender-law", "exponent-check", "scale-laws-only"].forEach(name => { content.querySelector(`[data-box="${name}"]`).dataset.stateArrival = "true"; });
window.setTime = function (t) {
  const stay = 1 - powerIn(t, T.end - 0.5, 0.5);
  const shot = swap(t, CORE_IN);
  const b3 = swap(t, T.b3 + 0.25);
  const fieldK = shot.oldK;
  const coreK = shot.newK;
  const lam = lambdaAt(t), tau = tauAt(t);
  const c = cam(t);
  st.orbit([0, 0, 0], c.az, c.el, c.dist);
  swirl.setTime(Math.min(Math.max(0, t), CORE_IN), fieldK);
  core.setTime(Math.max(CORE_IN, Math.min(t, T.end)), coreK);
  /* No hard outline on the particle core: hide the kit's velocity-coloured silhouette; the faint tau = 1 reference stays. */
  core.group.children.forEach(mesh => { if (mesh.material?.uniforms?.halfWidth && mesh !== core.ghostContour?.mesh) mesh.visible = false; });

  const coreWidths = core.trails.mesh.geometry.attributes.width;
  const coreTint = core.trails.mesh.geometry.attributes.tint;
  const density = 0.22 + 0.78 * Math.pow(tau, 0.8);
  const strength = 0.55 + 0.45 * Math.pow(tau, 0.8);
  for (let i = 0; i < coreWidths.array.length; i++) {
    coreWidths.array[i] *= density;
    coreTint.array[i * 4 + 3] *= strength;
  }
  coreWidths.needsUpdate = coreTint.needsUpdate = true;

  const rK = powerOut(t, T.radius, D_R) * coreK;
  const lK = powerOut(t, T.length, D_LEN) * coreK;
  const m = core.metrics(t);
  const right = screenRight(c.az);
  const side = Math.max(1.65 * m.R, 0.30);
  radArrow.place([0, 0, 0], [-m.R * right[0], 0, -m.R * right[2]]);
  radArrow.setOpacity(rK * (1 - 0.35 * powerOut(t, T.length - 0.3, 0.35)));
  lenArrow.place([side * right[0], -m.L, side * right[2]], [side * right[0], m.L, side * right[2]]);
  lenArrow.setOpacity(lK * (1 - 0.35 * powerOut(t, T.speed - 0.3, 0.35)));
  core.group.updateMatrixWorld(true);
  const projected = p => st.project(core.group.localToWorld(new THREE.Vector3(...p)).toArray());
  const pR = projected([-m.R * right[0], 0, -m.R * right[2]]);
  const pL = projected([side * right[0], -0.4 * m.L, side * right[2]]);
  tagR.style.left = (pR.x - 76).toFixed(2) + "px";
  tagR.style.top = (pR.y - 24).toFixed(2) + "px";
  tagL.style.left = (pL.x + 22).toFixed(2) + "px";
  tagL.style.top = (pL.y - 14).toFixed(2) + "px";
  /* Projected dimension labels follow the shrinking reference scales. */
  op(tagR, rK * stay);
  op(tagL, lK * stay);
  st.canvas.style.maskImage = t < CORE_IN ? "linear-gradient(to bottom, var(--paper) 85%, transparent 94%)" : "none";
  st.render();
  st.setOpacity(stay);

  chapter.setTime(t);
  if (t >= chapter.intro) op(chapter.el, stay);
  const field = b3.oldK;
  const old = 1;
  math(lamRead, "\\lambda=" + lam.toFixed(1));
  op(lamRead, powerOut(t, T.b1, 0.35) * field * old * stay);
  op(eqU.el, KIT.textIn(t, T.space) * field * old * stay); eqU.setTime(t);
  op(fieldNote, field * stay);
  op(frozenNote, powerOut(t, T.space, 0.35) * field * stay);
  op(fieldReference, powerOut(t, cue("c5b1", "It"), 0.35) * field * stay);
  ledger.forEach(({el, at, next, topic}) => {
    const topicK = topic === "field" ? field : coreK;
    op(el, KIT.entryIn(t, el, at) * topicK * stay);
  });
  const bars = powerOut(t, T.packing, 0.35) * field;
  math(normRead, "\\|u_\\lambda\\|_{L^3}=" + swirl.moments.l3.toFixed(3));
  math(energyRead, "E_\\lambda=" + (swirl.moments.energy / lam).toFixed(3));
  op(normRead, bars * stay); op(energyRead, bars * stay);
  rectBar(barL3, 1320, 55, bars * stay);
  rectBar(barE, 1590, 55 / lam, bars * stay);

  math(tauRead, "\\tau=1-t=" + tau.toFixed(2));
  const clockK = powerOut(t, T.tau, D_TBAR) * coreK;
  op(tauRead, clockK * stay);
  timeTrack.setAttribute("opacity", clockK * stay);
  timeFill.setAttribute("opacity", clockK * stay);
  timeFill.setAttribute("width", 300 * tau);
  op(clockNote, coreK * stay);
  op(coreReference, coreK * stay);
  op(fullEnergy, powerOut(t, T.b4, 0.35) * coreK * stay);
  op(eqProd.el, powerOut(t, T.multiply, 0.35) * coreK * stay); eqProd.setTime(t);
  for (const [name, at] of [["uu", T.multiply], ["vol", T.volume], ["exponent", T.scales], ["zero", T.zero]]) {
    for (const term of eqProd.el.querySelectorAll(".term-" + name)) term.style.opacity = KIT.textIn(t, at);
  }
  const final = KIT.textIn(t, T.peak, D_PEAK) * coreK;
  op(peakLimit.el, final * stay); peakLimit.setTime(t);
  op(coreEnergy, KIT.textIn(t, T.multiply) * coreK * stay);
  fieldLegend.setOpacity(powerOut(t, cue("c5b1", "It"), 0.35) * field * stay);
  coreLegend.setOpacity(powerOut(t, T.speed, D_U) * coreK * stay);
  strip.setTime(t, stay);
  subs.setTime(t);
};

window.sceneReady = function () {
  if (core) return;
  swirl = makeSwirl(st, { lambdaAt, duration: CORE_IN, map: speedMap });
  swirl.group.scale.setScalar(1.1);
  core = makeParticleCore(st, { tauAt, startTime: CORE_IN, duration: T.end - CORE_IN, map: speedMap, gap: 0.035, scale: 0.90, clock: 0.3, count: 1040, width: 5.2, trailLength: 3 });

  radArrow = makeArrow(st, core.group, { token: "--ink", radius: 0.0045, lineHalo: 0, paperHead: false });
  lenArrow = makeDoubleArrow(st, core.group, { token: "--ink", radius: 0.0045 });
  window.c5Diagnostics.fieldMoments = swirl.moments;
  window.c5Diagnostics.cacheBytes = swirl.cacheBytes + core.cacheBytes;
};
