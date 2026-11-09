/* Exact wrap motion on the cube [−1, 1]³ and the open lattice.
   Velocity (0.55, 0, 0) world units per second: straight through the marked pair of faces, one idea. No clock. */

export const VEL = [0.55, 0, 0];
export const START = [-0.5, 0, 0];
const STEP = 0.02;

function wrap1(x) {
  let y = (x + 1) % 2;
  if (y < 0) y += 2;
  return y - 1;
}

function at(s) {
  return [
    wrap1(START[0] + VEL[0] * s),
    wrap1(START[1] + VEL[1] * s),
    wrap1(START[2] + VEL[2] * s),
  ];
}

function jumped(a, b) {
  return Math.abs(a[0] - b[0]) > 1 || Math.abs(a[1] - b[1]) > 1 || Math.abs(a[2] - b[2]) > 1;
}

export function parcelPath(tMax) {
  const samples = [];
  const segments = [];
  let seg = [];
  const n = Math.round(tMax / STEP);
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const s = i * STEP;
    const p = at(s);
    const rec = { s: s, p: p };
    if (prev && jumped(prev, p)) {
      if (seg.length >= 2) segments.push(seg);
      seg = [];
    }
    samples.push(rec);
    seg.push(rec);
    prev = p;
  }
  if (seg.length >= 2) segments.push(seg);
  return { samples: samples, segments: segments };
}

export const PATH = parcelPath(8);

export function exits(tMax) {
  let n = 0;
  let prev = at(0);
  const steps = Math.round(tMax / STEP);
  for (let i = 1; i <= steps; i++) {
    const p = at(i * STEP);
    if (jumped(prev, p)) n += 1;
    prev = p;
  }
  return n;
}

/* 4×4×4 lattice, spacing 0.62, centred. Opacity falls gently toward the edge. */
export function latticePoints() {
  const pts = [];
  const sp = 0.62;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        const p = [(i - 1.5) * sp, (j - 1.5) * sp, (k - 1.5) * sp];
        const r = Math.hypot(p[0], p[1], p[2]) / (1.5 * sp * Math.sqrt(3));
        const bin = r < 0.45 ? 2 : r < 0.75 ? 1 : 0;
        pts.push({ p: p, bin: bin });
      }
    }
  }
  return pts;
}
