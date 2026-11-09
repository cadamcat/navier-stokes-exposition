// Static article plates drawn with the film's current seeded particle renderer.
import { stage3d, tokenColor, THREE, torusGeometry } from 'film/scenes/three3d/stage3d.js';
import { makeParticleCore } from 'film/scenes/ns/trails.js';
import { coreScales, coreVelocity, H_DRAW } from 'film/scenes/ns/corefield.mjs';

const q = new URLSearchParams(location.search);
const W = Number(q.get('w')), H = Number(q.get('h'));
const name = q.get('fig');
const st = stage3d({ width: W, height: H, fov: name === 'fig2-core' ? 25 : 28 });
st.renderer.setClearColor(tokenColor('--paper'), 1);
const map = magnitudeMap();
const cores = [];
const metadata = { hDraw: H_DRAW, renderer: 'film/scenes/ns/trails.js', field: 'film/scenes/ns/corefield.mjs', seed: 503, cores: [] };
function add(tau, x, y, scale, count) {
  const c = makeParticleCore(st, { tauAt: () => tau, startTime: 0, duration: 7, map,
    inflow: 0.05, count, clock: 0.3, equator: false, ghost: false,
    scale, width: 3.4, trailLength: 3, seed: 503 });
  c.group.position.set(x, y, 0);
  cores.push(c);
  metadata.cores.push({ tau, ...coreScales(tau) });
  return c;
}
function proj(c, x, y, z) {
  const v = new THREE.Vector3(x, y, z);
  c.group.localToWorld(v);
  return st.project(v.toArray());
}
let annulus;
if (name === 'fig2-core') {
  st.orbit([0, 0, 0], -8, 10, 11.8);
  add(1, -1.25, 0.7, 0.65, 650);
  add(0.35, 0.1, 0, 0.65, 650);
  add(0.12, 1.35, -0.6, 0.65, 650);
} else if (name === 'fig3-annulus') {
  st.orbit([0, 0, 0], -8, 10, 6.5);
  const c = add(0.4, 0, 0, 1, 900);
  const material = new THREE.MeshBasicMaterial({ color: tokenColor('--force'), transparent: true, opacity: 0.17, depthWrite: false });
  annulus = new THREE.Mesh(torusGeometry(2, 0.45, 128, 32), material);
  annulus.renderOrder = -1;
  annulus.scale.setScalar(coreScales(0.4).R);
  c.group.add(annulus);
} else throw new Error('unknown article plate ' + name);

window.setTime = t => {
  for (const c of cores) {
    c.setTime(t, 1);
    // The film exposes a silhouette by default. Article plates use trails alone,
    // per the user's explicit request to remove hard particle-core ellipses.
    c.group.traverse(obj => { if (obj.material?.uniforms?.halfWidth) obj.visible = false; });
  }
  st.scene.updateMatrixWorld(true);
  if (name === 'fig2-core') {
    metadata.centres = cores.map(c => proj(c, 0, 0, 0));
    metadata.outflow = cores.map((c, i) => proj(c, 0.9 * metadata.cores[i].R, 0.9 * metadata.cores[i].L, 0));
    const c = cores[0], { R, L } = metadata.cores[0];
    const point = [0.9 * R, 0.9 * L, 0];
    // At z=0 the x component is radial. Show that component alone, so the
    // outflow mark cannot be mistaken for the stronger azimuthal motion.
    const velocity = coreVelocity(...point, 1, 0.05);
    const v = new THREE.Vector3(velocity[0], 0, 0).normalize().multiplyScalar(0.45);
    metadata.outflowArrow = { from: proj(c, ...point), to: proj(c, point[0]+v.x, point[1]+v.y, point[2]+v.z) };
  } else {
    const c = cores[0], { R, L } = metadata.cores[0];
    metadata.core = proj(c, 0, 0.7 * L, 0);
    metadata.annulus = proj(c, 2.46 * R, 0, 0);
    metadata.pulses = [];
    // Same placement as c7's localized pulses; signs alternate in the article.
    for (let i = 0; i < 12; i++) {
      const a = Math.PI / 4 + Math.floor(i / 3) * Math.PI / 2;
      const r = 2.65 * R + (i % 3 - 1) * 0.035;
      const y = (i % 3 - 1) * 0.035;
      const p = proj(c, r * Math.cos(a), y - 0.15, r * Math.sin(a));
      const q = proj(c, r * Math.cos(a), y + 0.15, r * Math.sin(a));
      metadata.pulses.push(i % 2 ? { from: q, to: p } : { from: p, to: q });
    }
  }
  metadata.snapshotTime = t;
  metadata.cacheBytes = cores.reduce((sum, c) => sum + c.cacheBytes, 0);
  st.render();
};
window.setTime(5.2);
window.figAnchors = metadata;
window.figDone = true;
