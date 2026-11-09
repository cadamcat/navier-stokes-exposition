/* The reception record, the four alternatives, and the closing references. */
import { stage3d } from "../three3d/stage3d.js";
import { makeFlow } from "../ns/flow.js";
import { coreContour } from "../ns/contour.js";
import { makeAlternatives } from "../ns/alternatives.js";

installBeats(window.__BEATS__);

const D = {
  intro: need("c11b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word"),
  card: need("c11b1", "engage", 0.4, "first preprint card"),
  lei: need("c11b1", "Lei", 0.4, "second preprint card"),
  clay: need("c11b1", "Clay", 0.4, "Clay status"),
  db: need("c11b1", "MathDB", 0.4, "MathDB status"),
  report: need("c11b1", "report", 0.45, "referee line"),
  clear: need("c11b2", "Nothing", 0.5, "cards leave"),
  grid: need("c11b2", "Nothing", 0.6, "the four alternatives return"),
  zero: need("c11b2", "zero", 0.45, "f = 0 highlighted"),
  open: need("c11b2", "open", 0.45, "open tag"),
  tail: need("c11b2", "tail", 7.5, "picture fades; then the references and credit"),
};

const {Z, op, gate, powerOut, powerIn, sineInOut, swap} = KIT;
const T = {
  first: beatStart("c11b1"),
  scope: cue("c11b1", "Constantin"), type: cue("c11b1", "Vicol"),
  force: cue("c11b1", "Xiao"), lei: cue("c11b1", "Lei"),
  clay: cue("c11b1", "Clay"), db: cue("c11b1", "MathDB"),
  report: cue("c11b1", "no"), b2: beatStart("c11b2"),
  zero: cue("c11b2", "zero"), smooth: cue("c11b2", "smoothness"),
  data: cue("c11b2", "from"), open: cue("c11b2", "open"),
  end: beatEnd("c11b2"), holdEnd: beatHoldEnd("c11b2"),
};
T.matrixOut = T.end;
T.card = T.holdEnd - 6.5;
const chapter = chapterLabel({n: 11, title: "What stays open", intro: 2.0});
const content = KIT.layer();
const ledger=[];
function entry(name,words,y,at,next,kind="aux") {
  const el=KIT.text(content,name,words,{x:1256,y,w:544,kind});
  ledger.push({el,at,next});return el;
}
/* The side column carries what the narration says, level with the vortex. */
const civ=entry("civ","Constantin–Ignatova–Vicol",250,T.first,T.lei,"label");
const preprint=entry("civ-status","September · preprint · claimed",296,T.first,T.lei);
const lei=entry("lei-ren","Lei–Ren",364,T.lei,T.clay,"label");
const dates=entry("lei-dates","September; 4 November · preprints",410,T.lei,T.clay);
const clay=entry("clay","Clay: active",488,T.clay,T.db,"label");
const db=entry("mathdb","MathDB: open",534,T.db,T.report,"label");
const report=entry("referee","no completed independent\nreferee report found",580,T.report,T.b2);
/* The table of Figure 1, as in c1 and c3: A and B open, C and D inside the shared claimed frame. */
const alt=makeAlternatives(content,{x:830,y:130,w:970,hAB:160,hCD:160,cells:{
 A:{text:"every admissible initial velocity;\nforce = 0",status:"open"},
 B:{text:"every admissible initial velocity;\nforce = 0",status:"open"},
 C:{text:"smooth force → breakdown"},
 D:{text:"smooth force → breakdown"}}});
const schematic=KIT.note(content,"schematic","schematic flow");
const overlay=KIT.overlay(content), leader=KIT.leader(overlay);
const coreLabel=KIT.text(content,"core-label","schematic core",{x:930,y:250,kind:"aux"});
const map = magnitudeMap();
/* The same vortex remains the subject while its reception is described. */
const previewStage = stage3d({left: 120, top: 230, width: 1112, height: 600, fov: 32});
const previewFlow = makeFlow(previewStage, {force: 0, tightens: 1, tightDuration: 2, peak: 1e9, duration: T.holdEnd + 12}, map,
  {left: 120, top: 230, count: 240, width: 2.2, rail: false});
const previewContour = coreContour(previewStage);
const strip = mountStripJX(document.body, {labels: {c11b1: "Context · schematic flow", c11b2: "Context · schematic flow; C/D announced, claimed"}});
const subs = mountSubtitles(document.body, window.__BEATS__);

const credits = KIT.layer();
const title = KIT.text(credits, "film-title", "A smooth force and a singular fluid", {x: 120, y: 96, kind: "strong"});
const REFS = [
  { y: 168, text: "Fefferman, The Navier–Stokes equation, official problem description (Clay, 2006)" },
  { y: 214, text: "OpenAI, announcement and manuscript Finite Time Blowup for Navier–Stokes (2026); Lean development NavierStokesAndEuler @ f9e8bc5" },
  { y: 300, text: "Leray, Acta Math. 63 (1934); Hopf, Math. Nachr. 4 (1950)" },
  { y: 346, text: "Fujita and Kato, ARMA 16 (1964)" },
  { y: 392, text: "Caffarelli, Kohn and Nirenberg, CPAM 35 (1982)" },
  { y: 438, text: "Beale, Kato and Majda, CMP 94 (1984)" },
  { y: 484, text: "Escauriaza, Seregin and Šverák, Russian Math. Surveys 58 (2003)" },
  { y: 530, text: "Tao, JAMS 29 (2016)" },
  { y: 576, text: "Luo and Hou (2014); Chen and Hou, PNAS 122 (2025)" },
  { y: 622, text: "Bastounis, Circelli and Hansen, arXiv:2610.08144 (2026)" },
  { y: 668, text: "Constantin, Ignatova and Vicol, arXiv:2609.20803 (2026)" },
  { y: 714, text: "Lei and Ren, arXiv:2609.35406 and arXiv:2611.06869 (2026)" },
  { y: 760, text: "Full list with locators: the accompanying article." },
  { y: 828, text: "Prepared by Yao Xu with AI assistance; the narration voice is synthesized with an OpenAI speech model." },
];
const refBoxes = [];
REFS.slice(0, 12).forEach((row, i) => {
  const col = i < 6 ? 0 : 1, j = i % 6;
  const d = KIT.text(credits, "reference-" + i, row.text, {x: col ? 984 : 120, y: 188 + j * 90, w: 800, kind: "aux", nowrap: false});
  d.dataset.words = "skip";
  refBoxes.push(d);
});
const locator = KIT.text(credits, "locators", REFS[12].text, {x: 120, y: 754, kind: "aux"});
locator.dataset.words = "skip";
const credit = KIT.text(credits, "credit", REFS[13].text, {x: 120, y: 828, w: 1680, kind: "label", nowrap: false});
credit.dataset.words = "skip";
window.sceneEvents = [
  [beatStart("c11b1"), "c11b1", "first preprint (Constantin, Ignatova, Vicol) and Lei–Ren"],
  [T.type, "c11b1", "anisotropic Type II bounds"],
  [T.force, "c11b1", "uniform spatial C2 force bound up to singular time"],
  [T.clay, "c11b1", "Clay, MathDB and referee status"],
  [T.report, "c11b1", "no completed independent referee report found"],
  [T.b2, "c11b2", "the Figure 1 table returns beside the continuing vortex"],
  [cue("c11b2", "Alternatives"), "c11b2", "A and B: every admissible initial velocity, force = 0, open"],
  [T.open, "c11b2", "A and B emphasised: open"],
  [T.matrixOut, "c11b2", "matrix leaves as the final sentence ends"],
  [T.card, "c11b2", "references and credit"],
].map(([t, beat, what]) => ({t, beat, what}));
/* Chapter lengths lie on a 1/30 s grid; the last frame may fall just after the last beat. */
window.sceneDuration = Math.ceil(window.__BEATS__.duration * 30 - 1e-6) / 30;
window.setTime = function (t) {
  t = Math.max(0, Math.min(t, T.holdEnd));
  const stay = 1 - powerIn(t, T.holdEnd - 0.5, 0.5);
  chapter.setTime(t);
  if (t >= 2) op(chapter.el, stay);
  const clear=swap(t,T.b2).oldK;
  /* the table and the vortex beside it leave together as the last sentence ends */
  const mk=gate(t,T.b2,T.matrixOut,D.grid,0.5);
  const previewK=Math.max(clear,mk);
  const previewAz=KIT.mix(-18,-8,sineInOut(t,beatStart("c11b1"),3));
  previewStage.setOpacity(previewK);
  previewStage.orbit([0,0,0],previewAz,26,10.6);
  const previewClock=t+12;
  const {R:previewR,L:previewL}=previewFlow.scales(previewClock);
  previewContour.set(previewR,previewL,0);
  previewFlow.setTime(previewClock,1);
  previewStage.render();
  /* as in c1: the vortex moves into the left column to make room for the table */
  const layoutK=sineInOut(t,T.b2-0.4,0.9);
  const scale=KIT.mix(1,0.7,layoutK), dx=-236*layoutK, dy=-96*layoutK;
  previewStage.canvas.style.transformOrigin="50% 50%";
  previewStage.canvas.style.transform=`translate(${dx.toFixed(3)}px, ${dy.toFixed(3)}px) scale(${scale.toFixed(4)})`;
  const anchor=previewStage.project([previewR,previewL*0.6,0]);
  const labelX=930;
  coreLabel.style.left=labelX+"px";
  coreLabel.style.top=(anchor.y-18).toFixed(2)+"px";
  const labelK=clear*(1-powerIn(t,T.scope,0.6));
  op(coreLabel,labelK);
  leader.set(anchor.x,anchor.y,labelX-12,anchor.y,labelK);
  const cdK=KIT.textIn(t,T.b2+0.3,D.grid), abK=KIT.textIn(t,cue("c11b2","Alternatives"),D.open);
  const emphasis=powerOut(t,T.open,D.open);
  alt.set({k:mk,visc:1,heads:1,row0:abK,row1:cdK,claim:cdK,
    A:{k:abK,focus:emphasis},B:{k:abK,focus:emphasis},
    C:{k:cdK,outline:0},D:{k:cdK,outline:0}});
  ledger.forEach(({el,at,next})=>op(el,clear*KIT.entryIn(t, el, at)));
  op(schematic,previewK);
  const ck = powerOut(t, T.card, 0.5) * stay;
  op(credits, ck);
  for (const el of [title, ...refBoxes, locator, credit]) op(el, 1);
  strip.setTime(t, mk > 0 ? mk * stay : clear * stay);
  subs.setTime(t);
  window.c11State = {t, matrixK: mk, creditK: ck, previewCamera: {az:previewAz,el:26,dist:10.6}, layout: {dx, dy, scale}, matrixOut: T.matrixOut, card: T.card};
};
