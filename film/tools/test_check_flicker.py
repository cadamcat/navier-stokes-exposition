#!/usr/bin/env python3
"""Named failing case for check_flicker.py.

Usage: python3 tools/test_check_flicker.py SCRATCH_DIR

Writes two synthetic 1920x1080 sequences of 12 frames into SCRATCH_DIR and runs the checker on each:
  blink/    a static grey axis crossed by a blue grid line, thin bars moving 1, 2 and 11 px per
            frame and strokes moving 37 and 70 px per frame (motion, not
            blinks), a one-frame blink inside the subtitle band
            (excluded), and at frame 6 only a 60 x 6 px stretch of the axis that turns blue
            (the z-fighting pattern). Expected: exit 1, exactly one blink frame, frame 6.
  control/  the same sequence without the frame-6 blink. Expected: exit 0.
The test prints PASS when both outcomes are as expected, and exits 1 otherwise.
"""
import re, subprocess, sys
from pathlib import Path

import numpy as np

TOOLS = Path(__file__).resolve().parent
PAPER = (246, 243, 236)
GREY = (120, 116, 108)
BLUE = (52, 101, 164)
INK = (40, 38, 34)


def frame(k, blink):
    img = np.empty((1080, 1920, 3), np.uint8)
    img[:] = PAPER
    img[498:502, 300:1600] = GREY                 # the axis
    img[200:800, 958:962] = BLUE                  # a grid line crossing it
    x = 400 + 2 * k
    img[300:700, x:x + 3] = INK                   # thin bar moving 2 px per frame
    y = 150 + k
    img[y:y + 2, 1200:1500] = INK                 # thin bar moving 1 px per frame
    x = 1000 + 11 * k
    img[600:800, x:x + 3] = BLUE                  # thin bar moving 11 px per frame
    x = 100 + 37 * k
    img[820:826, x:x + 120] = INK                 # a short thick stroke moving 37 px per frame (a sliding title)
    x = 40 + 70 * k
    img[860:863, x:x + 30] = INK                  # a thin dash moving 70 px per frame
    if k == 4:
        img[940:960, 800:900] = BLUE              # one-frame blink in the subtitle band: excluded
    if blink and k == 6:
        img[498:502, 600:660] = BLUE              # one-frame blink on the axis
        img[497:503, 600:660] = BLUE
    return img


def run(dirpath):
    res = subprocess.run([sys.executable, str(TOOLS / 'check_flicker.py'), str(dirpath)], text=True, capture_output=True)
    print(res.stdout.strip())
    return res


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    root = Path(sys.argv[1])
    ok = True
    for name, blink in (('blink', True), ('control', False)):
        d = root / name
        d.mkdir(parents=True, exist_ok=True)
        raw = b''.join(frame(k, blink).tobytes() for k in range(12))
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1920x1080', '-i', '-',
                        '-start_number', '0', str(d / 'f%05d.png')], input=raw, check=True)
        res = run(d)
        frames = [int(m) for m in re.findall(r'blink at frame (\d+)', res.stdout)]
        if blink:
            good = res.returncode == 1 and frames == [6]
        else:
            good = res.returncode == 0 and frames == []
        print(f'{name}: exit {res.returncode}, blink frames {frames} -> {"as expected" if good else "UNEXPECTED"}')
        ok &= good
    print('PASS: the checker flags the one-frame blink and nothing else' if ok else 'FAIL')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
