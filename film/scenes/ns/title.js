/* The argument map advances through sections and their chapter steps.
   The map appears only on section title cards; in-section transitions show a brief title. */
(function (root) {
  const NODES = [
    { label: "Question", from: 2, to: 3 },
    { label: "Known", from: 4, to: 5 },
    { label: "Construction", from: 6, to: 8 },
    { label: "C and D", from: 9, to: 9 },
    { label: "Lean", from: 10, to: 10 },
    { label: "Open", from: 11, to: 11 },
  ];
  const CHAPTERS = {2: "Flow", 3: "A–D", 4: "Results", 5: "Scaling", 6: "Force", 7: "Core", 8: "Smooth", 9: "C, D", 10: "Lean", 11: "Open"};
  const SVG = "http://www.w3.org/2000/svg";
  const base = root.chapterLabel;
  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(SVG, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }
  function map(parent, n, mini) {
    const x = mini ? 0 : 180, dx = mini ? 280 : 312;
    const y = mini ? 19 : 540, sy = mini ? 32 : 660;
    const host = document.createElement("div");
    host.className = "stage-abs";
    Object.assign(host.style, {left: "0", top: "0", width: mini ? "1680px" : "1920px", height: mini ? "68px" : "1080px"});
    parent.appendChild(host);
    const svg = svgEl("svg", {width: mini ? 1680 : 1920, height: mini ? 68 : 1080, class: "stage-abs"}, host);
    const section = Math.max(0, NODES.findIndex(s => n >= s.from && n <= s.to));
    const previous = Math.max(0, NODES.findIndex(s => n - 1 >= s.from && n - 1 <= s.to));
    const lineY = mini ? 32 : y;
    svgEl("line", {x1: x, y1: lineY, x2: x + 5 * dx + (mini ? 44 : 0), y2: lineY, stroke: "var(--rule)", "stroke-width": 1.5}, svg);
    const fill = svgEl("line", {x1: x, y1: lineY, x2: x, y2: lineY, stroke: "var(--ink-muted)", "stroke-width": 2}, svg);
    const sections = [], steps = [];
    NODES.forEach((s, i) => {
      const cx = x + i * dx;
      const label = document.createElement("div");
      label.className = "t-strip stage-abs";
      label.textContent = s.label;
      Object.assign(label.style, {left: (mini ? cx : cx - 140) + "px", top: (mini ? 0 : 574) + "px", width: (mini ? 240 : 280) + "px", textAlign: mini ? "left" : "center"});
      host.appendChild(label);
      const dot = mini ? null : svgEl("circle", {cx, cy: y, r: 7, fill: "var(--paper)", stroke: "var(--rule)", "stroke-width": 2}, svg);
      sections.push({label, dot, i});
      const count = s.to - s.from + 1;
      for (let ch = s.from; ch <= s.to; ch++) {
        const sx = mini ? cx + (ch - s.from) * 88 + 44 : cx + (ch - s.from - (count - 1) / 2) * 88;
        const dot = svgEl("circle", {cx: sx, cy: sy, r: mini ? 5 : 8, fill: "var(--paper)", stroke: "var(--rule)", "stroke-width": 1.5}, svg);
        const tick = svgEl("path", {d: `M ${sx - 3} ${sy} l 2 2 l 4 -5`, fill: "none", stroke: "var(--paper)", "stroke-width": 1.5}, svg);
        {
          const number = document.createElement("div");
          number.className = "t-strip stage-abs";
          number.textContent = CHAPTERS[ch];
          Object.assign(number.style, {left: (sx - 44) + "px", top: (mini ? "42px" : "682px"), width: "88px", textAlign: "center", color: "var(--ink-muted)"});
          host.appendChild(number);
        }
        steps.push({ch, sx, dot, tick});
      }
    });
    const marker = mini ? null : svgEl("circle", {cy: y, r: 11, fill: "var(--ink)", stroke: "var(--paper)", "stroke-width": 3}, svg);
    const ring = svgEl("circle", {cy: sy, r: mini ? 8 : 12, fill: "none", stroke: "var(--ink)", "stroke-width": 2}, svg);
    function setTime(t) {
      const p = root.KIT.sineInOut(t, 0.35, 1.3);
      const current = steps.find(s => s.ch === Math.max(2, n));
      const prior = steps.find(s => s.ch === n - 1) || {sx: current.sx - 30};
      const mx = x + dx * (previous + (section - previous) * p);
      fill.setAttribute("opacity", n < 2 ? 0 : 1);
      fill.setAttribute("x2", mini ? prior.sx + (current.sx - prior.sx) * p : mx);
      if (marker) marker.setAttribute("cx", mx);
      ring.setAttribute("cx", prior.sx + (current.sx - prior.sx) * p);
      ring.setAttribute("opacity", n < 2 ? 0 : 1);
      sections.forEach(({label, dot, i}) => {
        label.style.color = i === section && n >= 2 ? "var(--ink)" : "var(--ink-muted)";
        label.style.fontWeight = i === section && n >= 2 ? "600" : "400";
        if (dot) dot.setAttribute("fill", i < section ? "var(--ink-muted)" : "var(--paper)");
      });
      steps.forEach(({ch, dot, tick}) => {
        const done = ch < n - 1 ? 1 : ch === n - 1 ? p : 0;
        dot.setAttribute("fill", ch < n ? "var(--ink-muted)" : "var(--paper)");
        dot.setAttribute("stroke", ch <= n ? "var(--ink-muted)" : "var(--rule)");
        tick.setAttribute("opacity", done);
      });
    }
    return {host, setTime};
  }
  root.chapterLabel = function (opts) {
    const label = base(Object.assign({}, opts, {intro: 0}));
    const el = label.el;
    el.textContent = "";
    el.dataset.words = "per-text";
    Object.assign(el.style, {left: "120px", top: "8px", width: "1680px", height: "68px", zIndex: "42", background: "transparent"});
    const sectionStart = NODES.some(n => n.from === opts.n);
    const duration = sectionStart && opts.intro > 0 ? opts.intro : 0;
    let cover = null, title = null, large = null;
    if (duration) {
      cover = document.createElement("div");
      cover.className = "title-cover stage-abs";
      title = document.createElement("div");
      title.className = "t-title stage-abs";
      title.dataset.box = "title-card";
      title.textContent = opts.title;
      Object.assign(title.style, {left: "120px", top: "370px", maxWidth: "1680px", whiteSpace: "nowrap"});
      cover.appendChild(title);
      large = map(cover, opts.n, false);
      document.body.appendChild(cover);
    } else if (opts.n > 1) {
      title = document.createElement("div");
      title.className = "t-label t-statement stage-abs";
      title.textContent = opts.title;
      Object.assign(title.style, {left: "1136px", top: "86px", width: "544px", color: "var(--ink-muted)", background: "transparent", whiteSpace: "normal"});
      el.appendChild(title);
    }
    function setTime(t) {
      el.style.transform = "none";
      el.style.opacity = duration && t < duration ? "0" : "1";
      if (cover) {
        large.setTime(t);
        cover.style.display = t >= duration ? "none" : "block";
        title.style.opacity = large.host.style.opacity = String(root.KIT.powerOut(t, 0, 0.35));
      } else if (title) title.style.opacity = String(root.KIT.gate(t, 0, 1.7, 0.35, 0.3));
    }
    // The first picture holds during the silent in-section transition.
    if (!sectionStart && opts.n > 1) {
      let scene;
      Object.defineProperty(root, "setTime", {configurable: true,
        get() { return scene; },
        set(fn) { scene = function (t) { fn(t < 2 ? 2 : t); if (t < 2) setTime(t); }; },
      });
    }
    setTime(0);
    return {el, text: label.text, setTime, intro: duration, cover};
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
