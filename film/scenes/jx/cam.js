/* Camera paths for the 3D scenes: a pure function of t, no clock.
   camPath(keys) takes keys [t, az, el, dist] (degrees, world units) in time order and returns
   f(t) -> { az, el, dist }. Between two keys the camera moves with a smoothstep ease, so it starts
   and stops gently at every key; two keys with the same values make a hold. Before the first key
   and after the last the camera rests at that key. */
export function camPath(keys) {
  function ease(x) { return x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x); }
  return function (t) {
    if (t <= keys[0][0]) return { az: keys[0][1], el: keys[0][2], dist: keys[0][3] };
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1], b = keys[i];
      if (t <= b[0]) {
        const k = ease((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
        return { az: a[1] + (b[1] - a[1]) * k, el: a[2] + (b[2] - a[2]) * k, dist: a[3] + (b[3] - a[3]) * k };
      }
    }
    const z = keys[keys.length - 1];
    return { az: z[1], el: z[2], dist: z[3] };
  };
}
