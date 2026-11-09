/* c9 periodic cell. One horizontal layer of 3 × 3 cells. scene.js moves it.
   Only the centre cell is a whole wire cube; the other cells are drawn as a grid on the floor of the layer, so no
   edge passes in front of a copy of the construction. */
import { surface, tokenColor, THREE } from "../three3d/stage3d.js";

const XS = [-3, -1, 1, 3];
const YS = [-1, 1];
const ZS = [-3, -1, 1, 3];

function inCenter(x, y, z) {
  return Math.abs(x) <= 1 + 1e-6 && Math.abs(y) <= 1 + 1e-6 && Math.abs(z) <= 1 + 1e-6;
}

export function blockSegments() {
  const center = [];
  const rest = [];
  function add(x0, y0, z0, x1, y1, z1) {
    const seg = [x0, y0, z0, x1, y1, z1];
    if (inCenter(x0, y0, z0) && inCenter(x1, y1, z1)) center.push(seg);
    else if (y0 === YS[0] && y1 === YS[0]) rest.push(seg);
  }
  for (let yi = 0; yi < YS.length; yi++) {
    for (let zi = 0; zi < ZS.length; zi++) {
      for (let xi = 0; xi < XS.length - 1; xi++) {
        add(XS[xi], YS[yi], ZS[zi], XS[xi + 1], YS[yi], ZS[zi]);
      }
    }
  }
  for (let xi = 0; xi < XS.length; xi++) {
    for (let zi = 0; zi < ZS.length; zi++) {
      add(XS[xi], YS[0], ZS[zi], XS[xi], YS[1], ZS[zi]);
    }
  }
  for (let xi = 0; xi < XS.length; xi++) {
    for (let yi = 0; yi < YS.length; yi++) {
      for (let zi = 0; zi < ZS.length - 1; zi++) {
        add(XS[xi], YS[yi], ZS[zi], XS[xi], YS[yi], ZS[zi + 1]);
      }
    }
  }
  return { center: center, rest: rest };
}

/* Centre cell plus the eight neighbours in the plane y = 0.
   ring 0 centre, ring 1 the four orthogonal neighbours, ring 2 the four corners. */
export function cells() {
  const out = [];
  for (let i = -1; i <= 1; i++) {
    for (let k = -1; k <= 1; k++) {
      const man = (i !== 0 ? 1 : 0) + (k !== 0 ? 1 : 0);
      out.push({ i: i, k: k, ring: man, pos: [2 * i, 0, 2 * k] });
    }
  }
  return out;
}

/* Flat token-coloured tubes. Ends are shortened so neighbouring tubes do not share a volume. */
export function tubes(st, segs, opts) {
  const o = Object.assign({ token: "--rule", radius: 0.02, sides: 6, trim: 0.028 }, opts || {});
  const positions = [];
  const normals = [];
  const indices = [];
  let base = 0;
  for (let s = 0; s < segs.length; s++) {
    let x0 = segs[s][0], y0 = segs[s][1], z0 = segs[s][2];
    let x1 = segs[s][3], y1 = segs[s][4], z1 = segs[s][5];
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-4) continue;
    const ux = dx / len, uy = dy / len, uz = dz / len;
    const trim = Math.min(o.trim, len * 0.22);
    x0 += ux * trim; y0 += uy * trim; z0 += uz * trim;
    x1 -= ux * trim; y1 -= uy * trim; z1 -= uz * trim;
    let px = 0, py = 1, pz = 0;
    if (Math.abs(uy) > 0.85) { px = 1; py = 0; pz = 0; }
    let bx = uy * pz - uz * py;
    let by = uz * px - ux * pz;
    let bz = ux * py - uy * px;
    const bl = Math.hypot(bx, by, bz);
    bx /= bl; by /= bl; bz /= bl;
    const nx = by * uz - bz * uy;
    const ny = bz * ux - bx * uz;
    const nz = bx * uy - by * ux;
    const sides = o.sides;
    for (let end = 0; end < 2; end++) {
      const x = end ? x1 : x0;
      const y = end ? y1 : y0;
      const z = end ? z1 : z0;
      for (let k = 0; k < sides; k++) {
        const ang = 2 * Math.PI * k / sides;
        const c = Math.cos(ang), sn = Math.sin(ang);
        const ox = bx * c + nx * sn;
        const oy = by * c + ny * sn;
        const oz = bz * c + nz * sn;
        positions.push(x + o.radius * ox, y + o.radius * oy, z + o.radius * oz);
        normals.push(ox, oy, oz);
      }
    }
    for (let k = 0; k < sides; k++) {
      const k2 = (k + 1) % sides;
      const a = base + k, b = base + k2, c = base + sides + k, d = base + sides + k2;
      indices.push(a, c, b, b, c, d);
    }
    base += sides * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  const mat = new THREE.MeshBasicMaterial({ color: tokenColor(o.token), transparent: true, opacity: 1 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 3;
  st.scene.add(mesh);
  return {
    mesh: mesh,
    setOpacity(k) {
      const v = Math.max(0, Math.min(1, k));
      mat.opacity = v;
      mat.depthWrite = v > 0.98;
      mesh.visible = v > 0.001;
    },
    setColor(token) { mat.color.copy(tokenColor(token)); },
  };
}

export function makeBlobs(st, n) {
  const geo = new THREE.SphereGeometry(1, 36, 24);
  const blobs = [];
  for (let i = 0; i < n; i++) {
    const surf = surface(st, geo, { token: "--obj-hopping", k: 1, outline: 0.02 });
    surf.setOpacity(0);
    blobs.push(surf);
  }
  return blobs;
}

/* Short double arrow in the gap between the centre blob and the +x neighbour.
   Shaft and heads do not touch each other, the blobs, or any cell edge. */
export const ARROW_MID = [1, 0.36, 0.16];

export function doubleArrow(st) {
  const y = ARROW_MID[1];
  const z = ARROW_MID[2];
  const shaft = tubes(st, [[0.8, y, z, 1.2, y, z]], { token: "--ink", radius: 0.03, trim: 0.02, sides: 8 });
  const geo = new THREE.ConeGeometry(0.064, 0.15, 12);
  const mats = [];
  const meshes = [];
  function head(tipX, dir) {
    const mat = new THREE.MeshBasicMaterial({ color: tokenColor("--ink"), transparent: true, opacity: 1 });
    const mesh = new THREE.Mesh(geo, mat);
    const h = 0.15;
    mesh.position.set(tipX - dir * (h * 0.5), y, z);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dir, 0, 0));
    mesh.renderOrder = 4;
    st.scene.add(mesh);
    mats.push(mat);
    meshes.push(mesh);
  }
  head(0.62, -1);
  head(1.38, 1);
  shaft.setOpacity(0);
  return {
    setOpacity(k) {
      const v = Math.max(0, Math.min(1, k));
      shaft.setOpacity(v);
      for (let i = 0; i < mats.length; i++) {
        mats[i].opacity = v;
        mats[i].depthWrite = v > 0.98;
        meshes[i].visible = v > 0.001;
      }
    },
  };
}
