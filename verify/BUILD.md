# Build feasibility and verification scope

Source: `refs/NavierStokesAndEuler`, detached at
`f9e8bc5b38b6e212696e8a30e3e91517af887bbd`.

The exact project requires Lean `v4.34.0-rc2`, Mathlib
`85e3a25e006c35636f0e53b0e9296caca2685bc0`, and Comparator
`19e111e2141cf333c7daff0f64c5f24acc91dd2e`.

The available Lean installation reports Lean `4.34.1`; see `lean-environment.log`.
We did not change the project's pins or install an alternative dependency set.

Cost estimate before deciding: the final submission's lexical project import
closure has 609 files, about 20 MB and 382,514 source lines, plus Mathlib and
other dependencies. A cold reproduction should be budgeted in hours and several GB of
cache/build disk, not as a single-file check. With four elaborator processes,
an assumed 2–4 GB each would mean 8–16 GB; this is an estimate, not a measured
peak or a guarantee below 24 GB. An exact compatible pilot would be required
before a full local build. The toolchain incompatibility prevents that pilot.

No local `lake build`, cache download, `#print axioms`, `leanchecker`, Comparator,
or independent kernel replay was run. There is consequently no local Lean
acceptance exit status or local axiom output. `lake --version` exited 0; that
only checks the environment. A full build log was not created.

Own acceptance checks are the Python source audit and symbolic computations,
whose actual command exit statuses are recorded in `acceptance.json`. Neither
is a substitute for Lean verification.
