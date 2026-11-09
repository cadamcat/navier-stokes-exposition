const zlib = require("zlib");

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePNG(buf) {
  if (buf[0] !== 137) throw new Error("not a png");
  let p = 8;
  let width = 0;
  let height = 0;
  let colorType = 6;
  let depth = 8;
  let interlace = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    p += 4;
    const type = buf.toString("ascii", p, p + 4);
    p += 4;
    const data = buf.subarray(p, p + len);
    p += len + 4;
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
      depth = data[8];
      interlace = data[12];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }
  if (interlace) throw new Error("interlaced png");
  if (depth !== 8 || (colorType !== 2 && colorType !== 6)) throw new Error("expected 8-bit RGB or RGBA png");
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = new Uint8Array(width * height * 4);
  let s = 0;
  let prev = new Uint8Array(width * bpp);
  for (let y = 0; y < height; y++) {
    const filter = raw[s++];
    const row = raw.subarray(s, s + width * bpp);
    s += width * bpp;
    const cur = new Uint8Array(width * bpp);
    for (let i = 0; i < cur.length; i++) {
      const left = i >= bpp ? cur[i - bpp] : 0;
      const up = prev[i];
      const ul = i >= bpp ? prev[i - bpp] : 0;
      const x = row[i];
      let v = x;
      if (filter === 1) v = x + left;
      else if (filter === 2) v = x + up;
      else if (filter === 3) v = x + ((left + up) >> 1);
      else if (filter === 4) v = x + paeth(left, up, ul);
      cur[i] = v & 255;
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const i = x * bpp;
      out[o] = cur[i];
      out[o + 1] = cur[i + 1];
      out[o + 2] = cur[i + 2];
      out[o + 3] = bpp === 4 ? cur[i + 3] : 255;
    }
    prev = cur;
  }
  return { width: width, height: height, colorType: colorType, data: out };
}


const crcTable = Array.from({ length: 256 }, function (_, n) {
  for (let k = 0; k < 8; k++) n = (n & 1) ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});

function chunk(type, data) {
  const out = Buffer.alloc(data.length + 12);
  out.writeUInt32BE(data.length);
  out.write(type, 4, 4, "ascii");
  data.copy(out, 8);
  let crc = 0xffffffff;
  for (let i = 4; i < out.length - 4; i++) crc = crcTable[(crc ^ out[i]) & 255] ^ (crc >>> 8);
  out.writeUInt32BE((crc ^ 0xffffffff) >>> 0, out.length - 4);
  return out;
}

function encodePNG({ width, height, data, colorType = 6 }) {
  if (colorType !== 2 && colorType !== 6) throw new Error("expected RGB or RGBA output");
  const channels = colorType === 2 ? 3 : 4;
  const stride = width * channels;
  const raw = Buffer.allocUnsafe((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (stride + 1);
    const src = y * width * 4;
    raw[row] = 1; // Sub filter compresses the large flat regions of a scene cheaply.
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < channels; c++) {
        const i = src + x * 4 + c;
        raw[row + 1 + x * channels + c] = (data[i] - (x ? data[i - 4] : 0)) & 255;
      }
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  // Keep the screenshot's channel layout. Switching between RGB still frames
  // and RGBA averaged frames makes video filters reinitialize and lose frames.
  header[9] = colorType;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("sRGB", Buffer.from([0])),
    chunk("IDAT", zlib.deflateSync(raw, { level: 3 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Average encoded sRGB channel values. Integer deltas preserve every unchanged
// pixel exactly, including antialiased text; this is display-space blur, not a
// simulation of a linear-light camera exposure. Screenshots have an opaque ground.
function averagePNGs(samples) {
  if (!samples.length) throw new Error("no shutter samples");
  const first = samples[0];
  if (samples.every(function (s) { return s.equals(first); })) return { buffer: first, identical: true };
  const base = decodePNG(first);
  const deltas = new Int32Array(base.data.length);
  let changed = false;
  for (let k = 1; k < samples.length; k++) {
    if (samples[k].equals(first)) continue;
    const next = decodePNG(samples[k]);
    if (next.width !== base.width || next.height !== base.height) throw new Error("shutter sample dimensions differ");
    for (let i = 0; i < deltas.length; i++) {
      const d = next.data[i] - base.data[i];
      deltas[i] += d;
      if (d) changed = true;
    }
  }
  if (!changed) return { buffer: first, identical: true };
  for (let i = 0; i < deltas.length; i++) {
    if (deltas[i]) base.data[i] = Math.round(base.data[i] + deltas[i] / samples.length);
  }
  return { buffer: encodePNG(base), identical: false };
}

module.exports = { decodePNG, encodePNG, averagePNGs };
