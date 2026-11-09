# Lean rerun and reproduction

On 9 November 2026 we built `openai/NavierStokesAndEuler` at
`f9e8bc5b38b6e212696e8a30e3e91517af887bbd` on a rented cloud Linux VM
with 8 vCPUs and 50 GB RAM. The project pins Lean `v4.34.0-rc2`, Mathlib
`85e3a25e006c35636f0e53b0e9296caca2685bc0`, and Comparator
`19e111e2141cf333c7daff0f64c5f24acc91dd2e`.

Mathlib's compiled files came from `lake exe cache get` (exit 0).
`lake build` built the project from source and exited 0: 11,424 jobs in
103 minutes 23.528 seconds wall time. The four `sorry` warnings come from
challenge placeholders in `ComparatorChallenges/`, outside the solution imports.
A file importing `NavierStokes.ComparatorSolution` printed both endpoint axiom
lists: exactly `propext`, `Classical.choice`, `Quot.sound` (exit 0).
The repository's Comparator configuration compared the challenge and solution
statements and both nanoda and Lean's default kernel accepted (exit 0).

The [runner, logs and exit receipts](../article/evidence/README.md#lean-rerun)
replace the former build-feasibility limitation. The retained
[compiler-version output](lean-environment.log) and [Python receipts](acceptance.json)
describe the earlier source/algebra checks, not the rerun.

To repeat the recorded commands, obtain the pinned source and its toolchain,
then run from that source root:

```sh
lake exe cache get
lake build
cat > Axioms.lean <<'LEAN'
import NavierStokes.ComparatorSolution
#print axioms NavierStokes.Comparator.navier_stokes_breakdown_periodic
#print axioms NavierStokes.Comparator.navier_stokes_breakdown_R3
LEAN
lake env lean Axioms.lean
lake exe comparator ComparatorChallenges/NavierStokes.json
```

The last command needs landrun, lean4export and nanoda_bin on PATH. Recorded
versions and the Comparator trust boundary are in [VERIFY.md](../VERIFY.md#own-lean-rerun).
The recorded runner includes tool installation commands; it is an execution
record, not a dependency installer for this exposition's build.
