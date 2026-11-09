/* The schematic model core shared by every chapter that shows it. Not the announced velocity profile: a divergence-free
   axisymmetric model built from the claimed scale laws, with a drawn h = 0.2 (exaggerated; the source has h < 0.01).
   R and L are Gaussian scales. Its peak azimuthal speed is U, at r = R/sqrt(2), y = 0. */
export const H_DRAW = 0.2;
export const R0 = 0.55;
export const L0 = 1.6;

export function coreScales(tau, h = H_DRAW) {
  return { R: R0 * Math.sqrt(tau), L: L0 * tau ** (0.5 - h), U: tau ** (-0.5 - h) };
}

/* inflow = 0: pure azimuthal swirl. inflow > 0 adds the meridional circulation with radial inflow near the equator and
   outflow along the axis, from the streamfunction  psi = a r^2 y exp(-r^2/R^2 - y^2/L^2),  so the velocity stays
   divergence-free: u_r = -(1/r) dpsi/dy, u_y = (1/r) dpsi/dr. inflow is its amplitude relative to the swirl. */
export function coreVelocity(x, y, z, tau, inflow = 0) {
  const { R, L, U } = coreScales(tau);
  const qx = x / R, qz = z / R, qy = y / L;
  const e = Math.exp(-qx * qx - qz * qz - qy * qy);
  const w = Math.sqrt(2 * Math.E) * U * e;
  if (!inflow) return [-qz * w, 0, qx * w];
  const a = inflow * Math.sqrt(2 * Math.E) * U / R;   // so the peak radial speed is inflow × U
  const radial = -a * (1 - 2 * qy * qy) * e;           // u_r / r
  const axial = 2 * a * y * (1 - qx * qx - qz * qz) * e;
  return [radial * x - qz * w, axial, radial * z + qx * w];
}
