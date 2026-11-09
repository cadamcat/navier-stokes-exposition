# Script: A smooth force and a singular fluid

Narration written for the ear: short sentences, one idea per sentence, formulas said the way a lecturer says them at the board. Each beat is one line: `- **id** `status` text`. Status is one of `definition`, `context`, `proved`, `computed`, `claimed`, `heuristic`, `lean` and sets the status strip:

- `proved`: a result in accepted published work, or a complete elementary argument given in the accompanying article;
- `computed`: an exact calculation checked by the accompanying computations (exact symbolic algebra, no numerical approximation);
- `claimed`: stated in a cited source, without independent refereeing established here; the announced construction is claimed throughout;
- `lean`: a named formal theorem in the Lean development, with the scope of its public execution record (nothing was rebuilt for this film);
- `heuristic`: a picture that proves nothing;
- `definition`, `context`: neutral.

The subtitles use exactly these words.

The voice reads one passage per chapter (long chapters in two halves); a line `<!-- passage -->` starts a passage. Beats on consecutive lines form one paragraph; a blank line starts a new paragraph. Every pause in the film is the voice's own. Where a scene declares that a motion needs more time than the voice gives (`need("beat", "word", seconds, "reason")` in its `scene.js`), `tools/narrate.py` lengthens the natural pause at that point by exactly the missing time.

Notation, each symbol defined once: `u` velocity; `p` pressure; `ν` (nu) viscosity; `f` force; `x` position and `t` time; `λ` (lambda) a scaling factor; `τ` (tau) the time left before the blowup time, which is set at one; `h` the small fixed exponent of the construction. Spoken in words only: energy, peak speed, radius, length. The letters A, B, C, D name the four official alternatives.

Article sections (A) behind each chapter: c1 A Summary; c2 A 1; c3 A 2; c4 A 3; c5 A 4; c6 A 1 (4), 5, 8.1; c7 A 6, 7.1; c8 A 7.2, 8.1; c9 A 8; c10 A 9, 10; c11 A 10.3, 11.

End card (not spoken; silent, about 7 s, music swelling): a left-aligned reference list for every work the film names, "Full list with locators: the accompanying article.", then: "Prepared by Yao Xu with AI assistance; the narration voice is synthesized with an OpenAI speech model."

## c1 · Cold open

<!-- passage -->
- **c1b1** `claimed` A fluid fills all of space and starts at rest. A smooth force begins to stir it. A thin vortex forms and tightens. Its peak speed grows without bound as a finite time approaches, while its total energy stays bounded.

- **c1b2** `context` On the eighth of September twenty twenty-six, OpenAI announced this construction for the Navier–Stokes equations, for every positive viscosity. It addresses the two breakdown alternatives of the Clay problem, C and D, not the smooth-forever alternatives A and B.
- **c1b3** `context` The proof is announced, not yet independently refereed. Its final statements are also written in Lean.

## c2 · The equations

<!-- passage -->
- **c2b1** `definition` At each point x and time t, the fluid has a velocity u, an arrow, and a pressure p, a number. Follow one small parcel: its acceleration is the change of u along its own path.
- **c2b2** `definition` The Navier–Stokes equations balance that acceleration against the push of pressure, viscous friction of strength nu, and an external force f. A second equation makes the flow incompressible: as much fluid leaves each tiny volume as enters it.

- **c2b3** `heuristic` Viscosity tends to smooth out differences in velocity, the way heat spreads. Transport, the velocity carrying itself along, is nonlinear.
- **c2b4** `definition` Smooth means that every derivative, in space and time, exists and is continuous. Can smooth motion lose its smoothness in a finite time?

## c3 · Four alternatives

<!-- passage -->
- **c3b1** `definition` Charles Fefferman's official statement poses the problem in all of space, and on the torus, a cube whose opposite faces are identified. It has four alternatives, each posed for every positive viscosity.
- **c3b2** `definition` A and B ask for a smooth solution for all time from every smooth, divergence-free initial velocity, with no force. In all of space, the data must decay rapidly and the energy must stay bounded.
- **c3b3** `definition` C and D ask for the opposite: admissible initial data and a smooth force, chosen together, for which no global smooth solution exists: on the whole space, none with bounded energy; on the torus, none that is periodic. The force must stay smooth and decaying through the breakdown and after it.

<!-- passage -->
- **c3b4** `definition` A proof of any one alternative is accepted.
- **c3b5** `proved` Breakdown with a force does not settle A or B. Without a force, smooth solutions might still last forever.

## c4 · What was known

<!-- passage -->
- **c4b1** `proved` Without a force, the energy, half the integral of the squared speed, can only decrease. But energy is a total. It does not bound the peak speed.
- **c4b2** `proved` In nineteen thirty-four, Jean Leray constructed global weak solutions; Eberhard Hopf later extended the theory. They satisfy the equations only in an averaged sense, and need not be smooth.

<!-- passage -->
- **c4b3** `proved` Without force, Fujita and Kato proved global smooth solutions for data small in a critical norm, relative to the viscosity. Caffarelli, Kohn and Nirenberg proved that the possible singular set is very small, though a single point is not excluded.
- **c4b4** `proved` Continuation criteria name a quantity that must blow up: a vorticity integral for Euler, by Beale, Kato and Majda, and the L three norm for Navier–Stokes, by Escauriaza, Seregin and Šverák, both without force.
- **c4b5** `proved` Terence Tao proved blowup for an averaged equation that keeps the energy identity. Jiajie Chen and Thomas Hou proved, with computer assistance, blowup for Euler without viscosity, at a cylinder's wall. Neither is a Navier–Stokes counterexample.

## c5 · Energy and scaling

<!-- passage -->
- **c5b1** `proved` Rescale a solution by a factor lambda: space shrinks by lambda, time by lambda squared, and the velocity grows by lambda. It still solves the equations, with the same viscosity and a rescaled force.
- **c5b2** `proved` The L three norm does not change, but the energy is divided by lambda. Packing a flow into ever smaller regions costs ever less energy: in three dimensions, the energy bound is supercritical.

<!-- passage -->
- **c5b3** `claimed` Put the blowup time at one, and let tau be the time left. The announced core's radius shrinks like tau to the one half. Its length shrinks like tau to the one half minus h, for a small fixed number h. Its speed grows like tau to the minus one half minus h.
- **c5b4** `computed` Multiply the squared speed by the core's volume. The core's energy then scales like tau to the one half minus three h, which tends to zero. So the peak speed grows without bound, while the core's energy shrinks.

## c6 · Designing the force

<!-- passage -->
- **c6b1** `proved` A forced construction can start from the answer. Choose a velocity and a pressure, put them into the equations, and call what is left over the force. The equations then hold by definition.
- **c6b2** `proved` The difficulty is the blowup time. If the velocity blows up, the leftover usually does too, and such a force is not allowed. The force must stay smooth through time one.

- **c6b3** `proved` Smooth is not the same as analytic. This function is smooth, and every derivative vanishes at zero, yet it is not zero. The official problem asks only for smoothness.

## c7 · A core and its pulses

<!-- passage -->
- **c7b1** `claimed` The construction has three layers. First, a vortex core spirals inward, spins faster and leaves along its axis, growing more slender as it shrinks.
- **c7b2** `claimed` Joined to the flow outside, it leaves an error in a ring around it: a missing stress.

<!-- passage -->
- **c7b3** `proved` Oscillations can supply stress. Take a wave whose velocity averages to zero over each period.
- **c7b4** `proved` The equations see the velocity times itself. That square never drops below zero, so its average is positive.
- **c7b5** `proved` So a wave that goes nowhere on average still carries a steady flux of momentum.
- **c7b6** `proved` But only positive combinations are available. In a toy model with two directions, the stresses that waves can make fill a cone, and a target outside it cannot be made.
- **c7b7** `claimed` So the manuscript adjusts the core until its error lies inside the actual cone. Localized pulses then deliver it: the core's shear first amplifies them, then viscosity damps them.

## c8 · Every derivative

<!-- passage -->
- **c8b1** `claimed` One repair is not enough. Each correction creates new errors, and the force must be smooth to every order. The manuscript cycles through four corrections, rebuilding the pressure after each.
- **c8b2** `claimed` Each full cycle raises the order of the remaining error. For a fixed number of derivatives, the losses stay fixed, so the order eventually passes them. The ladder has no last rung.
- **c8b3** `claimed` Smooth cutoffs assemble the corrections into one smooth field, and the force is extended smoothly through time one, with compact support in space and time.

## c9 · From a singular branch to C and D

<!-- passage -->
- **c9b1** `claimed` Now the whole construction: the force stays smooth through time one and after, the velocity becomes unbounded as time approaches one, and the energy stays bounded.
- **c9b2** `claimed` One step remains: could another smooth solution with bounded energy, the same force and the same start, last forever? The manuscript's comparison argument says no, without assuming decay of its derivatives or pressure.
- **c9b3** `proved` The end is elementary. Such a solution would be bounded on a compact region up to time one, yet equal to a branch whose speed is unbounded there. Given the construction, that contradiction gives C.

- **c9b4** `claimed` For D, shrink the construction into one cell of the torus and repeat it periodically. The copies do not interact, and a periodic comparison finishes the argument.

## c10 · What the Lean development states

<!-- passage -->
- **c10b1** `lean` OpenAI's Lean development ends in two theorems, for C and for D. Each says: for every positive viscosity, there are admissible initial data and an admissible force for which no admissible global smooth solution exists.
- **c10b2** `context` Its predicates spell out the official clauses: smoothness, incompressibility, the same initial data, decay, finite energy with one uniform bound, periodic velocity and pressure. Compared with Fefferman's text clause by clause, we found none missing.
- **c10b3** `lean` No hypothesis asks for a vortex or an estimate. We rebuilt the development and ran its checker: two independent kernels accept both theorems, which use only the three standard axioms.

<!-- passage -->
- **c10b4** `context` In October, Alexander Bastounis, Fabian Circelli and Anders Hansen showed two places where the Lean proof uses a different estimate from the paper: one more derivative, and another pressure bound. That refutes neither C nor D, but not every printed estimate was checked as written.

## c11 · What stays open

<!-- passage -->
- **c11b1** `context` Mathematicians have begun to engage, in preprints by Constantin, Ignatova and Vicol, and by Zhen Lei and Xiao Ren. Clay still lists the problem as active, MathDB as open, and the sources examined contain no completed independent referee report.
- **c11b2** `context` Nothing here sets the force to zero. Alternatives A and B, smoothness for all time without force, from all admissible data, remain open.
