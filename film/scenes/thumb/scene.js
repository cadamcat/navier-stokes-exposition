/* Thumbnail still: the film's schematic vortex at its tightest and a short title.
   Rendered at 3840x2160 and downscaled to 1280x720. No status strip, no subtitles. */
import { stage3d } from "../three3d/stage3d.js";
import { makeFlow } from "../ns/flow.js";
import { coreContour } from "../ns/contour.js";

const T = 9;
const st = stage3d({ parent: document.body, left: 0, top: 0, width: 1040, height: 1080, fov: 32 });
const map = magnitudeMap();
const flow = makeFlow(st, { force: 0, tightens: 1, tightDuration: 6.8, duration: 12, peak: 1e9 }, map, { left: 0, top: 0, rail: false, count: 300, width: 5.2 });
const core = coreContour(st, { width: 5, halo: 6 });

function line(text, top, scale, token, strong) {
  const d = document.createElement("div");
  d.className = "t-title thumb-title";
  d.textContent = text;
  d.style.top = top + "px";
  d.style.transform = "scale(" + scale + ")";
  d.style.color = "var(" + token + ")";
  if (!strong) d.style.fontWeight = "400";
  document.body.appendChild(d);
  return d;
}
line("Navier–Stokes:", 280, 2.05, "--ink", true);
line("the announced", 460, 2.05, "--ink", false);
line("blowup", 640, 2.05, "--velocity", true);

const note = document.createElement("div");
note.className = "t-label";
note.style.position = "absolute";
note.style.left = "120px";
note.style.top = "984px";
note.style.color = "var(--ink-muted)";
note.style.transformOrigin = "0 0";
note.style.transform = "scale(1.35)";
note.textContent = "schematic";
document.body.appendChild(note);

window.sceneDuration = 1;
window.setTime = function () {
  st.orbit([0, 0, 0], -8, 24, 9.7);
  const { R, L } = flow.scales(T);
  core.set(R, L, 0);
  flow.setTime(T, 1);
  st.render();
};
window.setTime(0);
