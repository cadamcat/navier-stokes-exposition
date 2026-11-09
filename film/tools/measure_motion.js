#!/usr/bin/env node
/* Measure the motion of a chapter, frame by frame, in pixels at 1080p, without rendering any image.

   Usage (from film/scenes): node ../tools/measure_motion.js c5 [--fps 60] [--from s --to s] [--json FILE] [--purity]

   For each pair of consecutive frames it seeks the scene and takes
     - 3D: every visible mesh of every stage (window.__stages): sampled vertices, through the camera and the
       canvas rectangle (so CSS moves of the canvas count), keyed by mesh and classed by geometry
       (sphere = beads, cone = arrow heads, tube = streamlines, rings and arrow shafts, ...);
     - 2D: every visible [data-box] element and SVG shape: the four edges of its rectangle.
   Subtitles and the status strip are static and left out.

   Printed per contiguous 3D segment (stage visible):
     peak = largest displacement of any vertex between two frames (px/frame) and the class that has it,
     p95  = 95th percentile, over the frames of the segment, of the frame's largest displacement,
     step = stepping index: the largest value, over 0.5 s windows with a peak of at least 1 px/frame, of
            (largest displacement in the window) / (median displacement in the window). Smooth motion
            gives about 1 to 1.5; a parameter that moves in steps (holds, then jumps) gives a large value.
   Then the same for the 2D layer over the whole chapter.

   --purity: every picture must be a pure function of t. At a time every second the scene is reached from
   t - 1 frame, from t - 3 frames (each of the three parallel render pages sees every third frame) and from 0; any box or vertex
   more than 0.25 px apart between these is a history dependence. Exit status 1 if one is found.

   Needs window.__stages (three3d/stage3d.js registers each stage there). */
const fs = require("fs");
const path = require("path");
const { launch, openScene } = require("../scenes/tools/browser");

function parse(argv) {
  const o = { fps: 30, purity: false };
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--fps") o.fps = Number(argv[++i]);
    else if (a === "--from") o.from = Number(argv[++i]);
    else if (a === "--to") o.to = Number(argv[++i]);
    else if (a === "--json") o.json = argv[++i];
    else if (a === "--purity") o.purity = true;
    else pos.push(a);
  }
  o.ch = pos[0];
  return o;
}

function installProbe() {
  const V = new (window.__stages && window.__stages[0] ? window.__stages[0].THREE.Vector3 : Object)();
  const MAX_V = 60;
  function visibleChain(o) {
    for (let e = o; e; e = e.parent) if (!e.visible) return false;
    return true;
  }
  function cls(mesh) {
    const t = mesh.geometry && mesh.geometry.type ? mesh.geometry.type : "mesh";
    if (mesh.isInstancedMesh) return "instanced";
    if (t === "SphereGeometry") return "sphere";
    if (t === "ConeGeometry") return "cone";
    if (t === "BoxGeometry") return "box";
    if (t === "TorusGeometry") return "torus";
    if (t === "BufferGeometry") return mesh.geometry.userData && mesh.geometry.userData.nS ? "lathe" : "tube";
    return t.replace("Geometry", "").toLowerCase();
  }
  function snap3d() {
    const out = [];
    let anyVisible = false;
    (window.__stages || []).forEach(function (st, si) {
      const op = parseFloat(st.canvas.style.opacity === "" ? "1" : st.canvas.style.opacity);
      if (op < 0.05) return;
      const r = st.canvas.getBoundingClientRect();
      const THREE = st.THREE;
      const M = new THREE.Matrix4();
      const IM = new THREE.Matrix4();
      const P = new THREE.Vector3();
      st.scene.updateMatrixWorld(true);
      st.camera.updateMatrixWorld(true);
      st.scene.traverse(function (o) {
        if (!o.isMesh || !visibleChain(o) || !o.geometry || !o.geometry.attributes.position) return;
        const mat = o.material;
        if (!mat || mat.colorWrite === false) return;
        const uo = mat.uniforms && mat.uniforms.uOpacity ? mat.uniforms.uOpacity.value : null;
        const mo = uo != null ? uo : (mat.transparent ? mat.opacity : 1);
        if (mo < 0.05) return;
        if (o.scale && o.scale.x === 0) return;
        const g = o.geometry;
        const pos = g.attributes.position;
        const idx = g.index;
        const start = g.drawRange ? g.drawRange.start : 0;
        const avail = idx ? idx.count : pos.count;
        const cnt = Math.min(avail - start, g.drawRange ? g.drawRange.count : Infinity);
        if (cnt <= 0) return;
        const stride = Math.max(1, Math.floor(avail / MAX_V));   // fixed on the whole mesh: a draw-on adds points, it moves none
        const pts = [];
        const inst = o.isInstancedMesh ? Math.min(o.count, 60) : 1;
        const instStride = o.isInstancedMesh ? Math.max(1, Math.floor(o.count / inst)) : 1;
        const vstride = o.isInstancedMesh ? Math.max(1, Math.floor(cnt / 3)) : stride;
        for (let ii = 0; ii < (o.isInstancedMesh ? o.count : 1); ii += instStride) {
          M.copy(o.matrixWorld);
          if (o.isInstancedMesh) {
            o.getMatrixAt(ii, IM);
            M.multiply(IM);
            if (Math.abs(IM.elements[0]) < 1e-3) { pts.push(NaN, NaN); continue; }
          }
          for (let j = start; j < start + cnt; j += vstride) {
            const v = idx ? idx.getX(j) : j;
            P.fromBufferAttribute(pos, v).applyMatrix4(M).project(st.camera);
            pts.push(r.left + (P.x + 1) / 2 * r.width, r.top + (1 - P.y) / 2 * r.height);
          }
        }
        anyVisible = true;
        // a mesh less than 2 px across (a bead shrunk to nothing at the end of its streamline) cannot be seen moving
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (let i = 0; i + 1 < pts.length; i += 2) {
          if (pts[i] < x0) x0 = pts[i];
          if (pts[i] > x1) x1 = pts[i];
          if (pts[i + 1] < y0) y0 = pts[i + 1];
          if (pts[i + 1] > y1) y1 = pts[i + 1];
        }
        out.push({ key: o.uuid, cls: cls(o), pts: pts, small: x1 - x0 < 2 && y1 - y0 < 2 });
      });
    });
    return { meshes: out, visible: anyVisible };
  }
  function shown2d(el) {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === "none" || s.visibility === "hidden") return false;
      if (parseFloat(s.opacity) < 0.05) return false;
    }
    return true;
  }
  let domList = null;
  function domNodes() {
    if (domList && domList.length) return domList;
    domList = [];
    document.querySelectorAll("[data-box], svg *").forEach(function (el, i) {
      const band = el.closest("[data-band]");
      const bn = band ? band.dataset.band : "";
      if (bn === "subtitle" || bn === "strip") return;
      if (el.tagName === "defs" || el.closest("defs") || el.closest(".katex") || el.tagName === "svg") return;
      if (el.closest("svg") && ["g", "marker", "mask", "clipPath"].indexOf(el.tagName) >= 0) return;
      domList.push({ el: el, key: i, name: el.dataset && el.dataset.box ? el.dataset.box : el.tagName + "#" + i });
    });
    return domList;
  }
  function snap2d() {
    const out = [];
    domNodes().forEach(function (n) {
      if (!shown2d(n.el)) return;
      const r = n.el.getBoundingClientRect();
      if (r.width < 0.5 && r.height < 0.5) return;
      out.push({ key: n.key, name: n.name, r: [r.left, r.top, r.right, r.bottom] });
    });
    return out;
  }
  function moved3d(a, b) {
    const map = new Map();
    a.meshes.forEach(function (m) { map.set(m.key, m); });
    let best = 0, bestCls = "";
    b.meshes.forEach(function (m) {
      const p = map.get(m.key);
      if (!p || p.pts.length !== m.pts.length || m.small || p.small) return;
      for (let i = 0; i + 1 < m.pts.length; i += 2) {
        const dx = m.pts[i] - p.pts[i], dy = m.pts[i + 1] - p.pts[i + 1];
        const d = Math.hypot(dx, dy);
        if (d > best) { best = d; bestCls = m.cls; }
      }
    });
    return { d: best, cls: bestCls };
  }
  function moved2d(a, b) {
    const map = new Map();
    a.forEach(function (m) { map.set(m.key, m); });
    let best = 0, bestName = "";
    b.forEach(function (m) {
      const p = map.get(m.key);
      if (!p) return;
      for (let i = 0; i < 4; i++) {
        const d = Math.abs(m.r[i] - p.r[i]);
        if (d > best) { best = d; bestName = m.name; }
      }
    });
    return { d: best, name: bestName };
  }
  window.__probe = {
    series: function (times) {
      const rows = [];
      let prev3 = null, prev2 = null;
      times.forEach(function (t) {
        window.setTime(t);
        const s3 = snap3d();
        const s2 = snap2d();
        if (prev3) {
          const m3 = moved3d(prev3, s3);
          const m2 = moved2d(prev2, s2);
          rows.push([t, s3.visible ? 1 : 0, m3.d, m3.cls, m2.d, m2.name]);
        }
        prev3 = s3;
        prev2 = s2;
      });
      return rows;
    },
    purity: function (t, dt) {
      window.setTime(t - dt); window.setTime(t);
      const a3 = snap3d(), a2 = snap2d();
      window.setTime(t - 3 * dt); window.setTime(t);
      const b3 = snap3d(), b2 = snap2d();
      window.setTime(0); window.setTime(t);
      const c3 = snap3d(), c2 = snap2d();
      const m = [moved3d(a3, b3), moved3d(a3, c3)];
      const n = [moved2d(a2, b2), moved2d(a2, c2)];
      return { d3: Math.max(m[0].d, m[1].d), cls: m[0].d > m[1].d ? m[0].cls : m[1].cls, d2: Math.max(n[0].d, n[1].d), name: n[0].d > n[1].d ? n[0].name : n[1].name };
    },
  };
  return V ? 1 : 0;
}

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}
function pct(xs, q) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : 0;
}
function stepIndex(rows, col, fps) {
  const win = Math.max(3, Math.round(fps / 2));
  let best = 1, at = 0;
  for (let i = 0; i + win <= rows.length; i += Math.ceil(win / 3)) {
    const w = rows.slice(i, i + win).map(function (r) { return r[col]; });
    const mx = Math.max.apply(null, w);
    if (mx < 1) continue;
    const r = mx / Math.max(median(w), 0.02);
    if (r > best) { best = r; at = rows[i][0]; }
  }
  return { v: best, at: at };
}

async function main() {
  const o = parse(process.argv.slice(2));
  const scene = o.ch + "/scene.html";
  const beats = JSON.parse(fs.readFileSync(o.ch + "/beats.json", "utf8"));
  const browser = await launch(1);
  let bad = 0;
  try {
    const page = await openScene(browser, scene, beats, 1);
    await page.evaluate(installProbe);
    const dur = await page.evaluate(function () { return window.sceneDuration; });
    const from = o.from == null ? 0 : o.from;
    const to = o.to == null ? Number(dur) : o.to;
    const dt = 1 / o.fps;
    if (o.purity) {
      for (let t = Math.max(from, 0.5); t < to; t += 0.5) {
        const r = await page.evaluate(function (a) { return window.__probe.purity(a[0], a[1]); }, [t, dt]);
        if (r.d3 > 0.25 || r.d2 > 0.25) {
          bad++;
          console.log(o.ch + " history dependence at t=" + t.toFixed(2) + ": 3D " + r.d3.toFixed(2) + " px (" + r.cls + "), 2D " + r.d2.toFixed(2) + " px (" + r.name + ")");
        }
      }
      console.log(o.ch + " purity: " + (bad ? bad + " times differ" : "pure"));
    } else {
      const rows = [];
      const n0 = Math.round(from * o.fps), n1 = Math.round(to * o.fps);
      for (let k = n0; k <= n1; k += 60) {
        const times = [];
        for (let i = k; i <= Math.min(n1, k + 60); i++) times.push(i * dt);
        const part = await page.evaluate(function (ts) { return window.__probe.series(ts); }, times);
        part.forEach(function (r) { rows.push(r); });
      }
      if (o.json) fs.writeFileSync(o.json, JSON.stringify(rows));
      const segs = [];
      let cur = null;
      rows.forEach(function (r) {
        if (r[1]) {
          if (!cur) { cur = []; segs.push(cur); }
          cur.push(r);
        } else cur = null;
      });
      segs.forEach(function (s) {
        if (s.length < 3) return;
        const ds = s.map(function (r) { return r[2]; });
        let pk = 0, cl = "", at = 0;
        s.forEach(function (r) { if (r[2] > pk) { pk = r[2]; cl = r[3]; at = r[0]; } });
        const si = stepIndex(s, 2, o.fps);
        console.log(o.ch + " 3D " + s[0][0].toFixed(1) + "-" + s[s.length - 1][0].toFixed(1) + " s  peak " + pk.toFixed(2) + " px/frame (" + cl + ", t=" + at.toFixed(2) + ")  p95 " + pct(ds, 0.95).toFixed(2) + "  median " + median(ds).toFixed(2) + "  step " + si.v.toFixed(1) + " (t=" + si.at.toFixed(1) + ")");
      });
      const ds2 = rows.map(function (r) { return r[4]; });
      let pk2 = 0, nm = "", at2 = 0;
      rows.forEach(function (r) { if (r[4] > pk2) { pk2 = r[4]; nm = r[5]; at2 = r[0]; } });
      const si2 = stepIndex(rows, 4, o.fps);
      console.log(o.ch + " 2D whole chapter  peak " + pk2.toFixed(2) + " px/frame (" + nm + ", t=" + at2.toFixed(2) + ")  p95 " + pct(ds2, 0.95).toFixed(2) + "  step " + si2.v.toFixed(1) + " (t=" + si2.at.toFixed(1) + ")");
    }
  } finally {
    await browser.close();
  }
  process.exit(bad ? 1 : 0);
}

main().catch(function (e) { console.error(e); process.exit(2); });
