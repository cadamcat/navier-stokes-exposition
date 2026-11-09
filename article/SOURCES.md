# Sources and evidence locators

Unless a later date is given, web sources were retrieved or inspected on 7 November 2026. Page references
are printed pages unless specified otherwise. A bibliographic entry establishes
where a result is published; it does not mean its full proof was reread for this
article. Mathematical status is assigned separately in CLAIMS.md.

## Official problem and announced construction

| Citation key | Source and verified locator | Evidence boundary |
|---|---|---|
| Fefferman2006 | Charles L. Fefferman, [official Clay description](https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf), pp. 1–2, equations (1)–(11), alternatives A–D; pp. 3–4, background; appended errata p. 6 | Six-page PDF read. The pressure-periodicity correction is included. Errata equation numbering is stale; the correction's content governs. No long verbatim passage is reproduced. |
| Announcement2026 | OpenAI, [announcement](https://openai.com/index/navier-stokes-solution/), 8 September 2026, “The result” and the 10 September update footnote | Institutional announcement of C/D, with manuscript and repository links. It is not independent acceptance. |
| Manuscript2026 | OpenAI, [*Finite Time Blowup for Navier–Stokes*](https://cdn.openai.com/pdf/32d9f210-8b73-45e0-91bc-82a30aef8a9a/navier-stokes.pdf), Theorem 1.1 p. 1; §§2–3 pp. 3–23; Theorem 4.6 p. 32 onward; Lemma 4.8 p. 35 and Appendix A.2 (A.6) p. 129, parameter schedule; §8.6 p. 96 and Proposition 9.6 pp. 107–108, four-correction cycle; §§10.1–10.2, force extension; §10.3, Lemma 10.5 pp. 121–123, comparison; Corollary 10.6 pp. 125–126 | The cited edition has 166 pages, SHA-256 `0e779481c4da40bd28d1e642e1d8ca57447d129610df28dfa5a11e9af8ae228f`. Architecture, principal statements and the two disputed estimates inspected; not a complete referee audit. The author line is OpenAI; no individual authorship is inferred. |
| ClayStatus2026 | Clay Mathematics Institute, [problem page](https://www.claymath.org/millennium/navier-stokes-equation/), status label above the title | Active at retrieval; this is a status observation, not an assessment by this article. |
| MathDB2026 | MathDB, [problem 315852](https://mathdb.com/p/315852/navier-stokes-existence-and-smoothness), progress summary and formal verification fields | Open and no independently verified resolving advance in the retrieved progress text; verification fields null. Public execution reports are separately described below. |

Two manuscript editions were recovered from the archive index for the publisher
URL: a 165-page edition, SHA-256
`8c8a94ad9ac824c8b605b9827cadf7beaca48bd10b380de3cfc872a2c37afa81`,
and the cited 166-page edition. The latter was present in an 8 September evening
capture and matches the publisher bytes retrieved on 7 November. Some captures
are gzip representations of the same PDF, not different editions. Archive
coverage does not prove that no intermediate editions existed. The principal
statement is unchanged between the recovered editions; expanded historical
attribution is not evidence that every other edit has been mathematically audited.

## Formal statements and execution records

Every OpenAI code locator below uses the immutable revision
`f9e8bc5b38b6e212696e8a30e3e91517af887bbd`.

| Citation key / use | Verified public locator | What was checked |
|---|---|---|
| Lean2026: C endpoint | [ComparatorR3Theorem, lines 38–44](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/NavierStokes/ComparatorR3Theorem.lean#L38-L44) | Final unconditional source statement and its invocation of the constructed whole-space theorem. |
| Lean2026: D endpoint | [ComparatorTheorem, lines 47–53](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/NavierStokes/ComparatorTheorem.lean#L47-L53) | Final source statement and its invocation of the periodic construction. |
| Lean2026: submission | [ComparatorSolution, lines 16–32](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/NavierStokes/ComparatorSolution.lean#L16-L32) | Submission namespace endpoints; the source requests their axiom lists. The source request is distinct from printed run output. |
| Lean2026: predicates | [ComparatorDefinitions](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/NavierStokes/ComparatorDefinitions.lean), `IsOnePeriodic`, initial/force structures and the three solution structures | Domains, derivative conventions, all decay quantifiers, actual integrability, uniform bound, periodic pressure. Source inspection, not a formal equivalence proof. |
| Lean2026: construction endpoint | [R3/Theorem, lines 46–49](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/NavierStokes/R3/Theorem.lean#L46-L49) and [PeriodicPaperTheorem](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/NavierStokes/PeriodicPaperTheorem.lean) | Links from the comparator propositions to the constructed witnesses. |
| Lean2026: inverse estimate | [SmoothFamilyTorusInverse, lines 1059–1080](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/NavierStokes/SmoothFamilyTorusInverse.lean#L1059-L1080) versus manuscript Lemma 8.6, (8.19), p. 95, proof p. 96 | Input order `w.length + 5` versus manuscript \(m+4\). It does not follow that the printed sharper estimate is false. |
| Lean2026: pressure flux | [R3/PressureFlux, lines 576–598](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/NavierStokes/R3/PressureFlux.lean#L576-L598); [WholeSpaceUniqueness, lines 60–70](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/NavierStokes/R3/WholeSpaceUniqueness.lean#L60-L70); manuscript (10.17)–(10.19), pp. 122–123 | Both displayed bounds and actual use of the formal bound in uniqueness. Formal localized-norm definitions are in `R3/ComparisonSetup`. |
| Rerun2026 | Yao Xu, [Lean rerun evidence](evidence/README.md#lean-rerun), 9 November 2026; [manifest](evidence/MANIFEST.json); Comparator [trust assumptions](https://github.com/leanprover/comparator/blob/19e111e2141cf333c7daff0f64c5f24acc91dd2e/README.md) | Own source build, endpoint axiom output and Comparator acceptance by both kernels at the pinned revision. Runner, logs, exit receipts and resolved tool versions included; environment-specific paths redacted as documented. Uses Mathlib's cache; follows the project command after building, without the unprivileged isolation recipe. No manuscript refereeing or official-statement equivalence check. |
| Lean2026: review metadata | [formalization.yaml](https://github.com/openai/NavierStokesAndEuler/blob/f9e8bc5b38b6e212696e8a30e3e91517af887bbd/formalization.yaml) | Review described as self-assessed; allowed axiom lists. No public upstream Actions run was found in the queried record. |
| FormalConjectures2026 | [Frozen definition source](https://github.com/google-deepmind/formal-conjectures/blob/8bf45ed70d48b2b2a501de9c00b26bfa38c573ee/FormalConjectures/Millenium/NavierStokes.lean) | Eleven definition/structure bodies compared after removing comments and normalizing whitespace. |
| MathDBTargets2026 | [Four public records](https://mathdb.com/api/posts/4da10455-6917-4dc3-9ba0-a560cc339325/lean-formalizations), linked [immutable target directory](https://github.com/mathdb-lean/problems/tree/924bd70ab97fcf6f1eda41dac7ee1be7e0bc8bda/additional-statements/315852) | Four source bodies independently fetched; hashes match the records. Order C,D,A,B. Lean 4.33.1 versus proof 4.34.0-rc2; no port performed. |

Earlier formal reports include [Rael Savitt's build record](https://github.com/swarm-ai-research/navier-stokes-lean-check),
[Sebastián Rodrigo González's results](https://github.com/elmismisimoxhunca/NavierStokes-OpenAI-Verification),
and [Francesco Antonio De Luca's audit](https://github.com/francescoantoniodeluca/navier-stokes-formal-audit/blob/main/FINAL_RED_TEAM_AUDIT.md).
They concern the earlier `8937a8f4cbc7abaab5e9e97d1cc7f5d2319d9538`
revision. These are the earlier reports referred to in the article's evidence
table. They are credited without transferring their execution results to the
later revision or inferring human mathematical refereeing.

## Classical background

| Citation key | Verified locator | Read boundary and use |
|---|---|---|
| Leray1934 | Jean Leray, *Acta Math.* 63 (1934), 193–248, [DOI](https://doi.org/10.1007/BF02547354); [original scan](https://archive.ymsc.tsinghua.edu.cn/pacm_download/117/5537-11511_2006_Article_BF02547354.pdf) | Original scan retained; bounded historical weak-existence claim also supported by Fefferman pp. 3–4. Not a reproof of the full construction. |
| Hopf1950 | Eberhard Hopf, *Math. Nachr.* 4 (1950), 213–231, [DOI](https://doi.org/10.1002/mana.3210040121) | Bibliographic identity checked; full original paper unavailable in this retrieval. No theorem number claimed. |
| FujitaKato1964 | Hiroshi Fujita and Tosio Kato, *Arch. Rational Mech. Anal.* 16 (1964), 269–315, [publisher record](https://doi.org/10.1007/BF00276188); Fefferman p. 2; Miller Theorem 1.8 | Publisher metadata inspected; unforced critical-norm smallness relative to viscosity, exemplified by homogeneous H^(1/2). Full original proof not read. |
| CKN1982 | Luis Caffarelli, Robert Kohn and Louis Nirenberg, *CPAM* 35 (1982), 771–831, [DOI](https://doi.org/10.1002/cpa.3160350604); exact singular-set conclusion in Fefferman p. 4 | Full original proof unavailable here. The zero one-dimensional parabolic Hausdorff measure statement is not “no singular points.” |
| BKM1984 | J. T. Beale, Tosio Kato and Andrew Majda, *CMP* 94 (1984), 61–66, [publisher](https://doi.org/10.1007/BF01212349); Fefferman p. 3; precise continuation class in ChenPavlovic2011 below | Original title/metadata and Fefferman's explicit Euler criterion inspected; full original proof not read. The H^s class, integer s≥3, is essential. No general forced Navier–Stokes criterion inferred. |
| ChenPavlovic2011 | Thomas Chen and Nataša Pavlović, [*A lower bound on blowup rates for the 3D incompressible Euler equation and a single exponential Beale–Kato–Majda estimate*](https://web.ma.utexas.edu/mp_arc/c/11/11-95.pdf), 17 June 2011, Theorem 1.1 and (1.4), pp. 1–2 | Research preprint retained and statement inspected. Explicitly restates BKM for the unforced whole-space Euler Cauchy problem in C([0,T];H^s)∩C^1([0,T];H^(s−1)), integer s≥3. The article does not use this paper's new quantitative estimates. |
| ESS2003 | L. Escauriaza, G. A. Seregin and V. Šverák, *Russian Math. Surveys* 58 (2003), 211–250, [publisher](https://doi.org/10.1070/RM2003v058n02ABEH000609), [original English article](https://www.mathnet.ru/php/getFT.phtml?jrnid=rm&option_lang=eng&paperid=609&what=fullteng), Theorem 1.3 p. 214; (1.3)–(1.7) p. 212 | Original PDF retained; theorem and class read. Finite-energy Leray–Hopf solutions of the unforced Cauchy problem on R3×(0,T), with strong L∞(0,T;L3(R3)). No arbitrary distributional-solution claim or weak-spatial-L3 substitution. |
| Tao2016 | Terence Tao, *JAMS* 29 (2016), 601–674, [preprint](https://arxiv.org/abs/1402.0290), abstract and §1; [published PDF](https://www.ams.org/jams/2016-29-03/S0894-0347-2015-00838-4/S0894-0347-2015-00838-4.pdf) | Energy cancellation is preserved by a modified averaged bilinear operator. Not blowup for the original equation. |
| Miller2020 | Evan Miller, *Nonlinearity* 33(10) (2020), [arXiv:1909.09125](https://arxiv.org/abs/1909.09125), unforced equation (1.1), Theorems 1.8–1.9, [DOI](https://doi.org/10.1088/1361-6544/ab9246) | Theorem 1.8 states small homogeneous H^(1/2) norm relative to viscosity; Theorem 1.9 gives unforced almost-two-dimensional regularity, including some large critical-norm data. Not arbitrary-data regularity or a strain-model blowup paper. |
| LuoHou2014 | Guo Luo and Thomas Y. Hou, [arXiv:1310.0497](https://arxiv.org/abs/1310.0497), abstract and introductory setting; shorter PNAS account [DOI](https://doi.org/10.1073/pnas.1405238111) | Numerical boundary Euler scenario. The long and short versions have different titles/pagination. |
| ChenHou2025 | Jiajie Chen and Thomas Y. Hou, [PNAS 122(27), e2500940122](https://www.pnas.org/doi/10.1073/pnas.2500940122), publication metadata, abstract and Theorem 1 | Successful publisher web extraction states acceptance 20 May 2025, publication 27 June, and cylinder boundary-Euler theorem. A short excerpt is retained; direct download failed and later extraction attempts timed out. No full PNAS-text audit. |
| ChenHouI2026 | Same authors, [arXiv:2210.07191v4](https://arxiv.org/abs/2210.07191v4), 16 August 2026, informal Theorem 2 p. 2 and precise Theorem 5 in §6 | Smooth finite-energy axisymmetric Euler in a cylinder with boundary, not positive-viscosity whole-space flow. Part I remains listed as submitted on [Chen's research page](https://jiajiechen94.github.io/research); publication status of the PNAS account is separate. |
| ChenHouII2025 | Same authors, *MMS* 23(1) (2025), 25–130, [DOI](https://doi.org/10.1137/23M1580395); [inspected arXiv v3](https://arxiv.org/abs/2305.05660v3), abstract and introduction | Rigorous error control for approximate solutions and stability constants. Full numerical proof not reproduced. Journal and preprint pagination differ. |

## Reception and computations

| Citation key | Verified locator | Scope |
|---|---|---|
| CIV2026 | Peter Constantin, Mihaela Ignatova and Vlad Vicol, [arXiv:2609.20803v1](https://arxiv.org/abs/2609.20803v1), 17 September, Theorem 1.1 (1.5)–(1.8) and Remark 1.2(a)–(b), pp. 3–4 | Suitable weak solutions smooth on compact pre-singular subsets; specified anisotropic bounds on the angular mean through two radial/axial derivatives; exact axisymmetry on a nonempty core at every time; force uniformly bounded in spatial C2 up to the candidate time, independently of local pre-singular spatial analyticity. Not unrestricted analytic-force regularity. Preprint theorem, not independently reproved here. |
| BCH2026 | Alexander Bastounis, Fabian Circelli and Anders C. Hansen, [arXiv:2610.08144v1](https://arxiv.org/abs/2610.08144v1), 6 October, Examples 3.1 and 3.3, pp. 4–12 | Both original estimates and the formal counterparts checked. General computability claims and every analytic assertion in the critique were not audited. The critique expressly does not decide correctness of the full manuscript. |
| LeiRenI2026 | Zhen Lei and Xiao Ren, [arXiv:2609.35406v2](https://arxiv.org/abs/2609.35406v2), abstract and §1; v1 posted 28 September, v2 29 September | Exposition of profile construction, with explanatory linear core model; pulse cancellation deferred. Not a complete review certificate. |
| LeiRenII2026 | Same authors, [arXiv:2611.06869v1](https://arxiv.org/abs/2611.06869v1), **4 November**, abstract and §1 stage roadmap | Exposition of pulse correction; explicitly no original mathematical contribution claimed. Outside pre-November reception window. |
| Calculations2026 | Yao Xu, [accompanying evidence package, version 1.1.0](evidence/README.md), [content manifest](evidence/MANIFEST.json): exact scripts and outputs, exit receipts, negative-control logs, environment/version record and manuscript-version comparison | Included in the article distribution; preserve the evidence directory with it. SymPy 1.14.0; core powers, coordinate identities, polynomial residual/curl instances, scaling and small-divisor algebra. Source audit enumerates imports and compares definition bodies. Original result records are included; machine-specific interpreter and temporary-directory prefixes in metadata/logs are replaced as documented. Three child processes exited 0; negative controls rejected specified corruptions. The source/algebra checks do not establish profile existence, analytic iteration or the full manuscript proof, and do not audit external library bodies. Lean execution is recorded separately under Rerun2026. A public hosting URL or DOI remains unassigned; this is a bundled evidence locator, not a claim of public archival deposit. |

The manuscript–Lean pressure comparison is an observation about two source
expressions and their proof dependencies. It does not assert that one bound
implies the other. The elementary toy covariance and energy arguments are
complete in the article; they do not claim to validate the profile-dependent
stress cone or the full energy estimates of the construction.
