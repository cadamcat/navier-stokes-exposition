/* Schematic envelopes, the conditional compactness contradiction, and separated periodic copies. */
import { stage3d, THREE, tokenColor } from "../three3d/stage3d.js";
import { makeParticleCore } from "../ns/trails.js";

installBeats(window.__BEATS__);
const INTRO = need("c9b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word");
const AXIS = need("c9b1", "Now", 0.8, "time axis and track names");
const FORCE = need("c9b1", "force", 1.0, "force envelope draws through time one");
const VEL = need("c9b1", "velocity", 1.0, "peak speed rises to the line at time one");
const EN = need("c9b1", "energy", 1.0, "energy curve levels off under its ceiling");
const VTRACK = need("c9b2", "another", 0.9, "hypothetical solution continues past time one");
const BRACKET = need("c9b2", "comparison", 0.7, "bracket over the interval before time one");
const DECAY = need("c9b2", "decay", 0.5, "no decay line");
const SHIFT = need("c9b3", "The", 0.6, "tracks make room on the right");
const RECT = need("c9b3", "compact", 0.6, "compact space-time rectangle");
const COLLIDE = need("c9b3", "unbounded", 0.9, "the two labels meet and the cross appears");
const GRID = need("c9b3", "C", 0.5, "grid cell C lights");
const LEAVE = need("c9b4", "For", 0.8, "tracks leave before the cell");
const SHRINK = need("c9b4", "shrink", 1.0, "support scales into one cell");
const ORBIT = need("c9b4", "shrink", 6.5, "camera turns from azimuth 8 to 28");
const REPEAT = need("c9b4", "repeat", 2.1, "neighbouring cells appear ring by ring");
const GAP = need("c9b4", "interact", 0.7, "a gap arrow shows the copies stay apart");
const MOVE = Math.max(need("c9b4", "comparison", 0.7, "cell moves left and D lights"), 1.2);
const OUT = need("c9b4", "tail", 0.8, "picture fades out");

const { Z, op, powerOut, powerIn, sineInOut, gate, swap, mix, svgEl } = KIT;
const T = {
  b1: beatStart("c9b1"), b2: beatStart("c9b2"), b3: beatStart("c9b3"), b4: beatStart("c9b4"),
  force: cue("c9b1", "force"), velocity: cue("c9b1", "velocity"), energy: cue("c9b1", "energy"),
  another: cue("c9b2", "another"), same: cue("c9b2", "same"), forever: cue("c9b2", "forever"),
  manuscript: cue("c9b2", "manuscript's"), compare: cue("c9b2", "comparison"), decay: cue("c9b2", "decay"),
  bounded: cue("c9b3", "bounded"), compact: cue("c9b3", "compact"), equal: cue("c9b3", "equal"), unbounded: cue("c9b3", "unbounded"),
  given: cue("c9b3", "Given"), gives: cue("c9b3", "gives"), C: cue("c9b3", "C"),
  shrink: cue("c9b4", "shrink"), repeat: cue("c9b4", "repeat"), interact: cue("c9b4", "interact"),
  periodic: cue("c9b4", "periodic"), comparison: cue("c9b4", "comparison"), finishes: cue("c9b4", "finishes"),
  end: beatHoldEnd("c9b4"),
};
const chapter = chapterLabel({ n: 9, title: "From a singular branch to C and D", intro: 2.0 });
const content = KIT.layer();
const plot = KIT.layer(content);
const svg = KIT.overlay(plot);
const map = magnitudeMap();
const A = 0.35, B = 1.45, MAX = 1.62, EXIT = 0.985;
function bell(t) {
  if (t <= A || t >= B) return 0;
  const z = (t - A) / (B - A);
  return Math.exp(4 - 1 / (z * (1 - z)));
}
const raw = s => s <= A ? 0 : Math.pow((1 - A) / Math.max(1e-5, 1 - s), 0.7) - 1;
const speed = s => raw(s) / raw(EXIT);
const energy = s => s <= A ? 0 : 0.74 * (1 - Math.exp(-7 * (s - A)));
const axes = KIT.chart(plot, svg, { box: "time", x: 120, y: 130, w: 1112, h: 640, xr: [0, MAX], yr: [0, 1], yAxis: false,
  xTicks: [{ v: 0, text: "0" }, { v: A, text: "$a$" }, { v: 1, text: "1" }, { v: B, text: "$b$" }] });
const X = axes.X;
const tickZero = plot.querySelector('[data-box="time-x0"]');
tickZero.style.left = "120px";
tickZero.style.width = "60px";
tickZero.style.textAlign = "left";
const compactBand = svgEl(svg, "rect", { x: X(0), y: 322, width: X(1) - X(0), height: 210, fill: "var(--ink-muted)", "fill-opacity": 0.07, opacity: 0 });
const forceChart = KIT.chart(plot, svg, { x: 120, y: 140, w: 1112, h: 100, xr: [0, MAX], yr: [0, 1.2], yAxis: false });
const forceCurve = forceChart.curve({ token: "--force", from: 0, to: MAX, fn: bell, width: 3 });
const forceFill = svgEl(svg, "path", { fill: "var(--force)", stroke: "none", opacity: 0 });
svg.insertBefore(forceFill, forceCurve.el);
const velocityChart = KIT.chart(plot, svg, { x: 120, y: 340, w: 1112, h: 180, xr: [0, MAX], yr: [0, 1], yAxis: false });
const velocityCurve = velocityChart.curve({ token: "--velocity", from: 0, to: EXIT, fn: speed });
const vExtension = velocityChart.curve({ token: "--ink-muted", from: 1, to: 1.5, fn: s => 0.88 - 0.15 * sineInOut(s, 1, 0.5), dashed: true });
const energyChart = KIT.chart(plot, svg, { x: 120, y: 596, w: 1112, h: 112, xr: [0, MAX], yr: [0, 1], yAxis: false });
const forceGhost = forceChart.curve({ token: "--force", from: 0, to: MAX, fn: bell });
const velocityGhost = velocityChart.curve({ token: "--velocity", from: 0, to: EXIT, fn: speed });
const energyGhost = energyChart.curve({ token: "--energy", from: 0, to: 1, fn: energy });
const energyCurve = energyChart.curve({ token: "--energy", from: 0, to: 1, fn: energy });
const ceiling = svgEl(svg, "line", { x1: 120, x2: X(1), y1: energyChart.Y(0.9), y2: energyChart.Y(0.9), stroke: "var(--energy)", "stroke-width": 2, "stroke-dasharray": "9 8", opacity: 0 });
const asymptote = svgEl(svg, "line", { x1: X(1), x2: X(1), y1: 340, y2: 520, stroke: "var(--ink-muted)", "stroke-width": 2, "stroke-dasharray": "9 8", opacity: 0 });
const equality = svgEl(svg, "rect", { x: 120, y: 759, width: X(1) - X(0), height: 22, fill: "var(--velocity)", "fill-opacity": 0.12, opacity: 0 });
const cross = svgEl(svg, "g", { stroke: "var(--ink)", "stroke-width": 3.5, "stroke-linecap": "round", opacity: 0 });
svgEl(cross, "line", { x1: X(1) - 15, y1: 322, x2: X(1) + 15, y2: 352 });
svgEl(cross, "line", { x1: X(1) + 15, y1: 322, x2: X(1) - 15, y2: 352 });
const fName = KIT.text(plot, "f-label", "$f$", { x: X(B) + 22, y: 188, kind: "label", color: "--force" });
const uName = KIT.text(plot, "u-label", "$\\sup|u|$", { x: X(EXIT) - 180, y: 321, kind: "label", color: "--velocity" });
const eName = KIT.text(plot, "e-label", "$E$", { x: X(1) + 22, y: energyChart.Y(energy(1)) + 8, kind: "label", color: "--energy" });
const infinity = KIT.text(plot, "infinity", "$\\to\\infty$", { x: X(EXIT) + 12, y: 310, kind: "aux", color: "--velocity" });
const boundName = KIT.text(plot, "energy-bound", "bounded", { x: X(1) + 22, y: energyChart.Y(0.9) - 23, kind: "aux", color: "--energy" });
const question = KIT.text(plot, "v-question", "$v$ ?", { x: X(1.5) + 8, y: velocityChart.Y(0.73) - 24, kind: "label" });
const eqName = KIT.text(plot, "equality", "$v=u$ for $t<1$", { x: 440, y: 718, kind: "aux", color: "--velocity" });
const compactName = KIT.text(plot, "compact-set", "$K\\times[0,1]$", { x: 136, y: 365, kind: "aux", color: "--ink" });
const schematic = KIT.note(plot, "schematic", "schematic");
const ledger = [];
function entry(name, words, y, at, next, strong = false) {
  const el = KIT.text(plot, name, words, {x: Z.rail.x, y, w: Z.rail.w, kind: strong ? "strong" : "aux"});
  ledger.push({el, at, next}); return el;
}
entry("construction-status", "construction · claimed", 96, cue("c9b1", "construction"), T.b2, true);
entry("smooth-force", "smooth $f$: through $t=1$ and after", 146, T.force + FORCE, T.velocity).style.color = "var(--force)";
entry("peak-speed", "unbounded speed as $t\\uparrow1$", 188, T.velocity + VEL, T.energy).style.color = "var(--velocity)";
entry("bounded-energy", "energy bounded", 230, T.energy + EN, T.b2).style.color = "var(--energy)";
entry("pressure-recovery", "pressure recovery", 290, T.b2, T.another);
entry("flux-bounds", "expanding-ball flux bounds", 328, T.b2, T.another);
entry("hypothetical", "another smooth solution\nwith bounded energy", 382, T.another, T.same);

entry("same-data", "same $f$, same start $u_0=0$", 466, T.same, T.compare);
entry("comparison-source", "comparison: claimed", 508, T.manuscript, T.b3);
entry("comparison-reference", "manuscript Lemma 10.5", 542, T.manuscript, T.b3);
const noDecay = KIT.note(plot, "no-decay", "schematic; no derivative or pressure decay assumed for $v$");
const bounded = KIT.text(plot, "bounded-here", "$v$ continuous ⇒ bounded here", {x: 136, y: 270, kind: "label"});
const unbounded = KIT.text(plot, "unbounded-here", "$u=v$: unbounded here", {x: 136, y: 548, kind: "label", color: "--velocity"});
const implication = KIT.text(plot, "conditional-implication", "proved implication, given both claims", {x: Z.rail.x, y: 576, kind: "aux"});
const matrix = KIT.matrix(content, {size: "rail", box: "alternatives", x: Z.rail.x, y: 610,
  dims: {cellH: 84, headH: 44}});
for (const cell of Object.values(matrix.cells)) {
  cell.letter.style.top = "4px"; cell.status.style.bottom = "4px";
}

/* A single final layout: only the core scale changes before the neighbouring translates appear. */
const periodicLayer = KIT.layer(content);
const st = stage3d({ parent: periodicLayer, left: Z.picture.x, top: Z.picture.y, width: Z.picture.w, height: Z.picture.h, fov: 28 });
const root = new THREE.Group();
st.scene.add(root);
const cellSize = 2;
const smallScale = 0.5;
const copies = [];
for (let z = -1; z <= 1; z++) for (let x = -1; x <= 1; x++) {
  const parent = new THREE.Group();
  parent.position.set(cellSize * x, 0, cellSize * z);
  root.add(parent);
  const center = x === 0 && z === 0;
  const core = makeParticleCore(st, { parent, scale: center ? 1 : smallScale, count: 60, ghost: false, equator: false,
    tauAt: () => 0.25, startTime: T.b4 - 6, duration: T.end - T.b4 + 6, map, inflow: 0.05, clock: 0.3, width: 3.5, trailLength: 3,
  });
  copies.push({ core, center, x, z });
}
/* Extra trails on the large central core only; they leave during the shrink, so all copies end identical. */
const denseParent = new THREE.Group();
root.add(denseParent);
const dense = makeParticleCore(st, { parent: denseParent, count: 300, ghost: false, equator: false,
  tauAt: () => 0.25, startTime: T.b4 - 6, duration: T.end - T.b4 + 6, map, inflow: 0.05, clock: 0.3, width: 3.5, trailLength: 3, seed: 911,
});
function lineSegments(points, token) {
  const mat = new THREE.LineBasicMaterial({ color: tokenColor(token), transparent: true, opacity: 0, depthWrite: false });
  const mesh = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p))), mat);
  mesh.renderOrder = -2;
  root.add(mesh);
  return { mat, mesh };
}
const cubePoints = [];
for (let axis = 0; axis < 3; axis++) for (const p of [-1,1]) for (const q of [-1,1]) {
  const a = [0,0,0], b = [0,0,0];
  a[axis] = -1; b[axis] = 1;
  a[(axis+1)%3] = b[(axis+1)%3] = p;
  a[(axis+2)%3] = b[(axis+2)%3] = q;
  cubePoints.push(a,b);
}
const cube = lineSegments(cubePoints, "--ink-muted");
const floorPoints = [];
for (const p of [-3,-1,1,3]) {
  floorPoints.push([p,-1.04,-3],[p,-1.04,3],[-3,-1.04,p],[3,-1.04,p]);
}
const floor = lineSegments(floorPoints, "--rule");
const legend = KIT.legend(content, {map, label: "speed", unit: "log scale", y: 124,
  ticks: [{u: 0, text: "0"}, {u: 1, text: "9"}]});
legend.el.style.left = "120px";
const periodicLedger = [];
function periodicEntry(name, words, y, at, next, strong = false) {
  const el = KIT.text(content, name, words, {x: Z.rail.x, y, kind: strong ? "strong" : "aux"});
  periodicLedger.push({el, at, next}); return el;
}
periodicEntry("tracer-clock", "schematic; tracers $\\times0.3$", 96, T.b4, T.shrink);
periodicEntry("support", "each copy: compact spatial support", 164, T.shrink, T.repeat, true);
periodicEntry("periodic-construction", "construction · claimed", 210, T.shrink, T.comparison);
periodicEntry("periodic-velocity", "velocity, pressure and force", 258, T.repeat, T.interact);
periodicEntry("periodic-caption", "periodic", 300, T.repeat, T.interact);
periodicEntry("cell-energy", "finite energy per cell", 362, T.shrink + SHRINK + 3, T.comparison);
periodicEntry("whole-space-energy", "no whole-space energy claim", 404, T.shrink + SHRINK + 3, T.comparison);
periodicEntry("separated-copies", "copies do not interact", 466, T.interact, T.comparison);
periodicEntry("periodic-comparison", "periodic comparison · claimed", 514, T.comparison, T.finishes);
periodicEntry("periodic-implication", "given claimed inputs ⇒ $D$", 558, T.finishes, T.end, true);
const copyCaption = KIT.note(content, "copy-caption", "schematic: one compactly supported copy");
const layerCaption = KIT.note(content, "layer-caption", "schematic: one layer of the 3D periodic lift");
const periodicSvg = KIT.overlay(content);
const supportLabel = KIT.text(content, "support-label", "one copy", {x: 0, y: 0, kind: "aux"});
const supportLeader = KIT.leader(periodicSvg, "--velocity");

const strip = mountStripJX(document.body, {
  labels: { c9b3: "Proved: the final implication, given the claimed construction and comparison" },
});
const subs = mountSubtitles(document.body, window.__BEATS__);
/* Chapter lengths lie on a 1/30 s grid; the last frame may fall just after the last beat. */
window.sceneDuration = Math.ceil(window.__BEATS__.duration * 30 - 1e-6) / 30;
window.sceneEvents = [
  [T.force,"c9b1","smooth force"], [T.velocity,"c9b1","unbounded speed"], [T.energy,"c9b1","bounded energy"],
  [T.another,"c9b2","hypothetical continuation"], [T.compare,"c9b2","claimed equality"],
  [T.compact,"c9b3","compact band"], [T.unbounded,"c9b3","contradiction on chart"], [T.C,"c9b3","conditional C"],
  [T.shrink,"c9b4","core scales into cell"], [T.repeat,"c9b4","identical translates"], [T.comparison,"c9b4","D frame"],
].map(([t,beat,what]) => ({t,beat,what}));
const S = (el,k) => el.setAttribute("opacity",k);
const windowK = (t,on,off) => gate(t,on,off == null ? null : off - 0.25);
/* State captions wait for the corresponding picture. */
["smooth-force", "peak-speed", "bounded-energy", "periodic-velocity", "periodic-caption", "cell-energy", "whole-space-energy", "separated-copies", "periodic-comparison", "periodic-implication"].forEach(name => { content.querySelector(`[data-box="${name}"]`).dataset.stateArrival = "true"; });
window.setTime = function(t) {
  t = Math.min(t, window.__BEATS__.duration);
  const stay = 1 - powerIn(t, T.end - 0.5, 0.5);
  const start = t >= 2 ? 1 : 0;
  op(content,start * stay);
  const plotK = 1 - powerIn(t, T.b4 - 0.3, 0.3);
  op(plot,plotK);
  const compactBeat = powerOut(t,T.b3,0.35);
  const lessLabels = 1;
  axes.setK(1);
  /* The time rule and its labelled tracks remain through the comparison. */
  axes.group.setAttribute("opacity",1);
  forceChart.setK(1); velocityChart.setK(1); energyChart.setK(1);
  const fp = powerOut(t,T.force,FORCE);
  forceCurve.set(MAX * fp,fp);
  let d = "M120 " + forceChart.Y(0);
  for (let i = 0; i <= 200; i++) {
    const s = MAX * fp * i / 200;
    d += "L" + X(s) + " " + forceChart.Y(bell(s));
  }
  forceFill.setAttribute("d",d + "L" + X(MAX * fp) + " " + forceChart.Y(0) + "Z");
  S(forceFill,fp * mix(0.25,0.8,windowK(t,T.force,T.velocity)));
  const vp = powerOut(t,T.velocity,VEL);
  velocityCurve.set(EXIT * vp,vp);
  forceGhost.set(null,0.2 * (1 - fp));
  velocityGhost.set(null,0.2 * (1 - vp));
  const ep = powerOut(t,T.energy,EN);
  energyGhost.set(null,0.2 * (1 - ep));
  energyCurve.set(ep,ep);
  S(ceiling,ep); S(asymptote,vp);
  op(fName,fp * lessLabels); op(uName,vp * lessLabels);
  op(eName,ep * lessLabels); op(boundName,ep * lessLabels);
  op(infinity,vp * lessLabels);
  const another = powerOut(t,T.another,VTRACK);
  vExtension.set(1 + 0.5 * another,another);
  op(question,another);
  const compare = powerOut(t,T.compare,BRACKET);
  S(equality,compare);
  op(eqName,compare);
  op(schematic,swap(t,KIT.sentenceStart(T.decay)).oldK);
  ledger.forEach(({el, at, next}) => op(el, KIT.entryIn(t, el, at)));
  op(noDecay,KIT.textIn(t,T.decay));
  const bandK = powerOut(t,T.compact,RECT);
  S(compactBand,bandK);
  op(compactName,bandK);
  const contradiction = powerOut(t,T.unbounded,COLLIDE);
  S(cross,contradiction);
  op(bounded,powerOut(t,T.compact + RECT,0.35));
  op(unbounded,powerOut(t,T.unbounded,0.35));
  op(implication,powerOut(t,T.given,0.35));

  const pk = powerOut(t,T.b4,0.35);
  op(periodicLayer,pk);
  const shrink = sineInOut(t,T.shrink,SHRINK);
  const orbitStart = T.shrink + SHRINK;
  const orbitEnd = orbitStart + 3;
  const reveal = sineInOut(t,orbitStart,3);
  st.orbit([0,-0.12,0],mix(-8,4,reveal),24,12.5);
  copies.forEach(c => {
    const k = c.center ? 1 : powerOut(t,T.repeat + (Math.abs(c.x)+Math.abs(c.z) === 2 ? 0.3 : 0),0.6);
    c.core.group.scale.setScalar(c.center ? mix(2.8,smallScale,shrink) : smallScale);
    c.core.setTime(t,k * pk);
  });
  dense.group.scale.setScalar(mix(2.8,smallScale,shrink));
  dense.setTime(t,pk * (1 - shrink));
  /* No hard outline on the particle cores: hide the kit's silhouettes (the support label still uses their geometry). */
  for (const c of [...copies.map(c => c.core), dense]) c.group.children.forEach(mesh => { if (mesh.material?.uniforms?.halfWidth) mesh.visible = false; });
  cube.mat.opacity = 0.5 * powerOut(t,T.shrink + SHRINK,0.35);
  floor.mat.opacity = 0.65 * powerOut(t,T.repeat,0.6);
  if(pk > 0.001) st.render();
  st.setOpacity(pk);
  const matrixK = powerOut(t,T.gives,0.35);
  const dFrame = powerOut(t,T.comparison,0.35);
  matrix.set({k: matrixK, head: 1, rows: 0,
    A: {k: 1}, B: {k: 1},
    C: {frame: 1, status: "claimed", statusK: 1}, D: {frame: dFrame, status: "claimed", statusK: dFrame},
  });
  periodicLedger.forEach(({el, at, next}) => op(el, pk * KIT.entryIn(t, el, at)));
  legend.setOpacity(pk);
  const layerSwap = swap(t,T.repeat);
  op(copyCaption,pk * layerSwap.oldK);
  op(layerCaption,pk * layerSwap.newK);
  const outline = copies.find(c => c.center).core.silhouette();
  const anchor = outline.length ? outline.reduce((a,b) => b.x > a.x ? b : a) : st.project([0,0,0]);
  supportLabel.style.left = (anchor.x + 88).toFixed(2) + "px";
  supportLabel.style.top = (anchor.y - 20).toFixed(2) + "px";
  const labelK = pk * powerOut(t,T.shrink,0.35);
  op(supportLabel,labelK);
  supportLeader.set(anchor.x,anchor.y,anchor.x + 76,anchor.y,labelK);

  chapter.setTime(t); if (t >= 2) op(chapter.el,stay); strip.setTime(t,stay); subs.setTime(t);
};
window.setTime(0);
