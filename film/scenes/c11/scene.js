/* The reception record, the four alternatives, and the closing references. */
import { stage3d } from "../three3d/stage3d.js";
import { makeFlow } from "../ns/flow.js";
import { coreContour } from "../ns/contour.js";

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
const civ=entry("civ","Constantin–Ignatova–Vicol",96,T.first,T.lei,"label");
const preprint=entry("civ-status","September · preprint · claimed",142,T.first,T.lei);
const structured=entry("structured-class","structured class:",184,T.first,T.scope);
const suitable=entry("suitable","suitable weak solution, smooth before the\ncandidate singular time",224,T.scope,T.type);
const axisymmetric=entry("axisymmetric","nonempty, exactly axisymmetric core",306,T.scope,T.type);
const typeII=entry("type-ii","anisotropic Type II bounds on the angular\nmean and its derivatives of order $\\le 2$",348,T.type,T.force);
const force=entry("force-restriction","force: uniform spatial $C^2$ bound\nup to the candidate time",430,T.force,T.clay);
const analytic=entry("analytic-force","force locally uniformly analytic in space\n$\\Rightarrow$ regular at the candidate point",512,T.force+0.8,T.clay);
const lei=entry("lei-ren","Lei–Ren",594,T.lei,T.clay,"label");
const dates=entry("lei-dates","September; 4 November",636,T.lei,T.clay);
const expositions=entry("expositions","expositions: profile and pulses",674,T.lei,T.clay);
const clay=entry("clay","Clay: active",716,T.clay,T.db,"label");
const db=entry("mathdb","MathDB: open",758,T.db,T.report,"label");
const report=entry("referee","no completed independent\nreferee report found",800,T.report,T.b2);
const matrix=KIT.matrix(content,{size:"full",box:"alternatives",x:120,y:128,
  dims:{rowW:80,cellW:508,cellH:252,headH:108,gap:16},rows:["",""]});
KIT.fill(matrix.heads[0],"whole space $\\mathbb{R}^3$");
KIT.fill(matrix.heads[1],"periodic cube $\\mathbb{T}^3$");
const f0=entry("zero-force","$f=0$",136,T.zero,T.smooth,"label");
const forever=entry("all-time","smooth for all time",254,T.smooth,T.data,"label");
const allData=entry("all-data","all admissible data",354,T.data,T.open,"label");
const open=entry("open","$A$, $B$: open",472,T.open,T.matrixOut,"strong");
const schematic=KIT.note(content,"schematic","schematic flows");
const overlay=KIT.overlay(content), leader=KIT.leader(overlay);
const coreLabel=KIT.text(content,"core-label","schematic core",{x:880,y:250,kind:"aux"});
const cellLabels={};
for(const id of ["A","B","C","D"]) {
 const c=matrix.cells[id];
 Object.assign(c.body.style,{top:"160px",whiteSpace:"nowrap"});
 cellLabels[id]=KIT.text(c.pic,"flow-"+id,id==="A"||id==="B"?"calm flow":"vortex",{x:18,y:60,kind:"aux"});
}

/* The top row is a still field of dots, with a clear central region. */
for (const id of ["A", "B"]) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "508"); svg.setAttribute("height", "172");
  for (let j = 0; j < 7; j++) for (let i = 0; i < 17; i++) {
    const u = (i + 0.5) / 17, v = (j + 0.5) / 7;
    const k = Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
    KIT.svgEl(svg, "circle", {cx: 110 + u * 370, cy: 24 + v * 128, r: 1.8,
      fill: "var(--ink-muted)", opacity: k * 0.5});
  }
  matrix.cells[id].pic.appendChild(svg);
}
const map = magnitudeMap();
/* The same vortex remains the subject while its reception is described. */
const previewStage = stage3d({left: 120, top: 230, width: 1112, height: 600, fov: 32});
const previewFlow = makeFlow(previewStage, {force: 0, tightens: 1, tightDuration: 2, peak: 1e9, duration: T.holdEnd + 12}, map,
  {left: 120, top: 230, count: 240, width: 2.2, rail: false});
const previewContour = coreContour(previewStage);
const small = ["C", "D"].map(id => {
  const st = stage3d({left: 70, top: 4, width: 420, height: 170, fov: 32, parent: matrix.cells[id].pic});
  const flow = makeFlow(st, {force: 0, tightens: 1, tightDuration: 2, peak: 1e9, duration: T.holdEnd + 12}, map,
    {left: 0, top: 0, count: 160, width: 1.7, rail: false});
  return {st, flow, contour: coreContour(st, {width: 1.4, halo: 2})};
});
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
  [beatStart("c11b1"), "c11b1", "claimed preprint and analytic-force restriction"],
  [T.scope, "c11b1", "suitable weak solutions; exactly axisymmetric core"],
  [T.type, "c11b1", "anisotropic Type II bounds"],
  [T.force, "c11b1", "uniform spatial C2 force bound up to singular time"],
  [T.lei, "c11b1", "Lei–Ren expositions"],
  [T.report, "c11b1", "no completed independent referee report found"],
  [T.b2, "c11b2", "matrix returns with continuing vortices"],
  [T.zero, "c11b2", "zero-force alternatives"],
  [T.smooth, "c11b2", "smooth for all time"],
  [T.data, "c11b2", "all admissible data"],
  [T.open, "c11b2", "A and B remain open"],
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
  const previewK=clear;
  const previewAz=KIT.mix(-18,-8,sineInOut(t,beatStart("c11b1"),3));
  previewStage.setOpacity(previewK);
  previewStage.orbit([0,0,0],previewAz,26,10.6);
  const previewClock=t+12;
  const {R:previewR,L:previewL}=previewFlow.scales(previewClock);
  const previewPoints=previewContour.set(previewR,previewL,0);
  previewFlow.setTime(previewClock,1);
  previewStage.render();
  const anchor=previewStage.project([previewR,previewL*0.6,0]);
  const right=Math.max(...previewPoints.map(p=>p.x));
  const labelX=anchor.x+64;
  coreLabel.style.left=labelX.toFixed(2)+"px";
  coreLabel.style.top=(anchor.y-18).toFixed(2)+"px";
  const labelK=clear*(1-powerIn(t,T.scope,0.6));
  op(coreLabel,labelK);
  leader.set(anchor.x,anchor.y,labelX-12,anchor.y,labelK);
  const mk=gate(t,T.b2,T.matrixOut,D.grid,0.5);
  const caption=powerOut(t,T.b2+2,0.25);
  const smoothK=KIT.textIn(t,T.smooth,D.open),openK=KIT.textIn(t,T.open,D.open);
  matrix.set({k:mk,
    A:{text:"smooth for all time",textK:smoothK,status:"open ($f=0$)",statusK:openK},
    B:{text:"smooth for all time",textK:smoothK,status:"open ($f=0$)",statusK:openK},
    C:{frame:1,status:"announced, claimed",statusK:caption},
    D:{frame:1,status:"announced, claimed",statusK:caption}});
  ledger.forEach(({el,at,next})=>{
    const topic=[f0,forever,allData,open].includes(el)?mk:clear;
    op(el,topic*KIT.entryIn(t, el, at));
  });
  op(schematic,Math.max(clear,mk));
  for(const el of Object.values(cellLabels))op(el,1);
  const az=KIT.mix(-18,-8,sineInOut(t,T.b2+D.grid,2.6));
  for(const p of small) {
    p.st.orbit([0,0,0],az,26,10.6);
    const clock=t+12;
    const {R,L}=p.flow.scales(clock);
    p.contour.set(R,L,0);
    p.flow.setTime(clock,1);
    p.st.render();
  }
  const ck = powerOut(t, T.card, 0.5) * stay;
  op(credits, ck);
  for (const el of [title, ...refBoxes, locator, credit]) op(el, 1);
  strip.setTime(t, mk > 0 ? mk * stay : clear * stay);
  subs.setTime(t);
  window.c11State = {t, matrixK: mk, creditK: ck, previewCamera: {az:previewAz,el:26,dist:10.6}, camera: {az, el: 26, dist: 10.6}, matrixOut: T.matrixOut, card: T.card};
};
