/* A schematic vortex, followed continuously through the announcement. */
import { stage3d } from "../three3d/stage3d.js";
import { magnitudeMap } from "../lib/colormap.mjs";
import { makeFlow } from "./flow.js";
import { coreContour } from "../ns/contour.js";

installBeats(window.__BEATS__);

const D_FORCE = need("c1b1", "force", 0.8, "force fades in");
const D_VORTEX = need("c1b1", "vortex", 0.9, "core contour forms");
const D_TIGHT = need("c1b1", "tightens", 6.8, "core contracts");
const D_PEAK = need("c1b1", "peak", 0.45, "schematic rising arrow");
const D_ENERGY = need("c1b1", "energy", 0.45, "schematic bounded energy");
const D_BOUND = need("c1b1", "bounded", 0.4, "bounded bracket");
const D_MOVE = need("c1b2", "On", 0.8, "announcement ledger enters");
const D_PAPER = need("c1b2", "eighth", 3.6, "static original manuscript page stack");
const D_QUOTE = need("c1b2", "Navier–Stokes", 0.4, "typeset attributed title and short theorem excerpt");
const D_CARD = need("c1b2", "eighth", 0.4, "announcement calendar");
const D_VISC = need("c1b2", "viscosity", 0.4, "viscosity line");
const D_GRID = need("c1b2", "alternatives", 0.6, "alternatives grid");
const D_NOT = need("c1b2", "not", 0.45, "A and B muted");
const D_REF = need("c1b3", "announced", 0.4, "refereed line");
const D_LEAN = need("c1b3", "Lean", 0.2, "Lean line");
const OUT = need("c1b3", "tail", 0.8, "picture fades out");
const { Z, op, powerOut, powerIn, sineInOut, gate, swap } = KIT;
const T = {
  force: cue("c1b1", "force"), vortex: cue("c1b1", "vortex"),
  tightens: cue("c1b1", "tightens"), peak: cue("c1b1", "peak"),
  energy: cue("c1b1", "energy"), bounded: cue("c1b1", "bounded"),
  hold: beatEnd("c1b1"), b2: beatStart("c1b2"),
  eighth: cue("c1b2", "eighth"), announced: cue("c1b2", "announced"),
  construction: cue("c1b2", "Navier–Stokes"),
  viscosity: cue("c1b2", "viscosity"), alternatives: cue("c1b2", "alternatives"),
  C: cue("c1b2", "C"), D: cue("c1b2", "D"), not: cue("c1b2", "not"),
  ref: cue("c1b3", "announced"), final: cue("c1b3", "final"),
  end: beatHoldEnd("c1b3"),
};
const content = KIT.layer();
const svg = KIT.overlay(content);
const text = (name, words, x, y, kind = "aux", w) => KIT.text(content, name, words, { x, y, kind, w });
const rest = text("rest", "initially at rest", Z.rail.x, 96, "strong");
const stirring = text("stirring", "smooth force", Z.rail.x, 158, "strong");
stirring.style.color = "var(--force)";
const filmTitle = text("film-title", "A smooth force and a singular fluid", 120, 96, "statement");
const noteField = KIT.note(content, "field-note", "schematic field");
const noteForce = KIT.note(content, "force-note", "schematic force");
const noteShape = KIT.note(content, "shape-note", "schematic core; anisotropy exaggerated");
const noteVolume = KIT.note(content, "volume-note", "schematic core; anisotropy exaggerated; not a material volume");
const coreLabel = text("core-label", "schematic core", 0, 0);
coreLabel.style.color = "var(--velocity)";
const leader = KIT.leader(svg, "--velocity");
const drawing = text("drawing-parameter", "$h=0.2$ (drawing only)", Z.rail.x, 220);
const peak = text("peak", "peak speed", Z.rail.x, 314, "label");
const infinity = text("infinity", "↗ ∞", Z.rail.x + 260, 314, "label");
const energy = text("energy", "total energy", Z.rail.x, 380, "label");
const bounded = text("bounded", "bounded", Z.rail.x + 260, 386);
const bracket = KIT.svgEl(svg, "path", {d: "M 1500 380 H 1490 V 416 H 1500", fill: "none", stroke: "var(--ink-muted)", "stroke-width": 1.5, opacity: 0});
const calendar = text("calendar", "8 September 2026", Z.rail.x, 96, "strong");
const announcer = text("announcer", "OpenAI · announced", Z.rail.x, 146);
const construction = text("announced-construction", "smooth force →\nfinite-time breakdown", Z.rail.x, 194);
const visc = text("viscosity", "every viscosity $\\nu > 0$", Z.rail.x, 278);
const matrix = KIT.matrix(content, {size: "rail", box: "alternatives", x: Z.rail.x, y: 338, rows: ["smooth\nforever", "breakdown"]});
const notAB = text("not-addressed", "$A$, $B$: not addressed", Z.rail.x, 636);
const claimed = KIT.card(content, {box: "announcement-status", status: "claimed", x: Z.rail.x, y: 674,
  title: "announced,", lines: ["not yet independently refereed"]});
const lean = KIT.card(content, {box: "lean-statements", status: "lean", x: Z.rail.x, y: 782,
  title: "final statements", lines: ["also written in Lean"]});
for (const card of [claimed, lean]) card.el.querySelector(".ledger-body").style.padding = "6px 18px 8px";
const tintDefs = KIT.svgEl(svg, "defs", {});
const tintGradient = KIT.svgEl(tintDefs, "radialGradient", {id: "core-tint"});
for (const [offset, opacity] of [[0, 0.18], [0.45, 0.10], [1, 0]])
  KIT.svgEl(tintGradient, "stop", {offset, "stop-color": "var(--velocity)", "stop-opacity": opacity});
const coreTint = KIT.svgEl(svg, "ellipse", {fill: "url(#core-tint)", opacity: 0});
const pages = paperStack({parent: content, box: "manuscript-stack", x: 120, y: 104, w: 1112, h: 710,
  count: 166, aspect: 792 / 612, thumb: n => `../paper/vector/p${String(n).padStart(3, "0")}.svg`});
Array.from(pages.el.querySelectorAll(".paper-thumb")).forEach((el, i) => { el.style.zIndex = String(166 - i); });
const paperSource = text("paper-source", "OpenAI · manuscript · 166 pages", 240, 122, "strong");
const paperTitle = text("paper-title", "Finite Time Blowup\nfor Navier–Stokes", 240, 278, "statement", 870);
const paperBy = text("paper-by", "OpenAI, manuscript, 2026", 240, 428, "strong");
const theoremLabel = text("paper-theorem", "Theorem 1.1 · claimed", 240, 508, "strong");
const theoremQuote = text("paper-quotation", '“For every $\\nu > 0$”', 240, 574, "statement");
const quoteCredit = text("quotation-credit", "— OpenAI, Theorem 1.1 (excerpt)", 240, 658);
const map = magnitudeMap();
const legend = KIT.legend(content, {map, box: "speed-legend", label: "speed (power scale)", ticks: [{u: 0, text: "0"}, {u: 1, text: "faster"}]});
const st = stage3d({left: 120, top: 104, width: 1680, height: 720, fov: 32});
const flow = makeFlow(st, {...T, tightDuration: D_TIGHT, duration: window.__BEATS__.duration}, map, {rail: true});
const contour = coreContour(st);
const chapter = chapterLabel({n: 1, title: "Opening", intro: 0});
const strip = mountStripJX(document.body);
const subs = mountSubtitles(document.body, window.__BEATS__);
window.sceneEvents = [
  [0, "c1b1", "fluid initially at rest"],
  [T.force, "c1b1", "stirring and depth reveal"],
  [T.vortex - 0.3, "c1b1", "camera locks; core forms"],
  [T.tightens, "c1b1", "core tightens"],
  [T.hold, "c1b1", "film title; flow continues at final scale"],
  [T.b2, "c1b2", "continuous vortex translates into the picture zone"],
  [T.eighth, "c1b2", "announcement calendar"],
  [T.viscosity, "c1b2", "every positive viscosity"],
  [T.C, "c1b2", "C framed amber"], [T.D, "c1b2", "D framed amber"],
  [T.ref, "c1b3", "announced, not yet independently refereed"],
  [T.final, "c1b3", "final statements also written in Lean"],
].map(([t, beat, what]) => ({t, beat, what}));
window.sceneDuration = T.end;
window.setTime = function (t) {
  t = Math.max(0, Math.min(t, T.end));
  const stay = 1 - powerIn(t, T.end - 0.5, 0.5);
  const dx = -284 * sineInOut(t, T.b2, D_MOVE);
  const az = KIT.mix(-20, -8, sineInOut(t, T.force, T.vortex - 0.3 - T.force));
  st.orbit([0, 0, 0], az, 26, 10.6);
  const draw = powerOut(t, T.vortex - 0.3, D_VORTEX);
  const {R, L, tau} = flow.scales(t);
  const silhouette = contour.set(R, L, 0);
  flow.setTime(t, 1);
  const bounds = {
    left: Math.min(...silhouette.map(p => p.x)), right: Math.max(...silhouette.map(p => p.x)),
    top: Math.min(...silhouette.map(p => p.y)), bottom: Math.max(...silhouette.map(p => p.y)),
  };
  for (const [key, value] of Object.entries({cx: (bounds.left + bounds.right) / 2 + dx,
    cy: (bounds.top + bounds.bottom) / 2, rx: (bounds.right - bounds.left) * 0.8,
    ry: (bounds.bottom - bounds.top) * 0.65, opacity: draw})) coreTint.setAttribute(key, value);
  st.render();
  st.canvas.style.transform = `translateX(${dx.toFixed(3)}px)`;
  const paperIn = powerOut(t, T.b2, 0.5);
  const paperOut = powerIn(t, T.viscosity + 0.6, 0.6);
  const paperK = paperIn * (1 - paperOut);
  st.setOpacity(stay * (1 - paperK));
  coreTint.style.opacity = String(1 - paperK);
  op(content, stay);
  const openingK = swap(t, T.b2).oldK;
  const stackK = paperIn * (1 - powerIn(t, T.construction - 0.5, 0.4));
  pages.show({enter: 1, fan: 0});
  op(pages.el, stackK);
  op(paperSource, paperK);
  const quoteK = powerOut(t, T.construction, D_QUOTE) * (1 - paperOut);
  for (const el of [paperTitle, paperBy, theoremLabel, theoremQuote, quoteCredit]) op(el, quoteK);
  op(rest, openingK);
  op(stirring, openingK * KIT.textIn(t, T.force, D_FORCE));
  op(drawing, openingK * powerOut(t, T.vortex, 0.4));
  op(filmTitle, gate(t, T.hold - 2.2, T.b2 - 0.25, 0.4, 0.25));
  op(noteField, swap(t, T.force).oldK);
  op(noteForce, gate(t, T.force, T.vortex - 0.55));
  op(noteShape, gate(t, T.vortex - 0.3, T.peak - 0.25));
  op(noteVolume, powerOut(t, T.peak, 0.35) * (1 - paperK));
  const a = st.project([-R, L * 0.6, 0]);
  coreLabel.style.left = (a.x + dx - coreLabel.getBoundingClientRect().width - 64).toFixed(2) + "px";
  coreLabel.style.top = (a.y - 18).toFixed(2) + "px";
  const leaderK = gate(t, 12, 15, 0.4, 0.6) * (1 - paperK);
  op(coreLabel, leaderK);
  leader.set(a.x + dx, a.y, a.x + dx - 52, a.y, leaderK);
  op(peak, KIT.textIn(t, T.peak, D_PEAK) * openingK);
  op(infinity, KIT.textIn(t, T.peak, D_PEAK) * openingK);
  op(energy, KIT.textIn(t, T.energy, D_ENERGY) * openingK);
  op(bounded, KIT.textIn(t, T.bounded, D_BOUND) * openingK);
  bracket.setAttribute("opacity", KIT.textIn(t, T.bounded, D_BOUND) * openingK);
  legend.setOpacity(powerOut(t, T.force, D_FORCE) * openingK);
  const seen = (el, at, next) => op(el, KIT.entryIn(t, el, at));
  seen(calendar, T.eighth, T.announced);
  seen(announcer, T.announced, T.construction);
  seen(construction, T.construction, T.viscosity);
  seen(visc, T.viscosity, T.alternatives);
  matrix.set({k: KIT.textIn(t, T.alternatives, D_GRID),
    C: {frame: KIT.textIn(t, T.C)}, D: {frame: KIT.textIn(t, T.D)},
    A: {dim: KIT.textIn(t, T.not, D_NOT)}, B: {dim: KIT.textIn(t, T.not, D_NOT)}});
  op(notAB, KIT.textIn(t, T.not, D_NOT));
  claimed.setK(KIT.textIn(t, T.ref, D_REF));
  lean.setK(KIT.textIn(t, T.final));
  chapter.setTime(t); op(chapter.el, stay);
  strip.setTime(t, stay);
  subs.setTime(t);
  window.c1State = {t, tau, R, L, dx, camera: {az, el: 26, dist: 10.6}};
};
window.c1Flow = flow;
