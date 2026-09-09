---
description: "Rescue a badly-built marketing site — audit it, then remediate in verified waves: delete dead code, kill hardcoded values, share one Header/Footer, fix dead CTAs and stub forms, repair copy, craft and the ALIVE bar, SEO + GEO, Core Web Vitals."
argument-hint: "[alcance opcional, ej: 'la home' — vacío = todo el sitio]"
---

Rescue this site: **$ARGUMENTS**

Load the `landing-craft` skill (and `craft-core` first). The site exists and it is bad: duplicated
nav markup on every page, hardcoded values, dead CTAs, a form that POSTs nowhere, no schema or
fabricated schema, contrast failures.

1. **Audit** — `assessor` (read-only): inventory with real tools, render every page at
   390/768/1440 in both themes, score the five bars, run the wiring / SEO+GEO / hardening / hygiene
   gates, measure contrast, reproduce the bugs, and produce the **verdict + ordered wave plan** in
   `landing/audit.md`.
   - **adopt** → healthier than it looked; report and stop.
   - **a rebuild is cheaper** → say so with the evidence. `/landing` rebuilds it properly.
   - **rescue** → show the plan, then continue.

2. **Remediate** — `restorer`, **on a branch, one wave per commit**:
   - **0 · safety net** — strict TS, lint, build, page smoke tests, **Playwright visual baselines**
     (time frozen, motion off), plus the bundle and CWV baseline. Nothing is refactored before it.
   - **1 · delete dead weight** — proven unused only; uncertain = reported, not deleted.
   - **2 · tokens** — the real palette/scale into the theme; every hardcoded value repointed.
     Must change zero pixels.
   - **3 · de-duplicate** — ONE Header, Footer, Section, Button across every page. The most common
     defect in a hastily built site.
   - **4 · wiring & architecture** — every CTA resolves somewhere real, every form actually works
     and never loses input, every declared env var is read, no `<img>` at a missing file, analytics
     mounts, no nav link 404s, no default favicon. Logic out of JSX, typed env, headers.
   - **5 · copy & conversion** — the hero passes the 5-second test, one primary CTA identity, proof
     above the mid-point, an objection handled, anti-slop sweep.
   - **6 · craft & ALIVE** — measured AA, focus states, responsive to 320px, then real imagery, a
     signature visual, scroll-reactive motion, warmth. The vibe test. *This wave changes appearance
     on purpose — diffs reviewed and baselines re-recorded.*
   - **7 · SEO + GEO** — metadata, canonicals, OG, valid schema **from real data** (fabricated
     Review/rating schema gets deleted, never improved), sitemap, robots, `llms.txt`, freshness.
   - **8 · Core Web Vitals** — LCP, images, layout shift, fonts. Measured before and after.

3. **Between every wave**: `tsc` · lint · build · smoke · **visual diff = 0** (or reviewed in wave
   6). A red gate is fixed before the next wave starts.

4. **Final gate** — `/landing-review`: the five bars + contrast + wiring + hardening + GEO. Loop
   fixes → re-review, max 3.

**Zero technical debt, changed at the ROOT:** fix what you find even if nobody mentioned it; delete
what you replace in the same wave; refactor every caller. No orphans, no half-migrations.

Report per wave with counts and commits, a before/after evidence table (tsc, lint, dead code,
bundle, measured contrast, CWV, visual diffs), the bugs and wiring defects fixed, **what you did not
touch and why**, and what honestly remains.
