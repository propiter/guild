# Shared conventions (every landing-craft agent follows these — don't repeat them per agent)

One source of truth for the rules every phase shares. Agents reference this instead of restating it.

## A. Orchestrator gate (cross-platform)
If you loaded the `landing-craft` skill as the ORCHESTRATOR (main thread), do NOT run a phase
inline — delegate to the phase sub-agent via the host's primitive (`Task` in Claude Code, `task`/
sub-agent in OpenCode, agent in Cursor). If you ARE a phase sub-agent, the gate does not apply —
execute your phase, do NOT delegate, do NOT re-invoke the skill.

## B. Artifact store (the `landing/` folder is the bus)
Every phase reads prior artifacts and writes its own under `landing/`:
`_init.md · research.md · strategy.md · architecture.md · copy.md · design.md · review.md`.
Pass **paths**, not full content, between phases to keep the thread thin. If engram is available,
mirror under `landing/<name>/<phase>` (same as SDD). The built site lives in the project (Next.js
app); artifacts stay in `landing/`.

## C. Zero technical debt (always-on)
The moment you spot a bug, smell, dead link, duplicated code, missing state, broken edge case, or a
clear improvement — **fix it on the spot and continue.** No TODOs, no "later", no stopping to ask.
Reusable components, no copy-paste. `review` is the backstop that repairs anything that slipped.

## D. The five bars (review enforces all)
Not AI-looking · Sells (5-sec test) · Intuitive · Crafted · **ALIVE** (real imagery, signature
visual, scroll-reactive motion, warmth — `alive-not-generic.md`). Plus the hard gates: WCAG AA
**measured** (`craft-core/references/contrast-check.md`), reduced-motion safe, multi-page consistency.

## E. Lead, don't interrogate
The skill leads. Gather context by RESEARCHING (scrape, search), not by questioning the user. Ask at
most one short thing, only if genuinely blocking. Tokens are not a constraint — ship a complete,
market-current product.

## F. Stack defaults
Next.js (App Router) + Tailwind, ALWAYS (switch only if the user explicitly says so). Tokens live in
`tailwind.config` — no hardcoded hex/px. Animation intensity from the saved style profile
(`landing-craft/style-profile`, default `medium`).

## G. Models / effort (per phase, override as host allows)
research = opus/high · strategy = opus · architecture = opus · copy = sonnet · design = opus ·
build = sonnet · motion = sonnet · polish = sonnet · seo = sonnet · review = opus · deploy = sonnet.
