---
title: "A smooth force and a singular fluid"
subtitle: "The Navier–Stokes breakdown claim, the classical problem, and the scope of its formal proof"
author: "Yao Xu"
date: "Version 1.2.0 · 9 November 2026"
bibliography: refs.bib
fontsize: 11pt
geometry: margin=23mm
---

# Summary {-}

Picture water filling all of space. At every point and instant it has a velocity. In a smooth flow, that velocity changes smoothly across space and time. The three-dimensional Navier–Stokes equations describe its evolution under transport, pressure, viscosity and an external force. The regularity question asks whether smooth initial motion can lose this smoothness in a finite time.

On 8 September 2026, OpenAI announced a construction that, it claims, answers this question for flows driven by a force. It attributes the written proof and Lean formalization to an internal AI system. A smooth external force sets a fluid in motion from rest. In the announced flow, the speed becomes unbounded in finite time while the total kinetic energy stays bounded, for every positive viscosity, in the whole space and on the three-dimensional torus. The manuscript presents this as a proof of alternatives C and D of Charles Fefferman's official formulation of the Millennium problem, which admits a force that stays smooth and decaying for all time, including through the singular time [@Announcement2026; @Manuscript2026, Theorem 1.1 and Corollary 10.6].

The announcement comes with a public Lean development. At the revision studied here, its final propositions state the two forced breakdown alternatives without any unproved hypothesis about the construction. On 9 November 2026 we rebuilt the pinned development from source, printed both axiom lists with only the three standard foundational axioms, and ran Comparator: nanoda and Lean's default kernel accepted the solution against the challenge statements; Mathlib's compiled files came from its binary cache, and Comparator ran after the full project build, as the repository configures it [@Rerun2026].

Three points set the scope. The manuscript is announced, and no completed independent referee report is publicly known; Clay's page still labels the problem Active and MathDB's progress text labels it Open [@ClayStatus2026; @MathDB2026]. The construction uses a force, so the unforced alternatives A and B remain open; a positive answer to A or B could coexist with forced breakdown. This article reads the Lean statements against the official problem and adds execution evidence at the same revision; Section 10.1 gives the run's scope.

Each claim carries one of five labels:

- **proved**: established in accepted published work, or by a complete elementary argument given here;
- **claimed**: asserted in the cited source, with no completed independent referee report publicly known;
- **computed**: checked by the exact computations in the accompanying [evidence package, version 1.1.0](evidence/README.md);
- **Lean**: a named formal proposition, with build and kernel evidence at the pinned revision;
- **heuristic**: an explanatory picture that proves nothing.

The claim ledger also identifies definitions, historical dates and observations about sources.

**Contribution.** The mathematical results belong to the authors cited. This article explains them for readers with multivariable calculus, compares the formal and official statements clause by clause, checks elementary calculations, reruns the pinned Lean development, and gives a dated account of the evidence, including an October critique that documents two places where the formal proof uses a different estimate from the manuscript. It explains the profile existence proof, the every-order analytic estimates and the whole-space uniqueness argument without reproving them.

# The mechanism and a reading route {-}

**Claimed:** start by designing the flow, then define the force as what is left over in the equation: its residual. The force must stay smooth through the time when the velocity blows up. A collapsing vortex core supplies the concentration, and oscillatory pulses supply the missing momentum stress. Ordered corrections remove the residual's singular behavior at every derivative order. Comparison then excludes every global smooth solution with uniformly bounded energy on the whole space for the same data and force; rescaling and periodization give the corresponding exclusion in the smooth periodic class on the torus. The construction and comparison are **claimed**; the final compactness implication is **proved**, conditional on them, and the C/D endpoints are **Lean** [@Manuscript2026, §§2–3, 10; @Lean2026; @Rerun2026].

For the main idea in about ten minutes, read Section 2 and Figure 1 for the statement, Section 5 for the residual, Section 6.2 and Figure 3 for stress, Section 7.2 and Figure 4 for every-order correction, and Sections 8.2–8.3 and Figure 5 for comparison and the torus. Sections 1, 3–4 and 6.1, including Figure 2, are optional background on the equations, earlier results, scales and coordinates. For the audit, read Sections 9–10 alongside the [claim ledger](CLAIMS.md), [source locators](SOURCES.md) and [execution evidence](evidence/README.md#lean-rerun). A notation key follows Section 11.

# 1. What the equations say

Write \(x=(x_1,x_2,x_3)\) for position and \(t\geq0\) for time. The unknown velocity \(u(x,t)\) is a vector, and pressure \(p(x,t)\) is a scalar. With density normalized to one, the equations are
\[
\partial_tu+(u\cdot\nabla)u
=\nu\Delta u-\nabla p+f,
\qquad \nabla\cdot u=0,
\qquad u(x,0)=u_0(x).
\tag{1}
\]
Here \(\nu>0\) is viscosity and \(f\) is the externally applied force per unit mass [@Fefferman2006, pp. 1–2].

The first two terms describe acceleration. If a fluid particle follows a path \(X(t)\) with \(X'(t)=u(X(t),t)\), the chain rule gives
\[
\frac{d}{dt}u(X(t),t)
=\partial_tu+(u\cdot\nabla)u
\quad\hbox{at }(X(t),t).
\tag{2}
\]
The second term is nonlinear: velocity determines both the motion and the directional derivative along it. The Laplacian \(\Delta u\) tends to smooth differences in velocity. Pressure enforces compatibility with incompressibility. For smooth fields, taking the divergence of the momentum equation yields
\[
-\Delta p=\sum_{i,j=1}^3(\partial_i u_j)(\partial_j u_i)-\nabla\cdot f.
\tag{3}
\]
These are **proved** differential identities. Equation (3) shows why pressure cannot be adjusted freely at each point: recovering it requires solving a spatial equation with appropriate conditions at infinity or on a periodic cell.

Incompressibility says that the flux out of a tiny volume balances the flux in. A smooth flow therefore preserves the volume occupied by the same fluid particles. A region selected by a velocity threshold, or used to describe a singularity, need not contain the same particles at successive times. Its volume may shrink without violating incompressibility.

Here smoothness means \(C^\infty\): all space and time derivatives exist and are continuous, with a one-sided interpretation at \(t=0\). This is stronger than continuity and different from analyticity. A smooth function can have every derivative zero at a point and still be nonzero nearby. For instance,
\[
g(s)=
\begin{cases}e^{-1/s^2},&s\ne0,\\0,&s=0\end{cases}
\tag{4}
\]
is smooth and flat at zero. Differentiation gives a polynomial in \(1/s\) times \(e^{-1/s^2}\); the exponential tends to zero faster than every such polynomial grows. Every derivative therefore extends by zero. Its Taylor series at zero is identically zero, although \(g(s)>0\) for \(s\ne0\) (**proved**). This distinction matters for the force in the announced construction.

For the whole space the kinetic energy is
\[
E(t)=\frac12\int_{\mathbb R^3}|u(x,t)|^2\,dx.
\tag{5}
\]
This integral measures total motion. A very large velocity confined to a sufficiently small region can have small energy. Breakdown of smoothness need not mean infinite energy, a hole in the fluid, or failure of every weaker notion of solution.

# 2. Four alternatives, with different quantifiers

Fefferman's problem pairs two domains with two kinds of conclusion. The torus \(\mathbb T^3=\mathbb R^3/\mathbb Z^3\) is a unit cube with opposite faces identified: the fields are period one in each spatial direction. It has no solid wall. A periodic lift repeats throughout \(\mathbb R^3\) [@Fefferman2006, alternatives A–D].

| Alternative | Domain | Data and force | Requested conclusion |
|---|---|---|---|
| A | \(\mathbb R^3\) | Every smooth, divergence-free, rapidly decaying \(u_0\); \(f=0\) | A global smooth solution with uniformly bounded energy |
| B | \(\mathbb T^3\) | Every smooth, divergence-free periodic \(u_0\); \(f=0\) | A global smooth periodic solution |
| C | \(\mathbb R^3\) | Some admissible smooth \(u_0,f\) | No global smooth solution with uniformly bounded energy |
| D | \(\mathbb T^3\) | Some admissible smooth periodic \(u_0,f\) | No global smooth periodic solution |

Each alternative is posed for every positive viscosity. A and B ask for global smooth existence for all admissible initial velocities, with no force. In C and D the solver chooses the initial velocity and force to exclude a global smooth solution with bounded energy on the whole space in C, or a global smooth periodic solution in D. The official formulation explicitly accepts a proof of any one alternative; C and D are part of the stated problem.

“Admissible” has substantial content. In C, for every spatial multi-index \(\alpha\), time derivative order \(m\), and decay order \(K\), one requires constants such that
\[
|\partial_x^\alpha u_0(x)|\leq C_{\alpha K}(1+|x|)^{-K},
\qquad
|\partial_x^\alpha\partial_t^m f(x,t)|
\leq C_{\alpha mK}(1+|x|+t)^{-K}.
\tag{6}
\]
The constants are independent of \(x\) and \(t\geq0\). In D, initial data and force are periodic; the force condition becomes
\[
|\partial_x^\alpha\partial_t^m f(x,t)|
\leq C_{\alpha mK}(1+t)^{-K}.
\tag{7}
\]
Both force requirements cover the singular time and every later time. A formula that becomes infinite at the proposed blowup time is inadmissible even if it is smooth at every earlier time. Neither alternative requires the force to be small, analytic or divergence-free [@Fefferman2006, (4)–(5), (8)–(9)].

In C the excluded solution has smooth velocity and pressure and one finite energy bound for all nonnegative times. Its velocity derivatives and pressure need not decay rapidly. Imposing those extra conditions would exclude fewer competitors and weaken the nonexistence assertion. In D, the appended Clay errata require both pressure and velocity to be periodic. No finite energy over all of \(\mathbb R^3\) is required for a nonzero periodic lift. Smoothness gives finite energy on each compact cell at each fixed time [@Fefferman2006, (6)–(7), (10)–(11), errata p. 6].

An explicit singular branch alone does not establish nonexistence. Suppose one constructs \(u,p\) on \(0\leq t<1\) with \(\sup_x|u(x,t)|\) unbounded as \(t\uparrow1\). One must also exclude every global smooth pair with bounded energy on the whole space, or in the periodic class on the torus, with the same force and initial data. Comparison or uniqueness must connect any such pair to the branch that blows up. Section 8 returns to this step.

![**Figure 1 — The four alternatives.** Columns: whole space and unit torus; rows: global smooth existence and admissible breakdown. A and B range over every admissible initial velocity with zero force; C and D choose an initial velocity and a smooth force together. Each alternative is posed for every viscosity \(\nu>0\), and the official formulation accepts any one of them; no implication between the rows is drawn. The announced 2026 construction addresses C and D (**claimed**); A and B remain open in the sources reviewed.](figures/fig1-alternatives.svg){width=100%}

# 3. What was already known

## 3.1 Energy controls an average

For a smooth solution with compact spatial support, take the dot product of (1) with \(u\) and integrate. Incompressibility turns the transport and pressure terms into divergences:
\[
u\cdot(u\cdot\nabla)u
=\nabla\cdot\left(\frac{|u|^2}{2}u\right),
\qquad
u\cdot\nabla p=\nabla\cdot(pu).
\]
Integration by parts gives
\[
\frac{dE}{dt}+\nu\int|\nabla u|^2\,dx
=\int f\cdot u\,dx.
\tag{8}
\]
The same calculation holds on a periodic cell because opposite boundary contributions cancel. This identity is **proved** under the stated smoothness and support or periodicity assumptions. Without force, energy decreases; with force, the right side is the rate of work.

The estimate controls \(u\) in a spatial square-integral norm and the time integral of \(|\nabla u|^2\). It does not bound \(\sup|u|\) or every derivative. Converting these bounds into pointwise smoothness in three dimensions is a major difficulty. Section 4 explains why through scaling.

## 3.2 Global weak solutions

Leray's 1934 work and Hopf's later treatment established global finite-energy weak solution theory. A weak solution satisfies the equations after multiplication by smooth test fields and integration by parts. Derivatives then fall on the test fields, so the velocity need not have all the derivatives in (1). Leray–Hopf solutions also satisfy an energy inequality, the weak counterpart of (8) (**proved**, classical existence theory) [@Leray1934; @Hopf1950; @Fefferman2006, pp. 3–4].

For example, a typical transport integral in the weak formulation involves \(u_i u_j\partial_j\phi_i\). A square-integrable velocity makes the quadratic product locally integrable; it need not make \(\partial_j u_i\) continuous. Passing to a weak limit of smooth approximations can preserve the integral equations while losing pointwise derivative control.

Global weak existence leaves smooth existence unsettled. A smooth, compactly supported force is compatible with the usual forced weak theory, so the announced failure of smooth continuation does not mean all solutions disappear after the singular time. Nor does the announcement alone establish nonuniqueness of Leray–Hopf continuations for its particular data and force.

## 3.3 Local existence, small data and special large data

Classical theory gives a smooth solution for a short time from smooth admissible data. For arbitrary large data the guaranteed interval depends on the datum. For the unforced equation, sufficiently small divergence-free initial data in a critical norm give global solutions. For example, the Fujita–Kato theory uses small \(\dot H^{1/2}(\mathbb R^3)\) norm relative to viscosity \(\nu\) (**proved**) [@FujitaKato1964; @Miller2020, Theorem 1.8; @Fefferman2006, p. 2].

The strategy starts with heat diffusion and treats nonlinear transport as a perturbation. Smallness makes the perturbation controllable over all time. Without smallness, the same argument gives only a local interval. With an arbitrary external force, small initial velocity alone gives no such global conclusion.

Smallness need not mean small speed at every point. The norm and geometry matter. Evan Miller's paper associated with arXiv:1909.09125 proves regularity for quantitatively almost-two-dimensional initial data in the unforced equation, including certain data large in critical norms (**proved**). The closer the relevant three-dimensional components are to a two-dimensional configuration, the more total size the hypotheses permit [@Miller2020, Theorem 1.9]. The theorem does not cover all large three-dimensional data.

## 3.4 Partial regularity and continuation criteria

Caffarelli, Kohn and Nirenberg proved that the singular set of a suitable weak solution has zero one-dimensional parabolic Hausdorff measure. This includes the smooth forces satisfying (6) (**proved**) [@CKN1982; @Fefferman2006, p. 4]. “Suitable” includes a local energy inequality. “Parabolic” measures time with the weight of two spatial dimensions, reflecting heat diffusion: a spatial scale \(r\) accompanies a time scale \(r^2\). This greatly limits a possible singular set but still allows a single singular point, which has zero such measure.

Continuation criteria specify quantities that must become uncontrollable if smoothness fails. For the unforced Euler Cauchy problem on \(\mathbb R^3\), Beale, Kato and Majda work in the classical \(H^s\) continuation class, with integer \(s\geq3\): on each interval before breakdown the velocity belongs to \(C([0,T];H^s)\cap C^1([0,T];H^{s-1})\). Here \(H^s\) requires square-integrable spatial derivatives through order \(s\), beyond joint smoothness alone. A finite maximal existence time in this class forces
\[
\int_0^T\|\omega(t)\|_{L^\infty}\,dt=\infty,
\qquad \omega=\nabla\times u.
\tag{9}
\]
This is a **proved** Euler criterion, not an unqualified statement about every forced Navier–Stokes equation [@BKM1984; @ChenPavlovic2011, Theorem 1.1; @Fefferman2006, p. 3]. Vorticity measures local rotation. Its stretching by a three-dimensional velocity gradient is one source of possible growth.

For the unforced Navier–Stokes Cauchy problem on \(\mathbb R^3\times(0,T)\), Escauriaza, Seregin and Šverák proved that a finite-energy Leray–Hopf solution in strong \(L^\infty(0,T;L^3(\mathbb R^3))\) is regular. In particular, a classical solution in the usual Cauchy class cannot break down at a finite time while that norm stays bounded (**proved**) [@ESS2003, Theorem 1.3, p. 214]. Here
\[
\|u(t)\|_{L^3}=\left(\int|u(x,t)|^3\,dx\right)^{1/3},
\]
and \(L^\infty_t\) means an essentially uniform bound in time. The spatial \(L^3\) norm is strong, not weak spatial \(L^3\). These hypotheses matter: applying a continuation theorem to a different force class requires checking the corresponding version.

## 3.5 What nearby blowup results teach

Terence Tao constructed finite-time blowup for an averaged three-dimensional Navier–Stokes equation, published in 2016 (**proved**). Its modified quadratic operator retains the energy cancellation but differs from the original transport operator. Thus energy cancellation and broad analytic size bounds alone cannot guarantee regularity across this class of equations. An argument for the original equation must use more of its structure [@Tao2016, abstract and §1].

Guo Luo and Thomas Hou's computations exhibited a potential Euler singularity at the wall of a periodic cylinder. Jiajie Chen and Thomas Hou subsequently developed a computer-assisted proof for smooth finite-energy data in that boundary Euler setting (**proved**, published account and rigorous-numerics component). Their method establishes stability of an approximate rescaled profile through rigorous error bounds [@LuoHou2014; @ChenHou2025, Theorem 1; @ChenHouII2025]. Their Part I gives the detailed analysis [@ChenHouI2026, Theorem 2 and §6].

The domain and viscosity are decisive. Euler has \(\nu=0\), and the cylinder wall affects the mechanism. The theorem supplies no positive-viscosity Navier–Stokes counterexample on the whole space or boundaryless torus. The same announcement separately claims finite-time breakdown of unforced Euler flow on \(\mathbb R^3\) from smooth, compactly supported, divergence-free data, with a companion manuscript and the endpoints `Euler.euler_breakdown_R3` and `Euler.exists_compact_smooth_euler_singularity` in the pinned repository (**claimed**) [@Announcement2026; @Lean2026, README and review metadata]. Our full build compiled the Euler library and printed those endpoints' axiom lists; our separate axiom command, Comparator run and clause-by-clause problem comparison cover Navier–Stokes.

# 4. Scaling: how energy can miss concentration

On \(\mathbb R^3\), for \(\lambda>0\), the parabolic rescaling of a solution is
\[
u_\lambda(x,t)=\lambda u(\lambda x,\lambda^2t),\quad
p_\lambda(x,t)=\lambda^2p(\lambda x,\lambda^2t),\quad
f_\lambda(x,t)=\lambda^3f(\lambda x,\lambda^2t).
\tag{10}
\]
Every term of the momentum equation gains the same factor \(\lambda^3\); viscosity stays fixed. For this calculation, take all spatial norms and energies over \(\mathbb R^3\). A change of variables gives
\[
\|u_\lambda(t)\|_{L^p}
=\lambda^{1-3/p}\|u(\lambda^2t)\|_{L^p},
\qquad E_\lambda(t)=\lambda^{-1}E(\lambda^2t).
\tag{11}
\]
These are **proved** by the chain rule and substitution; their powers were also **computed** exactly [@Calculations2026]. Spatial dilation changes a torus's period, so (11) is not a formula for norms over a fixed periodic cell.

The \(L^3\) norm is scale invariant, or critical. Energy decreases as \(\lambda\) increases and compresses the flow to finer spatial scales. This makes the three-dimensional energy estimate supercritical: a small energy budget can conceal activity at ever smaller scales. Scaling permits this concentration without proving that the original equation produces it.

The announced vortex has two distinct length scales. Put \(\tau=1-t\). After choosing the other profile parameters, the manuscript fixes a sufficiently small \(h>0\). Its schedule includes
\[
T_d=e^{M_d}+10,\qquad
0<h<\min\{1/100,\lambda,e^{-T_d}\},
\]
with further smallness choices in the profile construction; \(\lambda\) here is a profile parameter. The coarse bound \(h<1/100\) alone does not make a numerical value admissible [@Manuscript2026, Lemma 4.8, p. 35, and Appendix A.2, (A.6), p. 129]. We keep \(h\) symbolic. On a fixed central similarity region, the leading scales are
\[
R\sim\tau^{1/2},\qquad
L\sim\tau^{1/2-h},\qquad
U\sim\tau^{-1/2-h}.
\tag{12}
\]
Here \(R\) is radial width, \(L\) is axial length, and \(U\) describes the axial and swirling speeds. Since \(R/L\sim\tau^h\to0\), the core becomes more slender while both lengths shrink [@Manuscript2026, §§2.1, 3.1].

Multiply the two radial dimensions and one axial dimension. Then multiply by speed squared, or by the squared radial gradient scale:
\[
\begin{aligned}
\text{core volume}&\sim R^2L\sim\tau^{3/2-h},\\
\text{core energy}&\sim U^2R^2L\sim\tau^{1/2-3h},\\
\int_{\mathrm{core}}|\nabla_r u|^2\,dx
&\sim (U/R)^2R^2L\sim\tau^{-1/2-3h}.
\end{aligned}
\tag{13}
\]
The exponents are **computed**; the manuscript states the same core scales and the threshold \(h<1/6\) (**claimed**) [@Manuscript2026, §2.1, p. 4; §3.5, p. 16]. The core energy tends to zero, and the last power is time integrable when \(h<1/6\), which includes the manuscript's much smaller range. Growing peak speed is therefore consistent with bounded energy and finite integrated dissipation. The full energy bound still requires control of the exterior and corrections.

The same scale calculation gives
\[
\|u\|_{L^3(\mathrm{core})}\sim\tau^{-4h/3},
\qquad
\int_{\mathrm{core}}|u|^5\,dx\sim\tau^{-1-6h}.
\tag{14}
\]
The \(L^3\) norm is the scale-invariant spatial norm of Section 3.4. The fifth power enters through the scale-invariant space-time integral \(\int_0^1\!\!\int|u|^5\,dx\,dt\) in the Ladyzhenskaya–Prodi–Serrin condition [@ESS2003, Theorem 1.2, pp. 213–214]. At these core scales its time integral diverges, since \(\int_0^{\tau_0}\tau^{-1-6h}\,d\tau=\infty\). Both critical quantities grow while the core's energy shrinks. These **computed** consistency checks do not apply an unforced continuation criterion to this forced solution.

The angular Reynolds number \(UR/\nu\) grows like \(\tau^{-h}\) at fixed viscosity. Radial diffusion still has rate \(\nu/R^2\sim\tau^{-1}\), while axial transport has rate \(U/L\sim\tau^{-1}\). Viscosity remains in the leading balance, so the construction needs a viscous profile [@Manuscript2026, §2.1, pp. 4–5].

![**Figure 2 — Speed and energy on different scales.** Left: core regions at three times, shown with particle trails, not material volumes, drawn with \(h=0.2\), outside the range \(h<1/6\) of (13), and with the anisotropy exaggerated (**heuristic**); the source requires a far smaller \(h\), fixed by its full parameter schedule. Right: the leading scale laws (12)–(13) and their logarithmic slopes, with all constants normalized to one; the exponents are **computed**, and the scales are the manuscript's (**claimed**). These are scale laws, not numerical data of the constructed solution.](figures/fig2-concentration.svg){width=100%}

# 5. The residual turns forcing into a design problem

For any smooth divergence-free trial velocity and pressure, define their momentum residual by
\[
\mathcal R(u,p)=\partial_tu+(u\cdot\nabla)u-\nu\Delta u+\nabla p.
\tag{15}
\]
Setting \(f=\mathcal R(u,p)\) makes the momentum equation hold. The difficulty is admissibility: if the chosen velocity blows up, its residual usually does too. The construction must arrange cancellations so that every derivative of \(\mathcal R\) extends smoothly through \(t=1\), while the velocity does not [@Manuscript2026, §2].

A simple trial field shows the obstruction. If \(u=\tau^{-a}V(x)\), then its time derivative has size \(\tau^{-a-1}\), its quadratic transport has size \(\tau^{-2a}\), and its viscous term has size \(\tau^{-a}\), before any spatial concentration is included. Choosing \(f\) to be their sum generally imports these singular powers into the force. Smoothness at every \(t<1\) is insufficient.

The manuscript proposes three layers (**claimed**, manuscript architecture). First, build a concentrating background vortex that balances the equation near its axis. Second, add disturbances in an annulus whose quadratic momentum transport repairs the background's leading error. Third, correct the remaining errors to every order, making the residual smooth while the leading velocity stays singular [@Manuscript2026, §§2–3].

The exact algebra behind the last step is useful. For a correction \(w\) and pressure correction \(\pi\),
\[
\begin{aligned}
\mathcal R(u+w,p+\pi)=\mathcal R(u,p)
&+\partial_tw-\nu\Delta w+\nabla\pi\\
&+(u\cdot\nabla)w+(w\cdot\nabla)u
+(w\cdot\nabla)w.
\end{aligned}
\tag{16}
\]
The identity follows by expanding the quadratic term (**proved**); polynomial instances were also **computed**. Each correction must be assessed in the full residual: removing one error can generate transport cross-terms, a new quadratic stress, and cutoff errors that the iteration must also control.

# 6. A collapsing vortex and an annular stress

## 6.1 Geometry with two shrinking lengths

Use cylindrical coordinates \((r,\theta,z)\). The manuscript's background is axisymmetric: its cylindrical components \(u_r,u_\theta,u_z\) do not depend on \(\theta\). In its central region, inward spiralling combines with axial outflow, carrying incoming fluid away along the axis as incompressibility requires. Other regions have radial outflow, and the axial profile is slightly asymmetric. A perfectly reflected drawing is only schematic [@Manuscript2026, §2.1 and Appendix B].

If a particle conserves angular momentum \(ru_\theta\), inward motion increases its angular speed. This spin-up picture is **heuristic**: the actual viscous profile also involves angular momentum transport, pressure and axial flow.

The manuscript introduces variables
\[
A=\frac12+h,\quad D=\frac12-h,\qquad
\tau=q(1-\eta^2),\quad z=q^D\eta,\quad X=\frac{r^2}{2q}.
\tag{17}
\]
On \(|\eta|\leq\eta_0<1\), \(q\) is comparable to \(\tau\), giving (12). The coordinates also distinguish approach to the singular point from approach to other points of the final-time slice [@Manuscript2026, §3.1].

At fixed \(\tau\), differentiation gives
\[
\frac{dz}{d\eta}
=q^D\frac{1-2h\eta^2}{1-\eta^2}>0
\quad (|\eta|<1).
\tag{18}
\]
Equivalently, \(q\) solves \(\tau=q-z^2q^{2h}\). On this coordinate surface, the derivative of the right side with respect to \(q\) is \(1-2h\eta^2>0\). Both identities were **computed** and follow directly from (17). Since \(z\to\pm\infty\) as \(\eta\to\pm1\) at fixed \(\tau>0\), they show that every \((z,\tau)\) with \(\tau>0\) determines \(q\) and \(\eta\) uniquely; profile existence requires a separate argument.

Profile existence is a substantial analytic task. Smoothness on the axis constrains cylindrical components. The inner profiles must join a viscous heat exterior, satisfy five radial moment conditions, and leave an error with a special sign geometry. The manuscript's Theorem 4.6 and Appendices A–C address these requirements together (**claimed**).

## 6.2 The error has to be realizable

Joining the balanced core to an exterior leaves a leading tangential residual in an annulus. The construction represents it by radial derivatives of stress components:
\[
R_\theta=-\left(\partial_r+\frac2r\right)T_{r\theta},
\qquad
R_z=-\left(\partial_r+\frac1r\right)T_{rz}.
\tag{19}
\]
The extra \(1/r\) factors express cylindrical geometry. Here \(T_{r\theta}\) and \(T_{rz}\) are the radial fluxes of azimuthal and axial momentum. Integrating (19) from the axis gives
\[
T_{r\theta}(r)=-\frac1{r^2}\int_0^r s^2R_\theta(s)\,ds,\qquad
T_{rz}(r)=-\frac1r\int_0^r sR_z(s)\,ds.
\]
A stress that starts at zero therefore returns to zero beyond the annulus exactly when \(\int_0^\infty r^2R_\theta\,dr=0\) and \(\int_0^\infty rR_z\,dr=0\). These two moment conditions permit compact localization [@Manuscript2026, §3.2 and Theorem 4.6].

Why should an oscillation supply stress? If a rapidly oscillating vector has the toy form \(w=a b\cos\phi\), where \(b\) is fixed, its phase average is zero but
\[
\langle w\otimes w\rangle=\frac{a^2}{2}\,b\otimes b.
\tag{20}
\]
Nonlinear transport involves quadratic products, so zero average velocity need not mean zero average momentum flux. Equation (20) follows by averaging \(\cos\phi\) and \(\cos^2\phi\) (**proved**). This explains the mechanism; the proof uses a different pulse formula.

There is a constraint. The coefficient \(a^2/2\) is nonnegative. In a two-dimensional toy model, directions \(b_+=(1,1)\) and \(b_-=(1,-1)\) generate matrices
\[
c_+b_+\otimes b_++c_-b_-\otimes b_-
=\begin{pmatrix}s&d\\d&s\end{pmatrix},
\qquad s=c_++c_-,\quad d=c_+-c_-,
\tag{21}
\]
with \(c_\pm\geq0\), hence \(|d|\leq s\). This **proved** constraint shows why waves cannot supply an arbitrary prescribed stress. In the actual construction, two realizable covariance directions generate an admissible cone for the relevant stress components. The background's target must lie inside that cone; Appendix C adjusts the shear while repairing the moment conditions (**claimed**).

![**Figure 3 — What oscillations can supply.** Left: a core, the annulus that carries the leading momentum deficit, and zero-mean oscillations whose quadratic products average to a nonzero flux (mechanism **claimed**; averaging identity (20) **proved**). Right: the toy cone of (21), with the permitted matrix \((s,d)=(2,1)\) and the impossible \((1,2)\) (**proved**). The actual admissible stress cone has its own profile-dependent directions; the link between the two is **heuristic**.](figures/fig3-annulus-cone.svg){width=100%}

# 7. Pulses, correction cycles and all derivative orders

## 7.1 Growth and decay are both used

The manuscript's disturbances are localized oscillatory pulses. Background shear changes their wavevectors and polarizations and amplifies the needed components; viscosity then damps them. This sequence delivers momentum flux in the annulus while controlling unwanted terms (**claimed**) [@Manuscript2026, §§6–7]. The pulses' dynamics, support and averaged stress must all fit the same viscous equation.

Localization also has to preserve incompressibility. Multiplying a divergence-free field by a cutoff \(c\) gives
\[
\nabla\cdot(cu)=\nabla c\cdot u,
\]
which generally is not zero. Instead one can localize a vector potential and take its curl:
\[
w=\nabla\times(cB),\qquad
\nabla\cdot w=0,
\qquad
\nabla\times(cB)=c\nabla\times B+\nabla c\times B.
\tag{22}
\]
These are **proved** differential identities; polynomial instances were **computed**. The extra term belongs to the correction; momentum cutoff errors still need control.

The manuscript uses an auxiliary two-torus to separate overlapping pulse labels and organize oscillations and their means. Averaging over these variables differs from evaluating the final fields along the physical phase map. The proof must control that discrepancy: the final claim concerns (1), with its physical nonlinear transport intact [@Manuscript2026, §§6–7].

## 7.2 Why a finite correction is insufficient

The radial scale makes axial diffusion lower order by a factor \(q^{2h}\), supplying a hierarchy for background corrections. Differentiation in space or time costs powers of the shrinking scales, however, so a residual small in value can still have large derivatives [@Manuscript2026, §5].

For an elementary comparison, \(s^M\sin(1/s)\) can tend to zero as \(s\downarrow0\), while sufficiently high derivatives fail to do so. Any fixed algebraic order of smallness leaves high enough derivatives unprotected. The required force is \(C^\infty\), so the construction needs estimates at every derivative order.

The manuscript organizes residual improvement into four ordered corrections: supported nonzero angular modes, averaged tangential stress, the residual with zero auxiliary mean, and a five-equation moment correction. The last preserves two existing integral constraints and cancels the linear contributions to three current defects, \((P,J_\theta,J_z)\). Its nonlinear remainders enter the next residual.

After every correction, the authors reconstruct pressure from the updated radial equation and include its axial contribution in the full residual (16). The order matters: one correction can disturb conditions established by another (**claimed**) [@Manuscript2026, §3.4, pp. 13–14; §8.6, p. 96; Proposition 9.6, pp. 107–108].

Proposition 9.6 raises the residual order, measured in powers of \(\varepsilon=q^h\), through
\[
\sigma_j=\frac15+\frac{j}{10}.
\tag{23}
\]
In physical variables, derivatives of order \(m\) of the stage-\(j\) residual are bounded by \(q^{h\sigma_j-K_m}\), up to logarithmic factors and a separately retained flat term. The loss \(K_m\) depends on \(m\) but not on the stage [@Manuscript2026, (9.18), p. 113]. Since \(h\sigma_j\to\infty\), the exponent eventually exceeds any prescribed \(N\). This allows the iteration to target smooth forcing at every order (**claimed**).

The sequence must define an actual smooth field. Shrinking cutoffs applied to potentials and pressure produce a locally finite realization for \(q>0\): on any region bounded away from \(q=0\), every sufficiently late correction vanishes, so only finitely many terms remain. The bounds control approach to \(q=0\). Proposition 9.9 asserts a final residual with every space-time derivative \(O(q^N)\) for every \(N\), on the bounded similarity sectors specified there (**claimed**) [@Manuscript2026, pp. 107, 114].

Much of the proof lies in these uniform pulse estimates, inversion with derivative losses, moment repair, positivity of amplitudes, and nonlinear remainder bounds. Section 4's scale calculation cannot supply them; this account explains their logical role.

![**Figure 4 — A correction cycle.** Four ordered corrections, with pressure reconstructed from the updated radial equation and the full residual updated after each; the five-equation moment solve preserves two constraints and corrects three defects. A complete pass raises the residual order \(\sigma_j\), and a separate smooth cutoff realization follows (**claimed**, manuscript architecture). The inset is the elementary identity (22) (**proved**). A finite number of passes does not yet give a smooth force through blowup.](figures/fig4-cycle.svg){width=100%}

# 8. From a local singularity to the official conclusion

## 8.1 Extending the force

To turn the local construction into an admissible force, the manuscript cuts off the potentials, azimuthal component and pressure away from the singular region. It arranges the force's derivative limits at the final time, then extends it past that time using compatible Taylor jets and shrinking cutoffs. Lemmas 10.2–10.3 assert a force in
\[
C_c^\infty(\mathbb R^3\times(0,\infty);\mathbb R^3).
\tag{24}
\]
This means smooth with compact support strictly inside positive time and in a compact spatial region. The force need not vanish near the singular point: the extension combines flat residual estimates in one similarity region with off-origin limits (**claimed**) [@Manuscript2026, §§10.1–10.2].

Compact support is stronger than Clay's decay requirement. Each derivative is bounded on the compact support and zero outside. Multiplication by any fixed power of \(1+|x|+t\) preserves boundedness, proving (6) for a force satisfying (24). Zero initial velocity satisfies every initial decay and incompressibility condition (**proved** consequences of the claimed witness properties).

The distinction between smooth and analytic matters here. Constantin, Ignatova and Vicol consider suitable weak solutions smooth on compact subsets before the candidate singular time. Their theorem assumes the specified anisotropic Type II bounds on the angular mean and its radial/axial derivatives through total order two, exact axisymmetry on a nonempty core at each time, and a force uniformly bounded in spatial \(C^2\) up to that time.

Under these assumptions, if the force is real analytic in the space variables, locally uniformly on compact pre-singular cylinders, then the candidate singular point is regular (**claimed**, preprint theorem). The uniform \(C^2\) bound is independent: the analyticity radius may deteriorate towards that time. They also rule out force identically zero near the point within this class. These restrictions on the mechanism neither give regularity for every analytically forced flow nor contradict Clay's smooth-force allowance [@CIV2026, Theorem 1.1, (1.5)–(1.8), and Remark 1.2(a)–(b), pp. 3–4]. Flatness at a point, as in (4), differs from vanishing on a neighborhood.

## 8.2 Energy and comparison

The completed construction asserts compact spatial support for velocity and pressure before time one, uniformly bounded energy, and unbounded speed along points approaching the origin. Lemma 10.4 obtains the energy and integrated dissipation bounds using the equation and the smooth compact force (**claimed**) [@Manuscript2026, §10.3]. The energy conclusion concerns the whole field, including all corrections.

Suppose a global smooth competitor \(v,P\) with uniformly bounded energy on the whole space existed with this force and zero initial data. Comparison must show \(v=u\) before time one. Subtracting the equations suggests an energy estimate for the difference. But the whole-space competitor need not have decaying derivatives or pressure: the argument must account for far-field fluxes without assuming more than Clay requires.

The manuscript's Lemma 10.5 addresses these fluxes through pressure recovery, cutoff flux bounds and expanding-ball energy estimates (**claimed**) [@Manuscript2026, §10.3, Lemma 10.5, pp. 121–123]. It is the manuscript's own comparison argument, not an appeal to a general uniqueness theorem. One intermediate estimate differs in Lean, as discussed in Section 10.

Once comparison is available, the final contradiction is elementary. The constructed supports lie in a fixed compact set \(K\). A global smooth \(v\) is bounded on the compact space-time set \(K\times[0,1]\). Equality with \(u\) for \(t<1\) contradicts the unbounded peak speed there. This is the **proved** final implication, conditional on the construction and comparison. It excludes every global smooth competitor with bounded energy on the whole space for the same data and force.

The construction is carried out at viscosity one. For \(\nu>0\), the fields
\[
u_\nu(x,t)=\sqrt\nu\,u(x/\sqrt\nu,t),\qquad
p_\nu(x,t)=\nu\,p(x/\sqrt\nu,t),\qquad
f_\nu(x,t)=\sqrt\nu\,f(x/\sqrt\nu,t)
\]
solve (1) with viscosity \(\nu\) and the same singular time (**proved** by the chain rule). A smooth competitor with bounded energy on the whole space at viscosity \(\nu\) rescales to one at viscosity one. This yields the conclusion for every positive viscosity and explains why the force in (25) may depend on \(\nu\) [@Manuscript2026, (10.22)–(10.23), p. 124].

## 8.3 Transferring the construction to the torus

The whole-space fields have compact support before blowup. Parabolic rescaling and a time shift place them strictly inside a unit spatial cell. Periodize by summing integer translates. At each point the separated supports ensure that different copies do not interact in the nonlinear term. Smooth periodic pressure is included. A periodic energy comparison then excludes a global smooth periodic competitor (**claimed**, Corollary 10.6) [@Manuscript2026, §10.5, pp. 125–126].

The periodic lift has no compact support in the whole space. Its force retains compact support in time, and all spatial derivatives are bounded on a cell, giving (7). No finite whole-space energy or decay at spatial infinity is asserted for a nonzero periodic lift. These are the domain changes required for D.

![**Figure 5 — Local construction, global conclusion.** Schematic norm envelopes: the force is smooth through time one, the speed grows towards it, the energy stays bounded. Comparison with any global smooth competitor with bounded energy on the whole space (manuscript Lemma 10.5, **claimed**) and the compactness contradiction (**proved**, given the construction) give C; rescaling and periodization give D (**claimed**, Corollary 10.6). A and B stay outside these arrows.](figures/fig5-tracks.svg){width=100%}

# 9. Reading the formal theorem against the official problem

## 9.1 Identify an endpoint before trusting a label

The inspected development is `openai/NavierStokesAndEuler` [@Lean2026]. The pinned revision is:

`f9e8bc5b38b6e212696e8a30e3e91517af887bbd`.

Its bridge endpoints are

- `NavierStokes.ComparatorBridge.navier_stokes_breakdown_R3`;
- `NavierStokes.ComparatorBridge.navier_stokes_breakdown_periodic`.

The submission exposes the same propositions in the namespace `NavierStokes.Comparator`. In mathematical notation the whole-space endpoint says
\[
\forall\nu>0\;\exists u_0,f:\quad
\operatorname{InitialDecay}(u_0)\ \land\
\operatorname{ForceDecay}(f)\ \land\
\neg\exists v,p\;\operatorname{GlobalSolution}_{\nu,u_0,f}(v,p).
\tag{25}
\]
Here the global solution predicate requires uniformly bounded energy on the whole space; the periodic endpoint replaces the three predicates with their periodic versions, including periodic velocity and pressure. The existential force may depend on viscosity. The final proofs obtain their candidates from the construction; they require no supplied vortex, residual estimate or blowup assumption. This is **Lean** evidence from the source and our rerun, discussed below; (25) is an explanatory transcription.

## 9.2 The clauses inside the predicates

The following comparison uses the pinned `ComparatorDefinitions.lean`; field names locate the formal requirements.

| Official requirement | Formal expression or field | Meaning and qualification |
|---|---|---|
| Three dimensions | `EuclideanSpace ℝ (Fin 3)` | Ordinary Euclidean three-space |
| Positive viscosity | `(ν : ℝ) (hν : ν > 0)` | Every positive real viscosity |
| Smooth initial data | `.smooth` for initial data | `ContDiff ℝ ∞` |
| Initial incompressibility | `.div_free` | Trace of the spatial derivative is zero |
| Initial decay (4) | `.decay` for initial data | Every derivative tensor and every decay order |
| Smooth force | `.smooth` for force | Joint `ContDiffOn` on \(\mathbb R^3\times[0,\infty)\) |
| Force decay (5) | `.decay` for force | Joint derivative tensors bounded by \(C/(1+\|x\|+t)^K\) |
| Momentum equation (1) | `.navier_stokes` | Within-time derivative, spatial derivative applied to velocity, vector Laplacian, pressure gradient and force |
| Incompressibility (2) | `.div_free` in the solution structure | Every position and nonnegative time |
| Initial condition (3) | `.initial_condition` | Exactly the same chosen \(u_0\) |
| Smooth velocity and pressure (6)/(11) | `.velocity_smooth`, `.pressure_smooth` | Joint smoothness within the closed future domain |
| Actual finite energy (7) | `.integrable` | `MemLp` of the norm with exponent 2, at every \(t\geq0\) |
| Uniform energy bound (7) | `.globally_bounded_energy` | One \(E\) with \(\int\|v(x,t)\|^2dx<E\) for all \(t\geq0\) |
| Periodic data and force (8) | `IsOnePeriodic` and periodic structure fields | Translation by each coordinate unit vector |
| Periodic force decay (9) | `.decay` for periodic force | Uniform spatial bound with denominator \((1+t)^K\) |
| Periodic velocity (10) | `.isOnePeriodic_velocity` | Period one in each direction at each nonnegative time |
| Periodic pressure, erratum | `.isOnePeriodic_pressure` | Explicitly included; no zero-mean normalization |
| No global admissible pair | `¬ (∃ v p, …)` | Nonexistence for the same force and datum |

To compare these requirements, first consider derivatives. A bound on a full derivative tensor's norm controls each coordinate mixed partial by evaluation on coordinate unit vectors. Conversely, at a fixed order there are finitely many coordinate entries, so bounds on them control the tensor norm with a changed constant. The tensor and componentwise decay formulations therefore express the same estimates.

Second, the formal decay order \(K\) ranges over real numbers, but integer orders suffice. For any real \(K\), choose a nonnegative integer \(N\geq K\). Since the denominator base is at least one, a bound with exponent \(N\) implies one with exponent \(K\). This **proved** comparison adds no decay demand on the witness.

Third, the energy predicate explicitly requires square integrability. A real-valued integral in Lean has a default value when the function is not integrable, so an integral inequality alone could misdescribe finite physical energy. Here `MemLp` closes that gap. Smoothness and physical finite Lebesgue energy imply the formal field. The formal inequality \(\int\|v\|^2<E\) matches Fefferman's (7); the factor \(1/2\) in (5) only changes the constant.

Finally, the formal time domain is closed, so the PDE uses within derivatives at time zero. An ambient smooth competitor restricts to the required within-domain smoothness; excluding the formal class therefore excludes the usual smooth competitors. The converse, when closed-half-space smoothness is defined by extension, invokes an extension result not reproved here. The constructed force is ambient smooth with positive-time compact support, so the witness presents no such difficulty.

On this reading, the source comparison finds no missing official clause. It does not supply a machine-checked equivalence between independently defined statements. In particular, the stronger construction properties in Theorem 1.1 are not imposed on the competing solutions in (25).

## 9.3 MathDB's four targets and version boundary

MathDB's four frozen formalizations are targets for C, D, A and B respectively, not four completed solutions. This article compared their public `Problem.Target` abbreviations with the immutable repository sources. The relevant eleven definition and structure bodies match the comparator definitions after removing comments and whitespace. The C/D propositions have the same quantifier and predicate structure; the A/B propositions set the force to zero [@MathDBTargets2026; @FormalConjectures2026].

Matching text does not establish a proof import. The MathDB targets pin Lean 4.33.1 and their own Mathlib revision; the inspected proof pins Lean 4.34.0-rc2 and a different Mathlib revision. A port or institutional adoption would require a separate record.

# 10. What was checked, and what remains under review

## 10.1 Execution evidence has a version

The public records below were inspected as of 7 November 2026; our rerun took place on 9 November 2026. A successful run is evidence about the source revision and environment it actually used.

| Evidence | What it supports | Limit |
|---|---|---|
| This article's exact calculations | The powers, coordinate identities and specified algebraic checks in Sections 4–7 | No profile existence, all-order estimates or PDE solution proof |
| This article's source audit | Both final statement shapes, definition correspondence and absence of prohibited code tokens in the enumerated project import closures | Lexical source inspection; external library bodies were outside the scan |
| Our Lean rerun | The pinned development builds; both endpoint axiom lists contain only the three standard axioms; Comparator compares challenge and solution statements and both kernels accept | Execution evidence with the cache, toolchain and Comparator trust boundary described below |
| Upstream formalization metadata | The authors list the two endpoints and three standard axioms | The record calls its assessment self-assessed |
| Earlier independent checks | Public build/audit reports exist for the earlier `8937a8f…` revision | They do not establish execution of the later source tree |
| Institutional status pages | Clay says Active; MathDB's progress text says Open | Neither label is a kernel transcript or a mathematical referee report |

Our rerun used a rented cloud Linux VM with 8 vCPUs and 50 GB RAM and the pinned Lean 4.34.0-rc2 toolchain. `lake build` exited 0 after 11,424 jobs and 103 minutes 23.528 seconds wall time. Our axiom check imported `NavierStokes.ComparatorSolution`; Comparator ran with `ComparatorChallenges/NavierStokes.json`. Both commands exited 0, and Comparator reported acceptance by nanoda and Lean's default kernel [@Rerun2026].

Separately, the source audit followed imports from each endpoint and searched code, excluding comments and strings. The submission closure contains 609 project modules and 382,514 lines, with no `sorry`, `admit`, new `axiom`, `native_decide`, `implemented_by`, `extern` or `unsafe` tokens. The four `sorry` warnings in the full build are intentional challenge placeholders, two in `ComparatorChallenges/NavierStokes.lean` and two in `ComparatorChallenges/Euler.lean`, all outside that closure. This is a lexical check, with the limits listed above [@Calculations2026; @Lean2026].

Our own `#print axioms` output for each submission endpoint gives
\[
\texttt{[propext, Classical.choice, Quot.sound]}.
\tag{26}
\]
These are the permitted foundational axioms, not assumptions of the Navier–Stokes construction. The authors' self-assessed `formalization.yaml` record reports the same lists; our logs supply the execution receipts [@Lean2026, review metadata; @Rerun2026].

Whether these statements express the official problem is the subject of Section 9's clause-by-clause reading. The evidence package records the tool versions and the exact commands [@Rerun2026].

Formal checking tests whether a proof term establishes a proposition from the allowed foundations. Reading definitions tests whether that proposition expresses the intended mathematics. Reproducible builds, compiler and library provenance, and independent kernels address further trust questions. Human review asks whether the manuscript's written steps are valid and communicate the actual proof. Each of these four tasks needs its own evidence.

## 10.2 Two concrete manuscript–Lean differences

On 6 October, Alexander Bastounis, Fabian Circelli and Anders C. Hansen posted a critique of faithful translation, including two comparisons with this development. This article checked both differences below against the original passages and the pinned source [@BCH2026, Examples 3.1 and 3.3].

The manuscript's Lemma 8.6 gives a torus inverse estimate with \(m+4\) input derivatives for \(m\) output derivatives. The named Lean bound `norm_derivativeWord_inverse_le` uses derivative bounds at `w.length + 5`. Requiring an extra derivative is a weaker regularity estimate. It may still be sufficient in a smooth, every-order construction, but it does not verify the sharper estimate as printed [@Manuscript2026, (8.19), p. 95; @Lean2026, inverse-bound locator].

The second difference concerns the pressure flux used in whole-space uniqueness. With \(w=v-u\), a smooth cutoff \(\phi_R(x)=\phi(x/R)\), \(\chi_R=\phi_R^8\), and
\[
A_R=\left(\int\chi_R|\nabla w|^2\right)^{1/2},
\qquad B_R=\|\phi_R^4w\|_{L^6},
\]
the manuscript bounds the absolute pressure flux by
\[
\frac{C_T}{R}\left[(B_R+1)B_R^{1/2}
+R^{-3/4}B_R^{3/4}\right].
\tag{27}
\]
The corresponding formal bound has the form
\[
C_P\left[(B_R^{1/2}+1)
\left(\frac{A_R}{R}+\frac1{R^2}\right)
+R^{-7/4}B_R^{3/4}\right].
\tag{28}
\]
The source contains the extra localized gradient norm and different exponents, and the formal uniqueness proof invokes this estimate. Equation (28) is not a literal translation of (27) [@Manuscript2026, (10.19), p. 123; @Lean2026, pressure-flux and uniqueness locators].

These differences show that the formal development does not check every intermediate manuscript estimate as printed. They neither give a counterexample to C or D nor exhibit a forbidden endpoint axiom. A formal proof can use a different sufficient estimate without certifying a stronger printed lemma. This article does not adjudicate the critique's broader computability claims or independently reprove either pressure estimate.

## 10.3 Mathematical engagement and institutional status

Constantin, Ignatova and Vicol's September preprint gives the structural analytic-force restriction explained in Section 8. Zhen Lei and Xiao Ren's September account develops the profile construction and an explanatory core model, leaving pulse cancellation outside Part I. Their Part II, posted on **4 November**, explains residual correction through oscillatory pulses; it falls outside the pre-November reception record. These works provide substantive mathematical engagement but no completed independent referee verdict on the whole manuscript [@CIV2026; @LeiRenI2026; @LeiRenII2026].

The mutable manuscript URL has yielded two recovered editions, of 165 and 166 pages. The later edition expands the historical attribution. It credits Córdoba and Martínez-Zoroa (forced three-dimensional Euler and porous-medium singularities) and Córdoba, Martínez-Zoroa and Zheng (forced hypodissipative Navier–Stokes) with amplification across scales under a controlled force. Its introduction also cites Albritton, Brué and Colombo for nonuniqueness of forced Leray–Hopf solutions [@Manuscript2026, §1.1, pp. 2–3]. This article cites the 166-page edition throughout. The recovered archive does not establish that every intermediate version was captured. The fixed Lean revision is a separate version identifier [@Manuscript2026; @Calculations2026].

The public records describe different assessments. OpenAI announces a resolution of C and D, and its formal record lists both endpoints with the standard axioms. MathDB's retrieved progress text still reports no independently verified advance that resolves the problem, and its formal verification fields were null. Clay still labels the problem Active. These attributed records do not establish universal acceptance [@Announcement2026; @Lean2026; @MathDB2026; @ClayStatus2026].

# 11. The questions that remain

The announced construction claims that a carefully selected smooth force can drive a fluid from rest into a finite-time velocity singularity. Its proposed mechanism couples a concentrating viscous core to oscillatory momentum transfer in an annulus, then removes residual singularities to every derivative order. The force, geometry, estimates and solution class are all part of this specific claim.

On the clause-by-clause reading of Section 9, the named formal endpoints express the forced alternatives, with the pressure erratum, for solutions with bounded energy on the whole space and smooth periodic solutions on the unit torus. Our rerun builds the pinned development, prints only the standard foundational axioms for both endpoints, and records acceptance by both Comparator kernels. Some intermediate manuscript arguments differ from the formal proofs (Section 10.2).

The endpoints do not set the chosen force to zero, so global smoothness for all admissible unforced data, A and B, remains open. They also leave questions about how typical singularity formation is, what happens when the force or data change, and the behavior and uniqueness of weak continuations for this construction. An existential statement alone answers none of these.

Fefferman gives the official conditions in six pages. Sections 2–3 of the manuscript provide its mechanism and roadmap; Sections 4–9 carry the profile and correction estimates; Section 10 supplies the force extension and nonexistence conclusion. Reading the comparator predicates and the execution record alongside that account clarifies the announced advance while leaving the outcome of mathematical review open.

# Notation key {-}

These symbols are defined where used; the key gives a route back to them.

| Symbol | Meaning | Section |
|---|---|---|
| \(x,t;\ u,p;\ u_0,f,\nu\) | Position, time; velocity, pressure; initial velocity, force, positive viscosity | 1 |
| \(\nabla,\Delta;\ \omega=\nabla\times u\) | Spatial gradient and Laplacian; vorticity | 1, 3.4 |
| \(E(t),\ \|u\|_{L^p}\) | Kinetic energy; spatial \(p\)-norm | 1, 3.4–4 |
| \(\mathbb R^3,\mathbb T^3\) | Whole space; unit periodic cell with opposite faces identified | 2 |
| A, B; C, D | Unforced existence alternatives; forced breakdown alternatives | 2 |
| \(\lambda\) | Parabolic scaling factor in (10); a separate profile parameter in the smallness schedule | 4 |
| \(\tau=1-t,\ h\) | Time to the normalized singularity; sufficiently small positive profile parameter | 4 |
| \(R,L,U\) | Core radial width, axial length, leading speed scale | 4 |
| \(r,\theta,z;\ q,\eta,X\) | Cylindrical coordinates; similarity coordinates of (17) | 6.1 |
| \(A=\frac12+h,\ D=\frac12-h\) | Profile exponents in (17); distinct from alternatives A and D | 6.1 |
| \(T_{r\theta},T_{rz};\ w\otimes w,\langle\cdot\rangle\) | Stress components; tensor product, phase average | 6.2 |
| \(\varepsilon=q^h,\ \sigma_j;\ P,J_\theta,J_z\) | Small parameter, residual order in its powers; three moment defects | 7.2 |
| \(v,P\) | Competing velocity and pressure; \(P\) here differs from the moment defect | 8.2 |
| \(\phi_R,\chi_R;\ A_R,B_R\) | Spatial cutoffs; localized gradient and velocity norms | 10.2 |

# References {-}

<div id="refs"></div>

Prepared by Yao Xu with AI assistance.
