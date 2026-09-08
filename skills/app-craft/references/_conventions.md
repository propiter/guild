# Shared conventions (every app-craft agent follows these — don't repeat them per agent)

One source of truth for the rules every app phase shares. Agents reference this instead of
restating it. **This file assumes `craft-core/SKILL.md`** — zero technical debt, change-at-the-root,
the orchestrator gate, the closed review loop, tokens-first, and the model map live there and are
NOT repeated here.

## A. The artifact bus (`app/` is the bus)
Every phase reads prior artifacts and writes its own under `app/`:
`_init.md · product.md · ia.md · system.md · contract.md · screens.md · review.md`.
Pass **paths**, not full content, between phases. Mirror under engram key `app/<name>/<phase>` when
available.

**`app/contract.md` is special.** It is a *shared* artifact with whoever builds the backend — a
published interface, not a private note. Changing it is an API change: state what changed, and
whether it is additive or breaking.

## B. The six bars (review enforces all)
Not AI-looking · Learnable in 60s · Fast to OPERATE (keyboard) · **COMPLETE (every state)** ·
Survives stress · Crafted but quiet. Plus the hard gates: WCAG AA **measured**
(`craft-core/references/contrast-check.md`), reduced-motion safe, `tsc`/`lint` clean, contract not
drifted.

## C. Read the ground before you write (Mode A is the default)
Most runs land in an existing project. **Never assume greenfield.** Before designing anything,
know: the router, the styling approach, the component conventions, the data layer, the auth model,
and whether a design system already exists. `app/_init.md` holds this; if it's missing, scan first.
Match the project; never convert its stack unasked. See `adopt-existing.md`.

## D. Derive, don't invent (data)
Field names, types, nullability, enums and permissions come from the **real source of truth**
(schema / router types / OpenAPI / server-action signatures). If it doesn't exist yet, SPECIFY it
in `app/contract.md` and say plainly that it's a specification awaiting a backend. Never let a
component guess a field name. See `data-contract.md`.

## E. Every screen ships every state
Loading · empty (first-run / no-results / filtered) · error · partial · permission-denied ·
offline · overflow. A screen with only its happy path is **unfinished**, not "MVP". This is the
single loudest tell of an AI-built app. See `states-and-edges.md`.

## F. Behaviour from primitives, looks from tokens
Radix / Base UI (or the project's existing headless layer) supplies focus traps, roving tabindex,
ARIA wiring, portals and collision handling. Your token layer and your compositions supply 100% of
the appearance. **Never ship a default component-kit theme.** See `app-not-generic.md`.

## G. Scope discipline
In **Adopt** and **One-screen** modes, the blast radius is: what the task requires, plus what the
change-at-the-root rule obliges you to clean. You do not refactor unrelated modules, restyle
screens nobody asked about, or migrate the stack. Improvements outside the radius get *reported*,
not performed.

## H. UI microcopy is product design, not decoration
Button labels, empty states, error messages, confirmations and field help are part of the screen's
job. Use the `brand-voice` skill's anti-slop rules: specific verbs, the user's words, no "Oops!",
no blame, and every error says what happened AND what to do next. See `states-and-edges.md`.
