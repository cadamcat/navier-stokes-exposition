# Third-party material

## Lean source

The film (chapter 10) and the article (§9) quote verbatim the statements of the theorems `NavierStokes.Comparator.navier_stokes_breakdown_R3` and `NavierStokes.Comparator.navier_stokes_breakdown_periodic` and the names of fields of the structures in `NavierStokes/ComparatorDefinitions.lean`, from [openai/NavierStokesAndEuler](https://github.com/openai/NavierStokesAndEuler) at commit `f9e8bc5b38b6e212696e8a30e3e91517af887bbd` (OpenAI; Apache License 2.0). The article's evidence package compares definition bodies with the frozen Formal Conjectures source (`article/evidence/refs/formal-conjectures-NavierStokes.lean`, google-deepmind/formal-conjectures, Apache License 2.0) and MathDB's public target records.

A copy of the Apache License 2.0 is in [LICENSE-APACHE-2.0.txt](LICENSE-APACHE-2.0.txt).

## Manuscript pages and quotation

Chapter 1 shows original vector page images from OpenAI’s [*Finite Time Blowup for Navier–Stokes*](https://cdn.openai.com/pdf/32d9f210-8b73-45e0-91bc-82a30aef8a9a/navier-stokes.pdf), the cited 166-page edition (2026; SHA-256 `0e779481c4da40bd28d1e642e1d8ca57447d129610df28dfa5a11e9af8ae228f`). The pages appear small and unzoomed in a static stack with the first page in front; there is no fan-out or close-up. The separate card typesets the title, attribution, and the short quotation “For every ν > 0” from Theorem 1.1, labelled claimed. These manuscript-derived page images and quotations are attributed to OpenAI and are excluded from this repository’s CC BY 4.0 and Apache-2.0 grants; no manuscript licence is asserted.

## Installed, not copied

three.js 0.186.1 (MIT License, © 2010–2026 three.js authors, https://threejs.org), pinned in `studio/package.json` and `package-lock.json`, renders the 3D pictures of the film (`film/scenes/three3d/`) and of article figure 2 (`article/figures/fig3d.js`; the rendered picture is in `article/figures/3d/`). KaTeX (MIT), Playwright (Apache-2.0), Source Sans 3 and JetBrains Mono (SIL Open Font License 1.1) are installed by the commands in `README.md`. SymPy, NumPy and soundfile (BSD licences) are installed from `studio/requirements.txt`.
