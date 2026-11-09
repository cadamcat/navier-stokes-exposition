// Nested core regions. Labels are drawn later, over this picture.
// World point (R ρ cos θ, L η, R ρ sin θ) is stored as (x, y, z) with y the axis.
import { stage3d, curve, THREE, tokenColor } from "../../film/scenes/three3d/stage3d.js";

const q = new URLSearchParams(location.search);
const W = +q.get("w");
const H = +q.get("h");
document.documentElement.style.width = W + "px";
document.documentElement.style.height = H + "px";
document.body.style.width = W + "px";
document.body.style.height = H + "px";
document.body.style.background = "var(--paper)";

const FOV = 24;
const AZ = 38;
const EL = 15;
const DIST = 12.2;
const LOOK = [0, 0, 0];
const TOKEN = "--obj-hopping";
const H_DRAW = 0.2;
const TAUS = [1, 0.35, 0.12];
const STEP_N = 200;

function dist3(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function slicePoly(pts, a, b) {
  const out = [];
  let walked = 0;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const r = pts[i];
    const seg = dist3(p, r);
    const next = walked + seg;
    if (next >= a - 1e-9 && walked <= b + 1e-9) {
      const t0 = seg < 1e-12 ? 0 : Math.max(0, (a - walked) / seg);
      const t1 = seg < 1e-12 ? 1 : Math.min(1, (b - walked) / seg);
      if (t1 > t0 + 1e-8) {
        const A = [p[0] + (r[0] - p[0]) * t0, p[1] + (r[1] - p[1]) * t0, p[2] + (r[2] - p[2]) * t0];
        const B = [p[0] + (r[0] - p[0]) * t1, p[1] + (r[1] - p[1]) * t1, p[2] + (r[2] - p[2]) * t1];
        if (!out.length || dist3(out[out.length - 1], A) > 1e-5) out.push(A);
        out.push(B);
      }
    }
    if (walked > b + 1e-8) break;
    walked = next;
  }
  return out;
}

function dashedParts(pts, dash, gap) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += dist3(pts[i - 1], pts[i]);
  const out = [];
  for (let s = 0; s < total - 1e-6; s += dash + gap) {
    const b = Math.min(s + dash, total);
    if (b - s < dash * 0.4) break;
    const seg = slicePoly(pts, s, b);
    if (seg.length >= 2) out.push(seg);
  }
  return out;
}

function tube(st, pts, radius) {
  const clean = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (dist3(clean[clean.length - 1], pts[i]) > 1e-5) clean.push(pts[i]);
  }
  if (clean.length < 2) return;
  curve(st, clean, { token: TOKEN, radius: radius, closed: false, hidden: "none", halo: 0, sides: 6 });
}

function arrowHead(st, base, dir, length, radius) {
  const d = new THREE.Vector3(dir[0], dir[1], dir[2]);
  if (d.lengthSq() < 1e-16) return;
  d.normalize();
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(radius, length, 14),
    new THREE.MeshBasicMaterial({ color: tokenColor(TOKEN) })
  );
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  mesh.position.set(base[0] + d.x * length / 2, base[1] + d.y * length / 2, base[2] + d.z * length / 2);
  mesh.renderOrder = 5;
  st.scene.add(mesh);
  return [
    base[0] + d.x * length,
    base[1] + d.y * length,
    base[2] + d.z * length,
  ];
}

function coreSize(tau) {
  return { tau: tau, R: 0.55 * Math.sqrt(tau), L: 1.6 * Math.pow(tau, 0.5 - H_DRAW) };
}

function rhoOf(s) { return 2.4 * Math.exp(-s / 2); }

function dTheta(s) {
  const r2 = rhoOf(s) * rhoOf(s);
  return 2.2 * (1 - Math.exp(-r2)) / r2;
}

function integrate(eta0, theta0) {
  const sMax = Math.log(1.25 / Math.abs(eta0));
  const h = sMax / STEP_N;
  let s = 0;
  let th = theta0;
  const pts = [];
  for (;;) {
    const rho = rhoOf(s);
    const eta = eta0 * Math.exp(s);
    pts.push({ s: s, rho: rho, eta: eta, th: th });
    if (Math.abs(eta) > 1.25) break;
    const k1 = dTheta(s);
    const k2 = dTheta(s + h / 2);
    const k3 = dTheta(s + h / 2);
    const k4 = dTheta(s + h);
    th += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
    s += h;
    if (pts.length > STEP_N + 5) break;
  }
  return pts;
}

function world(R, L, p) {
  return [R * p.rho * Math.cos(p.th), L * p.eta, R * p.rho * Math.sin(p.th)];
}

const st = stage3d({ left: 0, top: 0, width: W, height: H, fov: FOV });
st.renderer.setClearColor(tokenColor("--paper"), 1);
st.orbit(LOOK, AZ, EL, DIST);

const cam = st.camera.position;
const phi = Math.atan2(cam.z - LOOK[2], cam.x - LOOK[0]);
const D = Math.hypot(cam.x - LOOK[0], cam.z - LOOK[2]);

function silhouetteAngles(R) {
  const alpha = Math.acos(Math.min(1, R / D));
  return [phi + alpha, phi - alpha];
}

const cores = TAUS.map(coreSize);
const wireR = 0.015;
for (const c of cores) {
  const dash = Math.max(0.055, 0.16 * c.R);
  const gap = Math.max(0.04, 0.10 * c.R);
  for (const y of [-c.L, 0, c.L]) {
    const ring = [];
    const n = 144;
    for (let i = 0; i <= n; i++) {
      const a = 2 * Math.PI * i / n;
      ring.push([c.R * Math.cos(a), y, c.R * Math.sin(a)]);
    }
    for (const seg of dashedParts(ring, dash, gap)) tube(st, seg, wireR);
  }
  for (const th of silhouetteAngles(c.R)) {
    const line = [
      [c.R * Math.cos(th), -c.L, c.R * Math.sin(th)],
      [c.R * Math.cos(th), c.L, c.R * Math.sin(th)],
    ];
    for (const seg of dashedParts(line, dash, gap)) tube(st, seg, wireR);
  }
}

const mid = cores[1];
const eta0s = [0.04, -0.04, 0.08, -0.08];
const theta0s = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];
const flow = [];
const flowWorld = [];
for (const eta0 of eta0s) {
  for (const theta0 of theta0s) {
    const samples = integrate(eta0, theta0);
    const wpts = samples.map((p) => world(mid.R, mid.L, p));
    tube(st, wpts, 0.008);
    const i = Math.min(wpts.length - 2, Math.max(1, Math.round(wpts.length * 0.55)));
    const dir = [wpts[i + 1][0] - wpts[i - 1][0], wpts[i + 1][1] - wpts[i - 1][1], wpts[i + 1][2] - wpts[i - 1][2]];
    arrowHead(st, wpts[i], dir, 0.09, 0.03);
    for (let k = 0; k < wpts.length; k += 8) flowWorld.push(wpts[k]);
    const last = samples[samples.length - 1];
    const first = samples[0];
    flow.push({
      eta0: eta0,
      theta0: theta0,
      n: samples.length,
      s0: first.s, rho0: first.rho, etaStart: first.eta, th0: first.th,
      s1: last.s, rho1: last.rho, eta1: last.eta, th1: last.th,
    });
  }
}

const outflow = [];
const dRho = 0.95;
for (const eta of [0.9, -0.9]) {
  for (const th of [phi - Math.PI / 2, phi + Math.PI / 2]) {
    const from = [mid.R * 1.5 * Math.cos(th), mid.L * eta, mid.R * 1.5 * Math.sin(th)];
    const to = [mid.R * (1.5 + dRho) * Math.cos(th), mid.L * eta, mid.R * (1.5 + dRho) * Math.sin(th)];
    const headLen = 0.075;
    const dir = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
    const Ldir = Math.hypot(dir[0], dir[1], dir[2]);
    const base = [to[0] - dir[0] / Ldir * headLen, to[1] - dir[1] / Ldir * headLen, to[2] - dir[2] / Ldir * headLen];
    tube(st, [from, base], 0.01);
    const tip = arrowHead(st, base, dir, headLen, 0.032);
    outflow.push({ eta: eta, theta: th, from: from, tip: tip });
  }
}

st.render();

function project(p) {
  const c = st.project(p);
  return { x: c.x, y: c.y };
}

const cloud = [];
for (const c of cores) {
  for (const y of [-c.L, 0, c.L]) {
    for (let k = 0; k < 12; k++) {
      const a = 2 * Math.PI * k / 12;
      cloud.push(project([c.R * Math.cos(a), y, c.R * Math.sin(a)]));
    }
  }
}
for (const p of flowWorld) cloud.push(project(p));
for (const o of outflow) cloud.push(project(o.tip));
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const p of cloud) {
  minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
  maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
}

window.figAnchors = {
  camera: { fov: FOV, azimuth: AZ, elevation: EL, distance: DIST, look: LOOK, phi: phi, D: D },
  map: "(R rho cos theta, L eta, R rho sin theta) -> (x, y, z), y axial",
  hDraw: H_DRAW,
  cores: cores,
  flow: flow,
  outflow: outflow.map((o) => ({ eta: o.eta, theta: o.theta, tip: project(o.tip), from: project(o.from) })),
  bounds: { minX: minX, minY: minY, maxX: maxX, maxY: maxY },
  axisTop: project([0, cores[0].L, 0]),
  axisBottom: project([0, -cores[0].L, 0]),
};
window.figDone = true;
