---
description: Rescue a badly-built app (AI-generated or grown without discipline) — audit it, then remediate in verified waves: delete dead code, kill hardcoded values, de-duplicate, fix architecture, fix bugs, add every missing state, a11y and performance. Zero technical debt, changed at the root.
argument-hint: "[alcance opcional, ej: 'el módulo de facturación' — vacío = toda la app]"
---

Rescue this app: **$ARGUMENTS**

Load the `app-craft` skill (and `craft-core` first). This is **Mode E — rescue.** The project
exists and it is bad: duplicated components, hardcoded values, dead files, `any` as a type system,
only the happy path, real bugs.

> **The adopt rule inverts here.** Normally app-craft matches the project's conventions. When the
> conventions ARE the problem, matching them propagates the disease. But you don't get to decide
> that by taste — **you judge first, and the score decides.**

1. **Audit** — `examiner` (read-only): inventory with real tools, render every route at
   320/768/1440 in light and dark, judge every component and page with evidence, reproduce the
   bugs, score the 10 health dimensions, and produce the **verdict + ordered wave plan** in
   `app/audit.md`.
   - Verdict **adopt** → it's healthier than you thought; report and stop.
   - Verdict **rewrite** → say so with the evidence and the comparative cost. Do not grind through
     a remediation that is the wrong shape of work.
   - Verdict **rescue** → show the plan, then continue.

2. **Remediate** — `renovator`, **on a branch, one wave per commit**:
   - **Wave 0 · safety net** — strict TS, lint, build, route smoke tests, and **Playwright visual
     baselines** (data frozen to a seeded mock, time frozen, motion off). *Nothing is refactored
     before this exists.* If a layer can't be built, that area is out of scope — stated, not
     silently skipped.
   - **1 · delete dead weight** — proven unused only (tool + symbol grep + string grep + framework
     conventions). Uncertain = not deleted, reported instead.
   - **2 · tokens** — extract the real palette/scale, repoint every hardcoded value. Kills
     "quemado" globally in one pass, and must not change appearance.
   - **3 · de-duplicate** — one Button, one Header, one Table. Every caller refactored, copies deleted.
   - **4 · architecture** — logic out of JSX into `lib`, data behind the contract, typed env, god
     files split, cycles broken, client/server boundary corrected. Behaviour preserved.
   - **5 · correctness & completeness** — bugs fixed (each its own commit), every missing state
     built, validation and error handling that never loses input.
   - **6 · a11y & craft** — keyboard, focus, ARIA, **measured** AA in both themes, density,
     responsive to 320px and 200% zoom. This wave changes appearance on purpose: diffs reviewed by
     eye and baselines re-recorded.
   - **7 · performance** — bundle, code-splitting, N+1, images. Measured before and after.

3. **Between every wave**: `tsc` · lint · build · smoke · **visual diff = 0** (or reviewed in wave
   6). A red gate is fixed before the next wave — never carried forward.

4. **Final gate** — `/app-review`: the six bars + the states, a11y, contract, motion and hardening
   gates. Loop fixes → re-review, max 3.

**Zero technical debt, changed at the ROOT:** fix what you find even if nobody mentioned it; when
you replace something, delete what it replaced in the same wave and refactor every caller. No
orphans, no "old + new" coexisting, no half-migrations.

Report per wave with counts and commits, a **before/after evidence table** (tsc errors, lint, dead
code, cycles, bundle, contrast, visual diffs), the bugs fixed with their reproductions, **what you
did not touch and why**, and what honestly remains.
