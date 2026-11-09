/* Comparator statements and independently rerun kernel checks. */
installBeats(window.__BEATS__);

const INTRO = need("c10b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word");
const TAGC = need("c10b1", "C", 0.45, "theorem tagged C");
const TAGD = need("c10b1", "D", 0.5, "periodic theorem tagged D");
const VIS = need("c10b1", "viscosity", 0.5, "every positive viscosity underlined");
const ADM = need("c10b1", "admissible", 0.5, "admissible data and force underlined");
const EXS = need("c10b1", "exists", 0.45, "no admissible global smooth solution underlined");
const SHRINK = need("c10b2", "Its", 0.6, "theorem panel fades for the table");
const SM = need("c10b2", "smoothness", 0.4, "smoothness pair lights");
const INC = need("c10b2", "incompressibility", 0.4, "divergence-free pair lights");
const SAME = need("c10b2", "same", 0.4, "initial data pair lights");
const DEC = need("c10b2", "decay", 0.4, "decay pair lights");
const FIN = need("c10b2", "finite", 0.4, "finite energy pair lights");
const PER = need("c10b2", "periodic", 0.4, "periodic pair lights");
const NONE = need("c10b2", "none", 0.45, "source comparison footer");
const BACK = need("c10b3", "No", 0.55, "table leaves and the theorem returns");
const HYP = need("c10b3", "hypothesis", 0.55, "only hypotheses");
const REC = need("c10b3", "rebuilt", 0.5, "rebuilt development");
const CHECK = need("c10b3", "kernels", 0.45, "two independent kernels accept both theorems");
const AXIOMS = need("c10b3", "axioms", 0.4, "only the three standard axioms");
const CLEAR = need("c10b4", "In", 0.55, "theorem leaves for the comparison");
const DER = need("c10b4", "derivative", 0.6, "inverse estimate row");
const PRES = need("c10b4", "pressure", 0.7, "pressure flux row");
const REF = need("c10b4", "refutes", 0.5, "neither C nor D refuted");
const OUT = need("c10b4", "tail", 0.8, "picture fades out");


const {op, gate, swap, powerOut, powerIn} = KIT;
const T = {
  C: cue("c10b1", "C"), D: cue("c10b1", "D"),
  vis: cue("c10b1", "viscosity"), adm: cue("c10b1", "admissible"), exs: cue("c10b1", "no"),
  table: beatStart("c10b2"), smooth: cue("c10b2", "smoothness"), inc: cue("c10b2", "incompressibility"),
  same: cue("c10b2", "same"), decay: cue("c10b2", "decay"), finite: cue("c10b2", "finite"),
  per: cue("c10b2", "periodic"), compared: cue("c10b2", "Compared"), none: cue("c10b2", "none"),
  back: beatStart("c10b3"), hyp: cue("c10b3", "hypothesis"), record: cue("c10b3", "rebuilt"),
  kernels: cue("c10b3", "kernels"), axioms: cue("c10b3", "axioms"),
  estimates: beatStart("c10b4"), names: cue("c10b4", "Alexander"), two: cue("c10b4", "two"),
  proof: cue("c10b4", "proof"), paper: cue("c10b4", "paper"), der: cue("c10b4", "derivative"),
  pressure: cue("c10b4", "pressure"), ref: cue("c10b4", "refutes"), but: cue("c10b4", "but"),
};
const chapter = chapterLabel({n: 10, title: "What the Lean development states", intro: 2.0});
const content = KIT.layer();
const svg = KIT.overlay(content);
const txt = (name, words, x, y, kind="aux", w) => KIT.text(content, name, words, {x,y,w,kind});
const ledger = [];
function entry(name, words, y, at, next, kind="aux") {
  const el=txt(name,words,1256,y,kind,544);
  ledger.push({el,at,next}); return el;
}
const abridged=KIT.note(content,"abridged","abridged; ℝ³ is EuclideanSpace ℝ (Fin 3)");
const source=entry("source","openai/NavierStokesAndEuler\n@ f9e8bc5\nNavierStokes.Comparator",652,T.C,T.vis);
const comparison=entry("comparison-limit","our comparison;\nnot a formal equivalence proof",272,T.compared,T.none);


/* Source identifiers are unchanged; line breaks expose the logical clauses. */
const sourceLines = [
  "theorem navier_stokes_breakdown_R3",
  "    (nu : ℝ) (hnu : nu > 0) :",
  "    ∃ (u₀ : ℝ³ → ℝ³) (f : ℝ³ → ℝ → ℝ³),",
  "    InitialVelocityConditionDecay u₀ ∧",
  "    ForceConditionDecay f ∧",
  "    ¬ (∃ v p,",
  "      NavierStokesExistenceAndSmoothnessRn",
  "        nu u₀ f v p)",
];
const symbol = {"ℝ":"\\mathbb R", "³":"{}^3", "₀":"{}_0", "∃":"\\exists", "∧":"\\land", "¬":"\\lnot", "→":"\\to", ">":"\\gt"};
function appendCode(parent, code) {
  code.split(/(\bnu\b|u₀|\bf\b)/).forEach(part => {
    const span = document.createElement("span");
    if (part === "nu") span.className="code-nu";
    if (part === "u₀") span.className="code-u";
    if (part === "f") span.className="code-f";
    for (const ch of part) {
      if (!symbol[ch]) span.append(document.createTextNode(ch));
      else {const g=document.createElement("span"); g.className="lean-sym"; katex.render(symbol[ch],g,KIT.KX); span.append(g);}
    }
    parent.append(span);
  });
}
function codePanel(name, y, h) {
  const d=document.createElement("div");
  d.className="lean-panel stage-abs"; d.dataset.box=name; d.dataset.words="skip";
  Object.assign(d.style,{left:"120px",top:y+"px",width:"1112px",height:h+"px"});
  content.append(d); return d;
}
const panelC=codePanel("theorem-c",156,456);
const marks=[];
sourceLines.forEach((line,i)=>{
  const d=document.createElement("div"); d.className="t-code lean-line";
  const span=document.createElement("span"); span.className="code-clause";
  appendCode(span,line); d.append(span); panelC.append(d); marks.push(span);
});
const panelD=codePanel("theorem-d",686,92);
const dLine=document.createElement("div"); dLine.className="t-code lean-line";
appendCode(dLine,"navier_stokes_breakdown_periodic"); panelD.append(dLine);
const tagC=txt("tag-c","C",120,106,"strong");
const tagD=txt("tag-d","D",120,638,"strong");
const vis=entry("every-viscosity","every $\\nu>0$",270,T.vis,T.adm,"label");
const adm=entry("admissible","admissible data\nand force",350,T.adm,T.exs,"label");
const exs=entry("no-global","no admissible global\nsmooth solution",462,T.exs,T.table,"label");
const hyp=entry("hypotheses","only hypotheses",120,T.hyp,T.record,"label");
const noAssumption=entry("no-assumption","no vortex, no estimate assumed",188,T.hyp,T.record);

/* Paired rows keep the six-clause scaffold while words arrive one pair at a time. */
const headPaper=txt("fefferman","Fefferman",138,120,"label");
const headLean=txt("lean-head","Lean",962,120,"label");
headLean.style.color="var(--status-lean)";
const rows=[
 ["smooth velocity and pressure",["velocity_smooth,", "pressure_smooth"],T.smooth,T.inc],
 ["divergence-free",["div_free"],T.inc,T.same],
 ["the same initial data",["initial_condition"],T.same,T.decay],
 ["decay of data and force",["decay"],T.decay,T.finite],
 ["finite energy,\none uniform bound",["integrable,", "globally_bounded_energy"],T.finite,T.per],
 ["periodic velocity and pressure",["isOnePeriodic_velocity,", "isOnePeriodic_pressure"],T.per,T.compared],
].map((r,i)=>{
 /* Two equal columns across the frame: Fefferman's clause in full ink beside the Lean predicate. */
 const y=180+i*96, H=88;
 const a=KIT.svgEl(svg,"rect",{x:120,y,width:800,height:H,rx:6,fill:"var(--paper-raised)"});
 const b=KIT.svgEl(svg,"rect",{x:944,y,width:856,height:H,rx:6,fill:"var(--paper-raised)"});
 const ba=KIT.svgEl(svg,"rect",{x:120,y,width:4,height:H,fill:"var(--ink)"});
 const bb=KIT.svgEl(svg,"rect",{x:944,y,width:4,height:H,fill:"var(--status-lean)"});
 const ruleA=KIT.svgEl(svg,"line",{x1:120,y1:y+H,x2:920,y2:y+H,stroke:"var(--rule)","stroke-width":1});
 const ruleB=KIT.svgEl(svg,"line",{x1:944,y1:y+H,x2:1800,y2:y+H,stroke:"var(--rule)","stroke-width":1});
 const left=txt("paper-clause-"+i,r[0].replace("\n"," "),142,y+24,"label");
 left.style.color="var(--ink)";
 const right=document.createElement("div");right.className="stage-abs clause-code";right.dataset.box="lean-clause-"+i;right.dataset.words="skip";
 const code=r[1].join(" ").length<=40?[r[1].join(" ")]:r[1];   // one line where it fits
 Object.assign(right.style,{left:"966px",top:y+(code.length>1?-6:21)+"px",width:"820px"});
 code.forEach(s=>right.append(renderLeanLine(s)));content.append(right);
 return {a,b,ba,bb,ruleA,ruleB,left,right,on:r[2],off:r[3]};
});
const assessment=entry("assessment","we found none missing",192,T.none,T.back,"strong");
/* The finding and its qualification sit under the table, on one line. */
Object.assign(assessment.style,{left:"120px",top:"772px",width:"340px"});
KIT.fill(comparison,"our comparison; not a formal equivalence proof");
Object.assign(comparison.style,{left:"480px",top:"778px",width:"720px"});
const recordHead=entry("record-heading","rebuilt the development\nran its checker",284,T.record,T.kernels,"label");
const rerun=entry("record-rerun","two independent kernels\naccept both theorems",430,T.kernels,T.estimates,"label");
const axioms=entry("record-axioms","only the three standard axioms",568,T.axioms,T.estimates);
[recordHead,rerun,axioms].forEach(el => { el.style.color="var(--status-lean)"; });

const credit=[
 entry("credit-bastounis","Alexander Bastounis",96,T.names,T.two,"label"),
 entry("credit-circelli","Fabian Circelli",140,cue("c10b4","Fabian"),T.two,"label"),
 entry("credit-hansen","Anders Hansen",184,cue("c10b4","Anders"),T.two,"label"),
];
const creditDate=entry("credit-date","6 October 2026",236,T.estimates,T.two);
const order=entry("output-order","$m$ = w.length\noutput derivatives",304,T.der-0.5,T.pressure);
const normA=entry("norm-a","$A_R$: $L^2$ norm of $\\nabla w$,\ncut off at radius $R$",404,T.pressure,T.ref);
const normB=entry("norm-b","$B_R$: localized $L^6$ norm of $w$;\ncutoff radius $R$; $w=v-u$",504,T.pressure,T.ref);
const paperHead=txt("paper-estimate","paper",138,136,"label");
const leanHead=txt("lean-estimate","Lean",694,136,"label");
const inverseLabel=txt("inverse-label","inverse estimate",138,194,"aux");
const invPaper=txt("inverse-paper","$m+4$ in, $m$ out",138,248,"label");
const invLean=txt("inverse-lean","$\\texttt{w.length}+5$ in",694,248,"label");
const pressureLabel=txt("pressure-label","pressure flux bound",138,354,"label");
const tableRules=[324,794].map(y=>KIT.svgEl(svg,"line",{x1:120,y1:y,x2:1232,y2:y,stroke:"var(--rule)","stroke-width":1.5}));
const diff=tex=>"\\htmlClass{estimate-diff}{"+tex+"}";
const fp=KIT.formula(content,"pressure-paper", "\\begin{aligned}&\\frac{C_T}{R}\\big["+diff("(B_R+1)B_R^{1/2}")+"\\\\&\\quad+"+diff("R^{-3/4}")+"B_R^{3/4}\\big]\\end{aligned}",{x:138,y:442,w:520,h:250});
const fl=KIT.formula(content,"pressure-lean", "\\begin{aligned}&C_P\\big["+diff("(B_R^{1/2}+1)")+"\\\\&\\quad"+diff("\\big(\\frac{A_R}{R}+\\frac1{R^2}\\big)")+"\\\\&\\quad+"+diff("R^{-7/4}")+"B_R^{3/4}\\big]\\end{aligned}",{x:694,y:416,w:538,h:310});
const paperEq=txt("paper-equation","(10.19)",138,744);
const leanUse=txt("lean-use","used in uniqueness",694,744);
const result1=entry("counterexample","no counterexample to C or D",666,T.ref,T.but);
const result2=entry("printed-estimates","not every printed estimate\nchecked as written",742,T.but,beatHoldEnd("c10b4"));
const strip=mountStripJX(document.body, {labels: {c10b1: "Lean · formal theorem", c10b3: "Lean · two independent kernels accept both theorems"}});
const subs=mountSubtitles(document.body,window.__BEATS__);
window.sceneEvents=Object.entries(T).map(([what,t])=>({t,what,beat:t<T.table?"c10b1":t<T.back?"c10b2":t<T.estimates?"c10b3":"c10b4"}));
window.sceneDuration = Math.ceil(window.__BEATS__.duration * 30) / 30;
window.setTime=t=>{
 chapter.setTime(t);subs.setTime(t);
 const stay=1-powerIn(t,beatHoldEnd("c10b4")-0.5,0.5);
 if(t>=2) op(chapter.el,stay);
 strip.setTime(t,stay);op(content,stay);
 const s2=swap(t,T.table), s3=swap(t,T.back), s4=swap(t,T.estimates);
 const first=s2.oldK, returned=s3.newK*s4.oldK;
 op(panelC,Math.max(first,returned));
 op(panelD,first*KIT.textIn(t,T.D,TAGD));
 op(tagC,first*KIT.textIn(t,T.C,TAGC));
 op(tagD,first*KIT.textIn(t,T.D,TAGD));
 const v=powerOut(t,T.vis,VIS), a=powerOut(t,T.adm,ADM), e=powerOut(t,T.exs,EXS);
 marks.forEach((m,i)=>{
  const k=i===1?Math.max(v*first,returned*powerOut(t,T.hyp,HYP)):i===3||i===4?a*first:i>=5?e*first:0;
  m.style.backgroundImage="linear-gradient(var(--status-lean),var(--status-lean))";
  m.style.backgroundSize=(k*100).toFixed(2)+"% 2px";
 });
 const table=s2.newK*s3.oldK;
 op(headPaper,table);op(headLean,table);
 rows.forEach(r=>{
  const k=table*KIT.textIn(t,r.on);
  [r.left,r.right,r.a,r.b,r.ba,r.bb].forEach(n=>op(n,k));
  [r.ruleA,r.ruleB].forEach(n=>op(n,table));
 });
 ledger.forEach(({el,at,next})=>{
  let topic=el===source||[tagC,tagD,vis,adm,exs].includes(el)?first:
    el===comparison||el===assessment?table:
    [hyp,noAssumption,recordHead,axioms,rerun].includes(el)?returned:s4.newK;
  const until = [hyp,noAssumption,recordHead].includes(el) ? 1-powerIn(t,next-0.25,0.25) : 1;
  op(el,topic*KIT.entryIn(t, el, at)*until);
 });
 op(abridged,Math.max(first,returned));
 const estimates=s4.newK;
 [paperHead,leanHead].forEach(n=>op(n,estimates));
 const inverse=estimates*KIT.textIn(t,T.der,DER);
 [inverseLabel,invPaper,invLean].forEach(n=>op(n,inverse));
 const pressure=estimates*KIT.textIn(t,T.pressure,PRES);
 op(pressureLabel,pressure);
 [fp,fl].forEach(f=>{f.setTime(t);op(f.el,pressure);});
 [paperEq,leanUse].forEach(n=>op(n,pressure));
 tableRules.forEach(n=>op(n,estimates));
};
window.setTime(0);
