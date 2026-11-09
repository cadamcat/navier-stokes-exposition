/* The film's design kit, one classic script publishing `KIT`. Every picture is a pure function of t.
   Load after lib/kit.js, lib/equation.js, lib/colorbar.js and katex.

   Grid: 12 columns, x 120-1800, column 118, gutter 24. One layout everywhere:
     picture zone  x 120-1232, y 80-880, default centre (676, 480): the subject, always on the left
     rail          x 1256-1800, y 96-880: formulas at the top building down, readouts below
     legend slot   bottom of the rail: right edge 1800, bottom 880, width 260-320, two rows at most
     note slot     x 120, y 838-876 (last baseline about 872): one qualification, one line, 26 px muted
     subtitle      unchanged (y 908-1008); status line: jx/
   A picture that truly needs the width (a curve across the frame, a table) may use x 120-1800 with an empty rail.

   Type: formula or statement 48 beside a picture, 56 alone (never both in a frame); label (the beat's named object)
   32; auxiliary 26 muted; code 32. Text accumulates in a fixed column, in sentence-sized groups.
   Auxiliary text is the chrome tier (the size of the chapter label and the status line), so it carries data-band="aux":
   the two-sizes check then counts the formula and label sizes only, and its bounds are still the content area.

   Curves (MOTION M1-M3): arrive powerOut 0.3-0.5 s, leave powerIn 0.2-0.3 s, layout or camera sineInOut 0.6-1.0 s,
   emphasis 0.25-0.4 s, linear for clocks only. Text never dissolves over text: use swap(). */
(function (root) {
  const clamp01 = x => (x <= 0 ? 0 : x >= 1 ? 1 : x);
  const unit = (t, s, d) => (d > 0 ? clamp01((t - s) / d) : t >= s ? 1 : 0);
  const powerOut = (t, s, d) => 1 - Math.pow(1 - unit(t, s, d), 3);
  const powerIn = (t, s, d) => Math.pow(unit(t, s, d), 3);
  const sineInOut = (t, s, d) => (1 - Math.cos(Math.PI * unit(t, s, d))) / 2;
  const linear = unit;
  /* on from a (arrive over ain), off from b (leave over bout, finished at b + bout) */
  const gate = (t, a, b, ain = 0.35, bout = 0.25) => powerOut(t, a, ain) * (b == null ? 1 : 1 - powerIn(t, b, bout));
  /* sequential swap at time `at`: the old text is gone by `at`, the new one starts there. No overlap. */
  const swap = (t, at, out = 0.25, inn = 0.35) => ({ oldK: 1 - powerIn(t, at - out, out), newK: powerOut(t, at, inn) });
  const mix = (a, b, k) => a + (b - a) * k;

  /* Explanatory entries arrive together at the start of their spoken sentence.
     Picture-state labels use their original geometry/completion clocks instead. */
  function sentenceStart(at) {
    const beats = (root.__BEATS__ || {}).beats || [];
    const beat = beats.find(b => at >= b.start - 0.025 && at < b.holdEnd);
    if (!beat || at > beat.end) return at;
    let start = beat.start;
    for (let i = 0; i < beat.words.length; i++) {
      const word = beat.words[i];
      if (word.start > at + 0.025) break;
      if (i > 0 && /[.!?][”’"']?$/.test(beat.words[i - 1].word)) start = word.start;
    }
    return start;
  }
  const textIn = (t, at, duration = 0.35) => powerOut(t, sentenceStart(at), duration);
  const entryIn = (t, el, at) => powerOut(t, el.dataset.stateArrival ? at : sentenceStart(at), 0.35);

  const Z = {
    picture: { x: 120, y: 80, w: 1112, h: 800, cx: 676, cy: 480 },
    rail: { x: 1256, y: 96, w: 544, right: 1800, bottom: 880 },
    legend: { right: 1800, bottom: 880, w: 320, x: 1480, y: 794 },
    note: { x: 120, y: 838, w: 1112 },
    wide: { x: 120, y: 80, w: 1680, h: 800 },
  };
  const KX = { throwOnError: false, trust: true, strict: false, displayMode: false, output: "html" };
  const SVG = "http://www.w3.org/2000/svg";

  function op(el, v) {
    el.style.opacity = String(v <= 0.001 ? 0 : v >= 0.999 ? 1 : +v.toFixed(4));
  }

  /* the full-frame layer that holds a chapter's DOM content */
  function layer(parent) {
    const d = document.createElement("div");
    d.className = "stage-abs";
    Object.assign(d.style, { left: "0", top: "0", width: "1920px", height: "1080px", pointerEvents: "none" });
    (parent || document.body).appendChild(d);
    return d;
  }

  /* kind: "aux" (26 muted), "label" (32), "strong" (32 semibold), "statement" (48). opts.color: a CSS variable name. */
  function text(parent, name, content, o) {
    const opt = o || {};
    const d = document.createElement("div");
    const kind = opt.kind || "aux";
    d.className = "t-label stage-abs" + (kind === "aux" ? " t-aux" : kind === "strong" ? " strong" : kind === "statement" ? " t-statement" : "");
    d.dataset.box = name;
    if (kind === "aux") d.dataset.band = "aux";
    if (opt.group) d.dataset.group = opt.group;
    Object.assign(d.style, { left: opt.x + "px", top: opt.y + "px", opacity: "0" });
    if (opt.w != null) d.style.width = opt.w + "px";
    if (opt.nowrap !== false) d.style.whiteSpace = opt.w == null || opt.nowrap ? "nowrap" : "normal";
    if (opt.align) d.style.textAlign = opt.align;
    if (opt.color) d.style.color = "var(" + opt.color + ")";
    if (opt.tex) {
      d.dataset.words = "per-text";
      katex.render(content, d, KX);
    } else {
      /* a line may mix words and math: "for every $\\nu > 0$"; \n breaks by hand */
      fill(d, content);
    }
    parent.appendChild(d);
    return d;
  }

  function fill(d, content) {
    d.textContent = "";
    String(content).split("\n").forEach(function (line, i) {
      if (i) d.appendChild(document.createElement("br"));
      line.split("$").forEach(function (piece, k) {
        if (!piece) return;
        if (k % 2) {
          d.dataset.words = "per-text";
          const s = document.createElement("span");
          katex.render(piece, s, KX);
          d.appendChild(s);
        } else {
          d.appendChild(document.createTextNode(piece));
        }
      });
    });
  }

  /* one qualification in the note slot */
  function note(parent, name, content) {
    return text(parent, name, content, { x: Z.note.x, y: Z.note.y, kind: "aux" });
  }

  /* main formula. alone: true sets 56 px (no picture in the frame). Mark terms with \htmlClass{term-x}{...}. */
  function formula(parent, name, tex, o) {
    const opt = o || {};
    const e = root.mountEquation({ parent: parent, x: opt.x, y: opt.y, w: opt.w, h: opt.h || 80, tex: tex, box: name, schedule: opt.schedule || {} });
    e.el.dataset.words = "per-text";
    e.el.style.opacity = "0";
    if (opt.alone) e.el.classList.add("f-alone");
    return e;
  }

  /* the legend, in its slot. rows are label + unit, swatch, ticks: two rows of text at most. */
  function legend(parent, o) {
    const w = o.w || Z.legend.w;
    const bar = root.mountColorbar({
      parent: parent, x: Z.legend.right - w, y: o.y || Z.legend.y, w: w, map: o.map, label: o.label, unit: o.unit,
      ticks: o.ticks, box: o.box || "legend", group: o.group, opacity: 0,
    });
    bar.el.dataset.words = "per-text";
    bar.el.dataset.band = "aux";
    return bar;
  }

  /* an SVG overlay for leaders, axes and marks */
  function overlay(parent) {
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("width", "1920");
    svg.setAttribute("height", "1080");
    svg.setAttribute("viewBox", "0 0 1920 1080");
    svg.setAttribute("class", "stage-abs");
    Object.assign(svg.style, { left: "0", top: "0", pointerEvents: "none" });
    parent.appendChild(svg);
    return svg;
  }
  function svgEl(svg, tag, attrs) {
    const e = document.createElementNS(SVG, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    svg.appendChild(e);
    return e;
  }

  /* a leader: 1.5 px muted, ending in a dot on the object. Never crosses the subject. */
  function leader(svg, token) {
    const c = "var(" + (token || "--ink-muted") + ")";
    const line = svgEl(svg, "line", { stroke: c, "stroke-width": 1.5, opacity: 0 });
    const dot = svgEl(svg, "circle", { r: 3.5, fill: c, opacity: 0 });
    return {
      set(xObj, yObj, xLabel, yLabel, k) {
        line.setAttribute("x1", xObj); line.setAttribute("y1", yObj);
        line.setAttribute("x2", xLabel); line.setAttribute("y2", yLabel);
        dot.setAttribute("cx", xObj); dot.setAttribute("cy", yObj);
        line.setAttribute("opacity", k); dot.setAttribute("opacity", k);
      },
    };
  }

  /* the one chart spec: axes 2 px muted, main curve 3.5 px, comparison curve 2 px dashed, ticks 26 px, labels placed
     by the scene directly at the curve ends (no key). Curves are recomputed from their function up to a parameter,
     so a reveal is exact and a frame depends only on t.
       const ch = KIT.chart(layer, svg, {box, x, y, w, h, xr: [0, 1.2], yr: [0, 5], xTicks: [{v: 1, text: "1"}], yTicks: [...]});
       const c = ch.curve({token: "--velocity", fn: s => ..., from: 0, to: 1, n: 200, dashed: false});
       c.set(upTo, k);    // draw from `from` to upTo with opacity k
       ch.setK(k);        // axes and ticks
       ch.X(v), ch.Y(v)   // page coordinates, for direct labels */
  function chart(parent, svg, o) {
    const X = v => o.x + (v - o.xr[0]) / (o.xr[1] - o.xr[0]) * o.w;
    const Y = v => o.y + o.h - (v - o.yr[0]) / (o.yr[1] - o.yr[0]) * o.h;
    const muted = "var(--ink-muted)";
    const g = svgEl(svg, "g", { opacity: 0 });
    const base = o.y0 != null ? Y(o.y0) : o.y + o.h;
    svgEl(g, "line", { x1: o.x, y1: base, x2: o.x + o.w, y2: base, stroke: muted, "stroke-width": 2 });
    if (o.yAxis !== false) svgEl(g, "line", { x1: o.x, y1: o.y, x2: o.x, y2: o.y + o.h, stroke: muted, "stroke-width": 2 });
    const labels = [];
    (o.xTicks || []).forEach(function (tk, i) {
      const x = X(tk.v);
      svgEl(g, "line", { x1: x, y1: base, x2: x, y2: base + 8, stroke: muted, "stroke-width": 2 });
      const d = text(parent, (o.box || "chart") + "-x" + i, tk.text, { x: x - 60, y: base + 12, w: 120, align: "center", kind: "aux", tex: !!tk.tex });
      labels.push(d);
    });
    (o.yTicks || []).forEach(function (tk, i) {
      const y = Y(tk.v);
      svgEl(g, "line", { x1: o.x - 8, y1: y, x2: o.x, y2: y, stroke: muted, "stroke-width": 2 });
      const d = text(parent, (o.box || "chart") + "-y" + i, tk.text, { x: o.x - 84, y: y - 16, w: 68, align: "right", kind: "aux", tex: !!tk.tex });
      labels.push(d);
    });
    function curve(c) {
      const p = svgEl(svg, "path", {
        fill: c.fill || "none", stroke: "var(" + (c.token || "--ink") + ")",
        "stroke-width": c.width || (c.dashed ? 2 : 3.5), "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0,
      });
      if (c.dashed) p.setAttribute("stroke-dasharray", "9 8");
      const n = c.n || 240;
      let last = null;
      return {
        el: p,
        set(upTo, k) {
          const end = upTo == null ? c.to : Math.min(upTo, c.to);
          p.setAttribute("opacity", k <= 0.001 ? 0 : k >= 0.999 ? 1 : k.toFixed(4));
          if (end === last) return;
          last = end;
          let dd = "";
          let open = false;
          for (let i = 0; i <= n; i++) {
            const s = c.from + (end - c.from) * i / n;
            const v = c.fn(s);
            const ok = Number.isFinite(v) && (c.clipTop == null || v <= c.clipTop);
            if (ok) { dd += (open ? "L" : "M") + X(s).toFixed(2) + " " + Y(v).toFixed(2); open = true; } else open = false;
          }
          p.setAttribute("d", dd);
        },
      };
    }
    return {
      X: X, Y: Y, curve: curve, group: g,
      setK(k) {
        g.setAttribute("opacity", k <= 0.001 ? 0 : k >= 0.999 ? 1 : k.toFixed(4));
        labels.forEach(d => op(d, k));
      },
    };
  }

  /* the one card: raised paper, 4 px status bar, no outline, width fitted to the content. title and lines may mix
     words and $math$. kind "aux" sets the lines at 26 px muted (default); status "lean" adds the seal.
       const c = KIT.card(layer, {box, status, title, lines, x, y});  c.setK(k); */
  function card(parent, o) {
    const el = document.createElement("div");
    el.className = "ledger st-" + (o.status || "context");
    el.dataset.box = o.box || "card";
    el.dataset.words = "per-text";
    Object.assign(el.style, { left: o.x + "px", top: o.y + "px", opacity: "0" });
    if (o.w) el.style.width = o.w + "px";
    const bar = document.createElement("div");
    bar.className = "ledger-bar";
    el.appendChild(bar);
    const body = document.createElement("div");
    body.className = "ledger-body";
    if (o.status === "lean") {
      body.style.display = "flex";
      const seal = document.createElement("div");
      seal.className = "ledger-seal";
      body.appendChild(seal);
    }
    const box = document.createElement("div");
    const title = document.createElement("div");
    title.className = "t-label strong";
    fill(title, o.title || "");
    box.appendChild(title);
    (o.lines || []).forEach(function (line) {
      const d = document.createElement("div");
      d.className = "t-label t-aux ledger-line";
      d.dataset.band = "aux";
      fill(d, line);
      box.appendChild(d);
    });
    body.appendChild(box);
    el.appendChild(body);
    parent.appendChild(el);
    return {
      el: el,
      setK(k) {
        op(el, k);
        el.style.transform = k > 0 && k < 1 ? "translateY(" + (10 * (1 - k)).toFixed(2) + "px)" : "none";
      },
    };
  }

  /* the one matrix of the four alternatives, at two sizes.
       const m = KIT.matrix(layer, {size: "full"|"rail", x, y, cols: [...], rows: [...]});
     Full: rows x columns, each cell has a letter, up to two short text lines (texts: {A: "line one\nline two", ...}),
     a reserved status row and a host m.cells.A.pic for a small picture. Rail: letter and status row only.
       m.set({k, head, rows, A: {k, dim, frame, text, status}, B: ..., C: ..., D: ...})
     k overall opacity; head, rows opacities of the labels; per cell k opacity, dim 0..1 (fades the cell's content
     towards 40 %), frame 0..1 (3 px amber frame, claimed), status text (changed only when the string changes). */
  const MX = {
    full: { rowW: 250, cellW: 707, cellH: 300, gap: 16, headH: 56, textY: 60 },
    rail: { rowW: 150, cellW: 189, cellH: 112, gap: 8, headH: 44, textY: 40 },
  };
  function matrix(parent, o) {
    const s = Object.assign({}, MX[o.size || "full"], o.dims || {});
    const root_ = document.createElement("div");
    root_.className = "mx stage-abs" + (o.size === "rail" ? " mx-rail" : "");
    Object.assign(root_.style, { left: o.x + "px", top: o.y + "px", opacity: "0" });
    parent.appendChild(root_);
    const name = o.box || "matrix";
    const small = o.size === "rail";
    const cols = o.cols || ["\\mathbb{R}^3", "\\mathbb{T}^3"];
    const rows = o.rows || (small ? ["smooth\nforever", "breakdown"] : ["smooth\nfor all time", "breakdown"]);
    const heads = cols.map(function (tex, i) {
      const d = document.createElement("div");
      d.className = "mx-head t-label";
      d.dataset.box = name + "-col" + i;
      d.dataset.words = "per-text";
      Object.assign(d.style, { left: (s.rowW + i * (s.cellW + s.gap)) + "px", top: "0", width: s.cellW + "px", height: s.headH + "px" });
      katex.render(tex, d, KX);
      root_.appendChild(d);
      return d;
    });
    const rowEls = rows.map(function (txt, i) {
      const d = document.createElement("div");
      d.className = "mx-row t-label" + (small ? " t-aux" : "");
      d.dataset.box = name + "-row" + i;
      if (small) d.dataset.band = "aux";
      Object.assign(d.style, { left: "0", top: (s.headH + i * (s.cellH + s.gap) + (small ? 26 : 16)) + "px", width: (s.rowW - 16) + "px" });
      fill(d, txt);
      root_.appendChild(d);
      return d;
    });
    const cells = {};
    ["A", "B", "C", "D"].forEach(function (id, i) {
      const col = i % 2, row = i >> 1;
      const c = document.createElement("div");
      c.className = "mx-cell";
      Object.assign(c.style, { left: (s.rowW + col * (s.cellW + s.gap)) + "px", top: (s.headH + row * (s.cellH + s.gap)) + "px", width: s.cellW + "px", height: s.cellH + "px" });
      const pic = document.createElement("div");
      pic.className = "mx-pic";
      c.appendChild(pic);
      const letter = document.createElement("div");
      letter.className = "mx-letter t-label strong";
      letter.dataset.box = name + "-" + id;
      letter.textContent = id;
      c.appendChild(letter);
      const body = document.createElement("div");
      body.className = "mx-text t-label" + (small ? " t-aux" : "");
      body.dataset.box = name + "-" + id + "-text";
      body.dataset.words = "per-text";
      if (small) body.dataset.band = "aux";
      body.style.top = s.textY + "px";
      c.appendChild(body);
      const status = document.createElement("div");
      status.className = "mx-status t-label t-aux";
      status.dataset.box = name + "-" + id + "-status";
      status.dataset.words = "per-text";
      status.dataset.band = "aux";
      c.appendChild(status);
      const frame = document.createElement("div");
      frame.className = "mx-frame";
      frame.style.opacity = "0";
      c.appendChild(frame);
      root_.appendChild(c);
      if (o.texts && o.texts[id]) fill(body, o.texts[id]);
      cells[id] = { el: c, pic: pic, letter: letter, body: body, status: status, frame: frame, statusText: "", bodyText: o.texts && o.texts[id] || "" };
    });
    const out = {
      root: root_, cells: cells, heads: heads, rowEls: rowEls, dims: s,
      /* page rectangle of a cell, for a picture drawn on a stage above or below the matrix */
      rect(id) {
        const i = ["A", "B", "C", "D"].indexOf(id), col = i % 2, row = i >> 1;
        return { x: o.x + s.rowW + col * (s.cellW + s.gap), y: o.y + s.headH + row * (s.cellH + s.gap), w: s.cellW, h: s.cellH };
      },
      set(v) {
        op(root_, v.k == null ? 1 : v.k);
        const hk = v.head == null ? 1 : v.head;
        heads.forEach(d => op(d, hk));
        const rk = v.rows == null ? 1 : v.rows;
        rowEls.forEach(d => op(d, rk));
        ["A", "B", "C", "D"].forEach(function (id) {
          const c = cells[id], cv = v[id] || {};
          const k = cv.k == null ? 1 : cv.k;
          const dim = 1 - 0.6 * (cv.dim || 0);
          op(c.el, k);
          op(c.letter, 1); op(c.body, cv.textK == null ? 1 : cv.textK); op(c.status, cv.statusK == null ? 1 : cv.statusK);
          op(c.pic, dim);
          op(c.frame, cv.frame || 0);
          if (cv.text != null && cv.text !== c.bodyText) { c.bodyText = cv.text; fill(c.body, cv.text); }
          if (cv.status != null && cv.status !== c.statusText) { c.statusText = cv.status; fill(c.status, cv.status); }
        });
      },
    };
    return out;
  }

  root.KIT = {
    Z, sentenceStart, textIn, entryIn, unit, powerOut, powerIn, sineInOut, linear, gate, swap, mix, op,
    layer, text, fill, note, formula, legend, overlay, svgEl, leader, chart, card, matrix, KX,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
