/* Legend for a scalar map: label, unit, swatch, ticks, optional note.
   The swatch is the map itself, one column per device pixel. */
(function (root) {
  function drawSwatch(canvas, map) {
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 1;
    const cssH = canvas.clientHeight || 1;
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: false });
    const img = ctx.createImageData(w, h);
    const data = img.data;
    for (let x = 0; x < w; x++) {
      const u = w === 1 ? 0 : x / (w - 1);
      const c = map.bytes(u);
      for (let y = 0; y < h; y++) {
        const o = (y * w + x) * 4;
        data[o] = c[0];
        data[o + 1] = c[1];
        data[o + 2] = c[2];
        data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function mountColorbar(opts) {
    const o = opts || {};
    const parent = o.parent || document.body;
    const map = o.map;
    if (!map || !map.bytes) throw new Error("colorbar needs a map");
    const el = document.createElement("div");
    el.className = "colorbar t-label";
    el.dataset.box = o.box || "colorbar";
    if (o.group) el.dataset.group = o.group;
    el.style.left = (o.x || 0) + "px";
    el.style.top = (o.y || 0) + "px";
    el.style.width = (o.w || 420) + "px";

    const head = document.createElement("div");
    head.className = "colorbar-head";
    const label = document.createElement("span");
    label.className = "colorbar-label";
    label.textContent = o.label || "";
    const unit = document.createElement("span");
    unit.className = "colorbar-unit";
    unit.textContent = o.unit || "";
    head.appendChild(label);
    head.appendChild(unit);
    el.appendChild(head);

    const canvas = document.createElement("canvas");
    canvas.className = "colorbar-swatch";
    el.appendChild(canvas);

    const ticks = document.createElement("div");
    ticks.className = "colorbar-ticks";
    const items = o.ticks || [];
    for (let i = 0; i < items.length; i++) {
      const tick = document.createElement("span");
      tick.className = "colorbar-tick";
      tick.textContent = items[i].text;
      const u = items[i].u;
      if (u <= 0.001) {
        tick.style.left = "0px";
      } else if (u >= 0.999) {
        tick.style.right = "0px";
      } else {
        tick.style.left = (u * 100) + "%";
        tick.style.transform = "translateX(-50%)";
      }
      ticks.appendChild(tick);
    }
    el.appendChild(ticks);

    if (o.note) {
      const note = document.createElement("div");
      note.className = "colorbar-note";
      note.textContent = o.note;
      el.appendChild(note);
    }

    parent.appendChild(el);
    drawSwatch(canvas, map);

    function setOpacity(k) {
      const v = k <= 0 ? 0 : k >= 1 ? 1 : k;
      el.style.opacity = String(v);
    }

    setOpacity(o.opacity == null ? 1 : o.opacity);
    return { el: el, map: map, setOpacity: setOpacity };
  }

  root.mountColorbar = mountColorbar;
})(typeof globalThis !== "undefined" ? globalThis : this);
