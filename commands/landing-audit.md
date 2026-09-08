---
description: Diagnose an existing marketing site — page by page, section by section, component by component. Scores the five bars plus the wiring, SEO/GEO, hardening and contrast gates, and returns the verdict + an ordered plan. READ-ONLY.
argument-hint: "[alcance opcional, ej: 'la home y pricing' — vacío = todo el sitio]"
---

Audit this landing/site: **$ARGUMENTS**

Load the `landing-craft` skill and delegate to `assessor`. **Read-only — nothing changes.**

It will:

1. **Inventory mechanically**, with real tool output as evidence — `knip` (dead files/exports/deps),
   `depcheck`, `madge` (cycles), `jscpd` (duplication), `tsc --noEmit` with strict ON, `eslint`, and
   the hardcoded-value sweeps.
2. **Render every page** at 390/768/1440, light and dark, capturing console errors and failed
   requests.
3. **Score the FIVE bars per page** — AI-looking? · does it **sell** (the 5-second test on the hero
   alone) · intuitive (one primary CTA identity) · crafted · **ALIVE** (the vibe test: crop the
   logo, real imagery above the fold, does it respond as you scroll, warmth, one memorable moment).
4. **Run the wiring gate** — where hastily built sites fail hardest: CTAs pointing at `#`, forms
   that POST nowhere, `.env.example` vars no code reads, `<img>` at missing files, analytics
   declared but never mounted, nav links that 404, the default framework favicon.
5. **Run SEO + GEO** — titles, descriptions, canonicals, OG, valid right-type JSON-LD, sitemap,
   robots, `llms.txt`, freshness — and flag any **fabricated Review/rating schema** as a hard fail.
6. **Run hardening + hygiene** — headers, unvalidated endpoints, secrets in `NEXT_PUBLIC_*`, `any`,
   duplicated Header/Footer markup across pages, hardcoded values, logic in JSX.
7. **Measure contrast** with the scorer, every page and state, both themes.
8. **Reproduce real bugs** — and label reproduced facts differently from inferred suspicions.
9. **Score 10 health dimensions** → the verdict: **adopt** · **rescue** (here's the plan) ·
   **a rebuild is cheaper**, said with the evidence.

Output lands in `landing/audit.md`. Run `/landing-rescue` to execute the plan.
