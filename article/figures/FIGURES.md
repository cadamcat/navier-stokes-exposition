# Figure specifications

These are original design specifications for five figures and their animated
versions. The article currently contains caption callouts, not finished artwork.
Do not trace or reuse figures from any other exposition. Use vector artwork for
the final diagrams and standard plotting software for quantitative panels.

Use dark navy for velocity, teal for viscous smoothing, amber for force and
residual, and violet for quadratic stress. Pair color with labels or distinct
line styles. Mathematical labels must remain readable in grayscale and on a
phone. Motion arrows describe velocities, not the motion of a solid surface.
No photorealistic water, explosion, broken container or turbulent smoke should
stand for a mathematical singularity.

## Figure 1: The four alternatives

**Placement:** after Section 2. **Purpose:** establish the force quantifiers
before showing a vortex. **Status:** official requirements, not a proof diagram.

Draw a two-by-two grid. Columns: whole space and unit torus. Rows: global smooth
existence and admissible breakdown. Label cells A, B, C, D, respectively. Put
“every admissible initial velocity; force = 0” in A/B, and “choose initial
velocity and smooth force; exclude every global admissible pair” in C/D.
Place “every viscosity ν>0” above the whole grid. Under C put “uniformly finite
whole-space energy”; under D put “periodic velocity and pressure.”

At the bottom write “The official formulation asks for any one alternative.”
Highlight C and D with a thin border labeled “announced 2026 construction,”
and add a separate note “A/B remain open in the sources reviewed.” No implication
arrow should run from C/D to the falsity of A/B.

**Animation:** reveal data quantifiers first, then force conditions, then
conclusions. Pause on the difference between “every datum” and “choose a force.”

**Sources:** Fefferman2006 pp. 1–2 and pressure erratum; Manuscript2026 Theorem
1.1 and Corollary 10.6. **Caption:** use Figure 1's callout in the article,
expanded only if these conditions remain adjacent to the cells.

## Figure 2: Concentration with bounded energy

**Placement:** end of Section 4. **Purpose:** distinguish peak speed from total
energy, and actual scale powers from a schematic shape. **Status:** symbolic power
calculation conditional on the leading-scale model; geometric drawing heuristic.

Use two panels. Left: a sequence of three concentric, slender cylindrical core
regions, with radius R and axial half-length proportional to L. Arrows spiral
inward in the central region and leave axially. A few outward radial arrows
farther along the axis prevent the drawing from suggesting that all radial
motion is inward. Mark the core boundary as a dashed coordinate contour. Put
“not a material volume” beside it. The axial flow is schematic; do not assert
exact reflection symmetry.

Label the drawing directly “schematic; anisotropy exaggerated.” Keep h symbolic
throughout, chosen by the full manuscript parameter schedule: fix Md, then
Td=exp(Md)+10, P*, λ, and finally a sufficiently small positive h, including
h<min{1/100,λ,exp(−Td)} and the subsequent profile smallness requirements.
The coarse interval 0<h<1/100 alone is insufficient. No numerical h is selected.

Right: a formula table of the pure powers and their symbolic logarithmic slopes.
Let s=−log10(τ). Show the following table, without numerical curves or ticks:

| Scale | Value before taking the logarithm | Slope against s |
|---|---|---|
| Speed | τ^(−1/2−h) | 1/2+h |
| Radius | τ^(1/2) | −1/2 |
| Axial length | τ^(1/2−h) | −1/2+h |
| Core energy scale | τ^(1/2−3h) | −1/2+3h |

Normalize all proportionality constants to one and state this beside the table.
These are scale laws, not sampled values of the full constructed solution.
The R/L ratio is τ^h; include that formula beside the schematic drawing.
Any later quantitative panel must specify parameters justified by the full
schedule, rather than choose h from the coarse interval. This specification
uses symbolic formulas to avoid an unjustified numerical choice.
List the spatially integrated radial-gradient power τ^(−1/2−3h) below the table, with
“time integrable for h<1/6.” Do not portray the full energy as computed.

**Animation:** highlight each formula while the schematic core contracts;
use qualitative arrows for increasing speed and decreasing core-energy scale.
Keep “schematic; anisotropy exaggerated” and the scale-model qualification visible.

**Sources:** Manuscript2026 §§2–3, Lemma 4.8 p. 35 and Appendix A.2 (A.6)
p. 129; article (12)–(14); Calculations2026 core exponent checks.

## Figure 3: Annular repair and positive covariance

**Placement:** end of Section 6. **Purpose:** explain the nontrivial realizability
constraint on oscillatory stress. **Status:** core/annulus mechanism claimed;
the cosine and matrix algebra is proved; linking the toy cone to the actual
profile-dependent cone is heuristic.

Left: cross-section of a core, a surrounding annulus and a smooth exterior.
Mark the annulus as the location of the leading momentum deficit and pulse
stress. Draw zero-mean oscillatory velocity arrows with alternating sign.
Show their squared products feeding one nonzero averaged-flux arrow. Label
the averaging operation with angle brackets, and write
⟨a b cos φ⟩=0, ⟨(a b cos φ)⊗(a b cos φ)⟩=(a²/2)b⊗b.

Right: plot the two-dimensional toy cone in (s,d) coordinates, bounded by
d=±s and s≥0. The generating rays correspond to b+=(1,1) and b−=(1,−1).
Place a dot at a permitted matrix, for example s=2,d=1, giving c+=3/2,c−=1/2.
Place an outlined dot at s=1,d=2 outside the cone. Label it “cannot be formed
with nonnegative weights of these two directions.”

Write “toy matrix cone” above this panel and “the actual stress directions
depend on the background profile” below. Do not identify these toy coordinates
with the actual radial/azimuthal/axial stress components.

**Animation:** first average the velocity arrows to zero; then average the
quadratic products to a nonzero tensor. Vary c± while keeping them nonnegative
and sweep only the permitted cone. End with the need to adjust the background
target, not with an unrestricted stress generator.

**Sources:** article (19)–(21); Manuscript2026 §3.2, Theorem 4.6 and Appendix C.

## Figure 4: Residual improvement is an entire cycle

**Placement:** end of Section 7. **Purpose:** show why one successful pulse is
insufficient and how every derivative order becomes attainable. **Status:**
claimed analytic architecture, not a substitute for its estimates.

Use four main nodes around a loop: supported nonzero angular modes → averaged
tangential stress → residual with zero auxiliary mean → five-equation moment
correction. Label the last node “preserve two integral constraints; cancel the
linear contributions to three defects (P,Jθ,Jz).” Nonlinear remainders persist
with improved decay. Between every pair of nodes, including the return arrow,
place a smaller box “reconstruct pressure from updated radial equation; update
full residual, including axial pressure contribution.” Pressure reconstruction
is repeated after each correction. It is not a fifth correction at the end.
Attach the nonlinear expansion (16) as a small nearby reference, with the
quadratic correction term retained.

Below the loop draw a ladder labeled σj=1/5+j/10. A horizontal marker represents
the loss for one fixed derivative order. Show σj eventually passing that marker;
then show a higher marker for a higher derivative order. The ladder has no
last rung. A separate arrow leads to “shrinking cutoff realization on potentials
and pressure,” then to “smooth field for q>0; residual derivatives vanish to
arbitrary order on the stated sectors.” Do not claim that a finite rung proves
C∞ extension or that the residual is globally zero.

Include a small cutoff inset with u↦cu crossed out only for the generally
nonzero divergence term ∇c·u. Next to it show B↦curl(cB), with divergence zero
and the extra ∇c×B term written out. This is an elementary identity, not a
claim that cutoff has no momentum cost.

**Animation:** one full cycle raises the residual order once. Briefly display
new errors after each node before the next removes them. End with a separate
summation/realization step. Do not use a “proof complete” stamp here.

**Sources:** Manuscript2026 §3.4 pp. 13–14, §8.6 p. 96, Proposition 9.6
pp. 107–108 and Proposition 9.9 p. 114; article (16), (22)–(23);
Calculations2026 curl and residual polynomial checks.

## Figure 5: Smooth forcing, singular velocity, and two domains

**Placement:** end of Section 8. **Purpose:** display the finishing obligations
that convert a local singular branch into C/D. **Status:** source theorem
architecture; the final compactness implication is proved in the article.

Top: a time axis containing zero, a positive starting time a, blowup at 1, and
a later time b. On a force track show a smooth amber envelope with support
inside (a,b), extending smoothly through 1. This is a schematic norm envelope,
not the actual force profile. On a separate velocity track show growing speed
approaching 1, with no smooth continuation drawn beyond it. A pale energy track
remains bounded before 1. Do not set the force to zero near the singular point.

Middle: a hypothetical smooth global competitor, same force and zero datum,
is compared with the branch on every interval ending before 1. Label the
whole-space route “pressure recovery + expanding-ball flux bounds.” Then draw
the compactness contradiction: a continuous global competitor is bounded on
K×[0,1], while the equal pre-singular branch has unbounded speed in K. Neither
rapid derivative decay nor bounded pressure at spatial infinity is added to
the competitor.

Bottom: shrink and shift one compact spatial support into the interior of a
unit cell; repeat separated copies in adjacent cells. Mark opposite faces
identified and label velocity, pressure and force all periodic. Add “finite
cell energy; no whole-space L² claim for the periodic lift.”

**Animation:** finish the force track through time 1 before introducing the
competitor. After the contradiction, branch into C and the rescale/periodize
route to D. A/B remain visibly outside these arrows.

**Sources:** Manuscript2026 §§10.1–10.5, Lemmas 10.2–10.5 and Corollary 10.6;
Fefferman2006 including errata; article Section 8.
