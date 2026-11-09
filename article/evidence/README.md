# Computations, source audit and Lean rerun, version 1.1.0

Yao Xu. Companion evidence for *A smooth force and a singular
fluid*. This directory is part of the article distribution. Keep it beside
the article and its source ledger when sharing the text. No public archival
deposit URL or DOI has been assigned.

The [content manifest](MANIFEST.json) identifies every file in this package by
SHA-256. It fixes the contents of version 1.1.0 without claiming that the package
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
  This is the environment of the earlier source/algebra checks; the Lean rerun
  below used the pinned toolchain.

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

## Lean rerun

On 9 November 2026 we reran the pinned development on a rented cloud Linux VM
with 8 vCPUs and 50 GB RAM. The records are:

- [Commit](lean-rerun/commit.txt), [toolchain](lean-rerun/toolchain.txt),
  [runner](lean-rerun/runner.sh) and [run log](lean-rerun/runner.log).
- [Mathlib cache log](lean-rerun/cache.log): `lake exe cache get`, exit 0.
- [Build log](lean-rerun/build.log) and [exit receipt](lean-rerun/build.exit):
  `lake build`, exit 0, 11,424 jobs, `103m23.528s` wall time. Mathlib's compiled
  files came from its binary cache; the project was built from source. The four
  `sorry` warnings are challenge placeholders outside the solution import closure.
- [Axiom output](lean-rerun/axioms.log) and [exit receipt](lean-rerun/axioms.exit):
  the file importing `NavierStokes.ComparatorSolution` prints exactly `propext`,
  `Classical.choice`, `Quot.sound` for each endpoint, exit 0.
- [Comparator log](lean-rerun/comparator.log) and [exit receipt](lean-rerun/comparator.exit):
  `lake exe comparator ComparatorChallenges/NavierStokes.json`, exit 0;
  challenge and solution statements compared, nanoda and Lean's default kernel
  accept, “Your solution is okay!”.

Comparator used landrun v0.1.17 from `go install`, lean4export
`df81913eee5519d5a88ae5b0fd701b5298cc29ab` built with the project toolchain,
and nanoda_lib `0da9f98feadd3a0a2ef4b3dbcf52a298a6fef929` built with
`cargo build --release`, using rustc 1.99.1. The additional landrun checkout
revision in the log identifies a separate checkout, not the installed binary.
The runner's `@latest` tool installations describe the recorded run; the log's
resolved versions identify what was actually used.

Comparator's [README](https://github.com/leanprover/comparator/blob/19e111e2141cf333c7daff0f64c5f24acc91dd2e/README.md)
sets out its trust assumptions. The runner uses the project's configured command
after a full build, without the README's additional unprivileged-isolation setup.

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

The source/algebra scripts and mathematical result JSON are copied without changes. In process
receipts and the environment record only absolute interpreter names are replaced
with portable Python executable names. The negative-control traceback retains
its relative file and line locators, with the absolute temporary-directory
prefix removed. Exit statuses, timestamps, assertions and mathematical output
are unchanged. The Python receipt scope label is clarified to distinguish it
from the later Lean rerun; its process records are unchanged. These copies make the evidence distributable without exposing
private filesystem locations.

In the Lean rerun logs only environment-specific filesystem locations and PATH
values are replaced by `<run-root>`, `<home>`, `<temporary-file>`,
`<cache-root>` and `<environment-path>`. Commands, timestamps, compiler/tool
versions, warnings, axiom lists and exit statuses are unchanged. In the runner,
the original fixed execution directory is replaced by the required
`RERUN_ROOT` variable, and its environment-specific comment is generalized.
The manifest records the SHA-256 of each supplied original as well as the
SHA-256 of the distributed copy. Intermediate status snapshots and checksums
of undistributed transport archives are omitted.

In the MathDB record snapshot (`refs/mathdb-formalizations.json`), the prefix of
each record's internal `external_id` and its `source_url` into a private
backend directory are replaced. The record ids, the four Lean sources and their
SHA-256 values, which the source audit compares, are unchanged.
