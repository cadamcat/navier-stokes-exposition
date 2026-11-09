/* Chapter-local 3D pieces: shaded arrows, a wire cube, a marker ring.
   Colours come from tokens. Nothing here reads a clock. */
import { THREE, curve, tokenColor } from "../three3d/stage3d.js";

const UP = new THREE.Vector3(0, 1, 0);
const DIR = new THREE.Vector3();
const DUMMY = new THREE.Object3D();

function lit(token) {
  const base = tokenColor(token);
  const mat = new THREE.MeshLambertMaterial({
    color: base.clone().multiplyScalar(0.42),
    emissive: base.clone().multiplyScalar(0.62),
  });
  // Keep arrow tips in front of a cube edge they pass in front of.
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -2;
  mat.polygonOffsetUnits = -2;
  return mat;
}

export function arrowCloud(st, n, opts) {
  const o = Object.assign({ token: "--obj-hopping", shaft: 0.02, head: 0.056 }, opts || {});
  const shaftGeo = new THREE.CylinderGeometry(1, 1, 1, 9, 1);
  const headGeo = new THREE.ConeGeometry(1, 1, 9, 1);
  shaftGeo.translate(0, 0.5, 0);
  headGeo.translate(0, 0.5, 0);
  const matS = lit(o.token);
  const matH = lit(o.token);
  const shafts = new THREE.InstancedMesh(shaftGeo, matS, n);
  const heads = new THREE.InstancedMesh(headGeo, matH, n);
  shafts.frustumCulled = false;
  heads.frustumCulled = false;
  heads.renderOrder = 2;
  st.scene.add(shafts);
  st.scene.add(heads);

  function set(i, base, vec, thick) {
    const len = Math.hypot(vec[0], vec[1], vec[2]);
    const th = thick == null ? 1 : thick;
    if (len < 1e-5) {
      DUMMY.position.set(0, -20, 0);
      DUMMY.scale.set(0.0001, 0.0001, 0.0001);
      DUMMY.rotation.set(0, 0, 0);
      DUMMY.updateMatrix();
      shafts.setMatrixAt(i, DUMMY.matrix);
      heads.setMatrixAt(i, DUMMY.matrix);
      return;
    }
    DIR.set(vec[0] / len, vec[1] / len, vec[2] / len);
    DUMMY.quaternion.setFromUnitVectors(UP, DIR);
    const hL = Math.min(len * 0.4, 0.18);
    const sL = Math.max(len - hL, 0.001);
    const tuck = Math.min(0.012, sL * 0.15);
    DUMMY.scale.set(o.shaft * th, sL, o.shaft * th);
    DUMMY.position.set(base[0], base[1], base[2]);
    DUMMY.updateMatrix();
    shafts.setMatrixAt(i, DUMMY.matrix);
    DUMMY.scale.set(o.head * th, hL + tuck, o.head * th);
    DUMMY.position.set(base[0] + DIR.x * (sL - tuck), base[1] + DIR.y * (sL - tuck), base[2] + DIR.z * (sL - tuck));
    DUMMY.updateMatrix();
    heads.setMatrixAt(i, DUMMY.matrix);
  }

  function commit() {
    shafts.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
  }

  function setOpacity(v) {
    const a = Math.max(0, Math.min(1, v));
    matS.opacity = a;
    matH.opacity = a;
    matS.transparent = true;
    matH.transparent = true;
    matS.depthWrite = true;
    matH.depthWrite = true;
  }

  return { set: set, commit: commit, setOpacity: setOpacity };
}

export function arrowOne(st, opts) {
  const o = Object.assign({ token: "--obj-hopping", shaft: 0.02, head: 0.052 }, opts || {});
  const group = new THREE.Group();
  const base = tokenColor(o.token);
  const matS = new THREE.MeshLambertMaterial({
    color: base.clone().multiplyScalar(0.42), emissive: base.clone().multiplyScalar(0.62), transparent: true,
  });
  const matH = new THREE.MeshLambertMaterial({
    color: base.clone().multiplyScalar(0.42), emissive: base.clone().multiplyScalar(0.62), transparent: true,
  });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(o.shaft, o.shaft, 1, 9, 1), matS);
  const head = new THREE.Mesh(new THREE.ConeGeometry(o.head, 1, 9, 1), matH);
  shaft.geometry.translate(0, 0.5, 0);
  head.geometry.translate(0, 0.5, 0);
  const order = o.order || 2;
  shaft.renderOrder = order;
  head.renderOrder = order + 1;
  group.add(shaft);
  group.add(head);
  st.scene.add(group);
  group.visible = false;
  let has = false;

  function set(base, vec) {
    const len = Math.hypot(vec[0], vec[1], vec[2]);
    has = len >= 1e-4;
    if (!has) { group.visible = false; return; }
    DIR.set(vec[0] / len, vec[1] / len, vec[2] / len);
    group.quaternion.setFromUnitVectors(UP, DIR);
    group.position.set(base[0], base[1], base[2]);
    const hL = Math.min(len * 0.42, 0.2);
    const sL = Math.max(len - hL, 0.001);
    const tuck = Math.min(0.012, sL * 0.15);
    shaft.scale.set(1, sL, 1);
    head.scale.set(1, hL + tuck, 1);
    head.position.set(0, sL - tuck, 0);
    shaft.position.set(0, 0, 0);
    group.visible = true;
  }

  function setOpacity(v) {
    const a = Math.max(0, Math.min(1, v));
    matS.opacity = a;
    matH.opacity = a;
    matS.depthWrite = a > 0.98;
    matH.depthWrite = a > 0.98;
    group.visible = has && a > 0.001;
  }

  return { set: set, setOpacity: setOpacity, group: group };
}

export function wireBox(st, centre, side, opts) {
  const o = Object.assign({ token: "--rule", radius: 0.012, joint: 0.02 }, opts || {});
  const h = side / 2;
  const corners = [];
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      for (let z = 0; z < 2; z++) {
        corners.push([
          centre[0] + (x ? h : -h),
          centre[1] + (y ? h : -h),
          centre[2] + (z ? h : -h),
        ]);
      }
    }
  }
  function id(x, y, z) { return x + 2 * y + 4 * z; }
  const pairs = [];
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      pairs.push([id(0, a, b), id(1, a, b)]);
      pairs.push([id(a, 0, b), id(a, 1, b)]);
      pairs.push([id(a, b, 0), id(a, b, 1)]);
    }
  }
  const gap = o.joint + o.radius + 0.008;
  const lines = pairs.map(function (pair) {
    const A = corners[pair[0]];
    const B = corners[pair[1]];
    const len = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]);
    const inset = gap / len;
    const pts = [];
    for (let k = 0; k < 4; k++) {
      const u = inset + (1 - 2 * inset) * (k / 3);
      pts.push([
        A[0] + (B[0] - A[0]) * u,
        A[1] + (B[1] - A[1]) * u,
        A[2] + (B[2] - A[2]) * u,
      ]);
    }
    return curve(st, pts, { token: o.token, radius: o.radius, closed: false, hidden: "none", halo: 0, sides: 6 });
  });
  const geo = new THREE.SphereGeometry(o.joint, 8, 6);
  const mat = new THREE.MeshBasicMaterial({ color: tokenColor(o.token), transparent: true });
  const joints = corners.map(function (p) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]);
    st.scene.add(m);
    return m;
  });
  return {
    setOpacity: function (v) {
      const a = Math.max(0, Math.min(1, v));
      lines.forEach(function (L) { L.setOpacity(a); });
      mat.opacity = a;
      joints.forEach(function (m) { m.visible = a > 0.001; });
    },
  };
}

/* Darker than the field arrows, which carry a bright emissive share of the same token. */
export function darkSphere(st, radius) {
  const base = tokenColor("--obj-hopping");
  const mat = new THREE.MeshLambertMaterial({
    color: base.clone().multiplyScalar(0.22),
    emissive: base.clone().multiplyScalar(0.16),
    transparent: true,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), mat);
  mesh.renderOrder = 6;
  st.scene.add(mesh);
  mesh.visible = false;
  return {
    mesh: mesh,
    setOpacity: function (v) {
      const a = Math.max(0, Math.min(1, v));
      mat.opacity = a;
      mat.depthWrite = a > 0.98;
      mesh.visible = a > 0.001;
    },
    position: function (p) { mesh.position.set(p[0], p[1], p[2]); },
  };
}

export function markerRing(st, radius, tube) {
  const geo = new THREE.TorusGeometry(radius, tube, 8, 28);
  const mat = new THREE.MeshBasicMaterial({ color: tokenColor("--obj-hopping"), transparent: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.visible = false;
  st.scene.add(mesh);
  const axis = new THREE.Vector3(0, 0, 1);
  const toCam = new THREE.Vector3();
  return {
    mesh: mesh,
    // Keep the ring facing the camera so it stays a circle, not an edge-on line.
    face: function (base, camera, lift) {
      toCam.set(camera.position.x - base[0], camera.position.y - base[1], camera.position.z - base[2]);
      if (toCam.lengthSq() < 1e-8) return;
      toCam.normalize();
      const d = lift || 0;
      mesh.position.set(base[0] + toCam.x * d, base[1] + toCam.y * d, base[2] + toCam.z * d);
      mesh.quaternion.setFromUnitVectors(axis, toCam);
    },
    setOpacity: function (v) {
      const a = Math.max(0, Math.min(1, v));
      mat.opacity = a;
      mesh.visible = a > 0.001;
    },
  };
}

export function resample(pts, n) {
  if (!pts || pts.length < 2) return null;
  const acc = [0];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
    acc.push(total);
  }
  if (total < 0.03) return null;
  const out = [];
  for (let k = 0; k < n; k++) {
    const d = total * (k / (n - 1));
    let i = 1;
    while (i < acc.length - 1 && acc[i] < d) i++;
    const span = acc[i] - acc[i - 1];
    const u = span < 1e-8 ? 0 : (d - acc[i - 1]) / span;
    const a = pts[i - 1];
    const b = pts[i];
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]);
  }
  return out;
}

const SEED_LINE = [];
for (let i = 0; i < 16; i++) SEED_LINE.push([0.01 * i, -12, 0]);

export function trailCurves(st, count, radius, opts) {
  const tube = radius == null ? 0.012 : radius;
  const o = opts || {};
  const curves = [];
  for (let i = 0; i < count; i++) {
    const c = curve(st, SEED_LINE, {
      token: o.token || "--obj-hopping", radius: tube, closed: false, hidden: "none", halo: 0, sides: 6,
    });
    if (o.overlay) {
      c.mesh.material.depthTest = false;
      c.mesh.material.depthWrite = false;
      c.mesh.renderOrder = 8;
    }
    c.setOpacity(0);
    curves.push(c);
  }
  return curves;
}
