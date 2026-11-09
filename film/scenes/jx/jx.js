/* The film's status line: a full-width colour rule (8 px) at the bottom edge and a quiet label above it, preceded by
   a mark that does not rely on hue (solid square proved, "=" computed, outlined square claimed, dashed square
   heuristic, double square seal Lean, none for definition and context).
   Statuses: proved, computed, claimed, heuristic, lean, definition, context.
   Load after lib/cues.js (beatAt). Colours come from jx.css (tokens only). Pure function of t. */
(function (root) {
  const ORDER = ["proved", "computed", "claimed", "heuristic", "lean", "definition", "context"];
  const LABEL = {
    proved: "Proved · published theorem / complete argument",
    computed: "Computed · exact code check",
    claimed: "Claimed · source statement; unchecked here",
    heuristic: "Heuristic · illustration only",
    lean: "Lean · formal theorem; authors’ verification record",
    definition: "Definition",
    context: "Context",
  };
  const RULE_IN = 0.3;    // the new colour arrives over the old one
  const TEXT_OUT = 0.2;   // the old label leaves before the beat ends ...
  const TEXT_IN = 0.3;    // ... and the new one arrives after it starts: never text over text

  /* opts.labels: optional {beatId: text} replacing the status label for that beat with a qualified one
     (same status and colour, e.g. a proved implication that is conditional on claimed input). */
  function mountStripJX(parent, opts) {
    parent = parent || document.body;
    const qualified = (opts && opts.labels) || {};
    const el = document.createElement("div");
    el.className = "strip t-strip jx-strip";
    el.dataset.box = "strip";
    el.dataset.band = "strip";
    el.dataset.chrome = "1";
    const under = document.createElement("div");
    const over = document.createElement("div");
    const line = document.createElement("div");
    line.className = "jx-line";
    const mark = document.createElement("div");
    const label = document.createElement("div");
    label.className = "strip-label";
    line.appendChild(mark);
    line.appendChild(label);
    el.appendChild(under);
    el.appendChild(over);
    el.appendChild(line);
    parent.appendChild(el);

    function statusOf(b) { return ORDER.indexOf(b.status) >= 0 ? b.status : "context"; }
    const SHORT = {
      c3b5: "Proved · a forced breakdown leaves A and B open",
      c5b4: "Computed · claimed-schedule exponents; profile application heuristic",
      c9b3: "Proved · final implication; given claimed construction and comparison",
      c11b1: "Context · schematic flow",
      c11b2: "Context · schematic flow; C/D announced, claimed",
    };
    function textOf(b) { return SHORT[b.id] || qualified[b.id] || LABEL[statusOf(b)]; }
    function unit(t, s, d) { return Math.max(0, Math.min(1, (t - s) / d)); }

    /* opacity: the chapter's own fade, so the status line leaves with the picture and no empty bar remains. */
    function setTime(t, opacity) {
      const beat = root.beatAt ? root.beatAt(t) : null;
      const k = opacity == null ? 1 : opacity;
      if (!beat) {
        el.style.opacity = "0";
        return;
      }
      el.style.opacity = String(k <= 0.001 ? 0 : k >= 0.999 ? 1 : k);
      const list = root.BEATS.list;
      const i = list.indexOf(beat);
      const prev = i > 0 ? list[i - 1] : null;
      const next = i + 1 < list.length ? list[i + 1] : null;
      const status = statusOf(beat);
      el.className = "strip t-strip jx-strip st-" + status;
      over.className = "jx-rule st-" + status;
      under.className = "jx-rule st-" + (prev ? statusOf(prev) : status);
      const r = prev ? 1 - Math.pow(1 - unit(t, beat.start, RULE_IN), 3) : 1;
      over.style.opacity = String(r);
      under.style.opacity = r >= 1 ? "0" : "1";   // a dashed rule must not show the previous colour in its gaps
      mark.className = "jx-mark st-" + status;
      mark.textContent = status === "computed" ? "=" : "";
      const text = textOf(beat);
      label.textContent = text;
      let o = 1;
      if (prev && textOf(prev) !== text) o = 1 - Math.pow(1 - unit(t, beat.start, TEXT_IN), 3);
      if (next && textOf(next) !== text) o *= 1 - Math.pow(unit(t, next.start - TEXT_OUT, TEXT_OUT), 3);
      line.style.opacity = String(o);
    }

    return { el: el, setTime: setTime };
  }

  root.mountStripJX = mountStripJX;
  root.JX_STATUS_LABEL = LABEL;
})(typeof globalThis !== "undefined" ? globalThis : this);
