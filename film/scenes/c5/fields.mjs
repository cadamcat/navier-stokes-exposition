/* Frozen finite-energy Gaussian swirl and its exact spatial rescaling. */
export function swirlVelocity(x, y, z, lambda = 1) {
  const qx = lambda * x, qy = lambda * y, qz = lambda * z;
  const w = lambda * Math.exp(-(qx * qx + qy * qy + qz * qz));
  return [-qz * w, 0, qx * w];
}

/* Cylindrical Simpson quadrature in physical coordinates. The six-unit
   Gaussian tail is below display precision; this is not a finite-domain energy. */
export function swirlMoments(lambda = 1, n = 120) {
  let e = 0, cube = 0;
  const dr = 6 / lambda / n, dy = 12 / lambda / n;
  for (let i = 0; i <= n; i++) {
    const r = i * dr;
    const wi = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
    for (let j = 0; j <= n; j++) {
      const y = -6 / lambda + j * dy;
      const wj = j === 0 || j === n ? 1 : j % 2 ? 4 : 2;
      const v = swirlVelocity(r, y, 0, lambda);
      const speed = Math.hypot(...v);
      const weight = wi * wj * 2 * Math.PI * r * dr * dy / 9;
      e += 0.5 * speed * speed * weight;
      cube += speed ** 3 * weight;
    }
  }
  return { energy: e, l3: Math.cbrt(cube) };
}

export { coreScales, coreVelocity } from "../ns/corefield.mjs";

export const BAR_H = 0.005;
export function sourceBars(tau) {
  return { speed: tau ** (-0.5 - BAR_H), energy: tau ** (0.5 - 3 * BAR_H) };
}
