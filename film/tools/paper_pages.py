#!/usr/bin/env python3
"""Extract original vector pages from the cited 166-page manuscript.

Usage: paper_pages.py MANUSCRIPT.pdf
Poppler preserves the page glyph outlines in SVG. The film shows the stack
small, static and unzoomed, with page one at the front. The separate title
and short attributed quotation are typeset in the house style.
"""
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'scenes' / 'paper'
EDITION_SHA256 = '0e779481c4da40bd28d1e642e1d8ca57447d129610df28dfa5a11e9af8ae228f'
URL = 'https://cdn.openai.com/pdf/32d9f210-8b73-45e0-91bc-82a30aef8a9a/navier-stokes.pdf'


def main():
    pdf = Path(sys.argv[1]).resolve()
    digest = hashlib.sha256(pdf.read_bytes()).hexdigest()
    if digest != EDITION_SHA256:
        raise SystemExit('Input does not match the cited 166-page edition: ' + digest)
    info = subprocess.run(['pdfinfo', str(pdf)], capture_output=True, text=True, check=True).stdout
    count = int(re.search(r'Pages:\s+(\d+)', info)[1])
    pw, ph = map(float, re.search(r'Page size:\s+([\d.]+) x ([\d.]+)', info).groups())
    if count != 166:
        raise SystemExit('Expected 166 pages')
    vectors = OUT / 'vector'
    vectors.mkdir(parents=True, exist_ok=True)
    for n in range(1, count + 1):
        subprocess.run(['pdftocairo', '-svg', '-f', str(n), '-l', str(n), str(pdf),
                        str(vectors / f'p{n:03d}.svg')], check=True)
    meta = dict(source='OpenAI, Finite Time Blowup for Navier–Stokes (2026), 166-page edition',
                url=URL, sha256=digest, count=count, width_pt=pw, height_pt=ph,
                closeups=[], representation='original vector pages; static stack; first page in front; small and unzoomed')
    (OUT / 'pages.json').write_text(json.dumps(meta, indent=2) + '\n')
    print(f'{count} original vector pages; edition {digest}')


if __name__ == '__main__':
    main()
