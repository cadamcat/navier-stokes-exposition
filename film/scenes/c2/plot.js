/* Heat-equation family drawn as one profile plus earlier ghosts.
   width² = σ₀² + 4 k s, amplitude = 1 / width. Exact shape, chosen scales. */
const SVGNS = "http://www.w3.org/2000/svg";
const SIGMA0 = 0.42;
const HEAT_K = 0.3;
const GHOSTS = [0.55, 1.15, 1.75];
const X0 = 78;
const X1 = 800;
const Y0 = 36;
const Y1 = 400;
const XM0 = -3.2;
const XM1 = 3.2;
const YM1 = 2.75;

function el(name, attrs) {
  const e = document.createElementNS(SVGNS, name);
  if (attrs) {
    for (const k in attrs) e.setAttribute(k, attrs[k]);
  }
  return e;
}

function xp(x) { return X0 + (x - XM0) / (XM1 - XM0) * (X1 - X0); }
function yp(y) { return Y1 - Math.max(0, y) / YM1 * (Y1 - Y0); }

export function widthOf(s) {
  return Math.sqrt(SIGMA0 * SIGMA0 + 4 * HEAT_K * s);
}

export function heightAt(x, s) {
  const w = widthOf(s);
  return Math.exp(-(x * x) / (w * w)) / w;
}

function pathFor(s) {
  let d = "";
  for (let i = 0; i <= 96; i++) {
    const x = XM0 + (XM1 - XM0) * i / 96;
    const y = heightAt(x, s);
    d += (i ? "L" : "M") + xp(x).toFixed(2) + " " + yp(y).toFixed(2) + " ";
  }
  return d;
}

export function mountHeat(parent) {
  const svg = el("svg", { width: "860", height: "460", viewBox: "0 0 860 460" });
  svg.classList.add("stage-abs");
  svg.style.left = "150px";
  svg.style.top = "300px";
  svg.style.opacity = "0";
  parent.appendChild(svg);

  svg.appendChild(el("line", {
    x1: String(X0), y1: String(Y1), x2: String(X1), y2: String(Y1),
    stroke: "var(--ink-muted)", "stroke-width": "2",
  }));
  svg.appendChild(el("polygon", {
    points: X1 + "," + Y1 + " " + (X1 - 14) + "," + (Y1 - 6) + " " + (X1 - 14) + "," + (Y1 + 6),
    fill: "var(--ink-muted)",
  }));
  svg.appendChild(el("line", {
    x1: String(X0), y1: String(Y1), x2: String(X0), y2: String(Y0),
    stroke: "var(--ink-muted)", "stroke-width": "2",
  }));
  svg.appendChild(el("polygon", {
    points: X0 + "," + Y0 + " " + (X0 - 6) + "," + (Y0 + 14) + " " + (X0 + 6) + "," + (Y0 + 14),
    fill: "var(--ink-muted)",
  }));

  const ghosts = GHOSTS.map(function () {
    const p = el("path", { fill: "none", stroke: "var(--obj-hopping)", "stroke-width": "3", opacity: "0" });
    svg.appendChild(p);
    return p;
  });
  const live = el("path", {
    fill: "none", stroke: "var(--obj-hopping)", "stroke-width": "5", "stroke-linecap": "round",
  });
  svg.appendChild(live);

  function flank(sign) {
    const g = el("g", { opacity: "0" });
    const shaft = el("line", { stroke: "var(--obj-wave)", "stroke-width": "4", "stroke-linecap": "round" });
    const head = el("polygon", { fill: "var(--obj-wave)" });
    g.appendChild(shaft);
    g.appendChild(head);
    svg.appendChild(g);
    return { g: g, shaft: shaft, head: head, sign: sign };
  }
  const flanks = [flank(-1), flank(1)];

  function set(s, flankK) {
    live.setAttribute("d", pathFor(Math.max(0, s)));
    for (let i = 0; i < GHOSTS.length; i++) {
      const gs = GHOSTS[i];
      if (s > gs + 0.05) {
        ghosts[i].setAttribute("d", pathFor(gs));
        ghosts[i].setAttribute("opacity", "0.35");
      } else {
        ghosts[i].setAttribute("opacity", "0");
      }
    }
    const w = widthOf(Math.max(0, s));
    for (let i = 0; i < flanks.length; i++) {
      const f = flanks[i];
      const x = f.sign * Math.min(2.4, 0.95 * w);
      const y = heightAt(x, Math.max(0, s));
      const x1 = xp(x);
      const y1 = yp(y);
      const x2 = xp(x + f.sign * 0.55);
      const y2 = y1;
      f.shaft.setAttribute("x1", x1.toFixed(2));
      f.shaft.setAttribute("y1", y1.toFixed(2));
      f.shaft.setAttribute("x2", x2.toFixed(2));
      f.shaft.setAttribute("y2", y2.toFixed(2));
      const tip = f.sign;
      f.head.setAttribute("points", [
        (x2 + tip * 16).toFixed(2) + "," + y2.toFixed(2),
        (x2 - tip * 2).toFixed(2) + "," + (y2 - 8).toFixed(2),
        (x2 - tip * 2).toFixed(2) + "," + (y2 + 8).toFixed(2),
      ].join(" "));
      f.g.setAttribute("opacity", String(flankK <= 0.001 ? 0 : flankK >= 0.999 ? 1 : flankK));
    }
  }

  set(0, 0);
  return { svg: svg, set: set, pageX: function (x) { return 150 + xp(x); }, pageY: function (y) { return 300 + yp(y); } };
}
