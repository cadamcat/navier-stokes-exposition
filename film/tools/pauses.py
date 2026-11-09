#!/usr/bin/env python3
"""Pause statistics of the narration, from audio/cN.beats.json (word times) and its inserted silences.

Usage: pauses.py [--json out.json]
A pause is the time from the end of a word that closes a sentence (. ? ! ;) to the start of the next
word. It is a paragraph pause when the next word starts a new paragraph of the script, a passage
join where two speech passages meet, otherwise a sentence pause. Comma pauses are listed apart.
For each pause, the part that is inserted silence (narrate.py, with its reason) is reported
separately from the voice's own part. Also prints the share of the film with no word sounding."""
import argparse, json, re, statistics
from pathlib import Path

AUDIO = Path(__file__).resolve().parents[1] / 'audio'
CHAPTERS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11']


def q(xs):
    if not xs:
        return '-'
    xs = sorted(xs)
    pick = lambda f: xs[min(len(xs) - 1, int(round(f * (len(xs) - 1))))]
    return (f'n={len(xs)} min {xs[0]:.2f} p25 {pick(.25):.2f} median {statistics.median(xs):.2f} '
            f'p75 {pick(.75):.2f} max {xs[-1]:.2f} s')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json')
    a = ap.parse_args()
    kinds = {'sentence': [], 'paragraph': [], 'passage join': [], 'comma': []}
    natural = {'sentence': [], 'paragraph': [], 'passage join': [], 'comma': []}
    inserted_all, total, spoken = [], 0.0, 0.0
    rows = []
    for ch in CHAPTERS:
        m = json.loads((AUDIO / f'{ch}.beats.json').read_text())
        total += m['duration']
        ins = m.get('inserted', [])
        inserted_all += [dict(d, chapter=ch) for d in ins]
        words = []
        for b in m['beats']:
            for i, w in enumerate(b['words']):
                words.append((w, b['paragraph']))
        spoken += sum(w['end'] - w['start'] for w, _ in words)
        for (w, pa), (nx, pb) in zip(words, words[1:]):
            if re.search(r'[.?!;]["”]?$', w['word']):
                kind = 'sentence' if pa == pb else ('paragraph' if pa.split('.')[0] == pb.split('.')[0] else 'passage join')
            elif w['word'].endswith(',') or w['word'].endswith(':'):
                kind = 'comma'
            else:
                continue
            gap = nx['start'] - w['end']
            added = sum(d['seconds'] for d in ins if w['end'] - 1e-3 <= d['at'] <= nx['start'] + 1e-3)
            kinds[kind].append(gap)
            natural[kind].append(gap - added)
            rows.append(dict(chapter=ch, kind=kind, after=w['word'], at=w['end'], pause=round(gap, 3), inserted=round(added, 3)))
    for k in kinds:
        print(f'{k:13s} total   {q(kinds[k])}')
        print(f'{"":13s} voice   {q(natural[k])}')
    print('inserted silences:')
    for d in inserted_all:
        print(f"  {d['chapter']} at {d['at']:.2f} s: {d['seconds']:.2f} s, {d['where']}; {'; '.join(d['reason'])}")
    ins_total = sum(d['seconds'] for d in inserted_all)
    print(f'length {total:.1f} s; inserted {ins_total:.2f} s ({100 * ins_total / total:.1f} %); '
          f'no word sounding {100 * (1 - spoken / total):.1f} % (word spans from transcription)')
    if a.json:
        Path(a.json).write_text(json.dumps(dict(pauses=rows, inserted=inserted_all, length=total), indent=1))


if __name__ == '__main__':
    main()
