# Forced breakdown for the three-dimensional Navier–Stokes equations

Verification scope: source and statement audit, exact elementary calculations,
inspection of public verification records retrieved 7 November 2026, and our
Lean build, axiom check and two-kernel Comparator run on 9 November 2026.
The selected formal version is
`openai/NavierStokesAndEuler@f9e8bc5b38b6e212696e8a30e3e91517af887bbd`.

The comparison of the Lean statements with the official problem is the source
reading below. No counterexample to the final formal
statements was found. Two differences between intermediate paper and Lean
arguments were confirmed. The source is a claimed resolution of **forced**
alternatives C and D; it does not establish the **unforced** alternatives A or B.

## 1. What the official problem requires

The authoritative document is Charles L. Fefferman, *Existence and smoothness of
the Navier–Stokes equation*, printed pp. 1–6, including the appended errata:
[Clay PDF](https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf).
Saved original: `refs/fefferman.pdf`; extracted text: `refs/fefferman.txt`.
Its SHA-256 is
`c1b5f27b1a64705cfaf1afceea513db5deedca8a18ca56ab32e7f86445a06d0c`.

The headings on printed p. 2 are, exactly, “Breakdown of Navier–Stokes solutions
on R³” and “Breakdown of Navier–Stokes Solutions on R³/Z³”. The complete original
C/D passages are retained in the PDF, p. 2. The following is a mathematical
transcription of their requirements, rather than a reproduction of both prose
passages; full verbatim quotation is limited by quotation restrictions.

Fix any viscosity \(\nu>0\), in dimension three. In both alternatives one must
exhibit a smooth divergence-free initial velocity \(u_0\) and a smooth force
\(f\), for which there is **no** global admissible smooth pair \((u,p)\) with
those same data. The force is among the existentially chosen objects. It need
not be zero, divergence-free, small, analytic, or a predetermined physical force.

The equations, Fefferman (1)–(3), are
\[
 \partial_tu+(u\cdot\nabla)u=\nu\Delta u-\nabla p+f,
 \qquad \nabla\cdot u=0,\qquad u(x,0)=u_0(x),
 \quad x\in\mathbb R^3,\ t\geq0.
\]

| Clause | Whole space: alternative C | Periodic: alternative D |
|---|---|---|
| Initial velocity | Smooth on \(\mathbb R^3\), divergence-free | Same, and period one in each coordinate |
| (4) | For every spatial multi-index \(\alpha\) and every decay order \(K\), \(|\partial_x^\alpha u_0(x)|\le C_{\alpha K}(1+|x|)^{-K}\) | Replaced by smooth periodic data |
| Force domain | \(\mathbb R^3\times[0,\infty)\), including the putative singular time and all later times | Same, spatially periodic |
| (5) | Every mixed derivative satisfies \(|\partial_x^\alpha\partial_t^m f(x,t)|\le C_{\alpha mK}(1+|x|+t)^{-K}\), uniformly in \(x,t\ge0\) | Replaced by (9) |
| (8) | Not imposed | \(u_0(x+e_j)=u_0(x)\), \(f(x+e_j,t)=f(x,t)\) |
| (9) | Not imposed | \(|\partial_x^\alpha\partial_t^m f(x,t)|\le C_{\alpha mK}(1+t)^{-K}\), uniformly in space and nonnegative time |
| Smooth solution, (6)/(11) | \(u,p\in C^\infty(\mathbb R^3\times[0,\infty))\) | Same |
| Energy, (7) | One finite bound for \(\int_{\mathbb R^3}|u(x,t)|^2dx\) at **all** \(t\ge0\) | No separate whole-space energy condition; a nonzero periodic lift is generally not in \(L^2(\mathbb R^3)\) |
| (10) and errata | Not imposed | Velocity and pressure period one in every spatial direction |
| Breakdown conclusion | No pair satisfying (1),(2),(3),(6),(7) for all nonnegative time | No pair satisfying (1),(2),(3),(10),(11), including the pressure correction, for all nonnegative time |

The constants may depend on derivative indices and decay order, but not on the
space-time point. Smoothness is joint in position and time, with the usual
one-sided interpretation at time zero. No decay of a **competing solution's**
velocity derivatives or pressure is added in C. Conditions on initial data and
force must not be silently transferred to the class of solutions being excluded.

The errata, PDF p. 6, explicitly add pressure periodicity. They also correct a
weak-form identity; the latter is irrelevant to these classical PDE endpoints.
The errata's equation numbering is stale: the second correction is a weak
integral identity, although (10) in the displayed statement is periodicity.
Use the content of each correction, not that number alone.

The official negative conclusion is nonexistence of a global admissible smooth
solution. An explicit finite-time velocity singularity is a way to prove it;
it is not itself the full logical conclusion. One must also exclude a different
global smooth solution for the **same** force and data. Weak solutions and their
possible continuations are a separate question.

## 2. The pinned Lean statements and their meaning

Original source is cloned at `refs/NavierStokesAndEuler`. The two requested
declarations are

- `NavierStokes.ComparatorBridge.navier_stokes_breakdown_R3`,
  `NavierStokes/ComparatorR3Theorem.lean`, lines 38–44;
- `NavierStokes.ComparatorBridge.navier_stokes_breakdown_periodic`,
  `NavierStokes/ComparatorTheorem.lean`, lines 47–53.

The submission module `NavierStokes/ComparatorSolution.lean`, lines 16–27,
exposes the same propositions as
`NavierStokes.Comparator.navier_stokes_breakdown_R3` and
`NavierStokes.Comparator.navier_stokes_breakdown_periodic`. Its lines 31–32
request their axiom lists. These named endpoints, rather than every intermediate
lemma of the paper, are what our Comparator run and the external records check.

The mathematical shape of C is
\[
 \forall\nu>0\;\exists u_0,f:\quad
 \operatorname{InitialDecay}(u_0)\land\operatorname{ForceDecay}(f)
 \land\neg\exists v,p\;\operatorname{SmoothFiniteEnergySolution}(\nu,u_0,f,v,p).
\]
D replaces the three predicates with their periodic versions. Neither has an
unproved profile assumption, residual assumption, or conditional construction
hypothesis in its binder list. Helper theorems earlier in those files are
conditional on candidates; the final theorems discharge those candidates.

The final C bridge obtains the fields from `NavierStokesR3.theorem_1_1`, in
`NavierStokes/R3/Theorem.lean`, lines 46–49, and applies
`NavierStokesR3.comparator_of_breakdown`. The final D bridge obtains them from
`PeriodicPaper.periodic_corollary`. Its periodic candidate and competitor
structures are in `NavierStokes/PeriodicPaperTheorem.lean`. Internal fields use
`(t,x)`; the comparator uses curried `f x t`. Bridges convert that order.

### Clause correspondence

All locations below refer to `NavierStokes/ComparatorDefinitions.lean` at the
pinned commit. `verify/source-audit.json` records the exact definition-body
comparisons and module closures.

| Official clause | Formal encoding | Assessment and direction |
|---|---|---|
| Dimension 3 | `EuclideanSpace ℝ (Fin 3)` in each final theorem | Standard Euclidean three-space; not arbitrary dimension |
| Every positive viscosity | `(ν : ℝ) (hν : ν > 0)` | Universal, not one selected value |
| Initial incompressibility and smoothness | `InitialVelocityCondition.div_free`, `.smooth` | Divergence is trace of the spatial Fréchet derivative; `ContDiff ℝ ∞` |
| (4) | `InitialVelocityConditionDecay.decay` | Operator norm of the full derivative tensor of order `m`; all real `K` |
| Force smoothness | `ForceCondition.smooth` | `ContDiffOn ℝ ∞` on `univ ×ˢ Ici 0` |
| (5) | `ForceConditionDecay.decay` | Joint space-time derivative tensor, using `iteratedFDerivWithin` on that same domain; denominator `(1 + ‖x‖ + t)^K` |
| (1), time derivative | `NavierStokesExistenceAndSmoothness.navier_stokes` | `derivWithin (v x ·) (Ici 0) t`, including time zero |
| (1), convection | Same field, `fderiv ℝ (v · t) x (v x t)` | Spatial Jacobian applied to velocity, hence \((v\cdot\nabla)v\) |
| (1), viscosity and pressure | Same field, `ν • Δ (v · t) x - gradient (p · t) x` | Vector Laplacian and scalar gradient in the Euclidean inner product |
| (2) | `.div_free` | At all positions and nonnegative times |
| (3) | `.initial_condition` | Same existential datum, pointwise at time zero |
| (6)/(11) | `.velocity_smooth`, `.pressure_smooth` | Joint within-domain \(C^\infty\); negative-time values unused |
| (7), actual finite energy | `NavierStokesExistenceAndSmoothnessRn.integrable` | `MemLp (‖v · t‖) 2` at each time |
| (7), one uniform bound | `.globally_bounded_energy` | `∃ E, ∀ t ≥ 0, (∫ x, ‖v x t‖ ^ 2) < E` |
| (8) | `IsOnePeriodic` and periodic initial/force fields | Translation by `EuclideanSpace.single i 1`; torus is \(\mathbb R^3/\mathbb Z^3\), not a \(2\pi\)-periodic normalization |
| (9) | `ForceConditionPeriodic.decay` | Joint derivative tensors, uniform in space, denominator `(1+t)^K` |
| (10) | `NavierStokesExistenceAndSmoothnessPeriodic.isOnePeriodic_velocity` | At every nonnegative time |
| Pressure erratum | `.isOnePeriodic_pressure` | Explicit; no zero-mean pressure normalization added |
| Nonexistence | `¬ (∃ v p, …)` | Same force/data in the excluded class, not merely failure of the constructed branch |

Full derivative tensor bounds imply individual mixed-partial bounds by evaluation
on coordinate unit vectors. Conversely, finitely many coordinate bounds at a
fixed derivative order control the tensor norm, with a dimension/order dependent
constant. Thus these are equivalent finite-dimensional decay formulations after
changing constants. The real `K` quantifier is apparently stronger than a
nonnegative-integer formulation but is equivalent here: choose an integer at
least \(\max(K,0)\), since each base is at least one. These comparisons use
ordinary real powers; there is no natural-number division inside a cast.

`ContDiffOn` and within derivatives are an encoding of boundary smoothness, not
an additional decay condition. Restricting an ambient smooth Clay competitor
gives the required within smoothness. If one interprets smoothness on a closed
half-space via extendibility, the general converse is a smooth extension issue;
our inspection does not reprove that library result. The constructed force has
the stronger internal property of ambient smoothness and positive-time compact
support, so the witness has no time-zero extension difficulty. Spatial slices
are smooth, making the zero defaults of `fderiv` at nonsmooth points irrelevant.

The explicit `MemLp` field is essential: Lean's real Bochner integral has a
default value at nonintegrable functions. A bare real-integral inequality would
not alone express physical finite energy. Finite physical Lebesgue energy and
smoothness imply this field, so it does not improperly shrink the intended
competitor class. Strict `< E` instead of `≤ E` is equivalent after increasing
the constant. The missing factor \(1/2\) in kinetic energy also changes only the
constant. D imposes no such whole-space integrability or uniform energy field.

The source definitions and quantifier directions match the corrected Clay
requirements on this reading. This is a mathematical source comparison, not a
new machine-checked equivalence theorem or expert certification of every Mathlib
real-analysis definition.

### MathDB's four frozen targets

The public read endpoint
[`/api/posts/4da10455-6917-4dc3-9ba0-a560cc339325/lean-formalizations`](https://mathdb.com/api/posts/4da10455-6917-4dc3-9ba0-a560cc339325/lean-formalizations)
returns four records. All sources were saved as `refs/mathdb-target-N-source.lean`
and also retrieved independently from their immutable repository URLs. Every
source SHA-256 matches its record. They are `Problem.Target` abbreviations,
not four completed proofs.

| Saved target | Alternative and shape | MathDB ID |
|---|---|---|
| 1 | C: every \(\nu>0\), some decaying data/force, no smooth finite-energy global pair | `0bc5fe86-65d4-40ca-9457-ef76ceddba4e` |
| 2 | D: every \(\nu>0\), some periodic data/force, no smooth periodic global pair | `08cec2e7-3693-4edd-a98c-f416c2c7abaf` |
| 3 | A: every \(\nu>0\) and every admissible decaying datum, existence with `f := 0` | `122a7397-478c-4b6c-8f14-5b4c876edaf1` |
| 4 | B: every \(\nu>0\) and every admissible periodic datum, existence with `f := 0` | `10f93b4b-9f06-4c9b-91b4-a66fce3fcf25` |

All eleven relevant definition/structure bodies match the OpenAI comparator
after stripping comments and normalizing whitespace, despite namespace and
helper-lemma differences. The same bodies match the cited Formal Conjectures
revision `8bf45ed70d48b2b2a501de9c00b26bfa38c573ee`.
The C/D target propositions have the same quantifiers and predicates as the
submission. A/B do not follow from C/D; the existential force need not be zero.

MathDB sources pin Lean **4.33.1**, Mathlib
`0df444a360eaa60ab8c11dca51a86af692955474`, whereas the proof pins **4.34.0-rc2**
and Mathlib `85e3a25e006c35636f0e53b0e9296caca2685bc0`. Textual statement
correspondence is not a successful proof import into MathDB's older environment.
`reviewed_by` is null in the retrieved records. Any adoption or version migration
is for MathDB to document.

## 3. Build, source audit, and execution evidence

### Own Lean rerun

On 9 November 2026, on a rented cloud Linux VM with 8 vCPUs and 50 GB RAM,
we reran the development at the pinned commit with `leanprover/lean4:v4.34.0-rc2`.
The [runner and logs](article/evidence/README.md#lean-rerun) record:

- `lake exe cache get`: exit 0; Mathlib compiled files came from its binary cache.
- `lake build`: exit 0, “Build completed successfully (11424 jobs).”, wall time
  `103m23.528s`. The project was built from source.
- A file importing `NavierStokes.ComparatorSolution` and requesting `#print axioms`
  for both endpoints: exit 0; each depends on exactly `propext`, `Classical.choice`
  and `Quot.sound`.
- `lake exe comparator ComparatorChallenges/NavierStokes.json`: exit 0, with
  “nanoda kernel accepts the solution”, “Lean default kernel accepts the solution”
  and “Your solution is okay!”. This compares the solution with the repository's
  challenge statements.

The Comparator run used landrun v0.1.17 installed with `go install`, lean4export
`df81913eee5519d5a88ae5b0fd701b5298cc29ab` built with the project toolchain,
and nanoda_lib `0da9f98feadd3a0a2ef4b3dbcf52a298a6fef929` built with
`cargo build --release`, using rustc 1.99.1. These are the tools actually recorded
in `comparator.log`; the separate landrun checkout printed there is not the
source used by `go install`.

Comparator's [README](https://github.com/leanprover/comparator/blob/19e111e2141cf333c7daff0f64c5f24acc91dd2e/README.md)
states its trust assumptions. We ran the project's configured command after the
full build, without the README's additional unprivileged-isolation setup.
`verify/BUILD.md` gives the pins and reproduction commands.

### Source and algebra checks

`verify/source_audit.py` follows actual local import statements from each root,
blanks nested comments and strings, and searches code tokens. It reports:

| Root | Project modules in lexical import closure | Source lines | Forbidden code tokens |
|---|---:|---:|---:|
| `NavierStokes.ComparatorTheorem` | 604 | 382,184 | 0 |
| `NavierStokes.ComparatorR3Theorem` | 592 | 381,089 | 0 |
| `NavierStokes.ComparatorSolution` | 609 | 382,514 | 0 |

Searched tokens: `sorry`, `sorryAx`, `admit`, `axiom`, `native_decide`, `implemented_by`,
`extern`, `unsafe`. The output enumerates every project module and external
import. External library bodies and the Lean/compiler trust base were **not**
scanned by this script. An import closure overapproximates a declaration's proof
dependencies; it is not an elaborated declaration-level axiom cone.

The Navier–Stokes challenge file has two intentional `sorry` declarations
(the build warnings locate them at lines 273 and 280); two further warnings are
in the Euler challenge file at lines 85 and 170.
The challenge modules are **absent** from all three proof-root closures.
`ComparatorDefinitions.lean` supplies its definitions without those placeholders.
Finding a challenge placeholder is therefore not evidence of a hole in either
proved endpoint. Conversely, a clean lexical scan alone cannot establish kernel
acceptance, so it is not described as doing so.

Disposable negative controls detected a `sorry`, a new `axiom`, and omission of
time decay from a copied force definition; comments/string tokens were ignored.
The exact symbolic script also rejected a copied calculation missing one radial
dimension in the volume exponent. Logs: `verify/source-audit-selftest.log` and
`verify/identities-negative.log`. Commands and process exits are in
`verify/acceptance.json`.

### Upstream and independent records

The project `formalization.yaml` explicitly says its review is **self-assessed**.
It lists the two submission endpoints with axioms
`propext`, `Classical.choice`, `Quot.sound`. This upstream metadata agrees with our
printed axiom output in `article/evidence/lean-rerun/axioms.log`.
The pinned source has no `.github` workflow directory;
the retrieved upstream Actions API returned zero runs. No public upstream CI
execution record was found there.

| Record | Revision and actual evidence | Limits |
|---|---|---|
| [Rael Savitt / swarm-ai-research](https://github.com/swarm-ai-research/navier-stokes-lean-check) | Public filtered build log dated Sep. 8: 11,251 jobs, both NS endpoints on the three standard axioms; statement/definition diff | No independent kernel replay in that report; early version, not proof of the later fixed commit |
| [Sebastián Rodrigo González](https://github.com/elmismisimoxhunca/NavierStokes-OpenAI-Verification) | `verification-results.json` pins `8937a8f4cbc7abaab5e9e97d1cc7f5d2319d9538`; records exit 0 for build and both original Comparator configurations, both kernels, standard axioms | Raw logs private; metadata record, not a public signed attestation or CI replay; older revision |
| [Francesco Antonio De Luca audit](https://github.com/francescoantoniodeluca/navier-stokes-formal-audit/blob/main/FINAL_RED_TEAM_AUDIT.md) | Reports adversarial source review and Comparator exit 0, also pins `8937a8f…`; corrects two provenance claims in an earlier audit | Not an independent reproduction by us; not the selected later revision |
| [Alignment snapshot](https://github.com/mary-octavia/navier-stokes-proof/tree/main/navier-stokes-alignment/snapshots/2026-09-12) | Readme describes a conventional endpoint-to-Clay argument at `f9e8bc5…`, with boundary/operator/energy checks | Its reviewers are described as AI agents; not human peer review. Readme links include another machine's absolute paths; the linked local files were not accessible by those paths here |

We inspected these records; we did not run their scripts. Mathlib's binary
cache, the compiler, operating system and tool isolation remain part of those
records' trust assumptions.

Revision identity matters. Git shows **188 files changed, 25,143 insertions and
81 deletions** between `8937a8f…` and `f9e8bc5…`. The final propositions and
definitions retain their intended shape, but the bridge proofs and substantial
implementation changed. An early successful run cannot silently stand for the
later source tree.

## 4. Mathematical architecture and bounded checks

The retained CDN manuscript has 166 pages, author line **OpenAI**, SHA-256
`0e779481c4da40bd28d1e642e1d8ca57447d129610df28dfa5a11e9af8ae228f`.
The announcing institution and source attribution are recorded as published;
individual mathematical authors are not invented. Version evidence, including
earlier archived payloads and their availability limits, is in
`verify/MANUSCRIPT-VERSIONS.md`.

We read the architecture in §§1–3, the stated profile, iteration and completion
results, and the two disputed estimates. We did not audit every estimate in
§§4–9 or Appendices A–C. The stages carry different logical burdens:

1. **Residual formulation (§§2–3).** Define
   \(\mathcal R(u,p)=\partial_tu+(u\cdot\nabla)u-\nu\Delta u+\nabla p\).
   Defining \(f=\mathcal R\) makes a selected smooth pre-singular field solve
   the forced equation, but does not make the force smooth through the
   singular time. The proof must cancel singular terms to every derivative
   order. A force smooth only for \(t<1\) would not satisfy Clay.
2. **Anisotropic concentrating background (§4, Appendices A–C).** For
   \(\tau=1-t\), \(A=1/2+h\), \(D=1/2-h\), the coordinates satisfy
   \(\tau=q(1-\eta^2)\), \(z=q^D\eta\), \(X=r^2/(2q)\), with a fixed
   \(0<h<1/100\). Swirl and axial speeds scale as \(q^{-A}\); radial speed
   is lower order. Analytic axis profiles, a viscous heat exterior, and five
   radial moment matches must coexist with an admissible stress cone. This
   coupled profile-existence problem is a major part of the proof, not a
   consequence of dimensional analysis. The axial profile is slightly
   asymmetric; the construction is not simply an exactly reflected inflow.
3. **Annular momentum deficit (§3.2, Theorem 4.6).** The leading tangential
   residual is represented as
   \(R_\theta=-(\partial_r+2/r)T_{r\theta}\),
   \(R_z=-(\partial_r+1/r)T_{rz}\). Radial moment identities make the stress
   vanish outside a chosen annulus. The target stress must lie inside the
   positive cone generated by two realizable covariance directions. A covariance
   is not an arbitrary signed matrix: its amplitudes are squared. Appendix C
   modifies shear while repairing moments to meet that constraint.
4. **Base corrections and oscillatory pulses (§§5–7).** Axial diffusion is
   smaller by \(q^{2h}\), providing a hierarchy of axisymmetric corrections.
   Pulses are produced as curls of localized vector potentials, so divergence
   freedom survives variable cutoffs. Shear amplifies them and viscosity makes
   them decay; small cutoff tails leave smooth residuals. Two pulse families
   supply the required averaged radial momentum flux. Distinct overlapping
   labels are separated on an auxiliary two-torus. Auxiliary averaging and
   evaluation on the physical phase map are distinct operations; averaging
   does not literally change the Navier–Stokes equation.
5. **Every-order residual correction (§§8–9).** Nonzero angular modes,
   stress increments, zero-auxiliary-mean terms and five radial moment defects
   are corrected in a fixed cycle, with pressure reconstructed after each step.
   The full residual is recomputed, retaining nonlinear cross-terms and cutoff
   errors. Proposition 9.6 improves
   \(\sigma_j=1/5+j/10\). Derivative losses depend on derivative order but not
   on stage, making arbitrary decay order eventually possible. Shrinking
   cutoffs on potentials and pressure give a smooth, locally finite sum for
   \(q>0\); Proposition 9.9 leaves a residual whose every space-time derivative
   is \(O(q^N)\) for every \(N\), on bounded similarity sectors.
6. **Localization and force extension (§10.1–10.2).** Cut off potentials,
   azimuthal part and pressure away from the singular region. Cutting off
   velocity directly would generally break incompressibility. Transition
   errors are away from the singular point, where the required derivative
   limits exist. Lemmas 10.2–10.3 construct compatible force jets at \(t=1\)
   and extend them by a Taylor series with shrinking cutoffs, yielding a
   globally smooth force compactly supported in positive time and space.
   Flatness at a point does not mean the force vanishes in a neighborhood.
7. **Energy and exclusion of another solution (§10.3–10.4).** Lemma 10.4
   obtains bounded energy and integrable dissipation from the equation and
   smooth compact forcing. Lemma 10.5 proves comparison against any smooth
   competitor with bounded kinetic energy, without assuming spatial decay of
   its derivatives or pressure. Pressure recovery, cutoff flux estimates and
   expanding-ball energy estimates do the work. A hypothetical global smooth
   competitor then agrees with the constructed solution before time one;
   compactness near the concentrating path contradicts its unbounded speed.
8. **Torus (§10.5, Corollary 10.6).** Isotropic parabolic shrinking and a time
   shift place the compactly supported fields strictly inside one unit cell.
   Periodize disjoint translates of velocity, pressure and force. Their
   nonlinear terms do not mix across disjoint supports. Periodic uniqueness
   uses an energy argument on the cell. A nonzero periodic lift is not claimed
   to have compact spatial support on all of \(\mathbb R^3\).

### Recomputed identities and scales

`verify/check_identities.py`, run with SymPy 1.14.0, records exact algebra in
`verify/identities.json`. The environment and process exits are saved separately.
These are small symbolic calculations, not a fluid simulation or computer-assisted
proof of the profiles.

| Quantity | Recomputed result | Scope |
|---|---|---|
| Core radius, axial length, volume | \(\tau^{1/2}\), \(\tau^{1/2-h}\), \(\tau^{3/2-h}\) | Leading core scales on a fixed similarity sector |
| Core kinetic energy | \(\tau^{1/2-3h}\) | Tends to zero for \(h<1/6\); not a proof of the full flow's energy bound |
| Core squared radial-gradient integral | \(\tau^{-1/2-3h}\) | Time integrable precisely for the strict range \(h<1/6\) at this scale |
| Angular Reynolds number | \(\tau^{-h}\) | Grows; radial advection and radial viscosity nevertheless both have rate \(\tau^{-1}\) |
| Similarity Jacobian | \(dz/d\eta=q^D(1-2h\eta^2)/(1-\eta^2)\) at fixed \(\tau\) | Direct differentiation of (3.2) |
| Implicit coordinate derivative | \(\partial_q(q-z^2q^{2h})=1-2h\eta^2\) on the similarity surface | Positive for \(|\eta|<1\), \(0<h<1/2\) |
| Core \(L^3\) norm, fifth power space integral | \(\tau^{-4h/3}\), \(\tau^{-1-6h}\) | Scale consistency only; no standalone application of a regularity criterion to the forced construction |
| Parabolic scaling | \(u_\lambda=\lambda u(\lambda x,\lambda^2t)\), \(p_\lambda=\lambda^2p\), \(f_\lambda=\lambda^3f\); energy factor \(\lambda^{-1}\) | All PDE terms have factor \(\lambda^3\); viscosity unchanged |
| Viscosity change at fixed singular time | \(u_\nu=\sqrt\nu\,u(x/\sqrt\nu,t)\), \(p_\nu=\nu p(x/\sqrt\nu,t)\), \(f_\nu=\sqrt\nu\,f(x/\sqrt\nu,t)\) | Chain-rule powers agree, starting from viscosity one |
| Residual increment and curl localization | Cross-terms in the exact residual identity; \(\nabla\cdot\operatorname{curl}(cA)=0\); \(\operatorname{curl}(cA)=c\operatorname{curl}A+\nabla c\times A\) | Symbolic polynomial instances; the general identities follow from bilinearity/product rules |
| Small-divisor algebra | \(((\sqrt2-1)k_1+k_2)((-\sqrt2-1)k_1+k_2)=(k_2-k_1)^2-2k_1^2\) | Exact algebra; the nonzero integer product explains a one-derivative inverse loss |

The last calculation also clarifies the derivative-loss critique: a multiplier
growing linearly in frequency, followed by four additional input derivatives,
leaves a \((1+|k|)^{-3}\) Fourier majorant in two dimensions. Shells contain
\(4n\) integer points in the \(\ell^1\) norm, so this is summable. Five derivatives
also suffice, with a different majorant. A nonmatching loss estimate is not by
itself a false estimate or a contradiction.
