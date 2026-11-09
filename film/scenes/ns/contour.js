/* Perspective silhouette of a spheroid with semi-axes (R, L, R) centred at the origin of `parent`: the core's one
   outline, velocity blue with a paper halo so that it reads over the trails. Exact: the tangent cone from the eye,
   computed in the parent's local frame, so a tilted group works. */
import { THREE, tokenColor } from "../three3d/stage3d.js";

function strokeMesh(st, n, token, halfWidth, order) {
  const pos = new Float32Array((n + 1) * 6);
  const tangent = new Float32Array(pos.length);
  const side = new Float32Array((n + 1) * 2);
  const indices = [];
  for (let i = 0; i <= n; i++) {
    side[i * 2] = -1;
    side[i * 2 + 1] = 1;
    if (i < n) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("tangent", new THREE.BufferAttribute(tangent, 3));
  geo.setAttribute("side", new THREE.BufferAttribute(side, 1));
  geo.setIndex(indices);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      viewport: { value: new THREE.Vector2(st.width, st.height) },
      ink: { value: tokenColor(token) }, opacity: { value: 0 }, halfWidth: { value: halfWidth },
    },
    vertexShader: `
      attribute vec3 tangent;
      attribute float side;
      uniform vec2 viewport;
      uniform float halfWidth;
      varying float vSide;
      void main() {
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec4 q = projectionMatrix * modelViewMatrix * vec4(position + tangent, 1.0);
        vec2 d = (q.xy / q.w - p.xy / p.w) * viewport;
        vec2 dir = d / max(length(d), 0.00001);
        p.xy += vec2(-dir.y, dir.x) * side * 2.0 * halfWidth / viewport * p.w;
        gl_Position = p;
        vSide = side;
      }`,
    fragmentShader: `
      uniform vec3 ink;
      uniform float opacity;
      varying float vSide;
      void main() {
        float edge = 1.0 - smoothstep(1.0 - fwidth(vSide), 1.0, abs(vSide));
        gl_FragColor = vec4(ink, opacity * edge);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return { mesh, mat, pos, tangent, geo };
}

/* options: parent (default st.scene), token (default the velocity blue), width (px, default 2.2), halo (px on each
   side, default 4; 0 for none), order (renderOrder, default 5). */
export function coreContour(st, options) {
  const o = Object.assign({ parent: st.scene, token: "--velocity", width: 2.2, halo: 4, order: 5 }, options || {});
  const n = 160;
  const line = strokeMesh(st, n, o.token, o.width / 2, o.order + 1);
  const halo = o.halo > 0 ? strokeMesh(st, n, "--paper", o.width / 2 + o.halo, o.order) : null;
  o.parent.add(line.mesh);
  if (halo) o.parent.add(halo.mesh);
  const eye = new THREE.Vector3(), normal = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3();
  const stretch = new THREE.Vector3();
  const points = Array.from({ length: n }, () => new THREE.Vector3());
  const world = new THREE.Vector3();
  function write(m) {
    for (let i = 0; i <= n; i++) {
      const p = points[i % n], a = points[(i + n - 1) % n], b = points[(i + 1) % n];
      for (let s = 0; s < 2; s++) {
        const k = (i * 2 + s) * 3;
        m.pos.set([p.x, p.y, p.z], k);
        m.tangent.set([b.x - a.x, b.y - a.y, b.z - a.z], k);
      }
    }
    m.geo.attributes.position.needsUpdate = true;
    m.geo.attributes.tangent.needsUpdate = true;
  }
  /* returns the silhouette's page points, for labels and leaders */
  function set(R, L, opacity) {
    o.parent.updateWorldMatrix(true, false);
    st.camera.updateWorldMatrix(true, false);
    eye.setFromMatrixPosition(st.camera.matrixWorld);
    o.parent.worldToLocal(eye);
    // on the unit sphere the tangent plane from the eye C is (D^-1 C).q = 1
    normal.set(eye.x / R, eye.y / L, eye.z / R);
    const norm2 = normal.lengthSq();
    const center = normal.clone().multiplyScalar(1 / norm2);
    const radius = Math.sqrt(Math.max(0, 1 - 1 / norm2));
    normal.normalize();
    // any vector not parallel to the normal gives the first in-plane axis
    if (Math.abs(normal.y) < 0.9) u.set(normal.z, 0, -normal.x).normalize();
    else u.set(0, normal.z, -normal.y).normalize();
    v.crossVectors(normal, u).normalize();
    stretch.set(R, L, R);
    for (let i = 0; i < n; i++) {
      const a = 2 * Math.PI * i / n;
      points[i].copy(center).addScaledVector(u, radius * Math.cos(a)).addScaledVector(v, radius * Math.sin(a)).multiply(stretch);
    }
    write(line);
    if (halo) write(halo);
    line.mat.uniforms.opacity.value = opacity;
    line.mesh.visible = opacity > 0.001;
    if (halo) {
      halo.mat.uniforms.opacity.value = opacity;
      halo.mesh.visible = opacity > 0.001;
    }
    return points.map(p => {
      world.copy(p);
      o.parent.localToWorld(world);
      return st.project([world.x, world.y, world.z]);
    });
  }
  return { set, mesh: line.mesh };
}
