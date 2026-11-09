/* Tracers in one frozen Gaussian field, shown through exact rescalings. */
import { THREE, tokenColor } from "../three3d/stage3d.js";
import { particles3d } from "../lib/particles3d.js";
import { styleTrails } from "../ns/trails.js";
import { swirlVelocity, swirlMoments } from "./fields.mjs";

export function makeSwirl(st, { lambdaAt, duration, map }) {
  const group = new THREE.Group();
  st.scene.add(group);
  const flow = new THREE.Group();
  group.add(flow);
  const trails = particles3d({
    parent: flow, camera: st.camera,
    // q=lambda*x: frozen-field advection has clock rate lambda squared.
    field: (x, y, z, t) => swirlVelocity(x, y, z).map(v => v * lambdaAt(t) ** 2),
    scalar: (x, y, z, t) => lambdaAt(t) * Math.hypot(...swirlVelocity(x, y, z)),
    seeding: rng => {
      const r = 0.18 + 1.12 * Math.sqrt(rng());
      const a = 2 * Math.PI * rng();
      return [r * Math.cos(a), 1.5 * (rng() - 0.5), r * Math.sin(a)];
    },
    count: 360, seed: 502, lifetime: 8, trailLength: 2.6,
    duration, step: 1 / 90, segments: 56, width: 4.0, fade: 0.65,
    color: speed => map.css(Math.log1p(5 * speed) / Math.log(7.5)), opacity: 0.72,
  });
  trails.setViewport(st.width, st.height);
  trails.mesh.renderOrder = 1;

  const reference = new THREE.Group();
  reference.scale.setScalar(1.6);
  group.add(reference);
  const referenceTrails = particles3d({
    parent: reference, camera: st.camera,
    field: (x, y, z) => swirlVelocity(x, y, z),
    scalar: (x, y, z) => Math.hypot(...swirlVelocity(x, y, z)),
    seeding: rng => {
      const r = 0.18 + 1.12 * Math.sqrt(rng());
      const a = 2 * Math.PI * rng();
      return [r * Math.cos(a), 1.5 * (rng() - 0.5), r * Math.sin(a)];
    },
    count: 160, seed: 502, lifetime: 8, trailLength: 2.6,
    duration, step: 1 / 90, segments: 56, width: 2.4, fade: 0.65,
    color: speed => map.css(Math.log1p(5 * speed) / Math.log(7.5)),
  });
  referenceTrails.setViewport(st.width, st.height);
  const unit = s => Math.min(1, Math.log1p(5 * s) / Math.log(7.5));
  const style = styleTrails(trails, st, { unit, width: [0.5, 1], alpha: [0.9, 1], depth: 1.4, far: 0.65 });
  const referenceStyle = styleTrails(referenceTrails, st, { unit, width: [0.5, 1], alpha: [0.9, 1], depth: 1.4, far: 0.65 });

  const ghostMat = new THREE.LineBasicMaterial({ color: tokenColor("--ink-muted"), transparent: true, opacity: 0, depthWrite: false });
  const guide = new THREE.Group();
  for (const vertical of [false, true]) {
    const points = Array.from({ length: 129 }, (_, i) => {
      const a = i / 128 * 2 * Math.PI;
      return new THREE.Vector3(2.08 * Math.cos(a), vertical ? 1.2 * Math.sin(a) : 0, vertical ? 0 : 2.08 * Math.sin(a));
    });
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), ghostMat);
    line.renderOrder = 2;
    guide.add(line);
  }
  group.add(guide);

  const dotMat = new THREE.MeshBasicMaterial({ color: tokenColor("--ink"), transparent: true, depthTest: false });
  const haloMat = new THREE.MeshBasicMaterial({ color: tokenColor("--paper"), transparent: true, depthTest: false });
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.036, 20, 14), dotMat);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.058, 20, 14), haloMat);
  dot.renderOrder = 12;
  halo.renderOrder = 11;
  group.add(halo, dot);
  // Integrate the displayed clock once; frame lookup is independent of seek order.
  const dt = 1 / 240, clock = [0];
  for (let i = 1; i <= Math.ceil(duration / dt) + 1; i++) {
    clock[i] = clock[i - 1] + dt * lambdaAt((i - 0.5) * dt) ** 2;
  }
  const moments = swirlMoments();
  let point = [0, 0, 0], speed = 0;
  function setTime(t, opacity) {
    const lam = lambdaAt(t);
    flow.scale.setScalar(1.6 / lam);
    trails.setTime(t, 0.95 * opacity);
    style(t);
    // Thinning preserves texture as the fixed measurement frame concentrates the field.
    const widths = trails.mesh.geometry.attributes.width;
    const thin = 1 / (1 + 0.45 * (lam - 1));
    for (let i = 0; i < widths.array.length; i++) widths.array[i] *= thin;
    widths.needsUpdate = true;
    referenceTrails.setTime(t, 0.15 * opacity * Math.min(1, Math.max(0, (lam - 1) / 0.7)));
    referenceStyle(t);
    ghostMat.opacity = 0.34 * opacity * Math.min(1, Math.max(0, (lam - 1) / 0.7));
    const ix = Math.floor(t / dt), f = t / dt - ix;
    const theta = 0.3 + Math.exp(-0.5) * (clock[ix] * (1 - f) + clock[ix + 1] * f);
    const r = Math.SQRT1_2 * 1.6 / lam;
    point = [r * Math.cos(theta), 0, r * Math.sin(theta)];
    dot.position.set(...point);
    halo.position.copy(dot.position);
    dotMat.opacity = haloMat.opacity = opacity;
    speed = lam / Math.sqrt(2 * Math.E);
    group.visible = opacity > 0.001;
  }
  return { group, setTime, moments, tracer: () => ({ point, speed }), cacheBytes: trails.cache.bytes + referenceTrails.cache.bytes };
}
