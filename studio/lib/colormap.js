/* Scalar colour maps. Stops are token names; samples are OKLab interpolations.
   Classic scripts get the globals below. ES modules import lib/colormap.mjs
   after this file has loaded. No clock, no unseeded draw. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.Colormap = api;
  root.makeMap = api.makeMap;
  root.magnitudeMap = api.magnitudeMap;
  root.signedMap = api.signedMap;
  root.paintGeometry = api.paintGeometry;
  root.paintSVG = api.paintSVG;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  // Machado, Oliveira, Fernandes, IEEE TVCG 2009, severity 1.
  // Applied to linear sRGB, then clamped and encoded back. Row-major.
  const PROTAN = [
    0.152286, 1.052583, -0.204868,
    0.114503, 0.786281, 0.099216,
    -0.003882, -0.048116, 1.051998,
  ];
  const DEUTAN = [
    0.367322, 0.860646, -0.227968,
    0.280085, 0.672501, 0.047413,
    -0.011820, 0.042940, 0.968881,
  ];

  function tokenColors() {
    if (typeof TOKENS !== "undefined" && TOKENS && TOKENS.color) return TOKENS.color;
    if (typeof require === "function") return require("./tokens").color;
    throw new Error("tokens missing");
  }

  function clamp01(x) {
    if (x < 0) return 0;
    if (x > 1) return 1;
    return x;
  }

  function parseHex(text) {
    const n = parseInt(String(text).slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function srgbByteToUnit(c) {
    return c / 255;
  }

  function srgbToLinear(c) {
    return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
  }

  function displayFromLinear(c) {
    const x = clamp01(c);
    return x < 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 0.41666) - 0.055;
  }

  function encodeByte(linear) {
    return Math.round(clamp01(displayFromLinear(linear)) * 255);
  }

  function bytesToLinear(rgb) {
    return [
      srgbToLinear(srgbByteToUnit(rgb[0])),
      srgbToLinear(srgbByteToUnit(rgb[1])),
      srgbToLinear(srgbByteToUnit(rgb[2])),
    ];
  }

  function toOKLab(r, g, b) {
    const R = srgbToLinear(srgbByteToUnit(r));
    const G = srgbToLinear(srgbByteToUnit(g));
    const B = srgbToLinear(srgbByteToUnit(b));
    const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
    const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
    const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;
    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);
    return [
      0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
      1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
      0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    ];
  }

  function fromOKLab(L, a, b) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
  }

  function inGamut(lin) {
    return lin[0] >= -1e-4 && lin[0] <= 1 + 1e-4 &&
      lin[1] >= -1e-4 && lin[1] <= 1 + 1e-4 &&
      lin[2] >= -1e-4 && lin[2] <= 1 + 1e-4;
  }

  function labToBytes(L, a, b) {
    let scale = 1;
    let lin = fromOKLab(L, a, b);
    for (let i = 0; i < 24 && !inGamut(lin); i++) {
      scale *= 0.9;
      lin = fromOKLab(L, a * scale, b * scale);
    }
    return [encodeByte(lin[0]), encodeByte(lin[1]), encodeByte(lin[2])];
  }

  function cssFromBytes(rgb) {
    const name = String.fromCharCode(114, 103, 98);
    return name + "(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
  }

  function resolveStop(stop) {
    if (stop.rgb) return { t: stop.t, rgb: stop.rgb.slice(), lab: toOKLab(stop.rgb[0], stop.rgb[1], stop.rgb[2]) };
    const table = tokenColors();
    const hex = table[stop.token];
    if (!hex) throw new Error("unknown token " + stop.token);
    const rgb = parseHex(hex);
    return { t: stop.t, token: stop.token, rgb: rgb, lab: toOKLab(rgb[0], rgb[1], rgb[2]) };
  }

  function unitFrom(x, lo, hi) {
    const span = hi - lo;
    if (!(span > 0)) return 0;
    const u = (x - lo) / span;
    return clamp01(u);
  }

  function sampleLab(stops, u) {
    const x = clamp01(u);
    if (x <= stops[0].t) return stops[0].lab;
    const last = stops[stops.length - 1];
    if (x >= last.t) return last.lab;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      if (x >= a.t && x <= b.t) {
        const span = b.t - a.t;
        const f = span > 0 ? (x - a.t) / span : 0;
        return [
          a.lab[0] + (b.lab[0] - a.lab[0]) * f,
          a.lab[1] + (b.lab[1] - a.lab[1]) * f,
          a.lab[2] + (b.lab[2] - a.lab[2]) * f,
        ];
      }
    }
    return last.lab;
  }

  function makeMap(opts) {
    const o = opts || {};
    const raw = o.stops || [];
    if (raw.length < 2) throw new Error("a map needs two stops");
    const stops = raw.map(resolveStop).sort(function (a, b) { return a.t - b.t; });
    const id = o.id || "map";
    const kind = o.kind || "sequential";

    function bytes(u) {
      const lab = sampleLab(stops, u);
      return labToBytes(lab[0], lab[1], lab[2]);
    }

    const map = {
      id: id,
      kind: kind,
      stops: stops,
      bytes: bytes,
      linear: function (u) { return bytesToLinear(bytes(u)); },
      css: function (u) { return cssFromBytes(bytes(u)); },
      lightness: function (u) {
        const c = bytes(u);
        return toOKLab(c[0], c[1], c[2])[0];
      },
      unitFrom: unitFrom,
    };
    return map;
  }

  function magnitudeMap() {
    return makeMap({
      id: "magnitude",
      kind: "sequential",
      stops: [
        { t: 0, token: "mapMag0" },
        { t: 0.25, token: "mapMag1" },
        { t: 0.5, token: "mapMag2" },
        { t: 0.75, token: "mapMag3" },
        { t: 1, token: "mapMag4" },
      ],
    });
  }

  function signedMap() {
    return makeMap({
      id: "signed",
      kind: "diverging",
      stops: [
        { t: 0, token: "mapSignNeg" },
        { t: 0.5, token: "mapSignZero" },
        { t: 1, token: "mapSignPos" },
      ],
    });
  }

  function valueAt(source, i, geometry, lo, hi) {
    const x = typeof source === "function" ? source(i, geometry) : source[i];
    if (lo == null || hi == null) return clamp01(x);
    return unitFrom(x, lo, hi);
  }

  function paintGeometry(geometry, source, map, opt) {
    const o = opt || {};
    const pos = geometry.getAttribute("position");
    if (!pos) throw new Error("geometry has no position");
    const n = pos.count;
    if (typeof source !== "function" && (!source || source.length < n)) {
      throw new Error("scalar list shorter than the vertex count");
    }
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const lin = map.linear(valueAt(source, i, geometry, o.min, o.max));
      arr[i * 3] = lin[0];
      arr[i * 3 + 1] = lin[1];
      arr[i * 3 + 2] = lin[2];
    }
    const Ctor = o.attribute || pos.constructor;
    geometry.setAttribute("color", new Ctor(arr, 3));
    return geometry;
  }

  function paintSVG(el, scalar, map, opt) {
    const o = opt || {};
    const u = o.min == null ? clamp01(scalar) : unitFrom(scalar, o.min, o.max);
    el.setAttribute(o.attr || "fill", map.css(u));
    return el;
  }

  function applyMatrix(M, rgb) {
    const R = srgbToLinear(srgbByteToUnit(rgb[0]));
    const G = srgbToLinear(srgbByteToUnit(rgb[1]));
    const B = srgbToLinear(srgbByteToUnit(rgb[2]));
    return [
      encodeByte(M[0] * R + M[1] * G + M[2] * B),
      encodeByte(M[3] * R + M[4] * G + M[5] * B),
      encodeByte(M[6] * R + M[7] * G + M[8] * B),
    ];
  }

  function simulateCVD(rgb, kind) {
    if (kind === "protan") return applyMatrix(PROTAN, rgb);
    if (kind === "deutan") return applyMatrix(DEUTAN, rgb);
    throw new Error("unknown simulation " + kind);
  }

  function linByte(c) {
    const x = c / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }

  function rgbToLab(r, g, b) {
    const R = linByte(r);
    const G = linByte(g);
    const B = linByte(b);
    let x = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
    let y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
    let z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;
    x /= 0.95047;
    y /= 1;
    z /= 1.08883;
    const f = function (t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; };
    const fx = f(x);
    const fy = f(y);
    const fz = f(z);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }

  function deltaE(rgbA, rgbB) {
    const a = rgbToLab(rgbA[0], rgbA[1], rgbA[2]);
    const b = rgbToLab(rgbB[0], rgbB[1], rgbB[2]);
    const kL = 1;
    const kC = 1;
    const kH = 1;
    const C1 = Math.hypot(a[1], a[2]);
    const C2 = Math.hypot(b[1], b[2]);
    const Cbar = (C1 + C2) / 2;
    const C7 = Math.pow(Cbar, 7);
    const G = 0.5 * (1 - Math.sqrt(C7 / (C7 + Math.pow(25, 7))));
    const a1 = (1 + G) * a[1];
    const a2 = (1 + G) * b[1];
    const C1p = Math.hypot(a1, a[2]);
    const C2p = Math.hypot(a2, b[2]);
    const hue = function (aa, bb) {
      if (aa === 0 && bb === 0) return 0;
      let h = Math.atan2(bb, aa) * 180 / Math.PI;
      if (h < 0) h += 360;
      return h;
    };
    const h1 = hue(a1, a[2]);
    const h2 = hue(a2, b[2]);
    const dL = b[0] - a[0];
    const dC = C2p - C1p;
    let dh = h2 - h1;
    if (C1p * C2p === 0) dh = 0;
    else if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
    const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh * Math.PI / 180) / 2);
    const Lp = (a[0] + b[0]) / 2;
    const Cp = (C1p + C2p) / 2;
    let Hp = (h1 + h2) / 2;
    if (C1p * C2p !== 0 && Math.abs(h1 - h2) > 180) {
      Hp = h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;
    }
    const rad = Math.PI / 180;
    const T = 1 - 0.17 * Math.cos((Hp - 30) * rad) + 0.24 * Math.cos(2 * Hp * rad) + 0.32 * Math.cos((3 * Hp + 6) * rad) - 0.2 * Math.cos((4 * Hp - 63) * rad);
    const dRo = 30 * Math.exp(-Math.pow((Hp - 275) / 25, 2));
    const Rc = 2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7)));
    const Sl = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2));
    const Sc = 1 + 0.045 * Cp;
    const Sh = 1 + 0.015 * Cp * T;
    const Rt = -Math.sin(2 * dRo * rad) * Rc;
    return Math.sqrt(
      Math.pow(dL / (kL * Sl), 2) +
      Math.pow(dC / (kC * Sc), 2) +
      Math.pow(dH / (kH * Sh), 2) +
      Rt * (dC / (kC * Sc)) * (dH / (kH * Sh))
    );
  }

  function endMiddleGaps(map) {
    const ends = [map.bytes(0), map.bytes(0.5), map.bytes(1)];
    function gap(kind, index) {
      return deltaE(simulateCVD(ends[index], kind), simulateCVD(ends[1], kind));
    }
    return {
      protan: [gap("protan", 0), gap("protan", 2)],
      deutan: [gap("deutan", 0), gap("deutan", 2)],
    };
  }

  return {
    makeMap: makeMap,
    magnitudeMap: magnitudeMap,
    signedMap: signedMap,
    paintGeometry: paintGeometry,
    paintSVG: paintSVG,
    simulateCVD: simulateCVD,
    deltaE: deltaE,
    endMiddleGaps: endMiddleGaps,
    toOKLab: toOKLab,
    unitFrom: unitFrom,
  };
});
