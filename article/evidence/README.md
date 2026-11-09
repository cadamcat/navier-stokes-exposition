# Computations and source audit, version 1.1

Yao Xu, 7 November 2026. Companion evidence for *A smooth force and a singular
fluid*. This directory is part of the article distribution. Keep it beside
the article and its source ledger when sharing the text. No public archival
deposit URL or DOI has been assigned.

The [content manifest](MANIFEST.json) identifies every file in this package by
SHA-256. It fixes the contents of version 1.1 without claiming that the package
has already been publicly hosted. The original mathematical output records
are included, rather than a summary of their values alone.

## Exact calculations

- [Calculation script](verify/check_identities.py), [original results](verify/identities.json)
  and [environment record](verify/environment.json): core scale powers,
  similarity-coordinate identities, polynomial residual and curl identities,
  parabolic/viscosity scaling, and quadratic-irrational small-divisor algebra.
- [Negative-control log](verify/identities-negative.log): deleting one radial
  dimension in a disposable copy makes the core-volume check fail by name.
- [Process receipts](verify/acceptance.json): original timestamps and exit
  statuses for all three bounded verification processes, including the exact
  calculation run. SymPy 1.14.0 was used for the symbolic calculations.

From this directory, with Python and SymPy 1.14.0 installed, run
`python3 verify/check_identities.py` to recompute the algebra. The script prints
JSON to standard output and writes its new environment record. Copy the package
first if preserving the distributed evidence bytes is required. Its report's
coarse inequality on h is not a sufficient parameter-admissibility test; the
article uses the full manuscript schedule and keeps h symbolic.

## Source audit

- [Audit script](verify/source_audit.py), [original output](verify/source-audit.json)
  and [negative-control log](verify/source-audit-selftest.log).
- [MathDB record snapshots](refs/mathdb-formalizations.json) and
  [frozen definition source](refs/formal-conjectures-NavierStokes.lean).
- [Compiler version output](verify/lean-environment.log). The inspected proof
  pins Lean 4.34.0-rc2, while the available compiler reported Lean 4.34.1.
  No Lean build, elaboration, axiom replay or kernel execution was attempted
  for this article.

The audit reads project sources at
[`f9e8bc5b38b6e212696e8a30e3e91517af887bbd`](https://github.com/openai/NavierStokesAndEuler/tree/f9e8bc5b38b6e212696e8a30e3e91517af887bbd).
To reproduce, obtain that exact Git revision as `refs/NavierStokesAndEuler`
under a copy of this directory. Run `python3 verify/source_audit.py --self-test`
and then `python3 verify/source_audit.py`. No Lean dependency download or build
is needed. The script records Git revision identity in its output, enumerates
the project's actual imports, and compares the eleven predicate bodies with
the supplied reference snapshots. External library bodies are excluded.

The source and algebra checks do not prove profile existence, positivity,
stress-cone realizability, pulse estimates, all-order summation or whole-space
uniqueness. Their process exits are not Lean acceptance receipts.

## Manuscript versions

The [archive index](refs/openai-manuscript-archive-index.json),
[retrieval records](refs/manuscript-retrievals.jsonl),
[version results](verify/manuscript-versions.json),
[extracted-text diff](verify/openai-navier-stokes-20260908172948-current.diff)
and [word changes](verify/openai-navier-stokes-20260908172948-word-changes.json)
retain the original comparison records.

The records identify two decoded PDF editions: 165 pages, SHA-256
`8c8a94ad9ac824c8b605b9827cadf7beaca48bd10b380de3cfc872a2c37afa81`,
and the cited 166-page edition, SHA-256
`0e779481c4da40bd28d1e642e1d8ca57447d129610df28dfa5a11e9af8ae228f`.
The retrieval records give the publisher and archive URLs. PDFs are not
duplicated in this package. Two wire captures were HTTP-gzipped; compare
decoded PDFs when identifying editions. This archive query does not establish
that every intermediate version was captured, or that every edit is harmless.

## Metadata transformations

Scripts and mathematical result JSON are copied without changes. In process
receipts and the environment record only absolute interpreter names are replaced
with portable Python executable names. The negative-control traceback retains
its relative file and line locators, with the absolute temporary-directory
prefix removed. Exit statuses, timestamps, assertions and mathematical output
are unchanged. These copies make the evidence distributable without exposing
private filesystem locations.

In the MathDB record snapshot (`refs/mathdb-formalizations.json`), the prefix of
each record's internal `external_id` and its `source_url` into a private
backend directory are replaced. The record ids, the four Lean sources and their
SHA-256 values, which the source audit compares, are unchanged.
