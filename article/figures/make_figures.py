#!/usr/bin/env python3
"""Article figures. Deterministic. Standard library only.

Object colours: velocity and the core, viscous smoothing, force and residual,
quadratic stress, energy. Status colours appear only on status words and frames.
"""
import base64
import json
import math
import re
from fractions import Fraction
from pathlib import Path

C = dict(
    paper="#F7F4EC", raised="#FBF8F1", ink="#1C1B19", muted="#5E5B55", rule="#D8D2C4",
    proved="#2F6B4F", claimed="#B7791F", heuristic="#8A8780",
    velocity="#4F5D8A", viscous="#2E7D86", force="#A34F3A", stress="#7A4A6E", energy="#8E8458",
)
SANS = "'Source Sans 3', sans-serif"
MATH = "KaTeX_Math, serif"
CAL = "KaTeX_Caligraphic, serif"
OUT = Path(__file__).resolve().parent
MIN = "−"  # U+2212
ALLOWED = set(C.values())


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def svg(w, h, body, title, desc):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">\n'
            f"<title>{esc(title)}</title>\n<desc>{esc(desc)}</desc>\n"
            f'<rect width="{w}" height="{h}" fill="{C["paper"]}"/>\n{body}\n</svg>\n')


def text(x, y, content, size=22, fill=None, anchor="start", weight=400, deco=None):
    d = f' text-decoration="{deco}"' if deco else ""
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{SANS}" font-size="{size}" '
            f'font-weight="{weight}" fill="{fill or C["ink"]}" text-anchor="{anchor}"{d}>{content}</text>')


def block(x, y, rows, size=22, anchor="start", fill=None, weight=400, leading=None):
    lead = (size + 16) if leading is None else leading
    parts = []
    for i, row in enumerate(rows):
        dy = 0 if i == 0 else lead
        parts.append(f'<tspan x="{x:.1f}" dy="{dy:.1f}">{row}</tspan>')
    return text(x, y, "".join(parts), size, fill, anchor, weight)


def mi(s):
    return f'<tspan font-family="{MATH}" font-style="italic">{esc(s)}</tspan>'


def mn(s):
    return f'<tspan font-family="{MATH}" font-style="normal">{esc(s)}</tspan>'


def mc(s):
    return f'<tspan font-family="{CAL}">{esc(s)}</tspan>'


def sup(inner):
    return f'<tspan font-size="65%" baseline-shift="super">{inner}</tspan>'


def sub(inner):
    return f'<tspan font-size="65%" baseline-shift="sub">{inner}</tspan>'


def subsc(letter, sign):
    """Plus or minus drawn as a subscript, on the letter.

    A full-size operator shifted with baseline-shift sits in the gap after the
    letter. This uses a smaller glyph and a dy the renderer honours.
    """
    glyph = "+" if sign == "+" else MIN
    return (
        mi(letter)
        + f'<tspan font-family="{MATH}" font-style="normal" font-size="65%" dy="7">{glyph}</tspan>'
        + '<tspan dy="-7">\u200b</tspan>'
    )


def st_word(kind):
    col = C["proved"] if kind == "computed" else C[kind]
    return f'<tspan fill="{col}" font-weight="600">{esc(kind)}</tspan>'


def line(x1, y1, x2, y2, col, w=2.2):
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{col}" '
            f'stroke-width="{w}" stroke-linecap="round"/>')


def arrow(x1, y1, x2, y2, col, w=2.4, head=11):
    a = math.atan2(y2 - y1, x2 - x1)
    bx, by = x2 - head * math.cos(a), y2 - head * math.sin(a)
    left = (bx + 5.5 * math.sin(a), by - 5.5 * math.cos(a))
    right = (bx - 5.5 * math.sin(a), by + 5.5 * math.cos(a))
    return (line(x1, y1, bx, by, col, w)
            + f'<path d="M{left[0]:.1f},{left[1]:.1f} L{x2:.1f},{y2:.1f} L{right[0]:.1f},{right[1]:.1f} Z" fill="{col}"/>')


def rect(x, y, w, h, stroke, sw=2.2, fill=None, dash=None, rx=6):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    fl = "none" if fill == "none" else (fill or C["raised"])
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" '
            f'fill="{fl}" stroke="{stroke}" stroke-width="{sw}"{da}/>')


def disk(cx, cy, r, fill, stroke=None, sw=2):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}"{st}/>'


def ring(cx, cy, r, stroke, sw=2.4, dash=None):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" stroke="{stroke}" '
            f'stroke-width="{sw}"{da}/>')


def double_frame(x, y, w, h, col):
    return rect(x, y, w, h, col, 2.0, C["paper"], rx=5) + rect(x + 5, y + 5, w - 10, h - 10, col, 1.6, "none", rx=3)


def path(d, stroke, sw=2.2, fill="none", dash=None, opacity=None):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    op = f' fill-opacity="{opacity}"' if opacity is not None else ""
    return (f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" '
            f'stroke-linejoin="round" stroke-linecap="round"{da}{op}/>')


def visible(src):
    text = re.sub(r"</tspan>", " ", src)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&gt;", ">").replace("&lt;", "<").replace("&amp;", "&")
    return re.sub(r"\s+", " ", text)


def require(name, src, phrases):
    plain = visible(src)
    missing = [p for p in phrases if p not in plain]
    if missing:
        raise SystemExit(f"{name} missing: {missing}")
    found = set(re.findall(r"#[0-9A-Fa-f]{6}", src))
    bad = found - ALLOWED
    if bad:
        raise SystemExit(f"{name} colours {sorted(bad)}")


def pow_join(parts):
    return sup("".join(parts))


def half():
    return mi("1") + mn("/") + mi("2")


def tau(exponent):
    return mi("τ") + exponent


# ---------- checks against the article ----------

def check_math():
    # (12)–(13): slope of log10 against s = −log10(τ) is minus the exponent of τ.
    # speed τ^(−1/2−h) -> 1/2+h; radius τ^(1/2) -> −1/2;
    # axial τ^(1/2−h) -> −1/2+h; core energy τ^(1/2−3h) -> −1/2+3h.
    def slope(const, h_coeff):
        return -const, -h_coeff
    assert slope(Fraction(-1, 2), -1) == (Fraction(1, 2), 1)
    assert slope(Fraction(1, 2), 0) == (Fraction(-1, 2), 0)
    assert slope(Fraction(1, 2), -1) == (Fraction(-1, 2), 1)
    assert slope(Fraction(1, 2), -3) == (Fraction(-1, 2), 3)
    # ∫ τ^(−1/2−3h) dτ near 0 converges when −1/2−3h > −1, i.e. h < 1/6.
    assert Fraction(1, 2) / 3 == Fraction(1, 6)
    # (21): s = c+ + c−, d = c+ − c−.
    def weights(s, d):
        return Fraction(s + d, 2), Fraction(s - d, 2)
    assert weights(2, 1) == (Fraction(3, 2), Fraction(1, 2))
    outside = weights(1, 2)
    assert outside[1] < 0 and abs(2) > 1
    # (23)
    for j, val in enumerate((Fraction(1, 5), Fraction(3, 10), Fraction(2, 5),
                             Fraction(1, 2), Fraction(3, 5), Fraction(7, 10))):
        assert Fraction(1, 5) + Fraction(j, 10) == val
    # Drawing scales, h = 1/5. R/L ∼ τ^h.
    h = 0.2
    ratio = None
    cores = []
    for tau_v in (1.0, 0.35, 0.12):
        R = 0.55 * tau_v ** 0.5
        L = 1.6 * tau_v ** (0.5 - h)
        cores.append((tau_v, R, L))
        got = (R / L) / (tau_v ** h)
        ratio = got if ratio is None else ratio
        if abs(got - 0.55 / 1.6) > 1e-12:
            raise SystemExit(f"R/L ratio {got}")
    anchors = json.loads((OUT / "3d" / "fig2-core-anchors.json").read_text())
    if len(anchors["cores"]) != len(cores):
        raise SystemExit("fig2 snapshot count")
    for (tau_v, R, L), got in zip(cores, anchors["cores"]):
        if abs(got["R"] - R) > 1e-9 or abs(got["L"] - L) > 1e-9 or got["tau"] != tau_v:
            raise SystemExit(f"core mismatch {got} vs {(tau_v, R, L)}")
    if anchors["hDraw"] != h or anchors["seed"] != 503:
        raise SystemExit("fig2 particle model metadata")
    return cores


def embed(name, x, y, w, h):
    data = base64.b64encode((OUT / "3d" / f"{name}.png").read_bytes()).decode()
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/png;base64,{data}"/>'


# ---------- figure 1 ----------

def fig1():
    W, H = 1400, 1070
    body, form = 32, 36
    b = [block(W/2, 65, ["every viscosity " + mi("ν") + "&gt;0"], form, "middle", weight=600)]
    for x, name in [(356, "whole space"), (1044, "unit torus")]:
        b.append(block(x, 140, [name], body, "middle", weight=600))
    b.append(block(60, 210, ["global smooth existence"], body, weight=600))
    for x, letter in [(36, "A"), (724, "B")]:
        b.append(rect(x, 238, 640, 214, C["rule"], 1.6))
        b.append(block(x+24, 288, [letter], form, weight=600))
        b.append(block(x+24, 348, ["every admissible initial velocity;", "force = 0"], body, leading=44))
    b.append(block(60, 494, ["admissible breakdown"], body, weight=600))
    b.append(block(W/2, 532, [st_word("claimed") + " · announced 2026 construction"], body, "middle"))
    # One shared claimed frame covers both forced-breakdown alternatives.
    b.append(rect(36, 552, 1328, 346, C["claimed"], 2.2))
    b.append(line(700, 552, 700, 898, C["claimed"], 2.2))
    for x, letter, rows in [
        (36, "C", ["uniformly finite whole-space energy"]),
        (724, "D", ["periodic velocity and pressure"]),
    ]:
        b.append(block(x+24, 602, [letter], form, weight=600))
        b.append(block(x+24, 664, ["choose initial velocity and smooth force;", "exclude every global admissible pair"], body, leading=46))
        b.append(line(x+24, 770, x+616, 770, C["rule"], 1.6))
        b.append(block(x+24, 834, rows, body))
    b.append(block(W/2, 970, ["The official formulation asks for any one alternative."], body, "middle"))
    b.append(block(W/2, 1030, ["A/B remain open in the sources reviewed"], body, "middle", fill=C["muted"]))
    src = "\n".join(b)
    require("fig1", src, ["every viscosity", "ν", ">0", "whole space", "unit torus", "global smooth existence", "admissible breakdown",
        "every admissible initial velocity;", "force = 0", "choose initial velocity and smooth force;", "exclude every global admissible pair",
        "uniformly finite whole-space energy", "periodic velocity and pressure", "The official formulation asks for any one alternative.",
        "announced 2026 construction", "claimed", "A/B remain open in the sources reviewed"])
    return svg(W, H, src, "The four alternatives", "The film's balanced A–D matrix: whole space and unit torus in columns, "
        "global smooth existence and admissible breakdown in rows. No implication runs between the rows.")


# ---------- figure 2 ----------

def slope_speed():
    return half() + mn("+") + mi("h")


def slope_radius():
    return mn(MIN) + half()


def slope_axial():
    return mn(MIN) + half() + mn("+") + mi("h")


def slope_energy():
    return mn(MIN) + half() + mn("+") + mi("3") + mi("h")


def exp_speed():
    return pow_join([mn(MIN), half(), mn(MIN), mi("h")])


def exp_radius():
    return pow_join([half()])


def exp_axial():
    return pow_join([half(), mn(MIN), mi("h")])


def exp_energy():
    return pow_join([half(), mn(MIN), mi("3"), mi("h")])


def exp_diss():
    return pow_join([mn(MIN), half(), mn(MIN), mi("3"), mi("h")])


def fig2():
    W, H = 1400, 1230
    body, form = 32, 36
    b = [embed("fig2-core", 36, 148, 620, 650)]
    b.append(block(60, 65, ["core regions at three times"], body, weight=600))
    b.append(block(60, 130, [mi("R") + mn("/") + mi("L") + " " + mn("∼") + " " + mi("τ") + sup(mi("h"))], form))
    for x, y, val in [(130, 560, "1"), (345, 640, "0.35"), (535, 710, "0.12")]:
        b.append(block(x, y, [mi("τ") + " = " + val], body, "middle"))
    a = json.loads((OUT / "3d" / "fig2-core-anchors.json").read_text())["outflowArrow"]
    p, q = a["from"], a["to"]
    # Extend the radial arrow's tail onto the visible trails. Its single leader
    # meets the shaft rather than running parallel to it as a second arrow.
    b.append(arrow(36+p["x"]-.65*(q["x"]-p["x"]), 148+p["y"]-.65*(q["y"]-p["y"]),
                   36+q["x"], 148+q["y"], C["velocity"], 2.4, 10))
    b.append(block(322, 266, ["radial outflow", "elsewhere"], body, fill=C["muted"], leading=38))
    b.append(line(316, 310, 36+(p["x"]+q["x"])/2, 148+(p["y"]+q["y"])/2, C["muted"], 1.6))
    # Same symbolic table as the article; type now meets the caption size.
    tx, tw = 700, 662
    b.append(line(tx, 38, tx, 70, C["proved"], 5))
    b.append(block(tx + 18, 65, [st_word("computed") + ": exponents"], body))
    b.append(block(tx, 190, ["Scale"], body, weight=600))
    b.append(block(922, 150, ["Value before", "taking the", "logarithm"], body, weight=600, leading=38))
    b.append(block(1150, 190, ["Slope against " + mi("s")], body, weight=600))
    rows = [
        (["Speed"], tau(exp_speed()), slope_speed()),
        (["Radius"], tau(exp_radius()), slope_radius()),
        (["Axial length"], tau(exp_axial()), slope_axial()),
        (["Core energy", "scale"], tau(exp_energy()), slope_energy()),
    ]
    for y, (label, val, slope) in zip([300, 412, 524, 636], rows):
        b.append(line(tx, y - 62, tx + tw, y - 62, C["rule"], 1.6))
        b.append(block(tx, y, label, body, leading=38))
        b.append(block(922, y, [val], form))
        b.append(block(1150, y, [slope], form))
    b.append(line(tx, 702, tx + tw, 702, C["rule"], 1.6))
    b.append(block(tx, 760, [mi("s") + " = " + mn(MIN) + "log" + sub(mn("10")) + " " + mi("τ")], form))
    b.append(block(tx, 822, ["all proportionality constants", "normalized to one"], body, leading=40))
    b.append(block(tx, 928, ["scale laws, not sampled values", "of the constructed solution"], body, leading=40))
    b.append(block(tx, 1038, [tau(exp_diss()), "time integrable for " + mi("h") + " &lt; 1/6"], body, leading=44))
    b.append(rect(36, 768, 620, 324, C["rule"], 1.6))
    b.append(path("M38 778 V1082", C["heuristic"], 5, dash="8 6"))
    b.append(block(60, 812, [st_word("heuristic")], body))
    b.append(block(60, 864, ["not a material volume", "schematic; anisotropy exaggerated;", "drawn with " + mi("h") + " = 0.2,", "the source needs " + mi("h") + " far smaller"], body, leading=48))
    b.append(line(tx, 1130, tx, 1200, C["claimed"], 5))
    b.append(block(tx + 18, 1156, [st_word("claimed") + ": the scale laws are", "the manuscript's (§§2–3)"], body, leading=40))
    src = "\n".join(b)
    require("fig2", src, ["core regions at three times", "not a material volume", "radial outflow", "elsewhere",
        "Scale", "Value before", "taking the", "logarithm", "Slope against", "Speed", "Radius", "Axial length", "Core energy",
        "all proportionality constants", "normalized to one", "scale laws, not sampled values", "of the constructed solution",
        "time integrable for", "1/6", "computed", "exponents", "heuristic", "claimed", "the manuscript's (§§2–3)",
        "schematic; anisotropy exaggerated;", "drawn with", "0.2", "far smaller"])
    return svg(W, H, src, "Concentration with bounded energy",
        "Three schematic core snapshots rendered from the film's seeded particle model, with no hard core outline. "
        "Beside them are the unchanged leading scale laws and their logarithmic slopes. The exponents are computed; the scales claimed.")


# ---------- figure 3 ----------

def fig3():
    W, H = 1400, 1310
    body, form = 32, 36
    ix, iy = 36, 90
    b = [embed("fig3-annulus", ix, iy, 620, 680)]
    a = json.loads((OUT / "3d" / "fig3-annulus-anchors.json").read_text())
    # All labels are transparent and use short leaders beside the actual targets.
    core = a["core"]
    b.append(block(core["x"] + ix + 30, core["y"] + iy - 25, ["core"], body))
    b.append(line(core["x"] + ix + 8, core["y"] + iy - 7, core["x"] + ix + 25, core["y"] + iy - 22, C["muted"], 1.6))
    b.append(block(60, 146, ["leading momentum", "deficit"], body, weight=600, leading=38))
    b.append(block(60, 222, ["pulse stress"], body))
    upper = a["pulses"][7]
    ux = ix + (upper["from"]["x"] + upper["to"]["x"]) / 2
    uy = iy + (upper["from"]["y"] + upper["to"]["y"]) / 2
    b.append(line(218, 234, ux, uy, C["muted"], 1.6))
    ann = a["annulus"]
    b.append(block(495, 478, ["annulus"], body))
    b.append(line(492, 489, ix+ann["x"]+3, iy+ann["y"]-8, C["muted"], 1.6))
    # No exterior region is drawn; label the visible alternating pulse pair.
    b.append(block(360, 676, ["alternating sign"], body, fill=C["muted"]))
    lower = a["pulses"][1]["to"]
    b.append(line(454, 644, ix+lower["x"], iy+lower["y"]+5, C["muted"], 1.6))
    for pulse in a["pulses"]:
        p, q = pulse["from"], pulse["to"]
        b.append(arrow(ix + p["x"], iy + p["y"], ix + q["x"], iy + q["y"], C["stress"], 2.4, 9))
    # One local averaging connector replaces four page-crossing leaders.
    b.append(arrow(516, 550, 620, 550, C["stress"], 3.2, 12))
    b.append(block(512, 596, ["averaged flux"], body))
    # Exact two-direction toy cone, matching the film's open wedge.
    ox, oy, sc = 850, 500, 115
    def xy(s, d):
        return ox + sc * s, oy - sc * d
    top, bot = xy(3.4, 3.4), xy(3.4, -2.4)
    b.append(block(1030, 65, ["toy matrix cone"], body, "middle", weight=600))
    b.append(path(f"M{ox},{oy} L{top[0]},{top[1]} L{top[0]},{oy+391} Z", C["stress"], 0, C["stress"], opacity=0.12))
    b.append(arrow(ox, oy, 1320, oy, C["ink"], 1.8, 11))
    b.append(arrow(ox, 800, ox, 310, C["ink"], 1.8, 11))
    for d in [3, -3]:
        q = xy(3, d)
        b.append(line(ox, oy, q[0], q[1], C["stress"], 2.6))
    b.append(block(1335, oy+10, [mi("s")], form))
    b.append(block(820, 324, [mi("d")], form, "end"))
    b.append(block(1110, 545, [mi("s") + " " + mn("≥") + " 0"], body))
    b.append(block(1070, 130, [mi("d") + " = " + mi("s")], body))
    b.append(block(970, 183, [subsc("b", "+") + " = (1, 1)"], body))
    b.append(block(1070, 858, [mi("d") + " = " + mn(MIN) + mi("s")], body))
    b.append(block(1034, 904, [subsc("b", "−") + " = (1, " + MIN + "1)"], body))
    pin, pout = xy(2, 1), xy(1, 2)
    b.append(disk(*pin, 8, C["stress"]))
    b.append(disk(*pout, 8, C["paper"], C["stress"], 2.4))
    b.append(block(1110, 336, [subsc("c", "+") + " = 3/2", subsc("c", "−") + " = 1/2"], body, leading=40))
    b.append(line(1101, 369, pin[0]+10, pin[1]-8, C["stress"], 1.6))
    b.append(block(702, 132, ["cannot be formed", "with nonnegative", "weights of these", "two directions"], body, leading=38))
    b.append(line(894, 246, pout[0]-10, pout[1]-4, C["muted"], 1.6))
    # Identities stay together, large enough to read at the article's print size.
    ab = mi("a") + " " + mi("b") + " cos " + mi("φ")
    b.append(block(60, 805, [mn("⟨") + ab + mn("⟩") + " = 0"], form))
    b.append(block(60, 866, [mn("⟨(") + ab + mn(")⊗(") + ab + mn(")⟩")], body))
    b.append(block(60, 914, ["= " + mn("(") + mi("a") + sup(mi("2")) + mn("/2) ") + mi("b") + mn("⊗") + mi("b")], form))
    for y, kind, rows in [
        (980, "proved", ["averaging identities (20) and the toy cone (21)"]),
        (1080, "claimed", ["the annular mechanism (manuscript §3.2, Theorem 4.6)"]),
        (1180, "heuristic", ["the actual stress directions depend on the background profile"]),
    ]:
        b.append(rect(36, y, 1326, 90, C["rule"], 1.6))
        b.append(path(f"M38 {y+10} V{y+80}", C[kind], 5, dash="8 6" if kind == "heuristic" else None))
        b.append(block(60, y+53, [st_word(kind)], body))
        b.append(block(280, y+53, rows, body))
    src = "\n".join(b)
    require("fig3", src, ["core", "leading momentum deficit", "pulse stress", "alternating sign", "averaged flux",
        "toy matrix cone", "the actual stress directions depend on the background profile", "cannot be formed", "with nonnegative",
        "weights of these", "two directions", "claimed", "proved", "heuristic", "averaging identities (20) and the toy cone (21)",
        "the annular mechanism (manuscript §3.2, Theorem 4.6)"])
    return svg(W, H, src, "Annular repair and positive covariance",
        "The film's particle core and annulus, with alternating pulse arrows and one averaged quadratic flux. "
        "The two averaging identities and the exact two-direction toy matrix cone retain their separate statuses.")


# ---------- figure 4 ----------

def fig4():
    # Article adaptation of the film's ordered loop, ladder and ledger card.
    # At 156 mm print width, 32 px text is 10.1 pt (the caption is 10 pt).
    W, H = 1400, 1460
    body, formula = 32, 36  # film label and subtitle sizes
    b = []

    def idx(s):
        # Explicit dy works in both Chromium screenshots and printed SVG.
        return (f'<tspan font-size="65%" dy="8">{mi(s)}</tspan>'
                '<tspan dy="-8">\u200b</tspan>')

    def words(x, y, rows, **kw):
        return block(x, y, rows, body, leading=40, **kw)

    # One claimed ledger covers the analytic construction, above the proved inset.
    b.append(line(36, 38, 36, 70, C["claimed"], 5))
    b.append(words(54, 65, [st_word("claimed")]))

    stages = [
        ["supported nonzero", "angular modes"],
        ["averaged", "tangential stress"],
        ["residual with zero", "auxiliary mean"],
        ["five-equation", "moment correction"],
    ]
    for i, rows in enumerate(stages):
        x = 36 + i * 342
        b.append(rect(x, 92, 300, 168, C["rule"], 1.6, rx=6))
        b.append(words(x + 24, 135, [str(i + 1)], fill=C["muted"]))
        b.append(words(x + 24, 186, rows, weight=600))
        if i < 3:
            b.append(arrow(x + 309, 176, x + 333, 176, C["ink"], 2.4, 9))
    # A continuous return track makes the ordered sequence a cycle.
    b.append(path("M1212 260 V302 H186 V282", C["muted"], 2.4))
    b.append(arrow(186, 283, 186, 263, C["muted"], 2.4, 9))
    # One shared pressure note; the moment conditions stay beside the last stage.
    b.append(words(60, 364, ["after each step:"], weight=600))
    b.append(words(60, 410, [
        "reconstruct pressure from",
        "updated radial equation;",
        "update full residual, including",
        "axial pressure contribution.",
    ]))
    b.append(rect(740, 338, 622, 230, C["rule"], 1.6))
    b.append(line(1212, 260, 1212, 338, C["muted"], 2.4))
    b.append(words(770, 378, [
        "preserve two integral constraints;",
        "cancel the linear contributions",
        "to three defects (" + mi("P") + ", " + mi("J") + idx("θ") + ", " + mi("J") + idx("z") + ").",
        "Nonlinear remainders persist",
        "with improved decay.",
    ]))

    # The entire residual expansion is retained, including its quadratic term.
    b.append(line(36, 584, 1362, 584, C["rule"], 1.6))
    b.append(words(60, 634, ["expansion (16)"], fill=C["muted"]))
    linear = (mc("R") + "(" + mi("u") + "+" + mi("w") + ", " + mi("p") + "+" + mi("π") + ") = "
              + mc("R") + "(" + mi("u") + ", " + mi("p") + ") + " + mn("∂") + idx("t") + mi("w")
              + " " + mn(MIN) + " " + mi("ν") + mn("Δ") + mi("w") + " + " + mn("∇") + mi("π"))
    cross = ("+ (" + mi("u") + mn("·∇") + ")" + mi("w")
             + " + (" + mi("w") + mn("·∇") + ")" + mi("u")
             + " + (" + mi("w") + mn("·∇") + ")" + mi("w"))
    b.append(block(340, 634, [linear, cross], body, leading=44))
    b.append(line(36, 722, 1362, 722, C["rule"], 1.6))

    # Equal rung spacing is the exact linear sigma_j sequence; losses are markers.
    b.append(block(60, 789, [mi("σ") + idx("j") + " = 1/5 + " + mi("j") + "/10"], formula))
    left, right = 150, 240
    for x in [left, right]:
        b.append(line(x, 844, x, 1148, C["muted"], 2.4))
    b.append(words((left + right) / 2, 835, ["…"], anchor="middle", fill=C["muted"]))
    for j in range(6):
        y = 1130 - j * 48
        b.append(line(left - 18, y, right + 18, y, C["muted"], 2.4))
        b.append(words(right + 32, y + 10, [f"{(j + 2) / 10:.1f}"]))
    for y in [1010, 864]:
        b.append(arrow(326, y, 248, y, C["muted"], 1.6, 9))
    b.append(words(352, 1004, ["fixed loss:", "one derivative order"]))
    b.append(words(352, 858, ["higher fixed loss:", "higher derivative order"]))
    # One arrow connects unbounded improvement with the separate realization.
    b.append(arrow(658, 954, 744, 954, C["ink"], 2.4, 11))

    # One connected realization panel replaces the unrelated cutoff boxes.
    b.append(rect(766, 782, 596, 350, C["rule"], 1.6, rx=6))
    b.append(words(794, 830, [
        "shrinking cutoff realization",
        "on potentials and pressure",
    ], weight=600))
    b.append(arrow(1064, 898, 1064, 944, C["ink"], 2.4, 11))
    b.append(words(794, 990, [
        "smooth field for " + mi("q") + "&gt;0;",
        "residual derivatives vanish to",
        "arbitrary order on the stated",
        "sectors",
    ]))

    # A two-row identity ledger. No formula is struck through: the nonzero
    # divergence, rather than the multiplication map, carries the obstruction.
    b.append(rect(36, 1190, 1326, 234, C["rule"], 1.6, C["raised"], rx=6))
    b.append(line(38, 1200, 38, 1414, C["proved"], 5))
    b.append(words(60, 1234, [st_word("proved")]))
    b.append(words(60, 1298, [mi("u") + " " + mn("↦") + " " + mi("cu")]))
    b.append(words(430, 1298, [
        mn("∇·") + "(" + mi("cu") + ") = " + mn("∇") + mi("c") + mn("·") + mi("u"),
    ]))
    b.append(words(1110, 1298, ["nonzero"]))
    b.append(line(60, 1328, 1338, 1328, C["rule"], 1.6))
    b.append(words(60, 1388, [mi("B") + " " + mn("↦") + " curl(" + mi("cB") + ")"]))
    ident = (mn("∇×") + "(" + mi("cB") + ") = " + mi("c") + " " + mn("∇×") + mi("B")
             + " + " + mn("∇") + mi("c") + " " + mn("×") + mi("B"))
    b.append(words(430, 1388, [ident]))
    b.append(words(1110, 1388, ["divergence zero"]))

    src = "\n".join(b)
    require("fig4", src, [
        "supported nonzero", "angular modes", "averaged", "tangential stress",
        "residual with zero", "auxiliary mean", "five-equation", "moment correction",
        "preserve two integral constraints;", "cancel the linear contributions",
        "three defects", "Nonlinear remainders persist", "with improved decay.",
        "after each step:", "reconstruct pressure from", "updated radial equation;",
        "update full residual, including", "axial pressure contribution.",
        "expansion (16)", "1/5", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "…",
        "fixed loss:", "one derivative order", "higher fixed loss:", "higher derivative order",
        "shrinking cutoff realization", "on potentials and pressure",
        "smooth field for", "residual derivatives vanish to",
        "arbitrary order on the stated", "sectors",
        "divergence zero", "nonzero", "claimed", "proved", "curl(",
    ])
    if "proof complete" in visible(src).lower():
        raise SystemExit("fig4 must not say proof complete")
    return svg(W, H, src, "Residual improvement is an entire cycle",
               "Four ordered corrections with a return track. The shared note applies after "
               "each correction: reconstruct pressure and update the full residual, including "
               "its axial pressure contribution. Orders continue without a last rung; "
               "a separate shrinking cutoff realizes a smooth field. The two-row proved inset "
               "compares velocity multiplication with localization of a vector potential.")


# ---------- figure 5 ----------

def smooth_bump(n=200):
    peak = math.exp(-4.0)
    out = []
    for i in range(n + 1):
        u = i / n
        if u <= 0.0 or u >= 1.0:
            z = 0.0
        else:
            z = math.exp(-1.0 / (u * (1.0 - u))) / peak
        out.append(z)
    return out


def fig5():
    W, H = 1400, 1550
    body, form = 32, 36
    b = [line(36, 38, 36, 70, C["claimed"], 5)]
    scope = st_word("claimed") + " (manuscript §§10.1–10.3)"
    b.append(block(54, 65, [scope], body))
    b.append(block(700, 65, ["schematic norm envelope,", "not the actual force profile"], body, fill=C["muted"], leading=40))
    # Aligned tracks share one time axis. Every track stays zero through a.
    x0, xa, x1, xb = 320, 595, 1000, 1260
    axis_y = 555
    def X(t): return x0 + (x1-x0)*t
    a_time=(xa-x0)/(x1-x0)
    b.append(arrow(300, axis_y, 1330, axis_y, C["ink"], 2.2, 11))
    for label, x in [("0", x0), ("a", xa), ("1", x1), ("b", xb)]:
        b.append(line(x, axis_y-8, x, axis_y+8, C["ink"], 2.2))
        b.append(block(x, axis_y+44, [mi(label) if label in ["a", "b"] else label], body, "middle"))
    b.append(block(x1, 641, ["blowup"], body, "middle"))
    b.append(path(f"M{x1} 144 V535", C["muted"], 1.6, dash="7 7"))
    base_f, base_v, base_e = 225, 380, 510
    for y in [base_f, base_v, base_e]: b.append(line(x0, y, 1300, y, C["rule"], 1.6))
    b.append(block(60, base_f+10, ["smooth force"], body))
    b.append(block(60, base_v+10, ["singular velocity"], body))
    b.append(block(60, base_e+10, ["energy"], body))
    pts = [(xa+(xb-xa)*i/200, base_f-70*z) for i,z in enumerate(smooth_bump())]
    d = "M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in pts)+f" L{xb},{base_f} L{xa},{base_f} Z"
    b.append(path(d, C["force"], 2.6, C["force"], opacity=0.18))
    def vel(t): return 0 if t<=a_time else ((1-a_time)/(1-t))**0.7-1
    t_hit=.99
    k=112/vel(t_hit)
    pts=[(X(t_hit*i/240),base_v-k*vel(t_hit*i/240)) for i in range(241)]
    b.append(path("M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in pts), C["velocity"], 3.2))
    b.append(arrow(*pts[-2], pts[-1][0], pts[-1][1]-8, C["velocity"], 3.2, 11))
    def en(t):
        v=max(0,(t-a_time)/(1-a_time))
        return (1-math.exp(-5*v))/(1-math.exp(-5))
    pts=[(X(i/240),base_e-60*en(i/240)) for i in range(241)]
    b.append(path("M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in pts), C["energy"], 2.6))
    b.append(path(f"M{x0} 438 H{x1}", C["energy"], 2.2, dash="7 5"))
    b.append(block(1040, 462, ["bounded"], body))
    # Two local comparison steps, then one full-width compactness ledger.
    b.append(rect(36, 695, 620, 178, C["rule"], 1.6))
    b.append(block(60, 743, ["hypothetical smooth global competitor", "same force, zero datum", "compared on intervals ending before 1"], body, leading=44))
    b.append(arrow(668, 784, 714, 784, C["ink"], 2.4, 11))
    b.append(rect(726, 695, 636, 178, C["rule"], 1.6))
    b.append(block(750, 738, [st_word("claimed")], body))
    b.append(block(750, 789, ["pressure recovery +", "expanding-ball flux bounds"], body, leading=44))
    b.append(arrow(1044, 880, 1044, 917, C["ink"], 2.4, 11))
    b.append(rect(36, 926, 1326, 198, C["rule"], 1.6))
    b.append(line(38, 936, 38, 1114, C["proved"], 5))
    b.append(block(60, 973, [st_word("proved")], body))
    b.append(block(270, 973, ["compactness contradiction on " + mi("K") + mn("×") + "[0,1]"], form))
    b.append(block(270, 1034, ["continuous global competitor bounded on " + mi("K") + mn("×") + "[0,1]",
        "equal pre-singular branch has unbounded speed in " + mi("K")], body, leading=44))
    # Orthogonal, short branches to C and the periodization route to D.
    b.append(arrow(355, 1132, 355, 1176, C["ink"], 2.4, 11))
    b.append(arrow(668, 1315, 714, 1315, C["ink"], 2.4, 11))
    b.append(rect(36, 1185, 620, 260, C["rule"], 1.6))
    b.append(block(60, 1235, ["C"], form, weight=600))
    b.append(block(145, 1235, ["whole space"], body))
    # The compactly supported whole-space construction, schematic.
    b.append(disk(341, 1337, 32, C["velocity"]))
    b.append(rect(726, 1185, 636, 260, C["rule"], 1.6))
    b.append(block(750, 1235, ["D"], form, weight=600))
    b.append(block(840, 1235, [st_word("claimed") + " (Corollary 10.6)"], body))
    # Nine separated compact supports; opposite-face marks stay local.
    gx, gy, cell=750,1260,51
    for j in range(4):
        b.append(line(gx, gy+j*cell, gx+3*cell, gy+j*cell, C["rule"], 1.6))
        b.append(line(gx+j*cell, gy, gx+j*cell, gy+3*cell, C["rule"], 1.6))
    for i in range(3):
        for j in range(3): b.append(disk(gx+(i+.5)*cell,gy+(j+.5)*cell,9,C["velocity"]))
    for y in [gy, gy+3*cell]:
        b.append(line(gx+69,y-5,gx+69,y+5,C["ink"],1.6))
        b.append(line(gx+84,y-5,gx+84,y+5,C["ink"],1.6))
    for x in [gx, gx+3*cell]: b.append(line(x-5,gy+76,x+5,gy+76,C["ink"],1.6))
    b.append(block(940, 1289, ["shrink and shift", "opposite faces identified", "velocity, pressure and", "force periodic"], body, leading=40))
    b.append(block(726, 1488, ["finite cell energy; no whole-space " + mi("L") + sup("2") + " claim", "for the periodic lift"], body, leading=38))
    b.append(block(60, 1488, ["A, B (no force):", "outside these arrows"], body, fill=C["muted"], leading=38))
    src = "\n".join(b)
    require("fig5", src, ["smooth force", "singular velocity", "energy", "blowup", "bounded", "schematic norm envelope,", "not the actual force profile",
        "hypothetical smooth global competitor", "same force, zero datum", "compared on intervals ending before 1", "pressure recovery +", "expanding-ball flux bounds",
        "compactness contradiction on", "continuous global competitor bounded on", "equal pre-singular branch has unbounded speed in", "opposite faces identified",
        "velocity, pressure and", "force periodic", "finite cell energy; no whole-space", "claim", "for the periodic lift", "shrink and shift", "claimed", "proved",
        "manuscript §§10.1–10.3", "Corollary 10.6", "A, B (no force):", "outside these arrows"])
    return svg(W, H, src, "Smooth forcing, singular velocity, and two domains",
        "Aligned schematic force, speed and energy tracks. Local comparison gives a compactness contradiction and C. "
        "The compact support is rescaled and periodically repeated for D. A and B remain outside the argument arrows.")


def main():
    cores = check_math()
    print("math ok", " ".join(f"tau={t:.2f} R={R:.4f} L={L:.4f}" for t, R, L in cores))
    writers = [
        ("fig1-alternatives.svg", fig1),
        ("fig2-concentration.svg", fig2),
        ("fig3-annulus-cone.svg", fig3),
        ("fig4-cycle.svg", fig4),
        ("fig5-tracks.svg", fig5),
    ]
    for name, fn in writers:
        src = fn()
        (OUT / name).write_text(src)
        print("wrote", name, src.count("<text"), "text elements")


if __name__ == "__main__":
    main()
