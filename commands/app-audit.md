---
description: Diagnose an existing app — module by module, page by page, component by component. Scores health, finds dead code, hardcoded values, duplication, bugs, gaps, and returns the verdict + an ordered plan. READ-ONLY, changes nothing.
argument-hint: "[alcance opcional, ej: 'el módulo de facturación' — vacío = toda la app]"
---

Audit this app: **$ARGUMENTS**

Load the `app-craft` skill and delegate to `examiner`. **This is read-only — nothing gets changed,
not even a formatting fix.** You get a verdict and a plan you can review before anything is touched.

It will:

1. **Inventory mechanically** — every route, module, component, dependency, env var, asset, style.
   With real tool output as evidence: `knip` (dead files/exports/deps), `depcheck`, `madge`
   (circular imports), `jscpd` (duplication), `tsc --noEmit` with strict ON, `eslint`, and the
   hardcoded-value sweeps.
2. **RENDER it** — dev server + Playwright at 320/768/1440, light and dark, every route, capturing
   console errors and failed requests. Craft, broken states and "is this actually broken" cannot be
   judged from source.
3. **Judge every unit** — usage and duplication · `any`/`@ts-ignore` counts · hardcoded values by
   category · architecture (logic in JSX, god files, prop drilling, `useEffect` misuse, client/
   server boundary) · which states exist and which don't · a11y · verdict · risk · wave.
   **Every finding carries evidence** — a path, a line, tool output, or a reproduction.
4. **Audit the gaps** — missing states, missing route boundaries, absent validation, untyped env,
   no keyboard path, missing auth/settings/404 screens.
5. **Reproduce real bugs** — and label reproduced facts differently from inferred suspicions.
6. **Score 10 health dimensions** and give the verdict: **adopt** (it's fine) · **rescue**
   (salvageable — here's the plan) · **rewrite** (a rescue would cost more than rebuilding, with
   the evidence). It will tell you the uncomfortable one if that's the truth.
7. **Write the ordered wave plan** — what changes, blast radius, risk, and what verifies it. Plus
   what **cannot** be safely verified in this environment, and is therefore out of scope.

Output lands in `app/audit.md`. Run `/app-rescue` to execute the plan.
