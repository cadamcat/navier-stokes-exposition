# Claim ledger

This ledger covers the mathematical assertions, formal correspondence and
status observations in the exposition. Section and equation locators refer to
the article. A row may cover several parts of one displayed calculation.

**proved** denotes accepted published mathematics or a complete elementary
argument given in the article. **claimed** denotes a source assertion without
independent mathematical refereeing established here. **computed** denotes the
specified exact calculation in the accompanying [evidence package, version 1.1](evidence/README.md). **Lean** denotes the identified formal statement
with the attributed execution scope. **heuristic** denotes an explanatory model.
Definitions, requirements and source records below are non-theorem entries;
they do not inherit a mathematical proof label merely by being cited.

All citation keys resolve in SOURCES.md and refs.bib. No result of the announced
construction is credited to the exposition author.

## Problem and elementary framework

| ID | Article locator and assertion | Status | Source or argument; limit |
|---|---|---|---|
| P01 | Summary: announcement on 8 September 2026, attributed to OpenAI, claiming C/D | Source record | Announcement2026; Manuscript2026 author line and Theorem 1.1. Institutional announcement, not acceptance. |
| P02 | Summary, §8: every positive viscosity; zero initial data; compact smooth positive-time force; compact pre-singular velocity/pressure; bounded energy; unbounded speed | claimed; corresponding formal endpoints Lean | Manuscript2026, Theorem 1.1. Endpoint formal record in L01–L03 below; not independently reconstructed analytically here. |
| P03 | §§1–2, (1): velocity, pressure, viscosity, force, incompressibility and initial condition | Definition / official requirement | Fefferman2006, (1)–(3). Density normalized to one. |
| P04 | §1, (2): material acceleration is the derivative along a particle path | proved | Chain rule, with the explicitly assumed smooth trajectory and velocity. |
| P05 | §1, (3): pressure Poisson identity | proved | Apply divergence to (1), commute smooth derivatives, use divergence zero. This identity alone does not prescribe far-field conditions. |
| P06 | §1: a smooth incompressible flow preserves material volumes | proved | For the smooth flow map, the derivative of its Jacobian determinant is divergence times that determinant, hence zero. This assertion concerns the interval on which a smooth flow map exists. |
| P07 | §1: the shrinking core is not a fixed material volume | Definition / interpretation | The construction's core is selected by similarity coordinates, not particle labels; Manuscript2026, §§2–3. No contradiction with P06. |
| P08 | §1, (4): a smooth function can be flat at a point without being locally zero or analytic | proved | Derivative/exponential-decay argument given immediately after (4). |
| P09 | §1, (5): energy differs from a pointwise speed bound | Definition and proved observation | Square integral definition; concentration calculation (13) supplies an explicit scale illustration. |
| P10 | §2: official A/B unforced universal existence, C/D existential forced nonexistence, each for every positive viscosity | Official requirement | Fefferman2006, alternatives A–D; table is a transcription, not a new theorem. |
| P11 | §2: any one alternative is accepted by the official formulation | Official requirement | Fefferman2006, paragraph before A–D. No award decision inferred. |
| P12 | §2, (6)–(7): all initial and force decay conditions, with point-independent constants | Official requirement | Fefferman2006, (4), (5), (8), (9); domain includes all nonnegative times. |
| P13 | §2: force need not be small, analytic or divergence-free | Source comparison | None is an added condition in official C/D. The witness must still meet P12. |
| P14 | §2: smooth competing solutions in C have a uniform energy bound but no imposed derivative/pressure decay | Official requirement | Fefferman2006, (6)–(7). Conditions on witnesses do not transfer to competitors. |
| P15 | §2: torus has unit periods; pressure is periodic; no whole-space energy requirement on the lift | Official requirement | Fefferman2006, (8)–(11), pressure erratum. A nonzero smooth periodic velocity has infinite whole-space square integral. |
| P16 | §2: an explicit singular branch needs comparison to exclude every global competitor | proved logical implication | Same-force/same-datum nonexistence is stronger than noncontinuation of a named branch absent uniqueness. Full comparison is C19, not supplied by this observation. |

## Classical results and scaling

| ID | Article locator and assertion | Status | Source or argument; limit |
|---|---|---|---|
| B01 | §3.1, (8): smooth compact-support or periodic energy identity | proved | Dot (1) with velocity, use divergence identities and integrate by parts. No unstated far-field assumption on arbitrary competitors. |
| B02 | §3.1: energy estimate alone does not give pointwise derivative control | proved observation | Distinct norms; scaling (11) and the explicit concentration powers show why the estimate has no such direct implication. |
| B03 | §3.2: global Leray–Hopf weak existence and energy inequality | proved, classical | Leray1934; Hopf1950; Fefferman2006 pp. 3–4. Full original Hopf proof not read. Applies in the usual finite-energy framework with admissible forcing. |
| B04 | §3.2: weak formulation transfers derivatives to test functions | Definition / proved integration by parts | Fefferman2006 pp. 3–4; article's quadratic-product explanation. |
| B05 | §3.2: global weak existence does not assert global smoothness or nonuniqueness for these particular forced data | Logical scope | B03 and the different solution classes; no new continuation or nonuniqueness result claimed. |
| B06 | §3.3: local smooth existence for admissible data; unforced global existence with small critical norm relative to viscosity | proved, classical | FujitaKato1964; Fefferman2006 p. 2; Miller2020 Theorem 1.8 gives sufficient smallness of the homogeneous H^(1/2) norm relative to ν. Arbitrary forcing is not covered by initial smallness alone. |
| B07 | §3.3: almost-two-dimensional data can give large-data global regularity for the unforced equation in specified classes | proved | Miller2020 (1.1), Theorem 1.9. Not all three-dimensional large data; identifier 1909.09125 is a regularity paper. |
| B08 | §3.4: unforced suitable weak solutions have singular set of zero one-dimensional parabolic Hausdorff measure | proved | CKN1982; exact conclusion in Fefferman2006 p. 4. Does not exclude an isolated point. Original proof not reread. |
| B09 | §3.4, (9): unforced Euler breakdown in the H^s continuation class on R3, integer s≥3, requires divergent time integral of supremum vorticity | proved | BKM1984; ChenPavlovic2011 Theorem 1.1 and (1.4), pp. 1–2; Fefferman2006 p. 3. Class C([0,T];H^s)∩C^1([0,T];H^(s−1)) on intervals before breakdown; joint smoothness alone is insufficient. |
| B10 | §3.4: bounded strong L∞(0,T;L3(R3)) yields regularity for a finite-energy Leray–Hopf solution of the unforced NS Cauchy problem | proved | ESS2003 Theorem 1.3, p. 214; class (1.3)–(1.7), p. 212. No substitution of weak spatial L3, arbitrary distributional solutions or arbitrary force class. |
| B11 | §3.5: Tao's averaged equation has blowup while retaining energy cancellation | proved | Tao2016 abstract and §1; modified bilinear operator, not original convection. |
| B12 | §3.5: energy cancellation and broad size estimates alone cannot resolve the entire averaged class positively | proved implication | B11 provides a counterexample within that class. Does not prove blowup of original NS. |
| B13 | §3.5: Luo–Hou numerical evidence for a boundary Euler singularity | Source record / numerical evidence | LuoHou2014. No proof inferred from the simulation. |
| B14 | §3.5: Chen–Hou smooth finite-energy boundary Euler blowup with rigorous numerical stability bounds | proved, published account | ChenHou2025 Theorem 1; ChenHouII2025; detailed analysis ChenHouI2026 Theorem 2/§6. Full computer-assisted proof not reproduced. Part I's submitted status is retained in SOURCES.md. |
| B15 | §3.5: B14 is not positive-viscosity whole-space or torus NS blowup | Source comparison | Equation and domain of the cited theorem; cylinder wall and zero viscosity are material. |
| B16 | §4, (10)–(11): whole-space PDE scaling, Lp exponent and energy exponent | proved; computed powers | Chain rule and Jacobian substitution over R3; Calculations2026 isotropic scaling checks. Not a fixed-period unit-cell norm formula. |
| B17 | §4: whole-space L3 is critical; the three-dimensional whole-space energy estimate is supercritical | Definition and proved scaling comparison | Formula (11), with norms over R3. No dynamic existence assertion follows from this classification. |
| B18 | §4, (12), Figure 2: sufficiently small symbolic h and leading anisotropic lengths/speed | claimed profile scales | Manuscript2026 §§2.1, 3.1; Lemma 4.8 p. 35 and Appendix A.2 (A.6) p. 129: Td=exp(Md)+10 and h<min{1/100,λ,exp(−Td)}, with further profile smallness choices. No numerical h is asserted admissible. Comparison q≈τ only on a fixed central similarity sector. |
| B19 | §4, (13): core volume, energy and radial dissipation powers | computed; heuristic application to profile sizes | Calculations2026: powers 3/2−h, 1/2−3h, −1/2−3h. Does not prove full-field energy. |
| B20 | §4: time integrability at this scale for h<1/6 | proved; computed | Integrate τ^(−1/2−3h) near zero; equality h=1/6 is logarithmically divergent. Manuscript uses h<1/100. |
| B21 | §4, (14): L3 norm and fifth-power spatial integral core exponents | computed | Calculations2026: −4h/3 and −1−6h. No unforced criterion is independently applied. |
| B22 | §4: angular Reynolds number grows, while radial diffusion and axial transport retain τ^(−1) rates | computed scaling; heuristic interpretation | Calculations2026 powers and (12), fixed viscosity. No inviscid approximation claimed. |

## Construction and finishing arguments

| ID | Article locator and assertion | Status | Source or argument; limit |
|---|---|---|---|
| C01 | §5, (15): defining force as residual makes the selected fields solve momentum | proved identity | Definition of the residual. It gives no regularity at the singular time. |
| C02 | §5: trial τ^(−a)V has generally singular residual terms | proved power calculation | Differentiate and expand the displayed ansatz; absent special cancellation. Not a general no-cancellation theorem. |
| C03 | §5: core, annular pulses and every-order correction are the architecture | claimed | Manuscript2026 §§2–3; map of proof obligations, not a completed proof here. |
| C04 | §5, (16): full nonlinear residual increment identity | proved; computed polynomial instances | Bilinear expansion of transport; Calculations2026. |
| C05 | §6.1: axisymmetric core, central inward spiral and axial outflow, other radial outflow and slight asymmetry | claimed profile description | Manuscript2026 §2.1 and Appendix B. Ideal reflected drawings are schematic. |
| C06 | §6.1: conserved angular momentum explains inward spin-up in the torque-free toy picture | heuristic with conditional conservation law | Manuscript2026 §2.1; actual viscous core includes angular momentum transport. |
| C07 | §6.1, (17): similarity coordinate definitions | Definition in source | Manuscript2026 §3.1. |
| C08 | §6.1, (18): coordinate Jacobian and positive implicit derivative | proved; computed | Differentiate (17); Calculations2026. Positivity on |η|<1 and the specified h range. Only local inversion claimed. |
| C09 | §6.1: analytic-axis profiles, viscous exterior, five moments and stress cone must coexist | claimed | Manuscript2026 Theorem 4.6, Appendices A–C. Profile existence not checked by our symbolic script. |
| C10 | §6.2, (19): leading tangential residual represented by annular stress derivatives | claimed | Manuscript2026 §3.2/Theorem 4.6. Radial moment conditions permit compact localization. |
| C11 | §6.2, (20)–(21): zero-mean toy waves have nonzero positive covariance; toy cone inequality | proved | Average cosine and cosine squared; matrix sum and nonnegative coefficients. Not the actual admissible stress cone. |
| C12 | §6.2: actual two-direction realizability and profile shear repair with moments | claimed | Manuscript2026 Appendix C and stress construction. |
| C13 | §7.1: shear amplification, viscous decay and oscillatory stress matching | claimed | Manuscript2026 §§6–7; no pulse estimates derived here. |
| C14 | §7.1, (22): direct velocity cutoff breaks divergence in general; curl localization preserves it with a product term | proved; computed polynomial instances | Product rules and div curl=0; Calculations2026. |
| C15 | §7.1: auxiliary torus separates labels; averaging differs from physical evaluation | claimed construction / definition | Manuscript2026 §§6–7. Final equation is original NS, not Tao's averaged equation. |
| C16 | §7.2: axial diffusion is lower order by q^(2h); fixed residual smallness does not ensure all derivatives | claimed hierarchy; proved elementary obstruction | Manuscript2026 §5; differentiation of s^M sin(1/s) illustrates the second assertion. |
| C17 | §7.2, (23), Figure 4: four ordered corrections and stage orders; derivative losses do not grow with stage | claimed | Manuscript2026 §3.6 p. 14, §8.6 p. 96, Proposition 9.6 pp. 107–108. Pressure and full residual updated after every correction. Five moment equations preserve two integral constraints and cancel linear contributions to three defects (P,Jθ,Jz); nonlinear remainders remain. Every-order estimates not audited in full. |
| C18 | §7.2: smooth cutoff realization and every-derivative O(q^N) residual on stated sectors | claimed | Manuscript2026 Proposition 9.9 p. 114 and its domain. No assertion of global force flatness follows from this alone. |
| C19 | §8.1: localization, force jets and smooth compact positive-time extension | claimed | Manuscript2026 §§10.1–10.2, Lemmas 10.2–10.3. |
| C20 | §8.1: compact smooth force and zero data satisfy official witness decay | proved implication | Bound derivatives and polynomial weights on compact support; zero datum has zero derivatives/divergence. Conditional on C19's witness. |
| C21 | §8.1: analytic/locally zero force obstructs this particular structured mechanism | claimed, preprint | CIV2026 Theorem 1.1 (1.5)–(1.8), Remark 1.2(a)–(b), pp. 3–4. Suitable weak solution smooth on compact pre-singular subsets; anisotropic bounds on the angular mean through total radial/axial derivative order two; exact axisymmetry on a nonempty core at each time; force uniformly bounded in spatial C2 up to the candidate time, independently of local pre-singular analyticity. Not unrestricted regularity. |
| C22 | §8.2: full energy and integrated dissipation bound | claimed | Manuscript2026 Lemma 10.4. B19 alone does not establish it. |
| C23 | §8.2: comparison with every smooth uniformly finite-energy competitor without derivative/pressure decay | claimed; formal finishing theorem Lean | Manuscript2026 §10.3, Lemma 10.5, pp. 121–123; Lean2026 whole-space uniqueness. Formal proof has a different intermediate pressure bound. |
| C24 | §8.2: compactness plus comparison excludes a global smooth competitor | proved conditional argument | A continuous field is bounded on K×[0,1]; this contradicts the same field's asserted pre-singular unbounded speeds. |
| C25 | §8.3: shrinking, time shift, separated periodization and periodic comparison establish D | claimed; endpoint Lean | Manuscript2026 Corollary 10.6; Lean2026 periodic endpoint. No compact whole-space support or whole-space finite energy for the lift. |

## Formal evidence, critique and remaining scope

| ID | Article locator and assertion | Status | Source or argument; limit |
|---|---|---|---|
| L01 | §9.1, (25): unconditional final C statement, positive viscosity universally quantified | Lean | Lean2026 ComparatorR3Theorem lines 38–44; Rerun2026 build, axiom and two-kernel Comparator receipts at the pinned revision. |
| L02 | §9.1: unconditional D statement with periodic predicates | Lean, same scope | Lean2026 ComparatorTheorem lines 47–53; formalization.yaml. |
| L03 | §9.1: submission aliases and candidate obligations discharged in final proofs | Lean source comparison | ComparatorSolution lines 16–32, final bridge proof bodies. No hypothetical profile binder in the final types. |
| L04 | §9.2: dimension, derivatives, PDE, same datum, smoothness, energy and periodicity table | Source comparison | All fields read in pinned ComparatorDefinitions; full locators in SOURCES.md. Comparison not itself a formal equivalence proof. |
| L05 | §9.2: coordinate/tensor derivative bounds equivalent up to constants | proved | Finite-dimensional multilinear expansion in the coordinate basis; evaluate on unit basis vectors for the reverse direction. |
| L06 | §9.2: integer versus real decay order, strict bound and energy factor do not alter intended conditions | proved | Base≥1 and integer ceiling; enlarge E and absorb factor 1/2. |
| L07 | §9.2: MemLp prevents real-integral default from masquerading as finite energy | Source/definition comparison | Explicit `.integrable` and integral fields read. Physical finite energy and smoothness imply the stated MemLp condition. |
| L08 | §9.2: ordinary ambient smooth competitor satisfies within-domain formal smoothness | proved direction / source comparison | Restriction to the closed future domain. General converse extension theorem not reproved or needed for this exclusion direction. |
| L09 | §9.2: no missing official clause found on the stated reading | Bounded assessment | P10–P15 and L04–L08; not library-wide or human-expert certification. |
| L10 | §9.3: MathDB targets C,D,A,B; eleven predicate bodies match | computed source comparison | MathDBTargets2026, FormalConjectures2026, Calculations2026 source audit; hashes and source copies compared. Not four proofs. |
| L11 | §9.3: Lean/toolchain and Mathlib version mismatch; no MathDB import/adoption established | Source record | MathDB target manifests versus proof pins; no port attempted. |
| L12 | §10.1: 609 modules/382,514 lines and no prohibited tokens in project submission closure | computed lexical audit | Calculations2026 enumerated import closure. External library bodies and elaborated axiom dependencies are outside scope. |
| L13 | Summary, §10.1: own source build at the pinned revision, with Mathlib compiled files from its binary cache; 11,424 jobs, 103 minutes 23.528 seconds wall time, exit 0 | Execution record; endpoints Lean | Rerun2026 commit.txt, toolchain.txt, runner.sh, runner.log, cache.log, build.log and build.exit. Rented cloud Linux VM, 8 vCPUs, 50 GB RAM, 9 November 2026. |
| L14 | §10.1, (26): the authors' formalization record lists both endpoints with zero sorry and the three standard axioms, and calls its review self-assessed | Source record (authors' metadata) | Lean2026 `formalization.yaml` at the pinned revision. Rerun2026 supplies separate execution receipts agreeing with these axiom lists. |
| L15 | §10.1: older independent records are not execution evidence for changed later sources | Source record / logical scope | Earlier repositories listed in SOURCES.md; source revision identity differs. No inference from unchanged endpoint names alone. |
| L16 | §10.2: inverse bound uses m+4 in manuscript and word length+5 in Lean | Source comparison, independently confirmed | BCH2026 Example 3.1; Manuscript2026 (8.19); Lean2026 inverse locator. Does not prove the sharper bound false. |
| L17 | §10.2, (27)–(28): pressure-flux expressions differ, and the formal estimate is used | Source comparison, independently confirmed | BCH2026 Example 3.3; Manuscript2026 (10.19); Lean2026 PressureFlux and WholeSpaceUniqueness. No implication between bounds asserted. |
| L18 | §10.2: differences do not themselves refute C/D or identify forbidden endpoint axioms | Logical scope | L16–L17 concern intermediate proofs; L14 and L25 report endpoint axioms. Not an independent proof of all analytic assertions in either source. |
| L19 | §10.3: Lei–Ren I/II give mathematical engagement, II posted 4 November | Source record | LeiRenI2026 and LeiRenII2026 abstracts/scope; not a full refereeing certificate. |
| L20 | §10.3: two recovered manuscript editions, later historical attribution expanded | computed archival/source comparison | Calculations2026 manuscript-version record; archived bytes decoded before comparison. No claim of exhaustive capture or harmlessness of every edit. |
| L21 | Summary, §10.3: Clay Active; MathDB Open/null verification; the authors' formal record lists the standard axioms | Dated source records | ClayStatus2026, MathDB2026 and Lean2026 review metadata. Conflicting status layers preserved rather than adjudicated. |
| L22 | Summary, §11: no completed independent referee report/Clay recognition established here | Bounded finding | Sources and reception records enumerated in SOURCES.md. A search cannot establish absence of every possible review. |
| L23 | §§2,11: forced C/D do not settle unforced A/B | proved quantifier comparison; open status in cited records | A/B fix f=0; C/D choose f. No claim that every nonzero force causes breakdown. |
| L24 | §11: typicality, perturbation stability and weak-continuation uniqueness are not supplied by the existential endpoints | Logical scope | Final theorem types and Manuscript2026 Theorem 1.1; no new theorem about these questions claimed. |
| L25 | Summary, §10.1, (26): our own axiom check prints exactly propext, Classical.choice and Quot.sound for each endpoint, exit 0 | Execution record; endpoints Lean | Rerun2026 runner.sh imports NavierStokes.ComparatorSolution; axioms.log and axioms.exit. |
| L26 | Summary, §10.1: Comparator compares challenge and solution statements; nanoda and Lean default kernels accept, exit 0 | Execution record; endpoints Lean | Rerun2026 comparator.log and comparator.exit; repository configuration ComparatorChallenges/NavierStokes.json. Recorded tool versions and invocation boundary in evidence/README.md. |
| L27 | §10.1: four build sorry warnings are challenge placeholders outside the solution imports | Execution record and computed source audit | Rerun2026 build.log; Calculations2026 enumerated submission import closure. No solution sorry axiom appears in L25. |
| L28 | Summary, §10.1: rerun does not referee the manuscript or check official-statement correspondence; cache, toolchain and Comparator tools trusted | Verification scope | Rerun2026 runner and documented Comparator trust assumptions; clause-by-clause source reading L04–L09 is unchanged. Mathematical construction remains claimed. |

The proposed figures are explanatory material, not additional numerical evidence.
Their captions distinguish exact scale powers and toy algebra from schematic
geometry. No figure from another exposition is reused.
