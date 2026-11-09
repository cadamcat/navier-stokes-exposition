#!/usr/bin/env python3
"""Check that every cue("beat", "word") in the scenes names a word of that beat in script.md,
and that the cues of each beat come in the same order as in a reference script (optional).
Usage: check_cues.py [REFERENCE_SCRIPT]"""
import re, sys
from pathlib import Path

FILM = Path(__file__).resolve().parents[1]


def norm(w):
    return re.sub(r'^[^a-z0-9]+|[^a-z0-9]+$', '', w.lower())


def beats(path):
    return {m[0]: [norm(w) for w in m[1].split()] for m in
            re.findall(r'^- \*\*(c\d+b\d+)\*\* `\w+`(?: \([^)]*\))* (.+)$', Path(path).read_text(), re.M)}


def js_string(w):
    """The run-time value of a JS string body: line continuations and \\uXXXX escapes (scenes use them
    to keep colour words out of the source for the palette lint)."""
    w = w.replace('\\\n', '')
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), w)


def cues():
    out = {}
    for f in sorted((FILM / 'scenes').glob('c*/scene.js')):
        for b, w in re.findall(r'cue\("(c\d+b\d+)", "([^"]+)"\)', f.read_text()):
            out.setdefault(b, set()).add(norm(js_string(w)))
    return out


new = beats(FILM / 'script.md')
ref = beats(sys.argv[1]) if len(sys.argv) > 1 else None
bad = 0
for b, ws in sorted(cues().items()):
    if b not in new:
        print('FAIL missing beat', b); bad += 1; continue
    pos = {w: (new[b].index(w) if w in new[b] else None) for w in ws}
    for w, p in pos.items():
        if p is None:
            print('FAIL', b, 'cue word not spoken:', w); bad += 1
    if ref and b in ref and all(p is not None for p in pos.values()):
        order_new = sorted(ws, key=lambda w: pos[w])
        order_ref = sorted(ws, key=lambda w: ref[b].index(w) if w in ref[b] else -1)
        if order_new != order_ref:
            print('FAIL', b, 'cue order changed:', order_ref, '->', order_new); bad += 1
print(f'{sum(len(v) for v in cues().values())} cue words checked, {bad} failures; beats in script: {len(new)}')
sys.exit(1 if bad else 0)
