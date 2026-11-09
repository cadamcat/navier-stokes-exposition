/* The film's one renderer for flows and for the core: long tapered trails coloured by the magnitude map, far trails
   lighter, strokes thin enough that dense regions keep their texture. Used wherever the core or a flow appears. */
import { THREE, tokenColor } from "../three3d/stage3d.js";
import { particles3d } from "../lib/particles3d.js";
import { coreContour } from "./contour.js";
import { coreScales, coreVelocity } from "./corefield.mjs";

/* One tilt for the model core in every chapter that shows it (radians about the view axis). */
export const CORE_TILT = -0.65;
export const CORE_LEAN = 0.38;

const smooth = x => { const u = x <= 0 ? 0 : x >= 1 ? 1 : x; return u * u * (3 - 2 * u); };

/* Apply the shared stroke styling after trails.setTime(t): width and strength follow the local speed unit u(speed),
   and a trail further from the camera than the centre gets lighter. opts: unit(speed) -> [0,1]; width [thin, thick]
   multipliers of the head width; alpha [low, high]; depth world half-range for the far fade (0 = none). */
export function styleTrails(trails, st, opts) {
  const o = Object.assign({ width: [0.35, 1.0], alpha: [0.45, 1.0], depth: 0, far: 0.35 }, opts || {});
  const geometry = trails.mesh.geometry;
  const pos = geometry.attributes.position.array;
  const tint = geometry.attributes.tint.array;
  const width = geometry.attributes.width.array;
  const m = trails.cache.options.segments + 1;
  const p = new Float64Array(4);
  const L = trails.cache.options.trailLength;
  const mv = new THREE.Matrix4();
  return function (t) {
    mv.multiplyMatrices(st.camera.matrixWorldInverse, trails.mesh.matrixWorld);
    const e = mv.elements;
    const z0 = e[14];
    trails.cache.visit(t, (track, age, alpha, i) => {
      for (let j = 0; j < m; j++) {
        trails.cache.sample(track, age - L * (1 - j / (m - 1)), p);
        const u = o.unit(p[3]);
        const a = o.alpha[0] + (o.alpha[1] - o.alpha[0]) * u;
        const w = o.width[0] + (o.width[1] - o.width[0]) * u;
        let far = 1;
        if (o.depth > 0) {
          const v = (i * m + j) * 2;
          const z = e[2] * pos[v * 3] + e[6] * pos[v * 3 + 1] + e[10] * pos[v * 3 + 2] + e[14];
          far = 1 - (1 - o.far) * smooth((z0 - z) / o.depth);
        }
        for (let s = 0; s < 2; s++) {
          const v = (i * m + j) * 2 + s;
          tint[v * 4 + 3] *= a * far;
          width[v] *= w;
        }
      }
    });
    geometry.attributes.tint.needsUpdate = true;
    geometry.attributes.width.needsUpdate = true;
  };
}

/* The core: a translucent paper-toned body, the τ = 1 reference outline, a thin equator, speed-coloured trails and the
   one outline (velocity blue with a paper halo). Options:
     tauAt(t), startTime, duration, map  required
     parent        default st.scene; the core's group is added to it
     tilt          default CORE_TILT (about the view axis)
     lean          default CORE_LEAN: the axis leans towards the viewer, so the swirl's rings open into ellipses
     gap           half-height of the seed-free band at the equator as a share of L (default 0; c5 keeps it open for R)
     scale         uniform scale of the whole core (default 1)
     count         trails (default 520)
     clock         tracer clock relative to the model time (default 0.3; state it on screen)
     inflow        meridional circulation amplitude (default 0: pure swirl; see corefield.mjs)
     width         head width of a trail in CSS px (default 4.4)
     trailLength   seconds of history (default 2)
     ghost         draw the τ = 1 reference (default true)
     equator       draw the thin equator (default true)
   Returns { group, setTime(t, opacity), metrics(t), contour(t, opacity), cacheBytes }. */
export function makeParticleCore(st, options) {
  const o = Object.assign({
    parent: st.scene, tilt: CORE_TILT, lean: CORE_LEAN, gap: 0, scale: 1, count: 520, clock: 0.3, inflow: 0, width: 4.4, trailLength: 2,
    ghost: true, equator: true, seed: 503, lifetime: 6,
  }, options);
  const { tauAt, startTime, duration, map } = o;
  const group = new THREE.Group();
  group.rotation.set(o.lean, 0, o.tilt);
  group.scale.setScalar(o.scale);
  o.parent.add(group);
  const bodyMat = new THREE.MeshBasicMaterial({ color: tokenColor("--paper-raised"), transparent: true, opacity: 0.5, depthWrite: false });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), bodyMat);
  body.renderOrder = 0;
  group.add(body);
  const unit = speed => Math.log1p(speed) / Math.log(10);
  const trails = particles3d({
    parent: group, camera: st.camera,
    field: (x, y, z, t) => coreVelocity(x, y, z, tauAt(t), o.inflow).map(v => o.clock * v),
    scalar: (x, y, z, t) => Math.hypot(...coreVelocity(x, y, z, tauAt(t), o.inflow)),
    seeding: (rng, i, birth) => {
      const { R, L } = coreScales(tauAt(birth));
      const r = R * (i % 6 === 0 ? 1.0 + 0.45 * rng() : 0.28 + 0.68 * Math.sqrt(rng()));
      const a = 2 * Math.PI * rng();
      const eta = (o.gap + (0.92 - o.gap) * rng()) * (i % 2 ? 1 : -1);
      return [r * Math.cos(a), eta * L, r * Math.sin(a)];
    },
    count: o.count, seed: o.seed, lifetime: o.lifetime, trailLength: o.trailLength,
    startTime, duration, step: 1 / 120, segments: 56, width: o.width, fade: 0.7,
    color: speed => map.css(unit(speed)), opacity: 0.8,
  });
  trails.setViewport(st.width, st.height);
  trails.mesh.renderOrder = 1;
  const style = styleTrails(trails, st, { unit: s => Math.min(1, unit(s) + 0.25), width: [0.7, 1], alpha: [0.8, 1], depth: 0.9, far: 0.45 });
  const contour = coreContour(st, { parent: group });
  const ghost = o.ghost ? coreContour(st, { parent: group, token: "--ink-muted", width: 1.5, halo: 0, order: 3 }) : null;
  const ringMat = new THREE.LineBasicMaterial({ color: tokenColor("--ink-muted"), transparent: true, depthWrite: false });
  const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 129 }, (_, i) => new THREE.Vector3(Math.cos(i * Math.PI / 64), 0, Math.sin(i * Math.PI / 64)))
  ), ringMat);
  ring.renderOrder = 2;
  ring.visible = o.equator;
  group.add(ring);
  const refScales = coreScales(1);
  let silhouette = [];
  function setTime(t, opacity) {
    const k = opacity == null ? 1 : opacity;
    group.visible = k > 0.001;
    if (!group.visible) return;
    group.updateMatrixWorld(true);
    const { R, L } = coreScales(tauAt(t));
    body.scale.set(R, L, R);
    bodyMat.opacity = 0.5 * k;
    ring.scale.set(R, R, R);
    ringMat.opacity = 0.5 * k;
    trails.setTime(t, 0.8 * k);
    style(t);
    silhouette = contour.set(R, L, k);
    if (ghost) ghost.set(refScales.R, refScales.L, 0.45 * k);
  }
  return {
    group, setTime, trails, ghostContour: ghost,
    metrics: t => ({ ...coreScales(tauAt(t)), tau: tauAt(t) }),
    silhouette: () => silhouette,
    cacheBytes: trails.cache.bytes,
  };
}
