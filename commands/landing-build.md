---
description: Build the approved landing — run production phases (build → motion → polish, with SEO in parallel) on the existing plan.
argument-hint: "(optional) framework override, e.g. 'astro'"
---

Run the **landing-craft** PRODUCTION phases on the approved plan in `landing/`.

Preconditions: `landing/strategy.md`, `landing/copy.md`, `landing/design.md` must exist (run
`/landing-new` first if not). Framework: $ARGUMENTS or auto-detect (default Next.js + Tailwind).

Pipeline:
1. **wright** — implement copy.md styled per design.md; wire tokens first; start dev server.
2. **choreographer** — apply `motion-craft` (one hero reveal, scroll reveals, micro-interactions, reduced-motion safe).
3. **burnisher** — Impeccable craft pass (type/space/colour/contrast/responsive/states).
4. In parallel off the build: **crier** — meta/OG/JSON-LD/CWV/llms.txt.

Then report the live preview URL and hand to `/landing-review`. Do not declare done until review
passes.
