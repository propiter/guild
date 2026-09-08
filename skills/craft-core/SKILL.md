---
name: craft-core
description: "Shared foundation for the craft pipelines — NOT invoked directly by a user. Holds the rules and references that landing-craft (marketing sites) and app-craft (applications) both depend on: the zero-technical-debt doctrine, change-at-the-root, the closed review loop, the artifact bus, stack defaults, the production/hardening bar, the measured WCAG contrast gate, the motion intensity dial, and asset generation. Load it when you are running any landing-craft or app-craft phase; read the pipeline's own SKILL.md for what that pipeline does."
license: Apache-2.0
metadata:
  author: propiter
  version: "2.2.0"
---

# Craft Core

The shared spine under **`landing-craft`** (marketing sites that sell) and **`app-craft`**
(applications that work). Both pipelines answer to the same engineering and craft doctrine; only
their *subject* differs. This skill holds what is genuinely common, so it is written ONCE and
neither pipeline drifts from the other.

> **You do not run this skill.** A user asks for a landing (`/landing…`) or an app (`/app…`).
> Those skills — and their sub-agents — load this one.

## What lives here

| Reference | What it governs | Loaded by |
|-----------|-----------------|-----------|
| `references/hardening.md` | The **production bar** — security headers, validated + rate-limited endpoints, typed env, CI + pre-commit + Dependabot, strict TS, atomic components, logic out of JSX, tokens single-sourced | build · seo · review · deploy (both pipelines) |
| `references/contrast-check.md` | The **WCAG AA gate**, MEASURED with a scorer — never eyeballed | polish · review (both) |
| `references/animation-levels.md` | The motion **intensity dial** (subtle/medium/rich/ultra) + the library stack (Motion · GSAP · Lenis) | motion · build · design (both) |
| `references/assets.md` | Generating real assets — logo/wordmark, branded favicon set, OG card, SVGs (via `web-assets` + Playwright) | design · build (both) |
| `references/remediation.md` | **Rescuing a badly-built codebase** — the 10-dimension health assessment, the adopt-vs-rescue-vs-rewrite verdict, the audit method, the wave order, the guardrails | audit · remediate |
| `references/safety-net.md` | **How to make an untested codebase safe to refactor** — strict TS, lint, build, route smoke tests, **Playwright visual baselines**, characterization tests | audit · remediate · build |
| `references/codebase-hygiene.md` | **Nothing dead, nothing hardcoded, built to scale** — dead-code tooling and the proof-before-delete rule, the "nada quemado" sweeps, structure limits, bundle discipline | audit · remediate · build · review |

Path convention: agents refer to these as **`craft-core/references/<file>.md`**. If your host
resolves skill paths differently, glob for `**/craft-core/references/<file>.md` — never inline a
copy of the content into another file.

## The doctrine both pipelines obey

### 1. Zero technical debt (always-on, every phase)
The moment you spot a bug, a flaw, a smell, a broken edge case, a dead link, duplicated code, or a
clear improvement — **fix it on the spot and CONTINUE.** No TODOs, no "later", no stopping to ask.
This covers the generated product AND the workflow's own artifacts. Later phases RE-CHECK earlier
work and repair anything that slipped; `review` is the backstop. The product ships complete —
**no known debt, nothing "to fix later".**

### 2. Change at the ROOT — never leave orphans
When you replace an approach (a component, a lib, a pattern, an env var, a dependency), **DELETE
what it replaced in the SAME pass**: no orphaned files, no dead imports/exports, no unused env
vars, no commented-out code, no "old + new" coexisting. Refactor every caller. Leave it as if it
had always been this way. This holds during the build AND during every post-launch iteration.

### 3. The closed review loop (max 3 passes)
Quality is not a vibe check at the end — it is a LOOP the orchestrator drives:

1. **Audit** — delegate to the pipeline's review agent. It returns **PASS/FAIL + a structured
   findings list**, each finding tagged with the phase that OWNS the fix.
2. **Route** — re-delegate each finding to its owning phase to fix in place.
3. **Re-audit** — run review again on the patched product.
4. **Repeat up to 3 passes total**; stop the instant review returns a real PASS.

**Honesty at the cap:** if it still isn't perfect after 3 passes, do NOT claim it is — report the
remaining issues plainly (severity · where · why they persist) and hand them to the user. **Never
ship a fake "PASS."**

### 4. The orchestrator gate (cross-platform)
If you loaded a pipeline skill as the ORCHESTRATOR (main thread), do NOT run a phase inline —
delegate to the phase sub-agent via the host's primitive (`Task` in Claude Code, `task`/sub-agent
in OpenCode, agent in Cursor). If you ARE a phase sub-agent, the gate does not apply — execute
your phase, do NOT delegate, do NOT re-invoke the skill.

### 5. The artifact bus
Every phase reads the prior artifacts and writes its own into the pipeline's artifact folder
(`landing/` or `app/`). **Pass PATHS, not full content**, between phases — that is what keeps the
orchestrator thread thin. If engram is available, mirror each artifact under the topic key
`<pipeline>/<name>/<phase>`.

### 6. Lead, don't interrogate
The skill leads. Gather context by RESEARCHING (scrape the product, read the codebase, search),
not by questioning the user. Ask at most one short thing, and only if it is genuinely blocking —
anything you can reasonably decide, DECIDE IT. Tokens are not a constraint; ship a complete
product, not a quick sketch.

### 7. Stack defaults
**Next.js (App Router) + Tailwind + TypeScript strict**, always — switch only if the user
explicitly says so, or the existing project already uses something else (then you MATCH the
project; you never convert it without being asked).

**Design tokens are the single source of truth.** No hardcoded hex/px anywhere in components.
This is both a maintainability rule and the #1 anti-"AI-generated" lever — see rule 8.

### 8. Tokens first, components second (the anti-generic lever)
**Tokens move every screen at once; component edits move one screen at a time.** So the order is
always: define the token layer → generate a screen → *then* customize individual components only
where the tokens genuinely cannot reach. Teams that do it backwards end up with a dozen
hand-tuned components inside a product that still reads as the default kit.

And **ship one token the kit does not have** — a signature shadow, a grain/noise texture, a
specific easing curve, a non-default border treatment. Named, and applied consistently. That one
extra token is the product's fingerprint. A palette alone is not an identity.

### 9. Never refactor what you cannot verify
Improving inherited code without a way to detect breakage is indistinguishable from breaking it
quietly. Before you delete a file, collapse a component or move logic, put a net under it: strict
`tsc`, lint, a green build, **route smoke tests**, and **visual baselines** you can diff
(`references/safety-net.md`). Then work in waves, verify between every wave, and commit each wave
separately so any one of them can be reverted.

If a net can't be built for some area, that area is **out of scope for refactoring** — say so.
"I could not verify this, so I left it alone" is a better answer than a confident refactor of code
you never saw run.

### 10. Models / effort (per phase, override as the host allows)
Judgment-heavy phases run on the stronger model; mechanical phases on the faster one.

`research/product = opus` · `strategy = opus` · `architecture/ia = opus` · `design/system = opus` ·
**`audit = opus`** · `copy = sonnet` · `contract = sonnet` · `build = sonnet` · `screens = sonnet` ·
`states = sonnet` · `remediate = sonnet` · `motion = sonnet` · `polish = sonnet` · `seo = sonnet` ·
**`review = opus`** · `deploy = sonnet`.

## What does NOT live here

Anything subject-specific stays with its pipeline — do not generalize it into this file:

- **`landing-craft/references/`** — `playbook.md` (conversion architecture), `market-research.md`,
  `site-architecture.md`, `alive-not-generic.md` (the landing vibe bar), `instrumentation.md`.
- **`app-craft/references/`** — `app-not-generic.md` (the app vibe bar), `ia-and-flows.md`,
  `design-system.md`, `app-shell.md`, `screen-patterns.md`, `states-and-edges.md`,
  `interaction-a11y.md`, `data-contract.md`, `adopt-existing.md`, `conductor.md`.

A landing must **sell to a stranger once**; an app must **serve a returning user a hundred times a
day**. Those are different design problems with different gates. Sharing the *engineering* spine is
correct; sharing the *design* doctrine is not.
