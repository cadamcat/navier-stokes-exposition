/* Camera-facing tracer ribbons with deterministic trajectories and segment depth sorting. */
import * as THREE from 'three';
import { createTrajectories, smooth } from './particles.js';

export function particles3d(options) {
  const o = { segments: 24, width: 3.4, opacity: 0.8, ...options };
  if (!o.parent || !o.camera) throw new TypeError('parent and camera are required');
  if (!Number.isInteger(o.segments) || o.segments < 2) throw new RangeError('segments must be at least 2');
  if (!(o.width > 0)) throw new RangeError('width must be positive');
  const cache = createTrajectories(o);
  const fallback = getComputedStyle(document.documentElement).getPropertyValue('--obj-wave').trim();
  const color = o.color || (() => fallback);
  const colors = cache.tracks.map(track => {
    const out = new Float32Array((cache.steps + 1) * 3);
    for (let j = 0; j <= cache.steps; j++) {
      const c = new THREE.Color(color(track.data[j * 4 + 3]));
      out.set([c.r, c.g, c.b], j * 3);
    }
    return out;
  });
  const n = cache.options.count;
  const m = o.segments + 1;
  const vertexCount = n * m * 2;
  const pos = new Float32Array(vertexCount * 3);
  const tangent = new Float32Array(vertexCount * 3);
  const tint = new Float32Array(vertexCount * 4);
  const side = new Float32Array(vertexCount);
  const width = new Float32Array(vertexCount);
  const indices = new Uint32Array(n * o.segments * 6);
  const order = Array.from({ length: n * o.segments }, (_, i) => i);
  const depth = new Float64Array(order.length);
  const pts = new Float64Array(n * m * 3);
  const geo = new THREE.BufferGeometry();
  for (let i = 0; i < vertexCount; i++) side[i] = i % 2 ? 1 : -1;
  for (const [name, data, size] of [['position', pos, 3], ['tangent', tangent, 3],
    ['tint', tint, 4], ['side', side, 1], ['width', width, 1]]) {
    geo.setAttribute(name, new THREE.BufferAttribute(data, size).setUsage(THREE.DynamicDrawUsage));
  }
  geo.setIndex(new THREE.BufferAttribute(indices, 1).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.ShaderMaterial({
    uniforms: { viewport: { value: new THREE.Vector2(1920, 1080) }, opacity: { value: o.opacity } },
    vertexShader: `
      attribute vec3 tangent;
      attribute vec4 tint;
      attribute float side;
      attribute float width;
      uniform vec2 viewport;
      varying vec4 vTint;
      varying float vSide;
      void main() {
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec4 q = projectionMatrix * modelViewMatrix * vec4(position + tangent, 1.0);
        vec2 delta = (q.xy / q.w - p.xy / p.w) * viewport;
        vec2 dir = delta / max(length(delta), 0.00001);
        vec2 normal = vec2(-dir.y, dir.x);
        p.xy += normal * side * width / viewport * p.w;
        gl_Position = p;
        vTint = tint;
        vSide = side;
      }`,
    fragmentShader: `
      uniform float opacity;
      varying vec4 vTint;
      varying float vSide;
      void main() {
        float edge = 1.0 - smoothstep(1.0 - fwidth(vSide), 1.0, abs(vSide));
        gl_FragColor = vec4(vTint.xyz, opacity * vTint.w * edge);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthTest: true, depthWrite: false,
    side: THREE.DoubleSide, blending: THREE.NormalBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(mesh);
  o.parent.add(group);
  const p = new Float64Array(4);
  const view = new THREE.Matrix4();

  function setTime(t, opacity = o.opacity) {
    mat.uniforms.opacity.value = Math.max(0, Math.min(1, opacity));
    cache.visit(t, (track, age, alpha, i) => {
      const palette = colors[track.id];
      for (let j = 0; j < m; j++) {
        const f = j / o.segments;
        const history = age - cache.options.trailLength * (1 - f);
        const born = smooth(history / cache.options.fade);
        cache.sample(track, history, p);
        const k = (i * m + j) * 3;
        pts.set(p.subarray(0, 3), k);
        const u = Math.max(0, Math.min(cache.steps, history / cache.dt));
        const cj = Math.min(cache.steps - 1, Math.floor(u));
        const cf = u - cj;
        for (let s = 0; s < 2; s++) {
          const v = (i * m + j) * 2 + s;
          pos.set(p.subarray(0, 3), v * 3);
          for (let c = 0; c < 3; c++) tint[v * 4 + c] = palette[cj * 3 + c] * (1 - cf) + palette[(cj + 1) * 3 + c] * cf;
          tint[v * 4 + 3] = alpha * born * Math.pow(f, 1.35);
          width[v] = o.width * (0.12 + 0.88 * f) * Math.sqrt(alpha * born);
        }
      }
      for (let j = 0; j < m; j++) {
        const a = (i * m + Math.max(0, j - 1)) * 3;
        const b = (i * m + Math.min(m - 1, j + 1)) * 3;
        for (let s = 0; s < 2; s++) for (let c = 0; c < 3; c++) {
          tangent[((i * m + j) * 2 + s) * 3 + c] = pts[b + c] - pts[a + c];
        }
      }
    });
    o.camera.updateWorldMatrix(true, false);
    mesh.updateWorldMatrix(true, false);
    view.multiplyMatrices(o.camera.matrixWorldInverse, mesh.matrixWorld);
    const e = view.elements;
    for (let k = 0; k < order.length; k++) {
      const i = Math.floor(k / o.segments);
      const j = k % o.segments;
      const a = (i * m + j) * 3;
      const b = a + 3;
      depth[k] = e[2] * (pts[a] + pts[b]) + e[6] * (pts[a + 1] + pts[b + 1]) + e[10] * (pts[a + 2] + pts[b + 2]);
    }
    order.sort((a, b) => depth[a] - depth[b] || a - b);
    for (let k = 0; k < order.length; k++) {
      const seg = order[k];
      const a = (Math.floor(seg / o.segments) * m + seg % o.segments) * 2;
      indices.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], k * 6);
    }
    for (const name of ['position', 'tangent', 'tint', 'width']) geo.attributes[name].needsUpdate = true;
    geo.index.needsUpdate = true;
  }
  return { group, mesh, cache, setTime,
    // CSS viewport dimensions, independent of device pixel ratio.
    setViewport(w, h) { mat.uniforms.viewport.value.set(w, h); },
    dispose() { group.removeFromParent(); geo.dispose(); mat.dispose(); } };
}
