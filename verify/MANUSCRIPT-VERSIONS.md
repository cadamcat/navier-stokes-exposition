# Manuscript editions recovered

The publisher's PDF URL is mutable and has no author-supplied version identifier.
We queried the Wayback CDX index for that exact URL, all status-200 captures,
collapsing adjacent repeated digests. The saved JSON is
`refs/openai-manuscript-archive-index.json`; its full request URL and retrieval
time are in `refs/retrievals.jsonl`.

The index returned eight rows from 8–21 September, representing four distinct
CDX SHA-1 digests. We retrieved one capture for each distinct digest. Two are
HTTP-gzipped representations of the other two. This distinction was checked:
for the compressed responses the SHA-1 of the retained `.http-gzip` bytes equals
the indexed digest; after decompression their PDF SHA-1 equals the corresponding
uncompressed indexed digest. Thus the four digest families yield **two distinct
PDF editions**, not four mathematical revisions.

| Requested capture UTC | Representation | Decoded PDF pages | Decoded PDF SHA-256 |
|---|---|---:|---|
| 2026-09-08 17:29:48 | gzip; wire digest `WWUKEWRORNMZ4VJYAGCLZXOJA4Y5IPUF` | 165 | `8c8a94ad9ac824c8b605b9827cadf7beaca48bd10b380de3cfc872a2c37afa81` |
| 2026-09-08 17:49:13 | PDF; digest `WSIIJZR6QSWEBHZUHFW6FMDRNCMO3FAJ` | 165 | `8c8a94ad9ac824c8b605b9827cadf7beaca48bd10b380de3cfc872a2c37afa81` |
| 2026-09-08 20:04:49 | gzip; wire digest `YAPKQY6XVKZZSJ5WJV6FJUWHQPVDTD3M` | 166 | `0e779481c4da40bd28d1e642e1d8ca57447d129610df28dfa5a11e9af8ae228f` |
| 2026-09-12 20:04:15 | PDF; digest `CXUZKARRZ2PXCGU2V3WSN3NZVDQOWQY7` | 166 | `0e779481c4da40bd28d1e642e1d8ca57447d129610df28dfa5a11e9af8ae228f` |

All decoded copies and their extracted text are saved under
`refs/openai-navier-stokes-TIMESTAMP.*`. The 166-page edition is byte-identical
to the current publisher PDF fetched on 7 November. The capture date is evidence
of availability by that capture, not necessarily the precise time a revision was
first published. An archive cannot prove it captured every intermediate version;
these are all distinct editions recovered from this query.

The earlier edition has 16 references; the later edition has 22. The expanded
historical discussion credits Córdoba–Martínez-Zoroa and
Córdoba–Martínez-Zoroa–Zheng and related earlier amplification/pulse work. The
later bibliography also adds Craik–Criminale, including background-wave context.
Text extraction has substantial reflow, pagination and figure-placement changes.
`verify/openai-navier-stokes-20260908172948-current.diff` and the corresponding
word-change JSON preserve the full comparison, not just selected examples.

Theorem 1.1 has the same force, initial-rest, support, energy, blowup and
nonexistence assertions in the two recovered editions. The later edition is the
one used for all mathematical and page citations in VERIFY.md. No claim that
every line-level mathematical edit is harmless has been established by the
textual comparison. In particular this is not a retrospective referee report
on both editions.

The Lean repository has a separate two-commit history, pinned in
`verify/provenance.json`: `8937a8f…` (8 Sep.) and `f9e8bc5…` (10 Sep.). This is
not a manuscript-version numbering scheme. The code changed substantially even
where final theorem types did not. Build evidence is tied to its own Git SHA.

The announcement page also records a 10 September update to its discussion of
concurrent work. It must not be assumed that its current wording is identical
to the first 8 September announcement.
