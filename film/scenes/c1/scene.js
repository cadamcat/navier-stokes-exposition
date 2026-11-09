/* A schematic vortex, followed continuously through the announcement. */
import { stage3d } from "../three3d/stage3d.js";
import { magnitudeMap } from "../lib/colormap.mjs";
import { makeFlow } from "./flow.js";
import { coreContour } from "../ns/contour.js";
import { makeAlternatives } from "../ns/alternatives.js";

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
const D_NOT = need("c1b2", "not", 0.45, "A and B not addressed; full-colour cells remain");
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
// The table of Figure 1, shared with c3 and c11 (ns/alternatives.js). c1 states only what its narration says.
const alt = makeAlternatives(content, {x: 830, y: 130, w: 970, hAB: 150, hCD: 150, cells: {
  A: {text: "force = 0", status: "not addressed"},
  B: {text: "force = 0", status: "not addressed"},
  C: {text: "smooth force → breakdown"},
  D: {text: "smooth force → breakdown"},
}});
const claimed = KIT.card(content, {box: "announcement-status", status: "claimed", x: 120, y: 692,
  title: "announced,", lines: ["not yet independently refereed"]});
const lean = KIT.card(content, {box: "lean-statements", status: "lean", x: 120, y: 786,
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
  [T.C, "c1b2", "C and D inside one shared claimed frame"], [T.D, "c1b2", "D class: periodic velocity and pressure"],
  [T.ref, "c1b3", "announced, not yet independently refereed"],
  [T.final, "c1b3", "final statements also written in Lean"],
].map(([t, beat, what]) => ({t, beat, what}));
window.sceneDuration = T.end;
window.setTime = function (t) {
  t = Math.max(0, Math.min(t, T.end));
  const stay = 1 - powerIn(t, T.end - 0.5, 0.5);
  const layoutK = sineInOut(t, T.b2, D_MOVE);
  const dx = -530 * layoutK;
  const flowScale = KIT.mix(1, 0.66, layoutK);
  const dy = -80 * layoutK;
  const screenX = x => 960 + (x - 960) * flowScale + dx;
  const screenY = y => 464 + (y - 464) * flowScale + dy;
  /* One slow orbit from the first frame (eased in from rest, peak about 5.5 deg/s), so the resting ring reads as 3D;
     the camera locks before the core forms. */
  const az = KIT.mix(-34, -8, sineInOut(t, 0, T.vortex - 0.3));
  st.orbit([0, 0, 0], az, 26, 10.6);
  const draw = powerOut(t, T.vortex - 0.3, D_VORTEX);
  const {R, L, tau} = flow.scales(t);
  const silhouette = contour.set(R, L, 0);
  flow.setTime(t, 1);
  const bounds = {
    left: Math.min(...silhouette.map(p => p.x)), right: Math.max(...silhouette.map(p => p.x)),
    top: Math.min(...silhouette.map(p => p.y)), bottom: Math.max(...silhouette.map(p => p.y)),
  };
  for (const [key, value] of Object.entries({cx: screenX((bounds.left + bounds.right) / 2),
    cy: screenY((bounds.top + bounds.bottom) / 2), rx: (bounds.right - bounds.left) * 0.8 * flowScale,
    ry: (bounds.bottom - bounds.top) * 0.65 * flowScale, opacity: draw})) coreTint.setAttribute(key, value);
  st.render();
  st.canvas.style.transformOrigin = "50% 50%";
  st.canvas.style.transform = `translate(${dx.toFixed(3)}px, ${dy.toFixed(3)}px) scale(${flowScale.toFixed(4)})`;
  const paperIn = powerOut(t, T.b2, 0.5);
  /* The paper finishes fading before the table's sentence starts. */
  const paperOut = powerIn(t, T.viscosity + 0.25, 0.55);
  const paperK = paperIn * (1 - paperOut);
  /* The vortex, like its note, comes back only after the paper text has gone. */
  const backK = t < T.b2 + 1 ? 1 - paperIn : powerOut(t, T.viscosity + 0.8, 0.35);
  st.setOpacity(stay * backK);
  coreTint.style.opacity = String(backK);
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
  /* The core note leaves as the paper enters and returns only after the paper text has gone (no text over text). */
  op(noteVolume, powerOut(t, T.peak, 0.35) * backK);
  noteVolume.style.top = KIT.mix(Z.note.y, 600, layoutK).toFixed(2) + "px";
  const a = st.project([-R, L * 0.6, 0]);
  coreLabel.style.left = (screenX(a.x) - coreLabel.getBoundingClientRect().width - 64).toFixed(2) + "px";
  coreLabel.style.top = (screenY(a.y) - 18).toFixed(2) + "px";
  const leaderK = gate(t, 12, 15, 0.4, 0.6) * (1 - paperK);
  op(coreLabel, leaderK);
  leader.set(screenX(a.x), screenY(a.y), screenX(a.x) - 52, screenY(a.y), leaderK);
  op(peak, KIT.textIn(t, T.peak, D_PEAK) * openingK);
  op(infinity, KIT.textIn(t, T.peak, D_PEAK) * openingK);
  op(energy, KIT.textIn(t, T.energy, D_ENERGY) * openingK);
  op(bounded, KIT.textIn(t, T.bounded, D_BOUND) * openingK);
  bracket.setAttribute("opacity", KIT.textIn(t, T.bounded, D_BOUND) * openingK);
  legend.setOpacity(powerOut(t, T.force, D_FORCE) * openingK);
  const metadataK = swap(t, T.viscosity).oldK;
  for (const [el, at] of [[calendar, T.eighth], [announcer, T.announced], [construction, T.construction]])
    op(el, KIT.entryIn(t, el, at) * metadataK);
  // The viscosity line precedes the table; the table arrives with its sentence, A and B with their status.
  const tableK = KIT.textIn(t, T.alternatives, D_GRID);
  const abK = KIT.textIn(t, T.not, D_NOT);
  const cdK = KIT.textIn(t, T.C);
  alt.set({k: Math.max(tableK, powerOut(t, T.viscosity, D_VISC)), visc: powerOut(t, T.viscosity, D_VISC),
    heads: tableK, row0: abK, row1: tableK, claim: cdK,
    A: {k: tableK * abK, status: abK}, B: {k: tableK * abK, status: abK},
    C: {k: tableK * cdK, outline: 0}, D: {k: tableK * KIT.textIn(t, T.D), outline: 0}});
  claimed.setK(KIT.textIn(t, T.ref, D_REF));
  lean.setK(KIT.textIn(t, T.final));
  chapter.setTime(t); op(chapter.el, stay);
  strip.setTime(t, stay);
  subs.setTime(t);
  window.c1State = {t, tau, R, L, dx, camera: {az, el: 26, dist: 10.6}};
};
window.c1Flow = flow;
