// Arrow meshes for the film. Shafts are tubes; the head is a cone whose tip is the
// arrow's end. The shaft stops inside the head so the two surfaces do not meet.
import { THREE, curve, tokenColor } from "../three3d/stage3d.js";

export function makeArrow(st, parent, opts) {
  const o = Object.assign({ token: "--obj-hopping", radius: 0.016, sides: 7, lineHalo: 2.4, paperHead: true }, opts || {});
  const headLen = o.radius * 5.2;
  const headR = o.radius * 2.5;
  const shaft = curve(st, [[0, 0, 0], [0, 0.2, 0]], {
    token: o.token, radius: o.radius, closed: false, hidden: "none", halo: o.lineHalo, sides: o.sides,
  });
  st.scene.remove(shaft.group);
  parent.add(shaft.group);
  shaft.mesh.frustumCulled = false;
  shaft.material.transparent = false;
  shaft.material.depthWrite = true;

  const geo = new THREE.ConeGeometry(headR, headLen, 12);
  geo.translate(0, -headLen / 2, 0);
  let halo = null;
  let haloMat = null;
  if (o.paperHead) {
    const haloGeo = new THREE.ConeGeometry(headR * 1.7, headLen * 1.35, 12);
    haloGeo.translate(0, -headLen * 0.62, 0);
    haloMat = new THREE.MeshBasicMaterial({ color: tokenColor("--paper") });
    halo = new THREE.Mesh(haloGeo, haloMat);
    halo.frustumCulled = false;
    parent.add(halo);
  }
  const mat = new THREE.MeshBasicMaterial({ color: tokenColor(o.token) });
  const head = new THREE.Mesh(geo, mat);
  head.frustumCulled = false;
  parent.add(head);

  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3();
  const q = new THREE.Quaternion();
  let scaleK = 1;

  function setScale(k) {
    scaleK = Math.max(0.2, k);
  }

  function place(tail, tip) {
    dir.set(tip[0] - tail[0], tip[1] - tail[1], tip[2] - tail[2]);
    const len = dir.length();
    if (len < 1e-5) {
      shaft.group.visible = false;
      head.visible = false;
      if (halo) halo.visible = false;
      return;
    }
    dir.multiplyScalar(1 / len);
    const bury = headLen * scaleK * 0.72;
    const end = [
      tip[0] - dir.x * bury,
      tip[1] - dir.y * bury,
      tip[2] - dir.z * bury,
    ];
    shaft.group.visible = true;
    head.visible = true;
    shaft.setRadius(o.radius * scaleK);
    shaft.set([tail, end]);
    head.position.set(tip[0], tip[1], tip[2]);
    head.scale.setScalar(scaleK);
    q.setFromUnitVectors(up, dir);
    head.quaternion.copy(q);
    if (halo) {
      halo.position.copy(head.position);
      halo.quaternion.copy(q);
      halo.scale.setScalar(scaleK);
      halo.visible = true;
    }
  }

  function setOpacity(k) {
    const v = Math.max(0, Math.min(1, k));
    shaft.setOpacity(v);
    shaft.material.transparent = v < 0.999;
    shaft.material.depthWrite = v > 0.98;
    mat.opacity = v;
    mat.transparent = v < 0.999;
    mat.depthWrite = v > 0.98;
    if (haloMat) {
      haloMat.opacity = v;
      haloMat.transparent = v < 0.999;
      halo.visible = v > 0.001;
    }
    head.visible = v > 0.001;
  }

  function setColor(token) {
    shaft.setColor(token);
    mat.color.copy(tokenColor(token));
  }

  return { place, setOpacity, setColor, setScale, headLen };
}

// One shaft, a head at each end, both heads pointing outward.
export function makeDoubleArrow(st, parent, opts) {
  const o = Object.assign({ token: "--ink", radius: 0.014, sides: 7 }, opts || {});
  const headLen = o.radius * 5.2;
  const shaft = curve(st, [[0, 0, 0], [0, 0.2, 0]], {
    token: o.token, radius: o.radius, closed: false, hidden: "none", halo: 0, sides: o.sides,
  });
  st.scene.remove(shaft.group);
  parent.add(shaft.group);
  shaft.mesh.frustumCulled = false;
  shaft.material.transparent = false;

  function cone() {
    const geo = new THREE.ConeGeometry(o.radius * 2.5, headLen, 12);
    geo.translate(0, -headLen / 2, 0);
    const mat = new THREE.MeshBasicMaterial({ color: tokenColor(o.token) });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    parent.add(mesh);
    return { mesh, mat };
  }
  const a = cone();
  const b = cone();
  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3();
  const q = new THREE.Quaternion();

  function aim(part, tip, direction) {
    dir.copy(direction);
    if (dir.lengthSq() < 1e-12) dir.set(0, 1, 0);
    dir.normalize();
    part.mesh.position.set(tip[0], tip[1], tip[2]);
    q.setFromUnitVectors(up, dir);
    part.mesh.quaternion.copy(q);
    part.mesh.visible = true;
  }

  function place(p0, p1) {
    dir.set(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
    const len = dir.length();
    if (len < headLen * 1.2) {
      shaft.group.visible = false;
      a.mesh.visible = false;
      b.mesh.visible = false;
      return;
    }
    dir.multiplyScalar(1 / len);
    const bury = Math.min(headLen * 0.72, len * 0.28);
    const forward = dir.clone();
    shaft.group.visible = true;
    shaft.set([
      [p0[0] + forward.x * bury, p0[1] + forward.y * bury, p0[2] + forward.z * bury],
      [p1[0] - forward.x * bury, p1[1] - forward.y * bury, p1[2] - forward.z * bury],
    ]);
    aim(a, p0, forward.clone().multiplyScalar(-1));
    aim(b, p1, forward);
  }

  function setOpacity(k) {
    const v = Math.max(0, Math.min(1, k));
    shaft.setOpacity(v);
    shaft.material.transparent = v < 0.999;
    a.mat.opacity = v;
    b.mat.opacity = v;
    a.mat.transparent = v < 0.999;
    b.mat.transparent = v < 0.999;
    a.mesh.visible = v > 0.001;
    b.mesh.visible = v > 0.001;
  }

  return { place, setOpacity };
}
