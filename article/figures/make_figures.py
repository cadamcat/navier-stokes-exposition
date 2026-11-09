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
        + f'<tspan font-family="{MATH}" font-style="normal" font-size="14" dy="7">{glyph}</tspan>'
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
    for (tau_v, R, L), got in zip(cores, anchors["cores"]):
        if abs(got["R"] - R) > 1e-9 or abs(got["L"] - L) > 1e-9 or got["tau"] != tau_v:
            raise SystemExit(f"core mismatch {got} vs {(tau_v, R, L)}")
    if abs(anchors["camera"]["elevation"] - 15) > 1e-9:
        raise SystemExit("camera elevation")
    by_key = {}
    for row in anchors["flow"]:
        by_key[(round(row["eta0"], 5), round(row["theta0"], 5))] = row
    for eta0 in (0.04, -0.04, 0.08, -0.08):
        for k in (0, 1, 2):
            theta0 = k * 2 * math.pi / 3
            s, rho, eta, th = integrate_flow(eta0, theta0)
            row = by_key[(round(eta0, 5), round(theta0, 5))]
            if abs(row["eta1"]) <= 1.25:
                raise SystemExit("streamline stopped at or before |η| = 1.25")
            for a, b in ((row["s1"], s), (row["rho1"], rho), (row["eta1"], eta), (row["th1"], th)):
                if abs(a - b) > 1e-8:
                    raise SystemExit(f"streamline mismatch {row} vs {(s, rho, eta, th)}")
    return cores


def integrate_flow(eta0, theta0, n=200):
    s_max = math.log(1.25 / abs(eta0))
    h = s_max / n
    s = 0.0
    th = theta0

    def d_theta(u):
        rho = 2.4 * math.exp(-u / 2)
        r2 = rho * rho
        return 2.2 * (1.0 - math.exp(-r2)) / r2

    last = None
    for _ in range(n + 3):
        rho = 2.4 * math.exp(-s / 2)
        eta = eta0 * math.exp(s)
        last = (s, rho, eta, th)
        if abs(eta) > 1.25:
            return last
        k1 = d_theta(s)
        k2 = d_theta(s + h / 2)
        k3 = d_theta(s + h / 2)
        k4 = d_theta(s + h)
        th += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6.0
        s += h
    raise SystemExit("streamline did not reach |η| > 1.25")


def embed(name, x, y, w, h):
    data = base64.b64encode((OUT / "3d" / f"{name}.png").read_bytes()).decode()
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/png;base64,{data}"/>'


# ---------- figure 1 ----------

def fig1():
    W, H = 1500, 1000
    b = []
    b.append(block(750, 50, ["every viscosity " + mi("ν") + "&gt;0"], 24, "middle", weight=600))
    x1, x2, cw, ch = 270, 860, 570, 236
    c1, c2 = x1 + cw / 2, x2 + cw / 2
    b.append(block(c1, 108, ["whole space"], 22, "middle", weight=600))
    b.append(block(c2, 108, ["unit torus"], 22, "middle", weight=600))
    b.append(block(x1, 150, ["global smooth existence"], 22, "start", weight=600))
    y1 = 176
    for x, letter, lines in (
        (x1, "A", ["every admissible initial velocity;", "force = 0"]),
        (x2, "B", ["every admissible initial velocity;", "force = 0"]),
    ):
        b.append(rect(x, y1, cw, ch, C["ink"], 2.0))
        b.append(block(x + cw / 2, y1 + 58, [letter], 28, "middle", weight=600))
        b.append(block(x + cw / 2, y1 + 118, lines, 22, "middle", leading=40))
    # C and D, with the claimed border and its label on the frame
    yb, hb = 470, 360
    xb, wb = x1 - 16, (x2 + cw) - (x1 - 16) + 16
    b.append(rect(xb, yb, wb, hb, C["claimed"], 2.2, "none", rx=8))
    badge_w = 560
    badge_x = xb + (wb - badge_w) / 2
    b.append(rect(badge_x, yb - 22, badge_w, 44, C["claimed"], 2.0, C["paper"], rx=6))
    b.append(block(badge_x + badge_w / 2, yb + 8, [st_word("claimed") + "   announced 2026 construction"],
                   22, "middle"))
    b.append(block(x1, yb + 58, ["admissible breakdown"], 22, "start", weight=600))
    y2, h2 = yb + 78, 250
    for x, letter, note in (
        (x1, "C", "uniformly finite whole-space energy"),
        (x2, "D", "periodic velocity and pressure"),
    ):
        b.append(rect(x, y2, cw, h2, C["ink"], 2.0))
        b.append(block(x + cw / 2, y2 + 48, [letter], 28, "middle", weight=600))
        b.append(block(x + cw / 2, y2 + 100, [
            "choose initial velocity and smooth force;",
            "exclude every global admissible pair",
        ], 22, "middle", leading=38))
        b.append(line(x + 36, y2 + 176, x + cw - 36, y2 + 176, C["rule"], 1.6))
        b.append(block(x + cw / 2, y2 + 214, [note], 22, "middle"))
    b.append(block(W / 2, 880, ["The official formulation asks for any one alternative."], 22, "middle"))
    nw = 640
    b.append(rect((W - nw) / 2, 910, nw, 52, C["rule"], 1.6, C["paper"]))
    b.append(block(W / 2, 944, ["A/B remain open in the sources reviewed"], 22, "middle"))
    src = "\n".join(b)
    # the block() call above passed raw by mistake if I included it — fix by not using that kw.
    require("fig1", src, [
        "every viscosity", "ν", ">0", "whole space", "unit torus",
        "global smooth existence", "admissible breakdown",
        "every admissible initial velocity;", "force = 0",
        "choose initial velocity and smooth force;",
        "exclude every global admissible pair",
        "uniformly finite whole-space energy", "periodic velocity and pressure",
        "The official formulation asks for any one alternative.",
        "announced 2026 construction", "claimed",
        "A/B remain open in the sources reviewed",
    ])
    return svg(W, H, src, "The four alternatives",
               "Whole space or the unit torus, against global smooth existence or admissible breakdown. "
               "C and D carry the announced construction. A and B remain open. "
               "No arrow runs from C or D to A or B.")


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
    W, H = 1500, 1040
    ix, iy, iw, ih = 24, 64, 730, 820
    b = [embed("fig2-core", ix, iy, iw, ih)]
    b.append(block(ix + 365, 44, ["core regions at three times"], 22, "middle", weight=600))
    b.append(block(ix + 28, iy + 118, [
        mi("R") + mn("/") + mi("L") + " " + mn("∼") + " " + mi("τ") + sup(mi("h")),
    ], 22, "start"))
    b.append(block(ix + 28, iy + 760, ["dashed: coordinate contour"], 20, "start"))
    b.append(block(ix + 28, iy + 796, ["not a material volume"], 20, "start"))
    b.append(block(ix + 500, iy + 214, ["radial outflow elsewhere"], 20, "start"))
    # table. Formula base is 32 px so the superscripts still read in a 160 mm column.
    tx, tw = 790, 680
    cols = (196, 236, 248)
    form = 32
    rows_y = [250, 346, 442, 538]
    b.append(line(tx, 196, tx + tw, 196, C["rule"], 1.6))
    b.append(block(tx + 12, 156, ["Scale"], 20, "start", weight=600))
    b.append(block(tx + cols[0] + 8, 132, ["Value before taking", "the logarithm"], 20, "start", weight=600, leading=28))
    frame_x = tx + cols[0] + cols[1]
    b.append(double_frame(frame_x + 4, 78, cols[2] - 8, 64, C["proved"]))
    b.append(block(frame_x + cols[2] / 2, 118, [st_word("computed") + ": exponents"], 20, "middle"))
    b.append(block(frame_x + 12, 176, ["Slope against " + mi("s")], 20, "start", weight=600))
    body = [
        ("Speed", tau(exp_speed()), slope_speed()),
        ("Radius", tau(exp_radius()), slope_radius()),
        ("Axial length", tau(exp_axial()), slope_axial()),
        ("Core energy scale", tau(exp_energy()), slope_energy()),
    ]
    for y, (name, val, slope) in zip(rows_y, body):
        b.append(line(tx, y - 48, tx + tw, y - 48, C["rule"], 1.4))
        b.append(block(tx + 12, y, [name], 22, "start"))
        b.append(block(tx + cols[0] + 8, y, [val], form, "start"))
        b.append(block(tx + cols[0] + cols[1] + 12, y, [slope], form, "start"))
    b.append(line(tx, rows_y[-1] + 28, tx + tw, rows_y[-1] + 28, C["rule"], 1.6))
    b.append(block(tx, 620, [mi("s") + " = " + mn(MIN) + "log" + sub(mn("10")) + " " + mi("τ")], 22, "start"))
    b.append(block(tx, 664, ["all proportionality constants normalized to one"], 20, "start"))
    b.append(block(tx, 708, ["scale laws, not sampled values", "of the constructed solution"], 20, "start", leading=32))
    b.append(block(tx, 784, [tau(exp_diss()) + ": time integrable for " + mi("h") + " &lt; 1/6"], 28, "start"))
    b.append(rect(tx, 828, tw, 52, C["claimed"], 2.0, C["paper"]))
    b.append(block(tx + 16, 862, [st_word("claimed") + ": the scale laws are the manuscript's (§§2–3)"], 20, "start"))
    b.append(rect(ix, 900, iw, 120, C["heuristic"], 1.8, C["paper"], "7 5", rx=6))
    b.append(block(ix + 18, 932, [st_word("heuristic")], 20, "start"))
    b.append(block(ix + 18, 968, [
        "schematic; anisotropy exaggerated; drawn with " + mi("h") + " = 0.2,",
        "the source needs " + mi("h") + " far smaller",
    ], 20, "start", leading=32))
    src = "\n".join(b)
    plain = visible(src)
    if plain.count("0.2") != 1:
        raise SystemExit(f"fig2 numerical h count {plain.count('0.2')}")
    require("fig2", src, [
        "core regions at three times", "R", "L", "τ", "h",
        "dashed: coordinate contour", "not a material volume", "radial outflow elsewhere",
        "Scale", "Value before taking", "the logarithm", "Slope against",
        "Speed", "Radius", "Axial length", "Core energy scale",
        "all proportionality constants normalized to one",
        "scale laws, not sampled values", "of the constructed solution",
        "time integrable for", "1/6", "computed", "exponents", "heuristic", "claimed",
        "the scale laws are the manuscript's (§§2–3)",
        "schematic; anisotropy exaggerated; drawn with", "0.2", "far smaller",
        "log",
    ])
    return svg(W, H, src, "Concentration with bounded energy",
               "Three nested core regions, drawn schematically, beside the scale laws and their logarithmic slopes. "
               "The exponents are computed. The drawing is heuristic. The scales are claimed.")


# ---------- figure 3 ----------

def fig3():
    W, H = 1500, 1100
    b = []
    cx, cy = 390, 340
    b.append(ring(cx, cy, 228, C["viscous"], 3.0))
    b.append(block(cx + 168, cy + 250, ["smooth exterior"], 20, "middle"))
    b.append(ring(cx, cy, 158, C["stress"], 46))
    b.append(disk(cx, cy, 108, C["velocity"]))
    b.append(rect(cx - 46, cy - 18, 92, 36, C["paper"], 0, C["paper"], rx=4))
    b.append(block(cx, cy + 8, ["core"], 22, "middle", weight=600))
    b.append(block(48, 78, ["leading momentum deficit", "pulse stress"], 20, "start", leading=30))
    b.append(line(168, 96, cx - 40, cy - 150, C["stress"], 1.6))
    # alternating tangential arrows on the annulus, long enough to read
    r = 158
    length = 56
    for k, deg in enumerate((22, 67, 112, 157, 202, 247, 292, 337)):
        a = math.radians(deg)
        px, py = cx + r * math.cos(a), cy - r * math.sin(a)
        tx, ty = -math.sin(a), -math.cos(a)
        if k % 2:
            tx, ty = -tx, -ty
        b.append(arrow(px - 0.5 * length * tx, py - 0.5 * length * ty,
                       px + 0.5 * length * tx, py + 0.5 * length * ty, C["velocity"], 3.8, 13))
    b.append(block(48, 168, ["alternating sign"], 20, "start"))
    aim = math.radians(157)
    b.append(line(196, 180, cx + 188 * math.cos(aim), cy - 188 * math.sin(aim), C["ink"], 1.6))
    # squared products into one averaged-flux arrow
    junction = (690, 340)
    for deg in (30, 80, -30, -80):
        a = math.radians(deg)
        p = (cx + 190 * math.cos(a), cy - 190 * math.sin(a))
        b.append(arrow(p[0], p[1], junction[0] - 8, junction[1] + (0 if deg > 0 else 0), C["stress"], 1.8, 8))
    b.append(arrow(junction[0], junction[1], junction[0] + 78, junction[1], C["stress"], 3.2, 12))
    b.append(block(junction[0] + 8, junction[1] - 18, ["averaged flux"], 20, "start"))
    ab = mi("a") + " " + mi("b") + " cos " + mi("φ")
    b.append(block(48, 640, [mn("⟨") + ab + mn("⟩") + " = 0"], 22, "start"))
    left = mn("⟨(") + ab + mn(")⊗(") + ab + mn(")⟩")
    right = mn("(") + mi("a") + sup(mi("2")) + mn("/2) ") + mi("b") + mn("⊗") + mi("b")
    b.append(block(48, 690, [left], 20, "start"))
    b.append(block(48, 730, ["= " + right], 20, "start"))
    b.append(rect(48, 768, 560, 48, C["proved"], 2.0, C["paper"]))
    b.append(block(64, 798, [st_word("proved") + ": averaging identities (20) and the toy cone (21)"], 20, "start"))
    b.append(rect(48, 828, 660, 48, C["claimed"], 2.0, C["paper"]))
    b.append(block(64, 858, [st_word("claimed") + ": the annular mechanism (manuscript §3.2, Theorem 4.6)"], 20, "start"))

    # toy cone. Origin (1040, 500), 100 px per unit. s right, d up.
    ox, oy, sc = 1040, 520, 100
    def xy(s, d):
        return ox + sc * s, oy - sc * d
    top = xy(2.6, 2.6)
    bot = xy(2.6, -2.6)
    b.append(block(1180, 56, ["toy matrix cone"], 24, "middle", weight=600))
    b.append(path(f"M{ox:.1f},{oy:.1f} L{top[0]:.1f},{top[1]:.1f} L{bot[0]:.1f},{bot[1]:.1f} Z",
                  C["stress"], 0, C["stress"], opacity=0.16))
    b.append(arrow(ox, oy, xy(3.05, 0)[0], xy(3.05, 0)[1], C["ink"], 1.8, 10))
    b.append(arrow(ox, oy, xy(0, 2.55)[0], xy(0, 2.55)[1], C["ink"], 1.8, 10))
    b.append(line(ox, oy, top[0], top[1], C["stress"], 2.6))
    b.append(line(ox, oy, bot[0], bot[1], C["stress"], 2.6))
    b.append(block(xy(3.15, 0)[0], xy(3.15, 0)[1] + 8, [mi("s")], 22, "start"))
    b.append(block(xy(0, 2.7)[0] - 8, xy(0, 2.7)[1], [mi("d")], 22, "end"))
    # s ≥ 0 sits under the positive axis, clear of the lower ray.
    b.append(block(1196, 558, [mi("s") + " " + mn("≥") + " 0"], 20, "start"))
    # Ray labels sit outside the shaded cone, with a gap, and do not cross the rays.
    b.append(block(1188, 146, [
        mi("d") + " = " + mi("s") + ", " + subsc("b", "+") + " = (1, 1)",
    ], 20, "start"))
    b.append(block(1072, 816, [
        mi("d") + " = " + mn(MIN) + mi("s") + ", " + subsc("b", "−") + " = (1, " + MIN + "1)",
    ], 20, "start"))
    pin = xy(2, 1)
    out = xy(1, 2)
    b.append(disk(pin[0], pin[1], 8, C["stress"]))
    b.append(disk(out[0], out[1], 8, C["paper"], C["stress"], 2.4))
    b.append(block(pin[0] + 18, pin[1] + 6, [
        subsc("c", "+") + " = 3/2, " + subsc("c", "−") + " = 1/2",
    ], 20, "start"))
    b.append(line(1010, 156, out[0] - 8, 156, C["ink"], 1.6))
    b.append(arrow(out[0] - 8, 156, out[0], out[1] - 16, C["ink"], 1.6, 9))
    b.append(block(790, 112, [
        "cannot be formed",
        "with nonnegative",
        "weights of these",
        "two directions",
    ], 20, "start", leading=28))
    b.append(rect(790, 880, 680, 112, C["heuristic"], 1.8, C["paper"], "7 5"))
    b.append(block(806, 914, [st_word("heuristic")], 20, "start"))
    b.append(block(806, 954, ["the actual stress directions depend on the background profile"], 20, "start"))
    src = "\n".join(b)
    require("fig3", src, [
        "core", "smooth exterior", "leading momentum deficit", "pulse stress",
        "alternating sign", "averaged flux",
        "toy matrix cone",
        "the actual stress directions depend on the background profile",
        "cannot be formed", "with nonnegative", "weights of these", "two directions",
        "claimed", "proved", "heuristic",
        "averaging identities (20) and the toy cone (21)",
        "the annular mechanism (manuscript §3.2, Theorem 4.6)",
    ])
    return svg(W, H, src, "Annular repair and positive covariance",
               "A core, an annulus and a smooth exterior. Zero-mean alternating arrows "
               "have a nonzero averaged quadratic flux. The toy matrix cone shows which "
               "weights of the two directions are possible.")


# ---------- figure 4 ----------

PRESSURE = [
    "reconstruct pressure from",
    "updated radial equation;",
    "update full residual,",
    "including axial pressure",
    "contribution.",
]


def fig4():
    W, H = 1500, 1500
    b = []
    # claimed mark for the cycle
    b.append(rect(620, 16, 160, 40, C["claimed"], 2.0, C["paper"]))
    b.append(block(700, 43, [st_word("claimed")], 20, "middle"))
    nodes = {
        "n1": (36, 70, 470, 130, ["supported nonzero", "angular modes"]),
        "n2": (994, 70, 470, 130, ["averaged tangential stress"]),
        "n3": (994, 470, 470, 200, ["residual with zero", "auxiliary mean"]),
        "n4": (36, 430, 470, 250, [
            "five-equation moment correction",
            "preserve two integral constraints;",
            "cancel the linear contributions",
            "to three defects (" + mi("P") + ", " + mi("J") + sub(mi("θ")) + ", " + mi("J") + sub(mi("z")) + ").",
            "Nonlinear remainders persist",
            "with improved decay.",
        ]),
    }
    boxes = {
        "p12": (530, 78, 440, 168),
        "p23": (1008, 230, 442, 168),
        "p34": (530, 500, 440, 168),
        "p41": (50, 230, 442, 168),
    }
    for key, (x, y, w, h, rows) in nodes.items():
        b.append(rect(x, y, w, h, C["ink"], 2.2))
        lead = 30
        total = lead * (len(rows) - 1)
        y0 = y + (h - total) / 2 + 8
        weight = 600 if key != "n4" else 400
        # first line of node 4 is the name
        if key == "n4":
            b.append(block(x + w / 2, y0, [rows[0]], 22, "middle", weight=600))
            b.append(block(x + w / 2, y0 + 40, rows[1:], 20, "middle", leading=30))
        else:
            b.append(block(x + w / 2, y0 + 8, rows, 22, "middle", weight=600, leading=34))
    for key, (x, y, w, h) in boxes.items():
        b.append(rect(x, y, w, h, C["rule"], 1.6, C["paper"]))
        b.append(block(x + w / 2, y + 32, PRESSURE, 20, "middle", leading=26))
    # clockwise arrows 1 -> 2 -> 3 -> 4 -> 1, each ending on a pressure box or leaving it
    def right(r):
        return r[0] + r[2], r[1] + r[3] / 2
    def left(r):
        return r[0], r[1] + r[3] / 2
    def bottom(r):
        return r[0] + r[2] / 2, r[1] + r[3]
    def top(r):
        return r[0] + r[2] / 2, r[1]
    N, P = nodes, boxes
    pairs = [
        (right(N["n1"]), left(P["p12"])),
        (right(P["p12"]), left(N["n2"])),
        (bottom(N["n2"]), top(P["p23"])),
        (bottom(P["p23"]), top(N["n3"])),
        (left(N["n3"]), right(P["p34"])),
        (left(P["p34"]), right(N["n4"])),
        (top(N["n4"]), bottom(P["p41"])),
        (top(P["p41"]), bottom(N["n1"])),
    ]
    for (x1, y1), (x2, y2) in pairs:
        b.append(arrow(x1, y1, x2, y2, C["ink"], 2.2, 10))
    # expansion (16)
    b.append(rect(36, 710, 1428, 132, C["rule"], 1.6, C["paper"]))
    b.append(block(52, 742, ["expansion (16)"], 20, "start", fill=C["muted"]))
    quad = ("(" + mi("u") + mn("·∇") + ")" + mi("w") + " + (" + mi("w") + mn("·∇") + ")" + mi("u")
            + " + (" + mi("w") + mn("·∇") + ")" + mi("w"))
    line1 = (mc("R") + "(" + mi("u") + "+" + mi("w") + ", " + mi("p") + "+" + mi("π") + ") = "
             + mc("R") + "(" + mi("u") + ", " + mi("p") + ") + " + mn("∂") + sub(mi("t")) + mi("w")
             + " " + mn(MIN) + " " + mi("ν") + mn("Δ") + mi("w") + " + " + mn("∇") + mi("π"))
    b.append(block(52, 780, [line1], 22, "start"))
    b.append(block(52, 816, ["+ " + quad], 22, "start"))
    # ladder
    lx = 120
    rung_y = {0.2: 1188, 0.3: 1144, 0.4: 1100, 0.5: 1056, 0.6: 1012, 0.7: 968}
    b.append(block(420, 948, [mi("σ") + sub(mi("j")) + " = 1/5 + " + mi("j") + "/10"], 22, "start"))
    b.append(line(lx, 940, lx, 1210, C["ink"], 2.2))
    b.append(block(lx - 16, 930, ["…"], 22, "middle"))
    for val, y in rung_y.items():
        b.append(line(lx - 28, y, lx + 28, y, C["ink"], 2.2))
        label = "0.2" if val == 0.2 else f"{val:.1f}"
        b.append(block(lx + 40, y + 6, [label], 20, "start"))
    # loss marker between 0.4 and 0.5, higher marker above the ellipsis
    b.append(line(70, 1078, 280, 1078, C["ink"], 2.4))
    b.append(block(292, 1058, ["loss for one fixed derivative order"], 20, "start"))
    b.append(line(70, 892, 280, 892, C["ink"], 2.4))
    b.append(block(292, 872, ["higher derivative order"], 20, "start"))
    # realization, separate from the ladder
    b.append(arrow(300, 930, 700, 930, C["ink"], 2.2, 11))
    b.append(rect(710, 880, 750, 100, C["ink"], 2.0))
    b.append(block(1085, 918, ["shrinking cutoff realization", "on potentials and pressure"], 20, "middle", leading=30))
    b.append(arrow(1085, 980, 1085, 1030, C["ink"], 2.2, 11))
    b.append(rect(710, 1040, 750, 110, C["ink"], 2.0))
    b.append(block(1085, 1078, [
        "smooth field for " + mi("q") + "&gt;0;",
        "residual derivatives vanish to",
        "arbitrary order on the stated sectors",
    ], 20, "middle", leading=28))
    # cutoff inset
    b.append(rect(36, 1260, 1428, 200, C["proved"], 2.2, C["paper"]))
    b.append(block(56, 1300, [st_word("proved")], 20, "start"))
    struck = mi("u") + " " + mn("↦") + " " + mi("cu")
    b.append(text(200, 1304, struck, 22, C["ink"], "start", deco="line-through"))
    b.append(block(430, 1304, ["nonzero " + mn("∇") + mi("c") + mn("·") + mi("u")], 22, "start"))
    b.append(block(56, 1352, [
        mi("B") + " " + mn("↦") + " curl(" + mi("cB") + ")",
        "divergence zero",
    ], 22, "start", leading=36))
    ident = (mn("∇×") + "(" + mi("cB") + ") = " + mi("c") + " " + mn("∇×") + mi("B")
             + " + " + mn("∇") + mi("c") + " " + mn("×") + mi("B"))
    b.append(block(560, 1352, [ident], 22, "start"))
    src = "\n".join(b)
    require("fig4", src, [
        "supported nonzero", "angular modes", "averaged tangential stress",
        "residual with zero", "auxiliary mean", "five-equation moment correction",
        "preserve two integral constraints;", "cancel the linear contributions",
        "three defects", "Nonlinear remainders persist", "with improved decay.",
        "reconstruct pressure from", "updated radial equation;",
        "update full residual,", "including axial pressure", "contribution.",
        "expansion (16)", "1/5", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "…",
        "loss for one fixed derivative order", "higher derivative order",
        "shrinking cutoff realization", "on potentials and pressure",
        "smooth field for", "residual derivatives vanish to",
        "arbitrary order on the stated sectors",
        "divergence zero", "nonzero", "claimed", "proved", "curl(",
    ])
    if "proof complete" in visible(src).lower():
        raise SystemExit("fig4 must not say proof complete")
    return svg(W, H, src, "Residual improvement is an entire cycle",
               "Four corrections in a loop. Pressure is rebuilt and the full residual, "
               "including the axial pressure term, is updated between every pair, including the return. "
               "Orders continue without a last rung. A separate shrinking cutoff realizes a smooth field.")


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
    W, H = 1500, 1420
    b = []
    scope = st_word("claimed") + " (manuscript §§10.1–10.3)"
    b.append(rect(28, 16, 380, 44, C["claimed"], 2.0, C["paper"]))
    b.append(block(44, 44, [scope], 20, "start"))
    # time axis 0, a, 1, b
    ax0, ax1, axis_y = 180, 1280, 468
    ticks = {"0": 220, "a": 520, "1": 860, "b": 1160}
    b.append(arrow(ax0, axis_y, ax1, axis_y, C["ink"], 2.0, 11))
    for lab, x in ticks.items():
        b.append(line(x, axis_y - 8, x, axis_y + 8, C["ink"], 2.0))
        b.append(block(x, axis_y + 34, [mi(lab) if lab in ("a", "b") else lab], 22, "middle"))
    b.append(block(ticks["1"], axis_y + 64, ["blowup"], 20, "middle"))
    x0, x1 = ticks["0"], ticks["1"]
    span = x1 - x0
    a_time = (ticks["a"] - x0) / span

    def x_of(t):
        return x0 + span * t

    # force envelope on (a, b), nonzero at 1. Its band stays above the velocity track.
    base_f = 176
    amp = 56
    zs = smooth_bump()
    xa, xb = ticks["a"], ticks["b"]
    pts = []
    for i, z in enumerate(zs):
        x = xa + (xb - xa) * i / (len(zs) - 1)
        y = base_f - amp * z
        pts.append((x, y))
    d = "M" + " L".join(f"{p[0]:.1f},{p[1]:.1f}" for p in pts)
    d += f" L{xb:.1f},{base_f:.1f} L{xa:.1f},{base_f:.1f} Z"
    b.append(path(d, C["force"], 2.4, C["force"], opacity=0.22))
    b.append(block(36, base_f + 6, ["smooth force"], 20, "start"))
    b.append(block(430, 44, ["schematic norm envelope,", "not the actual force profile"], 20, "start", leading=28))
    # velocity: zero on [0, a], then the blow-up profile, clipped in its own track
    base_v, top_v = 328, 214
    height_v = base_v - top_v
    t_hit = 0.99
    coeff = (1 - a_time) ** 0.7

    def vel(t):
        if t <= a_time:
            return 0.0
        return coeff * (1 - t) ** (-0.7) - 1.0

    k_vel = height_v / vel(t_hit)
    vpts = []
    for i in range(0, 161):
        p = i / 160
        t = t_hit * p
        y = base_v - k_vel * vel(t)
        if y < top_v:
            y = top_v
        vpts.append((x_of(t), y, t))
        if y <= top_v + 0.05 and t > a_time:
            break
    if any(abs(y - base_v) > 0.05 for x, y, t in vpts if t <= a_time + 1e-12):
        raise SystemExit("fig5 velocity is not zero on [0, a]")
    if vpts[-1][0] > x1 + 0.05 or vpts[-1][1] < top_v - 0.05:
        raise SystemExit("fig5 velocity leaves its track or passes t = 1")
    dx = vpts[-1][0] - vpts[-2][0]
    dy = vpts[-1][1] - vpts[-2][1]
    angle = math.degrees(math.atan2(abs(dy), abs(dx) if abs(dx) > 1e-9 else 1e-9))
    if angle < 80:
        raise SystemExit(f"fig5 velocity end is not nearly vertical ({angle:.1f})")
    b.append(line(x0, base_v, x1, base_v, C["rule"], 1.4))
    vd = "M" + " L".join(f"{p[0]:.1f},{p[1]:.1f}" for p in vpts)
    b.append(path(vd, C["velocity"], 2.8, "none"))
    tip_x, tip_y = vpts[-1][0], vpts[-1][1]
    back = vpts[-2]
    norm = math.hypot(tip_x - back[0], tip_y - back[1]) or 1
    tail = 34
    b.append(arrow(tip_x - tail * (tip_x - back[0]) / norm, tip_y - tail * (tip_y - back[1]) / norm,
                   tip_x, tip_y, C["velocity"], 2.8, 12))
    b.append(block(36, base_v + 6, ["singular velocity"], 20, "start"))
    b.append(block(tip_x + 14, top_v + 6, ["→ ∞"], 20, "start"))
    # energy: zero on [0, a], then rises and levels off below a dashed ceiling
    base_e, ceil_e = 414, 368
    rise = 30

    def en(t):
        if t <= a_time:
            return 0.0
        u = (t - a_time) / (1 - a_time)
        return 1 - math.exp(-3.2 * u)

    epts = []
    for i in range(0, 121):
        t = i / 120
        epts.append((x_of(t), base_e - rise * en(t), t))
    if any(abs(y - base_e) > 0.05 for x, y, t in epts if t <= a_time + 1e-12):
        raise SystemExit("fig5 energy is not zero on [0, a]")
    if epts[-1][0] > x1 + 0.05 or epts[-1][1] <= ceil_e:
        raise SystemExit("fig5 energy passes t = 1 or meets the ceiling")
    late = en(1.0) - en(a_time + 0.75 * (1 - a_time))
    if late > 0.12:
        raise SystemExit("fig5 energy does not level off")
    b.append(line(x0, base_e, x1, base_e, C["rule"], 1.4))
    b.append(f'<line x1="{x0:.1f}" y1="{ceil_e:.1f}" x2="{x1:.1f}" y2="{ceil_e:.1f}" '
             f'stroke="{C["energy"]}" stroke-width="2.2" stroke-dasharray="7 5"/>')
    ed = "M" + " L".join(f"{p[0]:.1f},{p[1]:.1f}" for p in epts)
    b.append(path(ed, C["energy"], 2.6, "none"))
    b.append(block(36, base_e + 6, ["energy"], 20, "start"))
    b.append(block(x1 + 12, ceil_e + 6, ["bounded"], 20, "start"))
    print(f"fig5 tracks a={a_time:.4f} k={k_vel:.4f} t_hit={t_hit} angle={angle:.1f}")
    # middle: competitor, comparison, contradiction
    b.append(rect(36, 556, 420, 44, C["claimed"], 2.0, C["paper"]))
    b.append(block(52, 584, [scope], 20, "start"))
    b.append(rect(36, 616, 520, 150, C["ink"], 2.0))
    b.append(block(296, 656, [
        "hypothetical smooth global competitor",
        "same force, zero datum",
        "compared on intervals ending before 1",
    ], 20, "middle", leading=36))
    b.append(arrow(556, 691, 640, 691, C["ink"], 2.2, 10))
    b.append(rect(650, 631, 810, 120, C["ink"], 2.0))
    b.append(block(1055, 696, ["pressure recovery + expanding-ball flux bounds"], 20, "middle"))
    b.append(arrow(1055, 751, 1055, 806, C["ink"], 2.2, 10))
    b.append(rect(360, 816, 1100, 160, C["proved"], 2.2, C["paper"]))
    b.append(block(380, 856, [st_word("proved")], 20, "start"))
    b.append(block(910, 856, ["compactness contradiction on " + mi("K") + mn("×") + "[0,1]"], 22, "middle"))
    b.append(block(910, 900, ["continuous global competitor bounded on " + mi("K") + mn("×") + "[0,1]"], 20, "middle"))
    b.append(block(910, 940, ["equal pre-singular branch has unbounded speed in " + mi("K")], 20, "middle"))
    # bottom: shrink into a cell, copies, branch to C and to D; A/B outside
    origin = (180, 1236)
    u, v = (86, 30), (-40, 26)
    def corner(i, j):
        return (origin[0] + i * u[0] + j * v[0], origin[1] + i * u[1] + j * v[1])
    for i in range(4):
        p, q = corner(i, 0), corner(i, 3)
        b.append(line(p[0], p[1], q[0], q[1], C["ink"], 1.8))
    for j in range(4):
        p, q = corner(0, j), corner(3, j)
        b.append(line(p[0], p[1], q[0], q[1], C["ink"], 1.8))
    for i in range(3):
        for j in range(3):
            c = corner(i + 0.5, j + 0.5)
            blob = []
            for k in range(20):
                t = 2 * math.pi * k / 20
                blob.append((c[0] + 0.16 * math.cos(t) * u[0] + 0.16 * math.sin(t) * v[0],
                             c[1] + 0.16 * math.cos(t) * u[1] + 0.16 * math.sin(t) * v[1]))
            bd = "M" + " L".join(f"{p[0]:.1f},{p[1]:.1f}" for p in blob) + " Z"
            b.append(path(bd, C["velocity"], 1.6, C["velocity"], opacity=0.9))
    # ticks: opposite faces
    def tick(p, q, n=2):
        mx, my = (p[0] + q[0]) / 2, (p[1] + q[1]) / 2
        dx, dy = q[0] - p[0], q[1] - p[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        parts = []
        for s in ((-6, 6) if n == 2 else (0,)):
            parts.append(line(mx + s * dx / L * 0.04 + nx * 8, my + s * dy / L * 0.04 + ny * 8,
                              mx + s * dx / L * 0.04 - nx * 8, my + s * dy / L * 0.04 - ny * 8, C["ink"], 1.8))
        return "".join(parts)
    b.append(tick(corner(0, 0), corner(3, 0), 2))
    b.append(tick(corner(0, 3), corner(3, 3), 2))
    b.append(tick(corner(0, 0), corner(0, 3), 1))
    b.append(tick(corner(3, 0), corner(3, 3), 1))
    # source blob and shrink arrow into the centre cell
    src_c = (70, 1176)
    b.append(disk(src_c[0], src_c[1], 18, C["velocity"]))
    into = corner(1.2, 1.2)
    b.append(arrow(src_c[0] + 20, src_c[1], into[0], into[1], C["ink"], 2.0, 10))
    b.append(block(108, 1152, ["shrink and shift"], 20, "start"))
    b.append(block(520, 1104, ["opposite faces identified"], 20, "start"))
    b.append(block(520, 1146, ["velocity, pressure and force periodic"], 20, "start"))
    b.append(block(520, 1188, ["finite cell energy; no whole-space " + mi("L") + sup("2") + " claim",
                               "for the periodic lift"], 20, "start", leading=32))
    b.append(rect(980, 1092, 300, 44, C["claimed"], 2.0, C["paper"]))
    b.append(block(996, 1120, [st_word("claimed") + " (Corollary 10.6)"], 20, "start"))
    # branch to C from the contradiction and to D from the cells; A/B sit apart
    b.append(arrow(360, 936, 80, 1056, C["ink"], 2.2, 10))
    b.append(rect(36, 1064, 70, 48, C["ink"], 2.2, C["paper"]))
    b.append(block(71, 1096, ["C"], 22, "middle", weight=600))
    b.append(arrow(corner(3, 1)[0], corner(3, 1)[1], 1360, 1236, C["ink"], 2.2, 10))
    b.append(rect(1370, 1212, 70, 48, C["ink"], 2.2, C["paper"]))
    b.append(block(1405, 1244, ["D"], 22, "middle", weight=600))
    b.append(rect(1204, 18, 268, 152, C["rule"], 1.6, C["paper"]))
    b.append(block(1338, 52, ["A"], 22, "middle"))
    b.append(block(1338, 82, ["B"], 22, "middle"))
    b.append(block(1220, 120, ["A, B (no force):"], 20, "start"))
    b.append(block(1220, 148, ["outside these arrows"], 20, "start"))
    src = "\n".join(b)
    require("fig5", src, [
        "smooth force", "singular velocity", "energy", "blowup", "bounded",
        "schematic norm envelope, not the actual force profile",
        "hypothetical smooth global competitor", "same force, zero datum",
        "compared on intervals ending before 1",
        "pressure recovery + expanding-ball flux bounds",
        "compactness contradiction on", "continuous global competitor bounded on",
        "equal pre-singular branch has unbounded speed in",
        "opposite faces identified", "velocity, pressure and force periodic",
        "finite cell energy; no whole-space", "claim", "for the periodic lift",
        "shrink and shift", "claimed", "proved",
        "manuscript §§10.1–10.3", "Corollary 10.6",
        "A, B (no force):", "outside these arrows",
    ])
    return svg(W, H, src, "Smooth forcing, singular velocity, and two domains",
               "A smooth force is supported between a and b. Velocity and energy stay at zero until a. "
               "The velocity then blows up at time 1, and the energy levels off below a bound. "
               "Comparison with a competitor yields a compactness contradiction. "
               "Separated copies in a cell give the periodic statement. "
               "Arrows reach C and D. A and B stay outside them.")


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
