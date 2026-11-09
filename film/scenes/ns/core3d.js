// Schematic vortex core shared by c1, c5, c7 and the thumbnail. One idea at a glance: a slender body with two
// shrinking lengths, one streamline coming in and leaving upward, one coming in and leaving downward.
// Axis is world y. Drawing exponent hd = 0.2:
//   R(tau) = 0.55 * tau^(1/2),  L(tau) = 1.6 * tau^(1/2 - hd) = 1.6 * tau^0.3.
// Body: a translucent spheroid with semi-axes R, L, R (drawn first, writes no depth, so nothing can fight it),
// with a faint outline of the tau = 1 spheroid and one thin ring on its equator.
// Two streamlines, point reflections of each other, so one stays above the mid-plane and the other below it and
// the two never cross. Seeded at rho0 = 2.4, eta0 = +0.06 at theta = 0 and -0.06 at theta = pi:
//   rho(s) = rho0 * e^(-s/2),  eta(s) = eta0 * e^s,
//   d(theta)/ds = 2.2 * (1 - e^(-rho^2)) / rho^2,
// until |eta| > 1.25. World point = (R * rho * cos theta, L * eta, R * rho * sin theta).
// With the camera near azimuth 0 and low elevation the first comes in from the right, the second from the left,
// and the mid-plane inside the ring stays empty: the radius can be marked there, the half-length beside the body.
// Each streamline has one arrowhead on the way in, one on the way out, and one bead:
//   s_b = (s0 + c * phase) mod s_end; the callers pass phase = -ln(tau) + 0.3 t (a schematic clock).
// A bead shrinks to zero within 0.3 of either end of its streamline, so its wrap is invisible.
import { THREE, curve, circlePts, tokenColor, torusGeometry } from "../three3d/stage3d.js";
import { makeArrow } from "./arrows.js";

const RHO0 = 2.4;
const ETA_STOP = 1.25;
const SEEDS = [[0.06, 0], [-0.06, Math.PI]];
const N_PTS = 121;
const BEAD_C = 0.9;
const BEAD_EDGE = 0.3;
const TUBE0 = 0.02;
const TUBE_MIN = 0.012;
const HEAD_U = [0.3, 0.86];
const R0 = 0.55;
const L0 = 1.6;

function dTheta(rho) {
  const r2 = rho * rho;
  if (r2 < 1e-6) return 2.2;
  return 2.2 * (1 - Math.exp(-r2)) / r2;
}

function integrate(eta0, theta0) {
  const sEnd = Math.log(ETA_STOP / Math.abs(eta0));
  const nFine = Math.max(2, Math.ceil(sEnd / 0.002));
  const ds = sEnd / nFine;
  const fine = new Float64Array(nFine + 1);
  let th = theta0;
  fine[0] = th;
  for (let i = 0; i < nFine; i++) {
    const s = i * ds;
    const k1 = dTheta(RHO0 * Math.exp(-s / 2));
    const k2 = dTheta(RHO0 * Math.exp(-(s + ds / 2) / 2));
    const k4 = dTheta(RHO0 * Math.exp(-(s + ds) / 2));
    th += (ds * (k1 + 4 * k2 + k4)) / 6;
    fine[i + 1] = th;
  }
  const samples = [];
  for (let i = 0; i < N_PTS; i++) {
    const s = (sEnd * i) / (N_PTS - 1);
    const fi = s / ds;
    const i0 = Math.min(nFine - 1, Math.floor(fi));
    const f = fi - i0;
    const theta = fine[i0] * (1 - f) + fine[i0 + 1] * f;
    const rho = RHO0 * Math.exp(-s / 2);
    const eta = eta0 * Math.exp(s);
    samples.push({ s: s, x: rho * Math.cos(theta), y: eta, z: rho * Math.sin(theta) });
  }
  return { eta0: eta0, theta0: theta0, sEnd: sEnd, samples: samples };
}

function adopt(st, parent, obj) {
  st.scene.remove(obj.group);
  parent.add(obj.group);
  return obj;
}

// Translucent spheroid: a little tint everywhere, more where the surface turns away from the viewer, so its
// outline (the two lengths) reads at a glance. A pure function of the camera; it writes no depth.
const RIM_VS = `
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const RIM_FS = `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uBase;
uniform float uRim;
varying vec3 vN;
varying vec3 vV;
void main() {
  float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  gl_FragColor = vec4(uColor, (uBase + uRim * f * f * f) * uOpacity);
  #include <colorspace_fragment>
}`;

export function rimSpheroid(token, base, rim) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: tokenColor(token) },
      uOpacity: { value: 1 },
      uBase: { value: base },
      uRim: { value: rim },
    },
    vertexShader: RIM_VS,
    fragmentShader: RIM_FS,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 0;
  return {
    mesh: mesh,
    material: mat,
    setOpacity: function (k) {
      mat.uniforms.uOpacity.value = k;
      mesh.visible = k > 0.001;
    },
  };
}

function sampleStream(stream, s) {
  const n = stream.samples.length;
  const u = (s / stream.sEnd) * (n - 1);
  const i = Math.min(n - 2, Math.max(0, Math.floor(u)));
  const f = u - i;
  const a = stream.samples[i];
  const b = stream.samples[i + 1];
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
    z: a.z + (b.z - a.z) * f,
  };
}

function tubeRadius(R, minR) {
  return Math.max(minR, TUBE0 * (R / 0.55));
}

// Tube whose cross-section is tied to the horizontal radial direction, then kept
// continuous along the curve. The shared curve() frame can flip at one scale and
// leave a one-frame hole.
function stableTube(st, nPts, token) {
  const K = 7;
  const segs = nPts - 1;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(nPts * K * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const idx = [];
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < K; j++) {
      const j2 = (j + 1) % K;
      const a = i * K + j;
      const b = i * K + j2;
      const c = (i + 1) * K + j;
      const d = (i + 1) * K + j2;
      idx.push(a, b, c, b, d, c);
    }
  }
  geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({
    color: tokenColor(token),
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  const group = new THREE.Group();
  group.add(mesh);
  st.scene.add(group);
  let rad = TUBE0;
  const T = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();
  const P = new THREE.Vector3();
  let prevB = new THREE.Vector3();
  function set(pts) {
    let hasPrev = false;
    for (let i = 0; i < nPts; i++) {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(nPts - 1, i + 1)];
      T.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      if (T.lengthSq() < 1e-14) T.set(0, 1, 0);
      T.normalize();
      const px = pts[i][0];
      const pz = pts[i][2];
      const pl = Math.hypot(px, pz);
      if (pl > 1e-4) N.set(px / pl, 0, pz / pl);
      else N.set(1, 0, 0);
      N.addScaledVector(T, -N.dot(T));
      if (N.lengthSq() < 1e-8) {
        N.set(0, 1, 0);
        N.addScaledVector(T, -N.dot(T));
      }
      N.normalize();
      B.crossVectors(T, N);
      if (hasPrev && B.dot(prevB) < 0) {
        B.negate();
        N.negate();
      }
      prevB.copy(B);
      hasPrev = true;
      for (let j = 0; j < K; j++) {
        const ang = (2 * Math.PI * j) / K;
        const cs = Math.cos(ang);
        const sn = Math.sin(ang);
        P.set(N.x * cs + B.x * sn, N.y * cs + B.y * sn, N.z * cs + B.z * sn);
        const k = 3 * (i * K + j);
        pos[k] = pts[i][0] + rad * P.x;
        pos[k + 1] = pts[i][1] + rad * P.y;
        pos[k + 2] = pts[i][2] + rad * P.z;
      }
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeBoundingSphere();
  }
  return {
    group: group,
    mesh: mesh,
    material: mat,
    set: set,
    setRadius: function (r) { rad = r; },
    setDraw: function (f) {
      const k = Math.max(0, Math.min(segs, Math.round(f * segs)));
      geo.setDrawRange(0, k * 6 * K);
    },
    setOpacity: function (v0) {
      const v = Math.max(0, Math.min(1, v0));
      mat.opacity = v;
      group.visible = v > 0.001;
    },
  };
}

export function makeCore(st, opts) {
  const o = Object.assign({ bead: 0.045, tubeMin: TUBE_MIN, ghost: 1 }, opts || {});
  const tubeMin = o.tubeMin;
  const group = new THREE.Group();
  st.scene.add(group);
  const streamGroup = new THREE.Group();
  const boundGroup = new THREE.Group();
  const axialGroup = new THREE.Group();
  const beadGroup = new THREE.Group();
  const headGroup = new THREE.Group();
  group.add(boundGroup);
  group.add(streamGroup);
  group.add(axialGroup);
  group.add(headGroup);
  group.add(beadGroup);

  const body = rimSpheroid("--obj-hopping", 0.1, 0.42);
  boundGroup.add(body.mesh);
  const ghost = rimSpheroid("--ink-muted", 0, 0.34);
  ghost.mesh.scale.set(R0, L0, R0);
  boundGroup.add(ghost.mesh);

  const ringN = 96;
  const ring = curve(st, circlePts([0, 0, 0], [1, 0, 0], [0, 0, 1], R0, ringN), {
    token: "--ink-muted", radius: tubeMin * 0.55, closed: true, hidden: "none", halo: 0, sides: 6,
  });
  adopt(st, boundGroup, ring);
  ring.mesh.frustumCulled = false;
  ring.mesh.renderOrder = 2;

  const seeds = SEEDS.map(function (p) { return integrate(p[0], p[1]); });
  const streams = seeds.map(function (seed) {
    const c = stableTube(st, seed.samples.length, "--obj-hopping");
    adopt(st, streamGroup, c);
    c.set(seed.samples.map(function (p) { return [p.x, p.y, p.z]; }));
    c.setDraw(0);
    return { seed: seed, curve: c };
  });

  const headGeo = new THREE.ConeGeometry(1, 1, 16);
  headGeo.translate(0, -0.5, 0);
  const heads = [];
  streams.forEach(function (s, index) {
    HEAD_U.forEach(function (u) {
      const mat = new THREE.MeshBasicMaterial({ color: tokenColor("--obj-hopping"), side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(headGeo, mat);
      mesh.frustumCulled = false;
      mesh.renderOrder = 5;
      mesh.visible = false;
      headGroup.add(mesh);
      heads.push({ mesh: mesh, mat: mat, index: index, u: u });
    });
  });
  const headUp = new THREE.Vector3(0, 1, 0);
  const headDir = new THREE.Vector3();
  const headQ = new THREE.Quaternion();

  const axial = [
    makeArrow(st, axialGroup, { token: "--obj-hopping", radius: TUBE0 * 1.1, lineHalo: 0, paperHead: false }),
    makeArrow(st, axialGroup, { token: "--obj-hopping", radius: TUBE0 * 1.1, lineHalo: 0, paperHead: false }),
  ];

  const beadGeo = new THREE.SphereGeometry(1, 20, 14);
  const beads = streams.map(function () {
    const mat = new THREE.MeshBasicMaterial({ color: tokenColor("--obj-hopping"), depthTest: false });
    const mesh = new THREE.Mesh(beadGeo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 8;
    beadGroup.add(mesh);
    return { mesh: mesh, mat: mat };
  });

  const annGeo = torusGeometry(2, 0.45, 72, 36);
  const annMat = new THREE.MeshBasicMaterial({
    color: tokenColor("--obj-potential"),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const annMesh = new THREE.Mesh(annGeo, annMat);
  annMesh.frustumCulled = false;
  annMesh.renderOrder = 1;
  annMesh.visible = false;
  const annulus = new THREE.Group();
  annulus.add(annMesh);
  group.add(annulus);

  let R = R0;
  let L = L0;
  let tau = 1;
  let draw = 0;
  let phase = 0;
  let opAll = 1;
  let opAnn = 0;
  let opAx = 0;
  let ghostK = o.ghost;

  function scalePoint(p) {
    return [R * p.x, L * p.y, R * p.z];
  }

  function placeBeads() {
    const show = opAll > 0.001 && draw > 0.02;
    const br = Math.max(0.018, o.bead * Math.sqrt(R / R0));
    beads.forEach(function (bead, i) {
      const seed = streams[i].seed;
      const s0 = i * 0.5 * seed.sEnd;
      let s = (s0 + BEAD_C * phase) % seed.sEnd;
      if (s < 0) s += seed.sEnd;
      const drawnTo = draw * seed.sEnd;
      const w = scalePoint(sampleStream(seed, Math.min(s, drawnTo)));
      bead.mesh.position.set(w[0], w[1], w[2]);
      // a bead shrinks to nothing near both ends of its streamline, so the wrap from the end back to
      // the start (s mod s_end) never shows as a bead popping out or in
      const edge = Math.min(BEAD_EDGE, s, seed.sEnd - s) / BEAD_EDGE;
      const grow = edge <= 0 ? 0 : edge * edge * (3 - 2 * edge);
      bead.mesh.scale.setScalar(br * grow);
      const on = show && s <= drawnTo + 1e-6 && grow > 0.02;
      bead.mesh.visible = on;
      bead.mat.opacity = on ? opAll : 0;
      bead.mat.transparent = opAll < 0.999;
    });
  }

  function placeHeads() {
    const tubeR = tubeRadius(R, tubeMin);
    heads.forEach(function (h) {
      const seed = streams[h.index].seed;
      if (!(opAll > 0.02 && draw + 1e-4 >= h.u)) {
        h.mesh.visible = false;
        return;
      }
      const s = h.u * seed.sEnd;
      const wa = scalePoint(sampleStream(seed, s));
      const wb = scalePoint(sampleStream(seed, Math.min(seed.sEnd, s + 0.08)));
      headDir.set(wb[0] - wa[0], wb[1] - wa[1], wb[2] - wa[2]);
      if (headDir.lengthSq() < 1e-10) {
        h.mesh.visible = false;
        return;
      }
      headDir.normalize();
      const headR = Math.max(0.03, tubeR * 3.4);
      // tip on the curve, wider than the tube, same colour, so a gap cannot open
      h.mesh.position.set(wa[0], wa[1], wa[2]);
      headQ.setFromUnitVectors(headUp, headDir);
      h.mesh.quaternion.copy(headQ);
      h.mesh.scale.set(headR, headR * 2.6, headR);
      h.mat.opacity = opAll;
      h.mat.transparent = opAll < 0.999;
      h.mat.depthWrite = opAll > 0.98;
      h.mesh.visible = opAll > 0.02;
    });
  }

  function applyStyle() {
    streams.forEach(function (s) {
      s.curve.setDraw(draw);
      s.curve.setOpacity(draw > 0.001 ? opAll : 0);
      s.curve.material.transparent = opAll < 0.999;
      s.curve.material.depthWrite = opAll > 0.98;
    });
    const bv = opAll * Math.max(0, Math.min(1, draw));
    body.setOpacity(bv);
    ring.setOpacity(bv);
    // the outline of the tau = 1 spheroid appears only once the body has left it
    ghost.setOpacity(bv * ghostK * Math.max(0, Math.min(1, (1 - tau) / 0.12)));
  }

  function setTau(next) {
    tau = Math.max(1e-4, next);
    R = R0 * Math.sqrt(tau);
    L = L0 * Math.pow(tau, 0.3);
    const tubeR = tubeRadius(R, tubeMin);
    streams.forEach(function (s) {
      s.curve.setRadius(tubeR);
      s.curve.set(s.seed.samples.map(scalePoint));
    });
    body.mesh.scale.set(R, L, R);
    ring.setRadius(Math.max(tubeMin * 0.55, tubeR * 0.5));
    ring.set(circlePts([0, 0, 0], [1, 0, 0], [0, 0, 1], R, ringN));
    const axLen = Math.max(0.1, 0.34 * L);
    const y0 = ETA_STOP * L + 0.06;
    axial.forEach(function (a) { a.setScale(Math.max(0.5, Math.sqrt(R / R0))); });
    axial[0].place([0, y0, 0], [0, y0 + axLen, 0]);
    axial[1].place([0, -y0, 0], [0, -y0 - axLen, 0]);
    axial[0].setOpacity(opAll * opAx);
    axial[1].setOpacity(opAll * opAx);
    annulus.scale.set(R, R, R);
    placeBeads();
    placeHeads();
    applyStyle();
  }

  function setDraw(k) {
    draw = Math.max(0, Math.min(1, k));
    applyStyle();
    placeBeads();
    placeHeads();
  }

  function setBeadsTime(ph) {
    phase = ph;
    placeBeads();
  }

  function showAnnulus(k) {
    opAnn = Math.max(0, Math.min(1, k));
    annMat.opacity = 0.1 * opAll * opAnn;
    annMesh.visible = annMat.opacity > 0.001;
  }

  function showAxial(k) {
    opAx = Math.max(0, Math.min(1, k));
    axial.forEach(function (a) { a.setOpacity(opAll * opAx); });
  }

  function showGhost(k) {
    ghostK = Math.max(0, Math.min(1, k));
    applyStyle();
  }

  function setOpacity(k) {
    opAll = Math.max(0, Math.min(1, k));
    applyStyle();
    showAnnulus(opAnn);
    showAxial(opAx);
    placeBeads();
    placeHeads();
    group.visible = opAll > 0.001;
  }

  setTau(1);
  setDraw(0);
  showAnnulus(0);
  showAxial(0);

  return {
    group: group,
    annulus: annulus,
    setTau: setTau,
    setDraw: setDraw,
    setBeadsTime: setBeadsTime,
    showAnnulus: showAnnulus,
    showAxial: showAxial,
    showGhost: showGhost,
    setOpacity: setOpacity,
    metrics: function () { return { R: R, L: L, tau: tau }; },
  };
}

// Points perpendicular to the axis, on screen right of the axis, for a camera at azimuth az (degrees):
// dimension marks stay in the picture plane while the core turns.
export function screenRight(az) {
  const a = az * Math.PI / 180;
  return [Math.cos(a), 0, -Math.sin(a)];
}
