#!/usr/bin/env python3
"""Measure how much of a narration is silent.

Usage: silence.py AUDIO.wav [BEATS_DIR]
Energy figure: share of 50 ms windows whose RMS is more than 40 dB below the loudest 5 % of windows.
Word figure (with BEATS_DIR holding c1..c11.beats.json): share of time covered by no word [start, end].
"""
import json, sys
from pathlib import Path
import numpy as np
import soundfile as sf


def energy_silence(x, sr):
    if x.ndim > 1:
        x = x.mean(axis=1)
    n = int(0.05 * sr)
    w = x[: len(x) // n * n].reshape(-1, n)
    db = 20 * np.log10(np.sqrt((w ** 2).mean(axis=1)) + 1e-9)
    ref = np.percentile(db, 95)
    return float((db < ref - 40).mean()), len(x) / sr


def word_silence(beats_dir, total):
    covered, off = 0.0, 0.0
    for ch in ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11']:
        d = json.loads((Path(beats_dir) / f'{ch}.beats.json').read_text())
        for b in d['beats']:
            covered += sum(w['end'] - w['start'] for w in b['words'])
    return 1 - covered / total


if __name__ == '__main__':
    x, sr = sf.read(sys.argv[1])
    s, total = energy_silence(x, sr)
    print(f'duration {total:.1f} s; energy silence {100 * s:.1f} %')
    if len(sys.argv) > 2:
        print(f'no word sounding {100 * word_silence(sys.argv[2], total):.1f} %')
