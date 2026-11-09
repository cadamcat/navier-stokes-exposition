# A smooth force and a singular fluid: an exposition

An article and a 9:43 narrated film on the Navier–Stokes problem, the announced forced breakdown construction, its Lean statements and what remains open.

[Read the article (PDF)](https://github.com/cadamcat/navier-stokes-exposition/releases/latest/download/navier-stokes-exposition-article.pdf) · [Watch the film (4K)](https://github.com/cadamcat/navier-stokes-exposition/releases/download/v1.2.0/navier-stokes-exposition-film-4k.mp4) · [Evidence](article/evidence/README.md) · [Verification notes](VERIFY.md)

A 1080p copy of the film is attached to the [MathDB post](https://mathdb.com/p/315852/navier-stokes-existence-and-smoothness). The article link opens the latest published release.

This exposition explains the construction and provides a route to its mathematical and formal evidence.

- Author: Yao Xu.
- Version: v1.2.0.
- Date: 9 November 2026.
- Status: construction **claimed**; endpoints **Lean**, with our run; unforced A and B **open**.

## What the exposition covers

1. The equations: velocity, pressure, viscosity, force, incompressibility, and what smoothness means.
2. Charles Fefferman's official statement: two settings (all of space and the torus) and four alternatives, A and B without force for every admissible initial velocity, C and D with initial data and a smooth force chosen together.
3. What was known: the energy identity, Leray's and Hopf's weak solutions, Fujita–Kato, Caffarelli–Kohn–Nirenberg, the continuation criteria of Beale–Kato–Majda and Escauriaza–Seregin–Šverák, Tao's averaged equation, and the Chen–Hou boundary Euler blowup.
4. Scaling: why the energy bound is supercritical in three dimensions, and the two shrinking lengths of the announced vortex core.
5. The construction as announced: the force as the residual of a chosen velocity, the smoothness the force needs through the blowup time, a collapsing anisotropic core, oscillatory pulses that supply the missing stress, the cycle of corrections to every derivative order, the comparison with every global smooth competitor with bounded energy on the whole space, and the transfer to the smooth periodic class on the torus.
6. The formal statement: the two comparator theorems of OpenAI's Lean development read clause by clause against Fefferman's text, and the two places where the formal proof uses a different estimate from the manuscript.
7. What stays open.

## Status of each part

- **Claimed** (stated in a cited source, without independent refereeing established here): the announced construction, as stated in OpenAI's manuscript *Finite Time Blowup for Navier–Stokes* (Theorem 1.1 and Corollary 10.6): for every positive viscosity, zero initial velocity and a smooth, compactly supported force for which the velocity becomes unbounded in finite time while the energy stays bounded, and no global smooth solution with bounded energy on the whole space, or global smooth periodic solution on the torus, exists.
- **Lean:** OpenAI's Lean development `openai/NavierStokesAndEuler` at commit `f9e8bc5b38b6e212696e8a30e3e91517af887bbd` ends in `NavierStokes.Comparator.navier_stokes_breakdown_R3` (alternative C) and `navier_stokes_breakdown_periodic` (alternative D). Their statements were read against the official problem. On 9 November 2026 we built the pinned development from source, printed both axiom lists (`propext`, `Classical.choice`, `Quot.sound` only), and ran the repository's Comparator configuration: both nanoda and Lean's default kernel accepted the solution against the challenge statements; Mathlib's compiled files came from its binary cache, and Comparator ran after the full project build, as the repository configures it. The [rerun evidence](article/evidence/README.md#lean-rerun) includes the logs and runner script.
- **Proved:** the classical results cited (with their hypotheses, all for the unforced equations unless stated), the elementary identities and arguments given in the article, and the final compactness step from comparison to nonexistence, given the construction.
- **Computed:** the scale exponents, coordinate identities and polynomial identities of the article, checked by exact symbolic computation in `verify/` and `article/evidence/`, with negative controls; and a lexical source audit of the Lean development's import closure. See `VERIFY.md`.
- **Open:** alternatives A and B. A breakdown with a force does not settle them.
- **This exposition** is our own work and has not been peer reviewed. Our contribution is the explanation, a clause-by-clause comparison of the formal statements with the official problem, exact checks of elementary calculations, a rerun of the pinned Lean development, and a dated account of the evidence; the mathematics is due to the authors cited. Every claim is listed with its status and source in `article/CLAIMS.md`.

## Film chapters and subtitles

The film runs 9:43. [Download the subtitles](navier-stokes-exposition-subtitles.srt).

| Start | Chapter |
|---|---|
| 0:00 | Cold open |
| 0:41 | The equations |
| 1:35 | Four alternatives |
| 2:33 | What was known |
| 3:45 | Energy and scaling |
| 4:50 | Designing the force |
| 5:28 | A core and its pulses |
| 6:32 | Every derivative |
| 7:13 | From a singular branch to C and D |
| 8:05 | What the Lean development states |
| 9:07 | What stays open |

## Version history

- **v1.2.0:** evidence-link and locator repairs, direct entry points, reading route, notation key, solution-class qualifications and subtitle download; in the film, one table of the four alternatives laid out as in the article's Figure 1 (chapters 1, 3 and 11), slow camera motion at two openings, cleaner labels and layouts across chapters, a slower explanation of how oscillations carry momentum (chapter 7), the bounded-energy and periodic classes spoken in chapters 3 and 9, and our Lean rerun in chapter 10 (9:43). Publication time: `<TIME>`.
- **v1.1.0:** our Lean rerun and redrawn article figures; film unchanged. Published 9 November 2026, 13:30 UTC; commit `6853c10b62a7dd9958c2ad42177d3f6cfaf30ae1`.
- **v1.0.0:** first public version, 9 November 2026, 00:36 UTC; commit `acc49df709f0e37b0a60e62ee49bc10f88122cc4`. Software Heritage snapshot: `swh:1:snp:15b3da71f713c7b0b036a92eff489e562b62a878`.

## Contents

| Path | What it is |
|---|---|
| `article/exposition.md` | the article (Markdown with LaTeX math; the PDF is built from it) |
| `article/CLAIMS.md` | every claim of the article with its status (proved, computed, claimed, Lean, heuristic, definition, record) and source |
| `article/SOURCES.md`, `article/refs.bib` | every citation with its locator and how it was verified |
| `article/figures/` | the figure specifications, the figures as SVG and their generator; figures 2 and 3 embed 3D plates (`3d/*.png`) drawn with the film's seeded particle renderer |
| `article/evidence/` | the evidence package the article cites: exact calculations, source audit, manuscript-version records and our Lean rerun, with a SHA-256 manifest |
| `VERIFY.md`, `verify/` | the verification report and the programs with their original outputs, negative controls and process receipts |
| `film/script.md` | the narration, beat by beat, with the status of each beat |
| `film/narration.txt`, `film/subtitles.srt` | the spoken text and the subtitles of the whole film |
| `film/audio/*.beats.json` | word timings of the narration, which set the timing of every scene |
| `film/audio/narration.json`, `film/audio/instructions.txt`, `film/audio/takes.json` | length and checksum of each chapter's narration; the delivery text the voice was given; the takes used |
| `film/scenes/` | the scenes: HTML/SVG pages whose picture is a function of time; `three3d/` the 3D stage (three.js, rendered in the browser through WebGL), `ns/` the film's shared kit (layout zones, type scale, card, matrix, charts, trail renderer, title card), `jx/` the film's status line (proved, computed, claimed, heuristic, Lean) and camera paths, `thumb/` the thumbnail still (one frame, rendered at 4K and downscaled to 1280 × 720) |
| `film/tools/` | narration, assembly, music and check scripts |
| `studio/` | the scene components, render and check tools, pinned |

Release assets:

| File | What it is |
|---|---|
| `navier-stokes-exposition-film-4k.mp4` | the film, 3840×2160 at 60 frames per second (the 1920×1080 layout rendered at twice the pixel density), subtitles in the picture |
| `navier-stokes-exposition-article.pdf` | the article |
| `navier-stokes-exposition-subtitles.srt` | timed subtitles for the film |
| `navier-stokes-exposition-narration.flac` | the narration (voice only), lossless, all eleven chapters in order; the build adds the music bed |

Real fields in the film (a smooth divergence-free field in chapters 2 and 6, the wrap-around motion on the torus in chapter 3, the rescaled field in chapter 5) and the plotted functions are drawn from exact formulas; their particle trails are coloured by speed on a fixed scale shown beside the picture. The vortex core and its trails, the pulses and the norm envelopes are schematic, and say so on screen; the core is drawn with an exaggerated exponent h = 0.2, while the manuscript requires a far smaller h, and its tracers run at 0.3 times the model's clock, as stated on screen.

How the narration was made: it was synthesized once, passage by passage, with the settings recorded in `film/tools/narrate.py` and `film/audio/instructions.txt`; the word timings come from automatic transcription of that audio, mapped onto the script. The music bed is composed in code (`film/tools/music_bed.py`, fixed seed) and mixed under the narration when the film is joined. The film is rebuilt from the saved narration, not by synthesizing it again; `narrate.py` needs a speech-service account, the build does not.

## Rebuild

Requirements: Node.js 20 or later, Python 3.12 with the packages in `studio/requirements.txt` (`python3 -m pip install -r studio/requirements.txt`; `PYTHON=...` selects another interpreter for `build.sh`), ffmpeg, git, pandoc 3 with XeLaTeX (TeX Live with the Libertinus and GNU FreeFont fonts). The 3D scenes need WebGL in headless Chromium.

```sh
cd studio && npm ci && npx playwright install chromium     # pinned versions from package-lock.json
cd ..
./build.sh verify       # exact calculations, source audit and article consistency checks (fetches the Lean source at the pinned commit into refs/)
./build.sh article      # article/build/exposition.pdf
./build.sh narration navier-stokes-exposition-narration.flac   # film/audio/c1..c11.wav, checked against narration.json
./build.sh film         # renders every chapter at 4K, runs the checks, joins film/out/film-4k.mp4 and film-1080p.mp4
```

Every scene is deterministic: a frame depends only on its time. `./build.sh narration` restores the chapter audio from the FLAC file and refuses audio that differs from the recorded checksums. `./build.sh film` also runs every scene check. From `film/`, `python3 tools/qc_strip.py` checks the status line of the finished film against the script, and `python3 tools/check_flicker.py out/c5/frames` checks a chapter's rendered frames for one-frame blinks (flicker), outside the subtitle band and the status line; `python3 tools/test_check_flicker.py <scratch directory>` is its failing case (a synthetic sequence with one blinking frame). From `film/scenes/`, `node ../tools/check_titles.js c2 c3 ...` checks every frame of the chapter title cards (inside the picture, independent of the frames before; `./build.sh film` runs it), `node ../tools/test_check_titles.js <scratch directory>` is its failing case, and `node ../tools/measure_motion.js c5 --fps 60` measures the motion of a chapter in pixels per frame without rendering an image.

## Licences

- Article, film, script, narration text, subtitles and figures: [CC BY 4.0](LICENSE-CC-BY-4.0.txt).
- Code (studio components, scenes, verification programs, build scripts): [Apache-2.0](LICENSE-APACHE-2.0.txt).
- Third-party material keeps its attribution and rights: Lean source is Apache-2.0; manuscript-derived page images and the short attributed quotation are excluded from our licence grants. See [THIRD_PARTY.md](THIRD_PARTY.md).
- Installed, not copied: three.js (MIT), KaTeX (MIT), Playwright (Apache-2.0), SymPy (BSD), NumPy (BSD), soundfile (BSD), Source Sans 3 and JetBrains Mono (SIL Open Font License 1.1).
