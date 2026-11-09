#!/usr/bin/env python3
"""Find one-frame blinks (flicker) in a chapter's rendered frames.

Usage:
  python3 tools/check_flicker.py out/c3/frames            # PNG frames f00000.png ... (any scale)
  python3 tools/check_flicker.py out/c3/c3.mp4            # or a video
  options: --fps 60  --hi 64  --lo 24  --radius 20  --min-pixels 10  --top 15  --log FILE

Frames are scaled to 1920x1080 (area filter) and read in order. A pixel p of frame k blinks when
  1. it differs strongly from frame k-1 and from frame k+1 at p (max channel difference > hi), while
     frames k-1 and k+1 agree at p (difference < lo): the definition of a one-frame blink;
  2. it is not slow motion: candidates are grouped in 8 x 8 tiles, and a tile is motion when one
     velocity d (up to `radius` = 20 pixels per frame) explains it, i.e. frame k-1 moved by -d and frame
     k+1 moved by +d (speed change up to 4 px) reproduce its candidate pixels, with at most 15 % of
     them off by more than 32. A tile with at least 16 candidate pixels is also motion when frame k-1
     and frame k+1 each match it by a rigid shift of up to 40 pixels (fast or accelerating slides;
     16 samples make a chance match of a random pattern unlikely);
  3. and either its colour at frame k is found at the same pixel both before (frames k-4..k-2) and
     after (k+2..k+4), while the 24 x 24 pixels around it show the same scene (at most 25 % differ): the
     pixel alternates in place, as z-fighting and unstable transparency sorting make it do (judged
     per 8 x 8 tile: at least half of its leftover candidates must come back);
     or it is isolated in time: frames k-1 and k+1 have no candidate pixel within 96 pixels, and
     neither neighbour alone shows its tile shifted by up to 16 pixels (that is motion with one side
     hidden, as when a line passes behind another).
     A fast slide passes a pixel once, and the frames next to it have candidates close by, so it is
     neither; a single bad frame is isolated, and a flickering edge alternates.
Blink pixels count only in 8-connected groups of at least `min-pixels` (10) pixels: antialiasing
noise and the shimmer of a glyph's edge row as text slides at fractional positions (groups of 5-9
light pixels) are ignored; the z-fighting this check was built for makes groups of 20-200 pixels.
Rows 900-1079 are excluded: the subtitle band (908-1008) and the status strip (1040-1080).

Prints every frame with blink pixels (frame index, time, count, bounding box) and a summary line
"blink frames: N, blink pixels: M". Exit status 0 when there are none, 1 otherwise, 2 on usage errors.
The named failing case is tools/test_check_flicker.py.
"""
import argparse, subprocess, sys
from pathlib import Path

import numpy as np

W, H = 1920, 1080
MISMATCH = 32        # a compared pixel is off when its max-channel difference exceeds this
MAX_MISMATCH = 0.15  # a velocity explains a tile when at most this share of compared pixels is off
EXCLUDE_FROM_ROW = 900
ACCEL = 4            # pixels per frame: change of speed allowed between k-1 -> k and k -> k+1
BACK = 4             # frames searched on each side for a colour that comes back
WIDE = 40            # pixels per frame: fast motion searched for tiles with 16 candidate pixels
RECUR_SHARE = 0.5    # a tile alternates when at least this share of its leftover candidates come back
SAME = 0.25          # share of differing pixels up to which a neighbourhood counts as the same scene
FAR = 96             # pixels: "isolated in time" means no candidate this close in frames k-1, k+1


def frames(src, fps):
    p = Path(src)
    if p.is_dir():
        pngs = sorted(p.glob('f*.png'))
        if not pngs:
            sys.exit(f'no f*.png frames in {src}')
        start = int(pngs[0].stem[1:])
        inp = ['-framerate', str(fps), '-start_number', str(start), '-i', str(p / 'f%05d.png')]
    else:
        start = 0
        inp = ['-i', str(p)]
    cmd = ['ffmpeg', '-v', 'error'] + inp + ['-vf', f'scale={W}:{H}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    size = W * H * 3
    k = start
    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        yield k, np.frombuffer(buf, np.uint8).reshape(H, W, 3)[:EXCLUDE_FROM_ROW].astype(np.int16)
        k += 1
    proc.wait()
    if proc.returncode:
        sys.exit(f'ffmpeg failed on {src}')


def maxdiff(x, y):
    return np.abs(x - y).max(axis=-1)


def candidates(a, b, c, hi, lo):
    """Pixels of frame b that differ from both neighbours (> hi) while the neighbours agree (< lo)."""
    return (maxdiff(b, a) > hi) & (maxdiff(b, c) > hi) & (maxdiff(a, c) < lo)


def _tile_errors(frame, ys, xs, vals, tiles, nt, shifts):
    """Per tile, the share of the pixels (ys, xs) with colours vals that are off in `frame` moved by
    each shift. Returns an array (len(shifts), nt)."""
    hgt, wid = frame.shape[:2]
    cnt = np.maximum(np.bincount(tiles, minlength=nt), 1).astype(np.float64)
    out = np.empty((len(shifts), nt))
    for i, (dy, dx) in enumerate(shifts):
        yy = np.clip(ys + dy, 0, hgt - 1)
        xx = np.clip(xs + dx, 0, wid - 1)
        off = np.abs(frame[yy, xx] - vals).max(axis=-1) > MISMATCH
        out[i] = np.bincount(tiles, weights=off, minlength=nt) / cnt
    return out


def _minfilter(grid, r):
    """Min over a (2r+1)^2 window in the first two axes of grid (n, n, nt); outside counts as +inf."""
    n = grid.shape[0]
    pad = np.pad(grid, ((r, r), (r, r), (0, 0)), constant_values=np.inf)
    out = np.full_like(grid, np.inf)
    for dy in range(2 * r + 1):
        for dx in range(2 * r + 1):
            out = np.minimum(out, pad[dy:dy + n, dx:dx + n])
    return out


def _near(mask, r):
    """True where mask has a True pixel within Chebyshev distance r (summed-area table)."""
    hgt, wid = mask.shape
    cs = np.pad(mask.astype(np.int32), ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    y0 = np.clip(np.arange(hgt) - r, 0, hgt)
    y1 = np.clip(np.arange(hgt) + r + 1, 0, hgt)
    x0 = np.clip(np.arange(wid) - r, 0, wid)
    x1 = np.clip(np.arange(wid) + r + 1, 0, wid)
    return (cs[y1][:, x1] - cs[y0][:, x1] - cs[y1][:, x0] + cs[y0][:, x0]) > 0


def blink_mask(win, cand, k, lo, radius, min_pixels, block=8, per_block=16):
    """Blink pixels of frame k. win: {index: frame} holding k-BACK .. k+BACK where they exist;
    cand: {index: candidate mask} holding k-1, k, k+1 where they exist."""
    ck = cand[k]
    hgt, wid = ck.shape
    mask = np.zeros(ck.shape, bool)
    ys, xs = np.nonzero(ck)
    if len(ys) == 0:
        return mask
    a, b, c = win[k - 1], win[k], win[k + 1]
    # slow motion: one velocity per tile, k-1 at -d and k+1 at +d (speed change <= ACCEL px)
    tile = (ys // block) * (wid // block + 1) + xs // block
    order = np.argsort(tile, kind='stable')
    ys, xs, tile = ys[order], xs[order], tile[order]
    uniq, first, counts = np.unique(tile, return_index=True, return_counts=True)
    rank = np.arange(len(tile)) - np.repeat(first, counts)
    step = np.repeat(np.maximum(1, counts // per_block), counts)
    keep = (rank % step == 0) & (rank // step < per_block)       # at most per_block pixels per tile
    sy, sx, st = ys[keep], xs[keep], np.searchsorted(uniq, tile[keep])
    nt = len(uniq)
    n = 2 * radius + 1
    shifts = [(dy, dx) for dy in range(-radius, radius + 1) for dx in range(-radius, radius + 1)]
    v = b[sy, sx]
    ea_raw = _tile_errors(a, sy, sx, v, st, nt, shifts)
    ec_raw = _tile_errors(c, sy, sx, v, st, nt, shifts)
    ea = ea_raw.reshape(n, n, nt)[::-1, ::-1]                       # k-1 at -d
    ec = _minfilter(ec_raw.reshape(n, n, nt), ACCEL)                # k+1 near +d
    best = np.maximum(ea, ec).reshape(n * n, nt).min(axis=0)
    moving = best <= MAX_MISMATCH
    # one side alone explained by a shift: motion where the other frame has it hidden (occlusion)
    one_side = (ea_raw.min(axis=0) <= MAX_MISMATCH) | (ec_raw.min(axis=0) <= MAX_MISMATCH)
    # fast or accelerating motion: tiles with at least per_block candidates, k-1 and k+1 matched
    # separately by rigid shifts up to WIDE pixels (16 samples make a chance match of a random pattern
    # unlikely)
    full = np.bincount(st, minlength=nt) >= per_block
    todo = np.nonzero(~moving & full)[0]
    if len(todo):
        use = np.isin(st, todo)
        remap = np.full(nt, -1)
        remap[todo] = np.arange(len(todo))
        y2, x2, t2, v2 = sy[use], sx[use], remap[st[use]], v[use]
        wide = [(dy, dx) for dy in range(-WIDE, WIDE + 1) for dx in range(-WIDE, WIDE + 1)
                if max(abs(dy), abs(dx)) > radius - 2]
        fa = _tile_errors(a, y2, x2, v2, t2, len(todo), wide).min(axis=0)
        fc = _tile_errors(c, y2, x2, v2, t2, len(todo), wide).min(axis=0)
        moving[todo] = np.maximum(fa, fc) <= MAX_MISMATCH
    left = np.isin(tile, uniq[~moving])
    occl = np.isin(tile, uniq[one_side])[left]
    ys, xs, tl = ys[left], xs[left], tile[left]
    if len(ys) == 0:
        return mask
    # alternation: the colour at k is found at the same pixel within BACK frames before and after k,
    # where the scene around the pixel is the same at frame j as at frame k (at most SAME of the 24 x 24
    # pixels around its tile differ, so text that slides past does not count as coming back)
    vk = b[ys, xs]
    th, tw = -(-hgt // block), -(-wid // block)
    sides = []
    for js in (range(k - BACK, k - 1), range(k + 2, k + BACK + 1)):
        got = np.zeros(len(ys), bool)
        for j in js:
            if j not in win:
                continue
            diff = np.zeros((th * block, tw * block), np.float32)
            diff[:hgt, :wid] = maxdiff(win[j], b) > MISMATCH
            tsum = diff.reshape(th, block, tw, block).sum(axis=(1, 3))
            ctx = np.pad(tsum, 1)
            ctx = sum(ctx[1 + dy:1 + dy + th, 1 + dx:1 + dx + tw] for dy in (-1, 0, 1) for dx in (-1, 0, 1))
            same = ctx / (9 * block * block) <= SAME
            got |= (np.abs(win[j][ys, xs] - vk).max(axis=-1) < lo) & same[ys // block, xs // block]
        sides.append(got)
    recur = sides[0] & sides[1]          # back before k and again after k: alternation, not a passing line
    # isolation in time: no candidates near in frames k-1 and k+1
    others = np.zeros(ck.shape, bool)
    for j in (k - 1, k + 1):
        if j in cand:
            others |= cand[j]
    isolated = ~_near(others, FAR)[ys, xs] if others.any() else np.ones(len(ys), bool)
    # alternation is judged per tile: at least half of its unexplained candidates come back
    tu, ti = np.unique(tl, return_inverse=True)
    share = np.bincount(ti, weights=recur) / np.bincount(ti)
    sel = (share[ti] >= RECUR_SHARE) | (isolated & ~occl)
    mask[ys[sel], xs[sel]] = True
    if min_pixels > 1 and mask.any():
        mask = _clusters(mask, min_pixels)
    return mask


def _clusters(mask, size):
    """Keep the 8-connected groups of at least `size` pixels."""
    ys, xs = np.nonzero(mask)
    index = {(y, x): i for i, (y, x) in enumerate(zip(ys.tolist(), xs.tolist()))}
    seen = np.zeros(len(ys), bool)
    out = np.zeros(mask.shape, bool)
    for i in range(len(ys)):
        if seen[i]:
            continue
        group, todo = [], [i]
        seen[i] = True
        while todo:
            q = todo.pop()
            group.append(q)
            y, x = int(ys[q]), int(xs[q])
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    r = index.get((y + dy, x + dx))
                    if r is not None and not seen[r]:
                        seen[r] = True
                        todo.append(r)
        if len(group) >= size:
            out[ys[group], xs[group]] = True
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src')
    ap.add_argument('--fps', type=int, default=60)
    ap.add_argument('--hi', type=int, default=64)
    ap.add_argument('--lo', type=int, default=24)
    ap.add_argument('--radius', type=int, default=20)
    ap.add_argument('--min-pixels', type=int, default=10)
    ap.add_argument('--top', type=int, default=15)
    ap.add_argument('--log')
    o = ap.parse_args()
    if not Path(o.src).exists():
        print(f'missing: {o.src}', file=sys.stderr)
        return 2
    hits, total, n = [], 0, 0
    win, cand = {}, {}

    def evaluate(j):
        nonlocal total
        m = blink_mask(win, cand, j, o.lo, o.radius, o.min_pixels)
        cnt = int(m.sum())
        if cnt:
            ys, xs = np.nonzero(m)
            hits.append((j, cnt, (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))))
            total += cnt

    last = None
    for k, f in frames(o.src, o.fps):
        n += 1
        last = k
        win[k] = f
        if k - 2 in win:
            cand[k - 1] = candidates(win[k - 2], win[k - 1], f, o.hi, o.lo)
        j = k - BACK                       # frames up to j + BACK are read, cand up to j + 1 known
        if j in cand:
            evaluate(j)
        for old in [i for i in win if i < k - 2 * BACK]:
            del win[old]
        for old in [i for i in cand if i < k - 2 * BACK]:
            del cand[old]
    if last is not None:
        for j in range(last - BACK + 1, last):
            if j in cand:
                evaluate(j)
    lines = [f'{o.src}: {n} frames read (hi {o.hi}, lo {o.lo}, radius {o.radius}, min-pixels {o.min_pixels}, rows >= {EXCLUDE_FROM_ROW} excluded)']
    for kb, cnt, box in sorted(hits, key=lambda h: -h[1])[:o.top]:
        lines.append(f'  blink at frame {kb} (t = {kb / o.fps:.3f} s): {cnt} pixels, box x {box[0]}-{box[2]}, y {box[1]}-{box[3]}')
    if len(hits) > o.top:
        lines.append(f'  ... {len(hits) - o.top} more frames')
    lines.append(f'blink frames: {len(hits)}, blink pixels: {total}')
    lines.append('PASS: no one-frame blinks' if not hits else 'FAIL: one-frame blinks found')
    text = '\n'.join(lines)
    print(text)
    if o.log:
        Path(o.log).write_text(text + '\n')
    return 0 if not hits else 1


if __name__ == '__main__':
    sys.exit(main())
