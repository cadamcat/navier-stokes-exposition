/* Planar tracer trails on a self-contained, transparent canvas layer. */
import { createTrajectories, smooth } from './particles.js';

export function particles2d(options) {
  const o = { x: 0, y: 0, width: 1920, height: 1080, segments: 20,
    lineWidth: 3, opacity: 0.8, edgeFade: 32, ...options };
  if (!o.parent) throw new TypeError('parent is required');
  if (!(o.width > 0 && o.height > 0 && o.lineWidth > 0 && o.edgeFade > 0)) {
    throw new RangeError('canvas dimensions, lineWidth and edgeFade must be positive');
  }
  if (!Number.isInteger(o.segments) || o.segments < 2) throw new RangeError('segments must be at least 2');
  if (typeof o.field !== 'function') throw new TypeError('field is required');
  const cache = createTrajectories({ ...o,
    field: (x, y, z, t) => o.field(x, y, t),
    scalar: o.scalar ? (x, y, z, t) => o.scalar(x, y, t) : undefined });
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.left = o.x + 'px';
  canvas.style.top = o.y + 'px';
  canvas.style.width = o.width + 'px';
  canvas.style.height = o.height + 'px';
  canvas.style.pointerEvents = 'none';
  const ratio = o.pixelRatio || window.devicePixelRatio || 1;
  canvas.width = Math.round(o.width * ratio);
  canvas.height = Math.round(o.height * ratio);
  o.parent.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const project = o.project || ((x, y) => [x, y]);
  const fallback = getComputedStyle(document.documentElement).getPropertyValue('--obj-wave').trim();
  const color = o.color || (() => fallback);
  const p = new Float64Array(4);
  const points = new Float64Array((o.segments + 1) * 4);

  function setTime(t, opacity = o.opacity) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, o.width, o.height);
    ctx.lineCap = 'butt';
    cache.visit(t, (track, age, alpha) => {
      for (let j = 0; j <= o.segments; j++) {
        const f = j / o.segments;
        const history = age - cache.options.trailLength * (1 - f);
        cache.sample(track, history, p);
        const q = project(p[0], p[1]);
        const margin = Math.min(q[0], q[1], o.width - q[0], o.height - q[1]);
        points.set([q[0], q[1], smooth(history / cache.options.fade) * smooth(margin / o.edgeFade), p[3]], j * 4);
      }
      for (let j = 1; j <= o.segments; j++) {
        const f = (j - 0.5) / o.segments;
        const a = (j - 1) * 4;
        const b = j * 4;
        ctx.strokeStyle = color((points[a + 3] + points[b + 3]) / 2);
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity)) * alpha * Math.pow(f, 1.35) * points[b + 2];
        ctx.lineWidth = o.lineWidth * (0.12 + 0.88 * f) * Math.sqrt(alpha * points[b + 2]);
        if (ctx.lineWidth <= 0) continue;
        ctx.beginPath();
        ctx.moveTo(points[a], points[a + 1]);
        ctx.lineTo(points[b], points[b + 1]);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  }
  return { canvas, cache, setTime, dispose() { canvas.remove(); } };
}
