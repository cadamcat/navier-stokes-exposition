/* A schematic core and annular pulses, followed by the exact two-direction toy cone. */
import { stage3d, tokenColor, THREE, torusGeometry } from "../three3d/stage3d.js";
import { makeParticleCore } from "../ns/trails.js";
import { coreScales } from "../ns/corefield.mjs";

installBeats(window.__BEATS__);
const INTRO = need("c7b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word");
const D_CORE = need("c7b1", "core", 0.8, "core draws on");
const D_FAST = need("c7b1", "faster", 3.6, "bead speed rises");
const D_AXIS = need("c7b1", "axis", 0.45, "axial exits");
const D_SLEN = need("c7b1", "slender", 0.45, "more slender");
const D_RING = need("c7b2", "ring", 0.5, "annulus fades in");
const D_ERR = need("c7b2", "error", 0.45, "error arrows");
const D_STRESS = need("c7b2", "stress", 0.4, "missing stress");
const D_WAVE = need("c7b3", "Oscillations", 0.45, "zero-mean velocity wave appears");
const D_PERIOD = need("c7b3", "wave", 3.5, "scan complete periods and return to zero mean");
const D_ZERO = need("c7b3", "zero", 0.4, "zero average label");
const D_SQ = need("c7b4", "itself", 0.5, "square appears below the same velocity wave");
const D_MEAN = need("c7b4", "square", 4.5, "running average of the square visibly settles above zero");
const D_FLUX = need("c7b5", "steady", 0.5, "positive mean becomes a steady momentum flux");
const D_PLANE = need("c7b6", "But", 0.55, "toy plane appears");
const D_SWEEP = need("c7b6", "positive", 1.2, "weights sweep the cone");
const D_OUTSIDE = need("c7b6", "outside", 0.4, "forbidden point");
const D_ADJ = need("c7b7", "adjusts", 1.0, "core and error move until the error enters the actual cone");
const D_BACK = need("c7b7", "So", 0.8, "return to the core with a separate schematic actual cone");
const D_PULSE = need("c7b7", "pulses", 0.45, "pulses appear");
const D_AMP = need("c7b7", "amplifies", 0.65, "shear visibly lengthens pulses before damping starts");
const D_DAMP = need("c7b7", "damps", 0.7, "viscosity visibly shortens the amplified pulses");
const OUT = need("c7b7", "tail", 0.8, "picture fades out");

const { Z, op, powerOut, powerIn, sineInOut, gate, swap, mix, svgEl } = KIT;
const T = {
  b1: beatStart("c7b1"), b2: beatStart("c7b2"), b3: beatStart("c7b3"),
  b4: beatStart("c7b4"), b5: beatStart("c7b5"), b6: beatStart("c7b6"), b7: beatStart("c7b7"),
  first: cue("c7b1", "First"), faster: cue("c7b1", "faster"), slender: cue("c7b1", "slender"),
  ring: cue("c7b2", "ring"), error: cue("c7b2", "error"), stress: cue("c7b2", "stress"),
  wave: cue("c7b3", "wave"), zero: cue("c7b3", "zero"), waveEnd: beatEnd("c7b3"),
  itself: cue("c7b4", "itself"), square: cue("c7b4", "square"), positive: cue("c7b4", "positive"),
  steady: cue("c7b5", "steady"),
  weights: cue("c7b6", "positive"), toy: cue("c7b6", "toy"), outside: cue("c7b6", "outside"),
  adjusts: cue("c7b7", "adjusts"), inside: cue("c7b7", "inside"), back: beatStart("c7b7"),
  pulses: cue("c7b7", "pulses"), amp: cue("c7b7", "amplifies"), damp: cue("c7b7", "damps"), end: beatHoldEnd("c7b7"),
};
const chapter = chapterLabel({ n: 7, title: "A core and its pulses", intro: 2.0 });
const content = KIT.layer();
const svg = KIT.overlay(content);
const map = magnitudeMap();
const st = stage3d({ left: Z.picture.x, top: Z.picture.y, width: Z.picture.w, height: Z.picture.h, fov: 28 });
const tauAt = t => mix(1, 0.25, sineInOut(t, T.faster, D_FAST)) + 0.08 * sineInOut(t, T.adjusts, D_ADJ);
const core = makeParticleCore(st, { tauAt, startTime: 0, duration: T.end, map, inflow: 0.05, count: 900, clock: 0.3, equator: false, width: 4.4, trailLength: 3 });
const annMat = new THREE.MeshBasicMaterial({ color: tokenColor("--force"), transparent: true, opacity: 0, depthWrite: false });
const annulus = new THREE.Mesh(torusGeometry(2, 0.45, 128, 32), annMat);
annulus.renderOrder = -1;
core.group.add(annulus);

const layers = ["core", "pulses", "corrections"].map((s, i) => KIT.text(content, "layer-" + i, s, { x: Z.rail.x, y: 112 + i * 58, kind: "label" }));
const allOrders = KIT.text(content, "all-orders", "to every order", { x: Z.rail.x, y: 280, kind: "aux" });
const notes = {
  clock: KIT.text(content, "clock", "tracers $\\times0.3$", { x: 120, y: 746, kind: "aux" }),
  h: KIT.text(content, "drawing-exponent", "drawn $h=0.2$ · exaggerated", { x: Z.rail.x, y: 552, kind: "aux" }),
  source: KIT.text(content, "source-exponent", "source $h<0.01$", { x: Z.rail.x, y: 598, kind: "aux" }),
  material: KIT.note(content, "material", "schematic; not a material volume"),
  ghost: KIT.text(content, "reference-outline", "outline at $\\tau=1$", { x: 120, y: 690, kind: "aux" }),
};
const returnDisclosure = KIT.note(content, "returned-core-range", "schematic; drawn $h=0.2$ exaggerated; source $h<0.01$; not a material volume");
const slender = KIT.formula(content, "slender-law", "R/L\\sim\\tau^h", { x: Z.rail.x, y: 360, w: Z.rail.w, h: 96 });
const legend = KIT.legend(content, { map, label: "speed", unit: "log scale", ticks: [{ u: 0, text: "0" }, { u: 1, text: "9" }] });
legend.el.style.left = "888px";
legend.el.style.top = "744px";
const inflowLabel = KIT.text(content, "inflow", "inflow", { x: 0, y: 0, w: 120, kind: "label", color: "--velocity" });
const outflowLabel = KIT.text(content, "outflow", "outflow", { x: 0, y: 0, w: 140, kind: "label", color: "--velocity" });
const inflowLead = KIT.leader(svg, "--velocity");
const outflowLead = KIT.leader(svg, "--velocity");
const errorLabel = KIT.text(content, "annulus-label", "leading error", { x: 928, y: 586, kind: "label", color: "--force" });
const stressLabel = KIT.text(content, "stress-label", "missing stress $T$", { x: Z.rail.x, y: 474, kind: "label", color: "--stress" });
const pulseLabel = KIT.text(content, "pulse-label", "localized pulses", { x: 934, y: 586, kind: "label", color: "--stress" });
const annLead = KIT.leader(svg, "--force");
const pulseLead = KIT.leader(svg, "--stress");
const pulseMarks = Array.from({ length: 12 }, () => svgEl(svg, "line", { stroke: "var(--stress)", "stroke-width": 3.5, "stroke-linecap": "round", opacity: 0 }));

/* Exact sine model. One phase scan is shared by velocity and its square.
   Running means integrate [0, phi] analytically; their settling is data, not easing. */
const waveLayer = KIT.layer(content);
const waveSVG = KIT.overlay(waveLayer);
const PERIODS = 6 * Math.PI;
const wave = KIT.chart(waveLayer, waveSVG, { box: "wave", x: 180, y: 180, w: 940, h: 500, xr: [0, PERIODS], yr: [-1.2, 1.2], y0: 0, yAxis: false });
const waveCurve = wave.curve({ token: "--velocity", from: 0, to: PERIODS, fn: x => Math.sin(x), n: 480 });
const velocityCursor = svgEl(waveSVG, "line", { stroke: "var(--velocity)", "stroke-width": 2 });
const velocityPoint = svgEl(waveSVG, "circle", { r: 7, fill: "var(--velocity)" });
const velocityMean = svgEl(waveSVG, "line", { x1: 180, x2: 1120, stroke: "var(--velocity)", "stroke-width": 2, "stroke-dasharray": "9 8" });
const square = KIT.chart(waveLayer, waveSVG, { box: "square", x: 180, y: 500, w: 940, h: 248, xr: [0, PERIODS], yr: [0, 1.2], yAxis: false });
const sqCurve = square.curve({ token: "--stress", from: 0, to: PERIODS, fn: x => Math.sin(x) ** 2, n: 480 });
const runningMean = phi => phi < 1e-8 ? 0 : 0.5 - Math.sin(2 * phi) / (4 * phi);
const running = square.curve({ token: "--stress", from: 0, to: PERIODS, fn: runningMean, dashed: true, n: 480 });
const sqFill = svgEl(waveSVG, "path", { fill: "var(--stress)", "fill-opacity": 0.14, stroke: "none" });
waveSVG.insertBefore(sqFill, square.group);
const mean = svgEl(waveSVG, "line", { x1: 180, x2: 1120, stroke: "var(--stress)", "stroke-width": 2, "stroke-dasharray": "9 8" });
const meanPoint = svgEl(waveSVG, "circle", { r: 7, fill: "var(--stress)" });
const velocityLabel = KIT.text(waveLayer, "velocity-wave", "velocity", { x: 180, y: 110, color: "--velocity", kind: "label" });
const zeroLabel = KIT.text(waveLayer, "zero-mean", "average $0$", { x: Z.rail.x, y: 420, color: "--velocity", kind: "label" });
const squareLabel = KIT.text(waveLayer, "velocity-square", "velocity times itself", { x: 180, y: 446, color: "--stress", kind: "label" });
const halfLabel = KIT.text(waveLayer, "square-mean", "average is positive", { x: Z.rail.x, y: 548, color: "--stress", kind: "label" });
const fluxLabel = KIT.text(waveLayer, "momentum-flux", "steady flux of momentum", { x: Z.rail.x, y: 646, color: "--stress", kind: "label" });
const flux = svgEl(waveSVG, "path", { fill: "none", stroke: "var(--stress)", "stroke-width": 3.5, "stroke-linecap": "round", "stroke-linejoin": "round" });
const ledger = [];
function entry(name, words, y, at, next, kind = "aux", color) {
  const el = KIT.text(content, name, words, { x: Z.rail.x, y, w: Z.rail.w, kind, color });
  ledger.push({el, at, next});
  return el;
}
entry("cone-title", "toy cone", 348, T.b6, T.b7, "label");
entry("cone-law", "$c_+b_+\\otimes b_++c_-b_-\\otimes b_-$\n$=\\begin{pmatrix}s&d\\\\d&s\\end{pmatrix}$", 400, T.b6, T.b7);
entry("nonnegative-weights", "positive combinations", 536, T.weights, T.b7, "label", "--stress");
entry("weight-condition", "$c_+,c_-\\geq0$", 580, T.weights, T.b7, "label", "--stress");


/* The exact toy cone s >= |d| extends to the right, rather than ending on a vertical edge. */
const coneLayer = KIT.layer(content);
const coneSVG = KIT.overlay(coneLayer);
const defs = svgEl(coneSVG, "defs", {});
const grad = svgEl(defs, "linearGradient", { id: "cone-fade", x1: "0%", x2: "100%", y1: "0%", y2: "0%" });
svgEl(grad, "stop", { offset: "0%", "stop-color": "var(--stress)", "stop-opacity": 0.2 });
svgEl(grad, "stop", { offset: "50%", "stop-color": "var(--stress)", "stop-opacity": 0.14 });
svgEl(grad, "stop", { offset: "100%", "stop-color": "var(--paper)", "stop-opacity": 0 });
const P = (s, d) => [324 + 146 * s, 454 - 126 * d];
const a = P(0, 0), b = P(5, 5), c = P(5, -5);
const clip = svgEl(defs, "clipPath", { id: "cone-window" });
svgEl(clip, "rect", { x: 120, y: 100, width: 1112, height: 698 });
const cg = svgEl(coneSVG, "g", { "clip-path": "url(#cone-window)" });
svgEl(cg, "polygon", { points: [a,b,c].map(p => p.join(",")).join(" "), fill: "url(#cone-fade)" });
for (const d of [3, -3]) {
  const q = P(3, d);
  svgEl(cg, "line", { x1: a[0], y1: a[1], x2: q[0], y2: q[1], stroke: "var(--stress)", "stroke-width": 3.5 });
}
svgEl(coneSVG, "line", { x1: 252, y1: 454, x2: 1112, y2: 454, stroke: "var(--ink-muted)", "stroke-width": 2 });
svgEl(coneSVG, "line", { x1: 324, y1: 772, x2: 324, y2: 164, stroke: "var(--ink-muted)", "stroke-width": 2 });
const allowed = svgEl(coneSVG, "circle", { r: 8, fill: "var(--stress)" });
const target = svgEl(coneSVG, "circle", { r: 9, fill: "var(--paper)", stroke: "var(--force)", "stroke-width": 3 });
const targetLead = KIT.leader(coneSVG, "--force");
const weightsLead = KIT.leader(coneSVG, "--stress");
const rayPlus = KIT.text(coneLayer, "ray-plus", "$b_+=(1,1)$", { x: 650, y: 238, w: 200, align: "right", kind: "aux", color: "--stress" });
const rayMinus = KIT.text(coneLayer, "ray-minus", "$b_-=(1,-1)$", { x: 400, y: 728, w: 200, align: "right", kind: "aux", color: "--stress" });
const sLabel = KIT.text(coneLayer, "s-axis", "$s$", { x: 1134, y: 435, kind: "aux" });
const dLabel = KIT.text(coneLayer, "d-axis", "$d$", { x: 340, y: 200, kind: "aux" });
const coefficients = KIT.text(coneLayer, "weights", "$c_+=3/2,\\ c_-=1/2$", { x: 706, y: 296, kind: "aux", color: "--stress" });
const cannot = KIT.text(coneLayer, "cannot", "target outside:\ncannot be made", { x: 370, y: 90, kind: "label" });


const actualLayer = KIT.layer(content);
const actualSVG = KIT.overlay(actualLayer);
const actualTitle = KIT.text(actualLayer, "actual-cone", "actual cone", { x: Z.rail.x, y: 160, kind: "label", color: "--stress" });
const actualError = KIT.text(actualLayer, "actual-error", "error", { x: Z.rail.x, y: 216, kind: "label", color: "--force" });
svgEl(actualSVG, "path", { d: "M1288 462 L1732 264 L1732 660 Z", fill: "var(--stress)", "fill-opacity": 0.14, stroke: "none" });
svgEl(actualSVG, "path", { d: "M1732 264 L1288 462 L1732 660", fill: "none", stroke: "var(--stress)", "stroke-width": 3.5 });
const actualTarget = svgEl(actualSVG, "circle", { r: 9, fill: "var(--force)" });
const actualLead = KIT.leader(actualSVG, "--force");

/* One schematic amplitude is shared by the pulse marks and this time trace. */
function pulseLengthAt(time) {
  return mix(0.28,0.75,sineInOut(time,T.amp,D_AMP)) * mix(1,0.14,sineInOut(time,T.damp,D_DAMP));
}
const amplitudeLayer = KIT.layer(content);
const amplitudeSVG = KIT.overlay(amplitudeLayer);
const amplitude = KIT.chart(amplitudeLayer,amplitudeSVG,{box:"pulse-amplitude",x:1280,y:320,w:460,h:300,xr:[0,1],yr:[0,0.85]});
const pulseSpan = T.end - 0.5 - T.pulses;
const pulseX = time => (time-T.pulses)/pulseSpan;
const ampCurve = amplitude.curve({token:"--stress",from:0,to:pulseX(T.damp),fn:x=>pulseLengthAt(T.pulses+x*pulseSpan)});
const dampCurve = amplitude.curve({token:"--viscosity",from:pulseX(T.damp),to:1,fn:x=>pulseLengthAt(T.pulses+x*pulseSpan)});
const amplitudePoint = svgEl(amplitudeSVG,"circle",{r:7,fill:"var(--stress)"});
const amplitudeTitle = KIT.text(amplitudeLayer,"amplitude-title","amplitude",{x:1280,y:200,kind:"label"});
const growthLabel = KIT.text(amplitudeLayer,"amplitude-growth","shear amplifies",{x:1300,y:260,kind:"label",color:"--stress"});
const dampingLabel = KIT.text(amplitudeLayer,"amplitude-damping","viscosity damps",{x:1480,y:640,kind:"label",color:"--viscosity"});
const amplitudeTime = KIT.text(amplitudeLayer,"amplitude-time","time",{x:1738,y:685,kind:"aux"});
const growthLead = KIT.leader(amplitudeSVG,"--stress"), dampingLead = KIT.leader(amplitudeSVG,"--viscosity");

const strip = mountStripJX(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);
window.sceneDuration = Math.ceil(window.__BEATS__.duration * 30) / 30;
window.sceneEvents = [
  [T.faster, "c7b1", "core contracts"], [T.ring, "c7b2", "annular error"],
  [T.zero, "c7b3", "zero mean over each period"], [T.itself, "c7b4", "square"],
  [T.positive, "c7b4", "positive running mean"], [T.steady, "c7b5", "steady momentum flux"],
  [T.outside, "c7b6", "target outside toy cone"], [T.adjusts, "c7b7", "background adjustment and actual cone"],
  [T.pulses, "c7b7", "localized pulses"], [T.amp, "c7b7", "shear growth"], [T.damp, "c7b7", "viscous damping"],
].map(([t, beat, what]) => ({ t, beat, what }));
function showSVG(el, k) { el.setAttribute("opacity", k); }
function proj(x, y, z) { const v = new THREE.Vector3(x, y, z); core.group.localToWorld(v); return st.project(v.toArray()); }
function noteWindow(t, on, off) { return gate(t, on, off == null ? null : off - 0.25); }

window.setTime = function(t) {
  const stay = 1 - powerIn(t, T.end - 0.5, 0.5);
  const started = t >= 2 ? 1 : 0;
  const early = started * (1 - powerIn(t, T.b3 - 0.3, 0.3));
  const back = powerOut(t, T.back, D_BACK);
  const coreK = (early + back) * stay;
  const reveal = sineInOut(t, T.b2 + 0.35, 2.9);
  st.orbit([0, 0, 0], mix(-10, 2, reveal), 10, 8.2);
  core.setTime(t, coreK);
  // Contour meshes belong to the kit; hide their hard silhouette in this scene.
  core.group.children.forEach(mesh => { if (mesh.material?.uniforms?.halfWidth) mesh.visible = false; });
  if (core.ghostContour) {
    const ref = coreScales(1);
    core.ghostContour.set(ref.R, ref.L, 0);
  }
  const { R, L } = core.metrics(t);
  annulus.scale.setScalar(R);
  annMat.opacity = 0.17 * powerOut(t, T.error, D_RING) * coreK;
  if (coreK > 0.001) st.render();
  st.setOpacity(coreK);
  op(content, started * stay);
  const listK = early * KIT.textIn(t, cue("c7b1", "three"));
  layers.forEach((el, i) => {
    op(el, listK);
    const strong = i === (t < T.b3 ? 0 : 1);
    el.classList.toggle("strong", strong);
    el.style.color = "var(--ink)";
  });
  op(allOrders, listK);
  op(notes.clock, early + back);
  op(notes.h, early * powerOut(t, T.first, 0.4));
  op(notes.source, early * powerOut(t, T.first, 0.4));
  op(notes.material, early);
  op(returnDisclosure, back);
  op(notes.ghost, 0);
  const slenderK = early * powerOut(t, T.slender, D_SLEN);
  op(slender.el, slenderK); slender.setTime(t);
  const legendK = early * powerOut(t, T.first, 0.4) + back;
  legend.setOpacity(legendK * stay);
  const errK = early * powerOut(t, T.ring, D_ERR);
  op(errorLabel, errK);
  op(stressLabel, early * powerOut(t, T.stress, D_STRESS));
  const inPoint = proj(-1.35 * R, 0, 0);
  const outPoint = proj(0, 0.9 * L, 0);
  const inK = (early * powerOut(t, cue("c7b1", "inward"), 0.4) + back);
  const outK = (early * powerOut(t, cue("c7b1", "axis"), D_AXIS) + back);
  inflowLabel.style.left = (inPoint.x - 200) + "px";
  inflowLabel.style.top = (inPoint.y + 18) + "px";
  outflowLabel.style.left = (outPoint.x + 72) + "px";
  outflowLabel.style.top = (outPoint.y - 36) + "px";
  op(inflowLabel, inK); op(outflowLabel, outK);
  inflowLead.set(inPoint.x, inPoint.y, inPoint.x - 68, inPoint.y + 36, inK * stay);
  outflowLead.set(outPoint.x, outPoint.y, outPoint.x + 64, outPoint.y - 18, outK * stay);
  const edge = proj(2.46 * R, 0, 0);
  errorLabel.style.left = (edge.x + 66) + "px";
  errorLabel.style.top = (edge.y + 34) + "px";
  annLead.set(edge.x, edge.y, edge.x + 58, edge.y + 50, errK * stay);
  const pK = back * powerOut(t, T.pulses, D_PULSE);
  const amp = sineInOut(t, T.amp, D_AMP), damp = sineInOut(t, T.damp, D_DAMP);
  const length = pulseLengthAt(t);
  const tilt = amp * (1 - damp) * 35 * Math.PI / 180;
  const pulseCenters = [];
  for (let i = 0; i < 12; i++) {
    const angle = Math.PI / 4 + Math.floor(i / 3) * Math.PI / 2;
    const rr = 2.65 * R + (i % 3 - 1) * 0.035;
    const yy = (i % 3 - 1) * 0.035;
    const da = length * Math.sin(tilt) / (2 * rr);
    const q1 = proj(rr * Math.cos(angle - da), yy - length * Math.cos(tilt) / 2, rr * Math.sin(angle - da));
    const q2 = proj(rr * Math.cos(angle + da), yy + length * Math.cos(tilt) / 2, rr * Math.sin(angle + da));
    pulseCenters.push({ x: (q1.x + q2.x) / 2, y: (q1.y + q2.y) / 2 });
    for (const [k, v] of Object.entries({ x1:q1.x, y1:q1.y, x2:q2.x, y2:q2.y })) pulseMarks[i].setAttribute(k, v);
    showSVG(pulseMarks[i], pK);
  }
  const pulsePoint = pulseCenters.reduce((a, b) => a.x > b.x ? a : b);
  pulseLabel.style.left = (pulsePoint.x + 66) + "px";
  pulseLabel.style.top = (pulsePoint.y + 34) + "px";
  op(pulseLabel, pK);
  pulseLead.set(pulsePoint.x, pulsePoint.y, pulsePoint.x + 58, pulsePoint.y + 50, pK);

  const waveK = gate(t, T.b3, T.b6 - 0.3, 0.35, 0.3);
  op(waveLayer, waveK);
  const layout = sineInOut(t, T.b4, 0.7);
  const sy = mix(1, 0.5, layout), dy = 180 * (1 - sy);
  const transform = `translate(0 ${dy}) scale(1 ${sy})`;
  [wave.group, waveCurve.el, velocityMean, velocityCursor, velocityPoint].forEach(el => el.setAttribute("transform", transform));
  wave.setK(1); waveCurve.set(null, 1);
  op(velocityLabel, 1);
  const wavePhi = PERIODS * KIT.linear(t, T.wave, Math.max(D_PERIOD, T.waveEnd - T.wave - 0.25));
  const vMean = wavePhi < 1e-8 ? 0 : (1 - Math.cos(wavePhi)) / wavePhi;
  const vY = wave.Y(vMean);
  velocityMean.setAttribute("y1", vY); velocityMean.setAttribute("y2", vY);
  const scanK = (t >= T.wave && t < T.b4) ? 1 : 0;
  showSVG(velocityMean, powerOut(t, T.wave, 0.35));
  for (const [k,v] of Object.entries({x1:wave.X(wavePhi),x2:wave.X(wavePhi),y1:wave.Y(0),y2:wave.Y(Math.sin(wavePhi))})) velocityCursor.setAttribute(k,v);
  velocityPoint.setAttribute("cx", wave.X(wavePhi)); velocityPoint.setAttribute("cy", wave.Y(Math.sin(wavePhi)));
  showSVG(velocityCursor,scanK); showSVG(velocityPoint,scanK);
  zeroLabel.style.top = mix(420, 278, layout) + "px";
  op(zeroLabel, KIT.textIn(t, T.zero));
  const squared = powerOut(t, T.itself, D_SQ);
  square.setK(squared); sqCurve.set(null, squared); op(squareLabel, squared);
  const meanDuration = Math.max(D_MEAN, T.positive - T.square);
  const phi = PERIODS * KIT.linear(t, T.square, meanDuration);
  let fillD = "M180 " + square.Y(0);
  for (let i = 0; i <= 480; i++) {
    const x = phi * i / 480;
    fillD += "L" + square.X(x) + " " + square.Y(Math.sin(x) ** 2);
  }
  sqFill.setAttribute("d", fillD + "L" + square.X(phi) + " " + square.Y(0) + "Z");
  showSVG(sqFill, squared);
  const meanK = squared * powerOut(t, T.square, 0.35);
  running.set(phi, meanK);
  const meanY = square.Y(runningMean(phi));
  mean.setAttribute("y1", meanY); mean.setAttribute("y2", meanY); showSVG(mean, meanK);
  meanPoint.setAttribute("cx", square.X(phi)); meanPoint.setAttribute("cy", meanY); showSVG(meanPoint, meanK);
  op(halfLabel, KIT.textIn(t, T.positive) * swap(t,T.b5).oldK);
  const fluxK = powerOut(t, T.steady, D_FLUX);
  flux.setAttribute("d", `M1138 ${meanY} H1216 M1200 ${meanY-12} L1216 ${meanY} L1200 ${meanY+12}`);
  showSVG(flux, fluxK); op(fluxLabel, KIT.textIn(t,T.steady));
  ledger.forEach(({el, at, next}) => op(el, KIT.entryIn(t, el, at) * (next == null ? 1 : 1 - powerIn(t,next-0.25,0.25))));
  const actualK = back * (1 - powerIn(t,T.pulses-0.25,0.25));
  op(actualLayer, actualK); op(actualTitle, 1); op(actualError, 1);
  const adjust = sineInOut(t,T.adjusts,Math.max(D_ADJ,T.inside-T.adjusts));
  const ax = mix(1354,1558,adjust), ay = mix(282,434,adjust);
  actualTarget.setAttribute("cx",ax); actualTarget.setAttribute("cy",ay);
  actualError.style.left = (ax + 40) + "px"; actualError.style.top = (ay - 35) + "px";
  actualLead.set(ax,ay,ax+30,ay-20,1);

  op(amplitudeLayer,pK); amplitude.setK(1); op(amplitudeTitle,1); op(amplitudeTime,1);
  const pulseProgress = KIT.linear(t,T.pulses,pulseSpan);
  ampCurve.set(pulseProgress,1);
  dampCurve.set(Math.max(pulseX(T.damp),pulseProgress),t>=T.damp?1:0);
  amplitudePoint.setAttribute("cx",amplitude.X(pulseProgress));
  amplitudePoint.setAttribute("cy",amplitude.Y(pulseLengthAt(Math.min(t,T.end-0.5))));
  amplitudePoint.setAttribute("fill",t<T.damp?"var(--stress)":"var(--viscosity)");
  const gLabelK=powerOut(t,T.amp,0.35), dLabelK=powerOut(t,T.damp,0.35);
  op(growthLabel,gLabelK); op(dampingLabel,dLabelK);
  growthLead.set(amplitude.X(pulseX(T.amp+D_AMP)),amplitude.Y(0.75),1490,310,powerOut(t,T.amp+D_AMP,0.25));
  dampingLead.set(amplitude.X(pulseX(T.damp+D_DAMP)),amplitude.Y(0.75*0.14),1690,630,powerOut(t,T.damp+D_DAMP,0.25));
  const coneK = gate(t, T.b6, T.back - 0.3, 0.35, 0.3);
  op(coneLayer, coneK);
  const outside = powerOut(t, T.outside, D_OUTSIDE);
  const adjustment = 0;
  const weights = sineInOut(t, T.weights, D_SWEEP);
  const q = P(2 * weights, weights);
  allowed.setAttribute("cx", q[0]); allowed.setAttribute("cy", q[1]);
  showSVG(allowed, powerOut(t, T.weights, 0.35));
  const qTarget = P(2, 2.6);
  target.setAttribute("cx", qTarget[0]); target.setAttribute("cy", qTarget[1]);
  showSVG(target, outside);
  const labelsK = 1;
  op(rayPlus, labelsK); op(rayMinus, labelsK);
  op(coefficients, powerOut(t, T.weights + D_SWEEP, 0.35));
  weightsLead.set(P(2,1)[0], P(2,1)[1], 696, 320, powerOut(t, T.weights + D_SWEEP, 0.35));
  op(sLabel, 1); op(dLabel, 1);
  const cannotK = outside * (1 - powerIn(t, T.adjusts - 0.25, 0.25));
  op(cannot, cannotK);
  targetLead.set(qTarget[0], qTarget[1], qTarget[0]-13, qTarget[1], cannotK);
  chapter.setTime(t); if (t >= 2) op(chapter.el, stay); strip.setTime(t, stay); subs.setTime(t);
};
window.setTime(0);
