/* Exact ABC field on the periodic box, and the parcel path.
   Box (X, Y, Z) in [0, 2π]³. World cube of side 3 centred at the origin:
   world = (box − π) · 3 / (2π). No clock and no randomness. */

export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;
export const BOX = 3;
export const SCALE = BOX / TWO_PI;
export const ARROW_LEN = 0.3;
export const FACE_LEN = 0.16;
export const H = 0.01;

export function U(X, Y, Z) {
  return [Math.sin(Z) + Math.cos(Y), Math.sin(X) + Math.cos(Z), Math.sin(Y) + Math.cos(X)];
}

export function wrapBox(x) {
  let y = x % TWO_PI;
  if (y < 0) y += TWO_PI;
  return y;
}

export function toWorld(X, Y, Z) {
  return [(X - PI) * SCALE, (Y - PI) * SCALE, (Z - PI) * SCALE];
}

export function fromWorld(x, y, z) {
  return [x / SCALE + PI, y / SCALE + PI, z / SCALE + PI];
}

export function speed(u) {
  return Math.hypot(u[0], u[1], u[2]);
}

export function arrowOf(u, lenScale) {
  const m = speed(u);
  const s = (lenScale == null ? ARROW_LEN : lenScale) * m;
  if (m < 1e-10) return [0, 0, 0];
  return [u[0] / m * s, u[1] / m * s, u[2] / m * s];
}

/* 3×3×3 interior grid, sparse enough that each arrow reads. No point lies on a face, and u vanishes at none of them. */
export const GRID = [1, 3, 5].map(function (k) { return k * PI / 3; });

/* The point x with its labels: the grid point at the upper right of the picture for every camera azimuth of the
   chapter (30 to 58 degrees), so its leaders are short and cross nothing. */
export const FEAT = [5 * PI / 3, 5 * PI / 3, PI / 3];
export const SEED = [PI / 2, PI / 2, PI / 2];
export const SMALL_BOX = [PI, PI, PI];

function sameBin(a, b) {
  for (let i = 0; i < 3; i++) {
    if (Math.floor(a[i] / TWO_PI) !== Math.floor(b[i] / TWO_PI)) return false;
  }
  return true;
}

function rk4(p, h) {
  function f(q) {
    return U(wrapBox(q[0]), wrapBox(q[1]), wrapBox(q[2]));
  }
  function add(a, b, s) {
    return [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
  }
  const k1 = f(p);
  const k2 = f(add(p, k1, h / 2));
  const k3 = f(add(p, k2, h / 2));
  const k4 = f(add(p, k3, h));
  return add(p, [k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0], k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1], k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]], h / 6);
}

/* Samples every H seconds, split so no piece crosses a periodic face. */
export function integrate(seed, tMax) {
  const samples = [];
  const segments = [];
  let p = seed.slice();
  let seg = [];
  function pushSample(s, q) {
    const box = [wrapBox(q[0]), wrapBox(q[1]), wrapBox(q[2])];
    const u = U(box[0], box[1], box[2]);
    const world = toWorld(box[0], box[1], box[2]);
    const rec = { s: s, box: box, u: u, world: world };
    samples.push(rec);
    seg.push(rec);
  }
  function closeSeg() {
    if (seg.length >= 2) segments.push(seg);
    seg = [];
  }
  pushSample(0, p);
  const steps = Math.round(tMax / H);
  for (let i = 0; i < steps; i++) {
    const prev = p;
    const next = rk4(p, H);
    if (!sameBin(prev, next)) {
      closeSeg();
    }
    p = next;
    pushSample((i + 1) * H, p);
  }
  closeSeg();
  return { samples: samples, segments: segments };
}

export function atTime(path, s) {
  if (s <= 0) return path.samples[0];
  const last = path.samples[path.samples.length - 1];
  if (s >= last.s) return last;
  const i = Math.round(s / H);
  return path.samples[Math.max(0, Math.min(path.samples.length - 1, i))];
}

export const FIELD = [];
export let FEAT_INDEX = 0;
export let CENTRE_INDEX = 0;
(function buildGrid() {
  for (let ix = 0; ix < GRID.length; ix++) {
    for (let iy = 0; iy < GRID.length; iy++) {
      for (let iz = 0; iz < GRID.length; iz++) {
        const box = [GRID[ix], GRID[iy], GRID[iz]];
        const u = U(box[0], box[1], box[2]);
        const rec = { box: box, u: u, world: toWorld(box[0], box[1], box[2]), vec: arrowOf(u, ARROW_LEN) };
        if (Math.abs(box[0] - FEAT[0]) < 1e-9 && Math.abs(box[1] - FEAT[1]) < 1e-9 && Math.abs(box[2] - FEAT[2]) < 1e-9) FEAT_INDEX = FIELD.length;
        if (Math.abs(box[0] - SMALL_BOX[0]) < 1e-9 && Math.abs(box[1] - SMALL_BOX[1]) < 1e-9 && Math.abs(box[2] - SMALL_BOX[2]) < 1e-9) CENTRE_INDEX = FIELD.length;
        FIELD.push(rec);
      }
    }
  }
})();

export const PATH = integrate(SEED, 8);

/* Small cube, side 0.5, centred on one interior grid point. Face-centre velocities. */
export const SMALL_SIDE = 0.5;
export const FACE_ARROWS = (function () {
  const c = toWorld(SMALL_BOX[0], SMALL_BOX[1], SMALL_BOX[2]);
  const h = SMALL_SIDE / 2;
  const faces = [
    [h, 0, 0], [-h, 0, 0],
    [0, h, 0], [0, -h, 0],
    [0, 0, h], [0, 0, -h],
  ];
  return faces.map(function (off) {
    const world = [c[0] + off[0], c[1] + off[1], c[2] + off[2]];
    const box = fromWorld(world[0], world[1], world[2]);
    const u = U(box[0], box[1], box[2]);
    const n = [off[0] / h, off[1] / h, off[2] / h];
    return { world: world, u: u, vec: arrowOf(u, FACE_LEN), outflow: u[0] * n[0] + u[1] * n[1] + u[2] * n[2] };
  });
})();
