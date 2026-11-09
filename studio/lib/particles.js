/* Fixed-step tracer trajectories. All motion is sampled from an immutable cache. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 1831565813) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function smooth(x) {
  const k = Math.max(0, Math.min(1, x));
  return k * k * (3 - 2 * k);
}

function positive(value, name) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(name + ' must be positive');
  return value;
}

// Pure field(x,y,z,t) returns [u,v,w]; a planar field may return [u,v].
export function rk4(field, p, t, h, out = new Float64Array(3)) {
  const a = field(p[0], p[1], p[2], t);
  const b = field(p[0] + h * a[0] / 2, p[1] + h * a[1] / 2,
    p[2] + h * (a[2] ?? 0) / 2, t + h / 2);
  const c = field(p[0] + h * b[0] / 2, p[1] + h * b[1] / 2,
    p[2] + h * (b[2] ?? 0) / 2, t + h / 2);
  const d = field(p[0] + h * c[0], p[1] + h * c[1], p[2] + h * (c[2] ?? 0), t + h);
  out[0] = p[0] + h * (a[0] + 2 * b[0] + 2 * c[0] + d[0]) / 6;
  out[1] = p[1] + h * (a[1] + 2 * b[1] + 2 * c[1] + d[1]) / 6;
  out[2] = p[2] + h * ((a[2] ?? 0) + 2 * (b[2] ?? 0) + 2 * (c[2] ?? 0) + (d[2] ?? 0)) / 6;
  if (!out.every(Number.isFinite)) throw new RangeError('field produced a non-finite trajectory');
  return out;
}

export function createTrajectories(options) {
  const o = { count: 400, seed: 1, lifetime: 6, trailLength: 0.65,
    step: 1 / 120, startTime: 0, duration: 30, fade: 0.35, ...options };
  const field = o.field;
  if (typeof field !== 'function') throw new TypeError('field is required');
  for (const key of ['lifetime', 'trailLength', 'step', 'duration', 'fade']) positive(o[key], key);
  if (!Number.isInteger(o.count) || o.count < 1) throw new RangeError('count must be a positive integer');
  if (!Number.isFinite(o.startTime)) throw new RangeError('startTime must be finite');
  const region = o.seeding;
  if (typeof region !== 'function' && !(region && region.min && region.max)) {
    throw new TypeError('seeding must be a function or {min,max} bounds');
  }
  const seedPoint = typeof region === 'function' ? region : (rng) =>
    [0, 1, 2].map(k => (region.min[k] ?? 0) + rng() * ((region.max[k] ?? 0) - (region.min[k] ?? 0)));
  const steps = Math.ceil(o.lifetime / o.step);
  // A smaller final fixed step fits the lifetime exactly.
  const dt = o.lifetime / steps;
  const tracks = [];
  const slots = [];
  const schedule = seededRandom(o.seed);
  const edge = Math.min(o.fade, o.lifetime / 2);
  for (let i = 0; i < o.count; i++) {
    const phase = (i + schedule()) / o.count;
    const firstBirth = o.startTime - o.lifetime + phase * o.lifetime;
    const list = [];
    for (let cycle = 0; firstBirth + cycle * o.lifetime <= o.startTime + o.duration; cycle++) {
      const birth = firstBirth + cycle * o.lifetime;
      const rng = seededRandom((o.seed ^ Math.imul(i + 1, 73856093) ^ Math.imul(cycle + 1, 19349663)) >>> 0);
      const p0 = seedPoint(rng, i, birth);
      const p = new Float64Array([p0[0], p0[1], p0[2] ?? 0]);
      if (!p.every(Number.isFinite)) throw new RangeError('seeding produced a non-finite position');
      const data = new Float64Array((steps + 1) * 4);
      for (let j = 0; j <= steps; j++) {
        const time = birth + j * dt;
        const v = field(p[0], p[1], p[2], time);
        const scalar = o.scalar ? o.scalar(p[0], p[1], p[2], time) : Math.hypot(v[0], v[1], v[2] ?? 0);
        if (!Number.isFinite(scalar)) throw new RangeError('scalar must be finite');
        data.set([p[0], p[1], p[2], scalar], j * 4);
        if (j < steps) rk4(field, p, time, dt, p);
      }
      const track = { data, birth, particle: i, cycle, id: tracks.length };
      tracks.push(track);
      list.push(track);
    }
    slots.push(list);
  }

  function sample(track, age, out) {
    const u = Math.max(0, Math.min(steps, age / dt));
    const j = Math.min(steps - 1, Math.floor(u));
    const f = u - j;
    const k = j * 4;
    for (let c = 0; c < 4; c++) out[c] = track.data[k + c] * (1 - f) + track.data[k + 4 + c] * f;
    return out;
  }

  function visit(t, fn) {
    if (!Number.isFinite(t) || t < o.startTime || t > o.startTime + o.duration) {
      throw new RangeError('time is outside the precomputed interval');
    }
    for (let i = 0; i < slots.length; i++) {
      const list = slots[i];
      const cycle = Math.min(list.length - 1, Math.floor((t - list[0].birth) / o.lifetime));
      const track = list[cycle];
      const age = t - track.birth;
      const alpha = smooth(age / edge) * smooth((o.lifetime - age) / edge);
      fn(track, age, alpha, i);
    }
  }

  return { tracks, sample, visit, options: Object.freeze(o), steps, dt,
    bytes: tracks.reduce((sum, tr) => sum + tr.data.byteLength, 0) };
}
