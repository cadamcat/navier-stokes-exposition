/* Tracers of the exact ABC field, restricted to the displayed cube. */
import { particles3d } from "../lib/particles3d.js";
import { styleTrails } from "../ns/trails.js";
import { U, fromWorld, SCALE } from "./field.js";
export function makeABC(st, duration, map) {
  const unit = s => Math.min(1, s / Math.sqrt(6));
  const velocity = (x, y, z) => U(...fromWorld(x, y, z));
  const trails = particles3d({
    parent: st.scene, camera: st.camera,
    field: (x, y, z) => velocity(x, y, z).map(v => SCALE * v),
    scalar: (x, y, z) => Math.hypot(...velocity(x, y, z)),
    seeding: { min: [-1.48, -1.48, -1.48], max: [1.48, 1.48, 1.48] },
    count: 1500, seed: 202, lifetime: 3.2, trailLength: 1.5,
    step: 1 / 60, startTime: 0, duration, fade: 0.7,
    segments: 36, width: 3.6, color: s => map.css(unit(s)), opacity: 0.8,
  });
  trails.setViewport(st.width, st.height);
  const style = styleTrails(trails, st, { unit, width: [0.75, 1], alpha: [0.95, 1], depth: 3, far: 0.6 });
  return { setTime(t) {
    trails.setTime(t, 0.95); style(t);
    const g = trails.mesh.geometry, p = g.attributes.position.array, a = g.attributes.tint.array;
    for (let i = 0; i < p.length / 3; i++) {
      const gap = 1.5 - Math.max(Math.abs(p[i * 3]), Math.abs(p[i * 3 + 1]), Math.abs(p[i * 3 + 2]));
      a[i * 4 + 3] *= KIT.powerOut(gap, 0, 0.14);
    }
    g.attributes.tint.needsUpdate = true;
  } };
}
