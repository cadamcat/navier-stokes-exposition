/* Illustrative spiral inflow and axial outflow, sampled only from t. */
import { THREE, tokenColor } from "../three3d/stage3d.js";
import { particles3d } from "../lib/particles3d.js";
import { seededRandom } from "../lib/particles.js";

export function makeFlow(st, timing, map, options) {
  const opt = Object.assign({ left: 120, top: 104, count: 360, width: 4.0, rail: true }, options || {});
  const count = opt.count;
  const smooth = x => {
    const u = Math.max(0, Math.min(1, x));
    return u * u * (3 - 2 * u);
  };
  // Flat at both ends: stirring starts from exactly zero.
  function activation(t) {
    const u = (t - timing.force) / 1.2;
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    const a = Math.exp(-1 / u), b = Math.exp(-1 / (1 - u));
    return a / (a + b);
  }
  function scales(t) {
    const tau = 1 - 0.88 * Math.max(0, Math.min(1, (t - timing.tightens) / timing.tightDuration));
    return { tau, R: 0.55 * Math.sqrt(tau), L: 2.6 * Math.pow(tau, 0.3) };
  }
  function field(x, y, z, t) {
    const on = activation(t);
    if (on === 0) return [0, 0, 0];
    const { tau, R } = scales(t);
    const r2 = x * x + z * z;
    // Meridional streamfunction a r² y exp(-r²/b²-y²/c²).
    // Its radial inflow turns upward and downward along the axis.
    const b2 = 36, c2 = 64;
    const a = 0.36 * Math.pow(tau, -0.1);
    const e = Math.exp(-r2 / b2 - y * y / c2);
    const radial = -a * (1 - 2 * y * y / c2) * e;
    const axial = 2 * a * y * (1 - r2 / b2) * e;
    const q = 0.22 + 1.2 * R;
    const circulation = 2.25 * Math.pow(tau, -0.25);
    const omega = circulation * (-Math.expm1(-r2 / (q * q))) / Math.max(r2, 1e-10);
    const spin = 6.0 * Math.tanh(omega / 6.0) * Math.exp(-y * y / 36);
    return [on * (radial * x - spin * z), on * axial,
      on * (radial * z + spin * x)];
  }
  // Fixed power scale, never renormalized by frame. Slow outer fluid is pale.
  const speedUnit = speed => Math.pow(Math.min(1, speed / 3.0), 1.25);
  const color = speed => new THREE.Color().setRGB(...map.linear(speedUnit(speed)));
  function seeding(rng, i, birth) {
    // Six thin feeding rings, with independent angular phases. Before stirring,
    // every generation of a slot has the same point: the rest field is still.
    const r = birth <= timing.force ? seededRandom(9109 + i * 73) : rng;
    const ring = i % 6;
    const theta = (Math.floor(i / 6) * 0.61803398875 + 0.19 * ring + 0.012 * r()) * Math.PI * 2;
    const initial = birth <= timing.force;
    if (i % 12 === 0) {
      const radius = 1.2 + 2.3 * r();
      const y = initial ? (r() - 0.5) * 4.0 : (r() - 0.5) * 0.8;
      return [radius * Math.cos(theta), y, radius * Math.sin(theta)];
    }
    const radius = (initial ? [1.0, 1.55, 2.15, 2.7, 3.1, 3.45] :
      [2.15, 2.4, 2.65, 2.9, 3.15, 3.4])[ring] + (r() - 0.5) * 0.12;
    const y = (ring % 2 ? -1 : 1) * ([0.055, 0.055, 0.10, 0.10, 0.19, 0.19][ring] + r() * 0.025);
    return [radius * Math.cos(theta), y, radius * Math.sin(theta)];
  }
  const group = new THREE.Group();
  st.scene.add(group);
  const trails = particles3d({
    parent: group, camera: st.camera, field, seeding,
    count, seed: 9109, lifetime: 8.5, trailLength: 3.6,
    duration: timing.duration, step: 1 / 100, segments: 96, width: opt.width,
    fade: 0.8, opacity: 0.72, color,
  });
  trails.setViewport(st.width, st.height);
  trails.mesh.renderOrder = 1;
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.6, depthWrite: false }), count);
  heads.frustumCulled = false;
  heads.renderOrder = 2;
  group.add(heads);
  const dummy = new THREE.Object3D();
  const p = new Float64Array(4);
  const restColor = tokenColor("--ink-muted");
  const view = new THREE.Matrix4();
  let readoutK = 0;
  function screenEdge(x, y, z) {
    const e = view.elements;
    const w = e[3] * x + e[7] * y + e[11] * z + e[15];
    const nx = (e[0] * x + e[4] * y + e[8] * z + e[12]) / w;
    const ny = (e[1] * x + e[5] * y + e[9] * z + e[13]) / w;
    const qx = opt.left + (nx + 1) * st.width / 2;
    const qy = opt.top + (1 - ny) * st.height / 2;
    const rail = opt.rail ? smooth((qx - 1180) / 55) * smooth((qy - 340) / 30) * smooth((560 - qy) / 30) : 0;
    return smooth(Math.min((1 - Math.abs(nx)) * st.width / 2,
      (1 - Math.abs(ny)) * st.height / 2) / 75) * (1 - readoutK * rail);
  }
  function setTime(t, opacity, contour = []) {
    const on = smooth((t - timing.force) / 0.9);
    readoutK = smooth((t - timing.peak) / 0.45);
    view.multiplyMatrices(st.camera.projectionMatrix, st.camera.matrixWorldInverse);
    const bounds = contour.length ? {
      left: Math.min(...contour.map(p => p.x)) - 24,
      right: Math.max(...contour.map(p => p.x)) + 24,
      top: Math.min(...contour.map(p => p.y)) - 24,
      bottom: Math.max(...contour.map(p => p.y)) + 24,
    } : null;
    trails.setTime(t, opacity * 0.72 * on);
    const geometry = trails.mesh.geometry;
    const pos = geometry.attributes.position.array;
    const tint = geometry.attributes.tint.array;
    const width = geometry.attributes.width.array;
    const m = trails.cache.options.segments + 1;
    // Strength and width follow the same local speed as the colour. Distant
    // tails stay delicate; the faster spiral carries the visual structure.
    trails.cache.visit(t, (track, age, alpha, i) => {
      for (let j = 0; j < m; j++) {
        const history = age - trails.cache.options.trailLength * (1 - j / (m - 1));
        trails.cache.sample(track, history, p);
        const u = speedUnit(p[3]);
        // Leave the focal contour a narrow quiet band. Only nearby crossings
        // lose contrast; the surrounding flow keeps its texture.
        let quiet = 1;
        if (bounds) {
          const e = view.elements, x = p[0], y = p[1], z = p[2];
          const w = e[3] * x + e[7] * y + e[11] * z + e[15];
          const qx = opt.left + ((e[0] * x + e[4] * y + e[8] * z + e[12]) / w + 1) * st.width / 2;
          const qy = opt.top + (1 - (e[1] * x + e[5] * y + e[9] * z + e[13]) / w) * st.height / 2;
          if (qx > bounds.left && qx < bounds.right && qy > bounds.top && qy < bounds.bottom) {
            let d2 = Infinity;
            for (let k = 0; k < contour.length; k += 2) {
              const dx = qx - contour[k].x, dy = qy - contour[k].y;
              d2 = Math.min(d2, dx * dx + dy * dy);
            }
            quiet = 0.22 + 0.78 * smooth(Math.sqrt(d2) / 18);
          }
        }
        for (let side = 0; side < 2; side++) {
          const v = (i * m + j) * 2 + side;
          const edge = screenEdge(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
          tint[v * 4 + 3] *= edge * quiet * (0.6 + 0.4 * u) * (i % 12 === 0 ? 0.25 : 1);
          width[v] *= Math.sqrt(edge) * (0.35 + 0.9 * u);
        }
      }
      trails.cache.sample(track, age, p);
      const edge = screenEdge(p[0], p[1], p[2]);
      const envelope = 1 - on + on * alpha;
      dummy.position.set(p[0], p[1], p[2]);
      dummy.scale.setScalar(Math.sqrt(envelope * edge) * (1 - 0.44 * on));
      dummy.updateMatrix();
      heads.setMatrixAt(i, dummy.matrix);
      heads.setColorAt(i, restColor.clone().lerp(color(p[3]), on));
    });
    geometry.attributes.tint.needsUpdate = true;
    geometry.attributes.width.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    heads.instanceColor.needsUpdate = true;
    heads.material.opacity = opacity * (0.82 - 0.62 * on);
  }
  return { setTime, field, scales, trails, group, speedUnit };
}
