/* The one table of the four alternatives, in the layout of the article's Figure 1. Used by c1, c3 and c11.

   every viscosity nu > 0                       (centred over the table)
          whole space R3        unit torus T3   (column heads)
   global smooth existence                      (row label)
   [A ...........]  [B ...........]
   admissible breakdown                         (row label)
          claimed · announced 2026 construction (centred over the shared frame)
   [C ..........|D ...........]                 (one shared claimed frame around C and D)

   Each cell: letter, cell text (label tier, full ink), optional thin rule with a class line below it, optional
   status (label tier, strong) right-aligned on the letter's line. Built only from KIT text and tokens.

     const alt = makeAlternatives(layer, {x, y, w, hAB, hCD, cells: {A: {text, cls, status}, ...}});
     alt.set({k, visc, heads, row0, row1, claim, A: {k, text, cls, status, outline, focus}, ...});
   Every value is an opacity in 0..1 (outline: the cell's own thin outline; claim: the shared frame and its label). */

const LINE = 40;          // line pitch of the 32 px label tier
const PAD = 18;           // cell inner margin

export function makeAlternatives(parent, o) {
  const name = o.box || "alternatives";
  const W = o.w || 970, gap = o.gap || 16;
  const cellW = (W - gap) / 2;
  const hAB = o.hAB || 160, hCD = o.hCD || 160;
  const top = {visc: 0, heads: 52, row0: 104, AB: 150};
  top.row1 = top.AB + hAB + 16;
  top.claim = top.row1 + 46;
  top.CD = top.claim + 48;
  const height = top.CD + hCD;
  const root = document.createElement("div");
  root.className = "stage-abs";
  Object.assign(root.style, {left: o.x + "px", top: o.y + "px", width: W + "px", height: height + "px", opacity: "0"});
  parent.appendChild(root);
  const T = (box, words, x, y, kind, extra) => KIT.text(root, name + "-" + box, words, Object.assign({x, y, kind}, extra || {}));

  const visc = T("viscosity", o.visc || "every viscosity $\\nu > 0$", 0, top.visc, "strong", {w: W, align: "center"});
  const heads = [o.heads ? o.heads[0] : "whole space $\\mathbb{R}^3$", o.heads ? o.heads[1] : "unit torus $\\mathbb{T}^3$"]
    .map((words, i) => T("col" + i, words, i * (cellW + gap), top.heads, "strong", {w: cellW, align: "center"}));
  const rows = ["global smooth existence", "admissible breakdown"]
    .map((words, i) => T("row" + i, words, 0, i ? top.row1 : top.row0, "strong"));

  /* the shared claimed frame and its centred label */
  const claimLabel = T("claim", "", 0, top.claim, "aux", {w: W, align: "center", color: "--ink"});
  const claimWord = document.createElement("span");
  claimWord.textContent = "claimed";
  claimWord.className = "strong";
  claimWord.style.color = "var(--status-claimed)";
  claimLabel.replaceChildren(claimWord, document.createTextNode(" · announced 2026 construction"));
  const frame = document.createElement("div");
  frame.className = "mx-frame";
  Object.assign(frame.style, {left: "0", top: top.CD + "px", width: W + "px", height: hCD + "px", right: "auto", bottom: "auto", opacity: "0"});
  const divider = document.createElement("div");
  Object.assign(divider.style, {position: "absolute", left: (cellW + gap / 2 - 0.75) + "px", top: top.CD + "px", width: "0",
    height: hCD + "px", borderLeft: "1.5px solid var(--status-claimed)", opacity: "0"});

  const cells = {};
  ["A", "B", "C", "D"].forEach((id, i) => {
    const col = i % 2, upper = i < 2, h = upper ? hAB : hCD;
    const spec = (o.cells || {})[id] || {};
    const el = document.createElement("div");
    el.className = "stage-abs";
    Object.assign(el.style, {left: col * (cellW + gap) + "px", top: (upper ? top.AB : top.CD) + "px", width: cellW + "px",
      height: h + "px", background: "var(--paper-raised)", borderRadius: upper ? "6px" : "0", opacity: "0"});
    root.appendChild(el);
    const outline = document.createElement("div");
    Object.assign(outline.style, {position: "absolute", inset: "0", boxSizing: "border-box", border: "1.5px solid var(--rule)",
      borderRadius: upper ? "6px" : "0", opacity: "0"});
    el.appendChild(outline);
    const focus = document.createElement("div");
    Object.assign(focus.style, {position: "absolute", inset: "0", boxSizing: "border-box", border: "2px solid var(--ink-muted)",
      borderRadius: upper ? "6px" : "0", opacity: "0"});
    el.appendChild(focus);
    const pic = document.createElement("div");
    Object.assign(pic.style, {position: "absolute", inset: "0"});
    el.appendChild(pic);
    const C = (box, words, x, y, kind, extra) => KIT.text(el, name + "-" + id + "-" + box, words, Object.assign({x, y, kind}, extra || {}));
    const letter = C("letter", id, PAD, 12, "strong");
    const lines = spec.text ? String(spec.text).split("\n").length : 0;
    const textW = spec.textW || cellW - 2 * PAD;
    const body = C("text", spec.text || "", PAD, 54, "label", {w: textW, color: "--ink"});
    const ruleY = spec.ruleY || 54 + lines * LINE + 14;
    let rule = null, cls = null, status = null;
    if (spec.cls != null) {
      rule = document.createElement("div");
      Object.assign(rule.style, {position: "absolute", left: PAD + "px", right: PAD + "px", top: ruleY + "px",
        borderTop: "1.5px solid var(--rule)", opacity: "0"});
      el.appendChild(rule);
      cls = C("class", spec.cls, PAD, ruleY + 12, "label", {w: cellW - 2 * PAD, color: "--ink"});
    }
    if (spec.status != null) {
      /* the status sits on the letter's line, right-aligned */
      status = C("status", spec.status, cellW / 2, 12, "strong", {w: cellW / 2 - PAD, align: "right", color: "--ink"});
    }
    cells[id] = {el, outline, focus, pic, letter, body, rule, cls, status, w: cellW, h,
      rect: () => ({x: o.x + col * (cellW + gap), y: o.y + (upper ? top.AB : top.CD), w: cellW, h})};
  });
  root.appendChild(frame);
  root.appendChild(divider);

  return {
    root, visc, heads, rows, claimLabel, frame, divider, cells, top, height, cellW,
    /* page rectangle of the whole table and of the shared C/D frame */
    rect: () => ({x: o.x, y: o.y, w: W, h: height}),
    frameRect: () => ({x: o.x, y: o.y + top.CD, w: W, h: hCD}),
    set(v) {
      KIT.op(root, v.k == null ? 1 : v.k);
      KIT.op(visc, v.visc == null ? 1 : v.visc);
      heads.forEach(d => KIT.op(d, v.heads == null ? 1 : v.heads));
      KIT.op(rows[0], v.row0 == null ? 1 : v.row0);
      KIT.op(rows[1], v.row1 == null ? 1 : v.row1);
      const claim = v.claim || 0;
      KIT.op(claimLabel, claim); KIT.op(frame, claim); KIT.op(divider, claim);
      for (const id of ["A", "B", "C", "D"]) {
        const c = cells[id], cv = v[id] || {};
        KIT.op(c.el, cv.k == null ? 1 : cv.k);
        KIT.op(c.letter, 1);
        KIT.op(c.body, cv.text == null ? 1 : cv.text);
        if (c.rule) { KIT.op(c.rule, cv.cls == null ? 1 : cv.cls); KIT.op(c.cls, cv.cls == null ? 1 : cv.cls); }
        if (c.status) KIT.op(c.status, cv.status == null ? 1 : cv.status);
        KIT.op(c.outline, cv.outline == null ? 1 : cv.outline);
        KIT.op(c.focus, cv.focus || 0);
      }
    },
  };
}
