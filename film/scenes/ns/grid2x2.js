/* Shared 2×2 alternatives grid. Tokens only. The scene sets text and opacity.
   The four cells occupy about 1400×560. Each cell has a condition line, a
   conclusion line and a tag, all inside the frame with padding. */
const SVGNS = "http://www.w3.org/2000/svg";
const KX = { throwOnError: false, trust: true, strict: false, displayMode: false, output: "html" };

const OX = 340;
const OY = 168;
const CW = 692;
const CH = 320;
const GAP = 12;

function box(parent, name, x, y, w, h, opt) {
  const o = opt || {};
  const d = document.createElement("div");
  d.className = "t-label stage-abs" + (o.strong ? " strong" : "");
  d.dataset.box = name;
  if (o.group) d.dataset.group = o.group;
  if (o.words) d.dataset.words = o.words;
  d.style.left = x + "px";
  d.style.top = y + "px";
  d.style.width = w + "px";
  if (h) d.style.height = h + "px";
  d.style.opacity = "0";
  d.style.color = o.color || "var(--ink)";
  if (o.align) d.style.textAlign = o.align;
  d.style.whiteSpace = "normal";
  d.style.boxSizing = "border-box";
  parent.appendChild(d);
  return d;
}

function frame(parent, x, y, w, h) {
  const d = document.createElement("div");
  d.className = "stage-abs";
  d.style.left = x + "px";
  d.style.top = y + "px";
  d.style.width = w + "px";
  d.style.height = h + "px";
  d.style.boxSizing = "border-box";
  d.style.border = "2px solid var(--rule)";
  d.style.opacity = "0";
  d.style.background = "transparent";
  parent.appendChild(d);
  return d;
}

function icon(kind) {
  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("width", "44");
  svg.setAttribute("height", "36");
  svg.setAttribute("viewBox", "0 0 44 36");
  svg.style.display = "block";
  if (kind === "lattice") {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const c = document.createElementNS(SVGNS, "circle");
        c.setAttribute("cx", String(8 + i * 14));
        c.setAttribute("cy", String(6 + j * 12));
        c.setAttribute("r", "2.4");
        c.setAttribute("fill", "var(--ink-muted)");
        svg.appendChild(c);
      }
    }
  } else {
    const r = document.createElementNS(SVGNS, "rect");
    r.setAttribute("x", "6");
    r.setAttribute("y", "4");
    r.setAttribute("width", "28");
    r.setAttribute("height", "24");
    r.setAttribute("fill", "none");
    r.setAttribute("stroke", "var(--ink-muted)");
    r.setAttribute("stroke-width", "2");
    svg.appendChild(r);
  }
  return svg;
}

function head(parent, name, x, y, w, kind, tex) {
  const d = box(parent, name, x, y, w, 0, { words: "per-text", strong: true, align: "center" });
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.justifyContent = "center";
  row.style.gap = "10px";
  row.appendChild(icon(kind));
  const texHost = document.createElement("div");
  katex.render(tex, texHost, KX);
  row.appendChild(texHost);
  d.appendChild(row);
  return d;
}

function line(parent, name, x, y, w) {
  return box(parent, name, x, y, w, 0, { words: "per-text" });
}

export function mountGrid2x2(parent) {
  const root = document.createElement("div");
  root.className = "stage-abs";
  root.style.left = "0";
  root.style.top = "0";
  root.style.width = "1920px";
  root.style.height = "1080px";
  root.style.opacity = "0";
  parent.appendChild(root);

  const title = box(root, "grid-title", 200, 88, 1520, 0, { words: "per-text", align: "center", group: "heads" });
  katex.render("\\text{for every viscosity }\\nu > 0", title, KX);

  const colR = head(root, "col-space", OX, 124, CW, "lattice", "\\mathbb{R}^3");
  const colT = head(root, "col-torus", OX + CW + GAP, 124, CW, "cube", "\\mathbb{T}^3");
  colR.dataset.group = "heads";
  colT.dataset.group = "heads";

  const rowS = box(root, "row-smooth", 124, 270, 200, 0, {});
  rowS.textContent = "smooth for all time";
  const rowB = box(root, "row-break", 124, 590, 200, 0, {});
  rowB.textContent = "breakdown";

  const ax = OX;
  const bx = OX + CW + GAP;
  const ay = OY;
  const by = OY + CH + GAP;
  const frames = {
    A: frame(root, ax, ay, CW, CH),
    B: frame(root, bx, ay, CW, CH),
    C: frame(root, ax, by, CW, CH),
    D: frame(root, bx, by, CW, CH),
  };
  const claimed = frame(root, ax - 8, by - 8, CW * 2 + GAP + 16, CH + 16);
  claimed.style.border = "3px solid var(--status-claimed)";
  claimed.style.opacity = "0";

  const pad = 20;
  const textW = CW - pad * 2;
  function cell(id, x, y) {
    return {
      id: id,
      l1: line(root, "cell-" + id + "-a", x + pad, y + 72, textW),
      l2: line(root, "cell-" + id + "-b", x + pad, y + 180, textW),
      tag: line(root, "cell-" + id + "-tag", x + pad, y + 276, textW),
    };
  }
  const letters = {
    A: box(root, "letter-A", ax + pad, ay + 14, 48, 0, { strong: true }),
    B: box(root, "letter-B", bx + pad, ay + 14, 48, 0, { strong: true }),
    C: box(root, "letter-C", ax + pad, by + 14, 48, 0, { strong: true }),
    D: box(root, "letter-D", bx + pad, by + 14, 48, 0, { strong: true }),
  };
  letters.A.textContent = "A";
  letters.B.textContent = "B";
  letters.C.textContent = "C";
  letters.D.textContent = "D";

  const cells = {
    A: cell("A", ax, ay),
    B: cell("B", bx, ay),
    C: cell("C", ax, by),
    D: cell("D", bx, by),
  };

  const foot = box(root, "grid-foot", 160, 834, 1600, 0, { align: "center" });
  foot.textContent = "The official statement accepts a proof of any one alternative.";

  function show(el, v) {
    const x = v <= 0.001 ? 0 : v >= 0.999 ? 1 : v;
    el.style.opacity = String(x);
  }
  function showAll(v) {
    show(root, v);
  }

  return { root: root, title: title, colR: colR, colT: colT, rowS: rowS, rowB: rowB, frames: frames, claimed: claimed, letters: letters, cells: cells, foot: foot, show: show, showAll: showAll };
}

export function setLine(el, text, tex) {
  el.textContent = "";
  if (tex) katex.render(tex, el, KX);
  else el.textContent = text || "";
}
