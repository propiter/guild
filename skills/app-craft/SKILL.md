---
name: app-craft
description: "Trigger: build/design an application UI, dashboard, admin panel, SaaS product screens, app layout, sidebar/header/app shell, a new view or module inside an existing app, CRUD screens, settings, onboarding, data table — AND rescuing an app that is already built badly: 'armame el dashboard', 'diseñá la pantalla de X', 'agregá el módulo de facturas', 'una app que no parezca hecha con IA', 'esta app está fatal/fea/mal hecha', 'refactorizá y limpiá esta app', 'analizá módulo por módulo y mejoralo', 'sacá el código muerto', 'nada quemado'. The FRONTEND specialist that plugs into a backend you already have or are building in parallel: it discovers or negotiates a typed CONTRACT, then runs product → IA & flows → design system → screens → contract → build → states → motion → polish → review. Works greenfield, ADOPTS an existing Next.js monolith, adds ONE screen to a live app, or RESCUES a badly-built one — auditing it page by page and component by component, then remediating in verified waves (safety net → delete dead code → tokenize → de-duplicate → architecture → bugs + states → a11y → performance). Headless primitives (Radix/Base UI) for accessibility + a 100% custom token layer — never a default component kit. Ships every state (loading/empty/error/permission/overflow), full keyboard, and reusable components."
license: Apache-2.0
metadata:
  author: propiter
  version: "2.2.0"
---

# App Craft

An application is not a landing with a sidebar. A landing has to **convince a stranger once**; an
app has to **serve a returning user a hundred times a day**. Different problem, different gates.

This skill is the **orchestrator** for building application UI: you hold one thin thread, delegate
each phase to a specialist sub-agent, pass artifacts forward, and guard the bar. It shares its
engineering spine with `landing-craft` via **`craft-core`** — read that first.

> **Load `craft-core/SKILL.md` before anything else.** It carries zero-technical-debt,
> change-at-the-root, the closed review loop, the orchestrator gate, the artifact bus,
> tokens-first, and the model map. This file does not repeat them.

## What app-craft is (and is not)

**It is the FRONTEND half of a full-stack effort.** Almost never does it build in a vacuum: there
is a backend that already exists, or a Next.js monolith already underway, or another agent/dev
building the API in parallel while you build the views. app-craft is designed for exactly that.

The mechanism that makes the two halves fit is a **typed CONTRACT that is the seam between them**
(`references/data-contract.md`). The frontend declares what it needs; the backend implements it;
neither one breaks when the other changes internally. That contract is a real, checked artifact —
not a promise in a chat message.

**It is not** a backend generator. It does not choose your database, write your migrations, or own
your auth provider. It *consumes* them, and when they don't exist yet it *specifies* them and runs
against a mock adapter that satisfies the identical contract.

## The Prime Directive — the SIX bars

Every application screen this workflow ships must clear all six. If any fails, it is not done:

1. **It does NOT look AI-generated.** No default component-kit look, no slate/zinc + violet, no
   `rounded-lg` on everything, no docs-example DataTable. A real token layer and a signature.
   Run the tell test in `references/app-not-generic.md` before sign-off.
2. **It's learnable in 60 seconds.** A new user knows where they are, what this screen is for,
   what they can do, and how to get back — without a tour.
3. **It's fast to OPERATE.** The frequent task is few clicks and **reachable from the keyboard**.
   Nothing is a dead end. This is the bar landings do not have, and the one apps live or die on.
4. **It's COMPLETE — every state exists.** Loading, empty (first-run vs. no-results vs. filtered),
   error, partial, permission-denied, offline, and overflow. **Only-the-happy-path is THE tell of
   an AI-built app** — bigger than any colour choice. See `references/states-and-edges.md`.
5. **It survives stress.** 60-character names, 10.000 rows, zero rows, a null every optional
   field, a slow network, 320px width, dark mode, and a language that runs 40% longer.
6. **It's crafted and alive — but QUIET.** Motion is feedback and continuity (≤200ms, never
   decorative, never delaying a task), AA contrast **measured**, focus always visible,
   reduced-motion honored. An app that performs for you is an app that wastes your time.

## The four modes — detect before you plan

Read the ground before choosing a pipeline. `prospector` does this and writes `app/_init.md`.

| Mode | When | What runs |
|------|------|-----------|
| **A · Adopt** *(most common)* | A Next.js/React project already exists — a monolith, a half-built app, a repo with a backend | `init` (adopt scan) → `product` → `ia` → `system` (EXTRACT + formalize what exists, then upgrade) → `contract` → `screens` → `build` → `states` → `motion` → `polish` → `review`. **You build INTO the project, matching its conventions.** See `references/adopt-existing.md`. |
| **B · Greenfield** | No app yet — start from zero | The full pipeline, scaffolding Next.js + Tailwind + TS strict first. |
| **C · One screen** | "agregá la vista de facturas" to a live app | `init` (quick scan) → `contract` (that entity only) → `screens` → `build` → `states` → `polish` → focused `review`. **No re-planning of the whole app.** This is `/app-screen`. |
| **D · Contract sync** | The backend changed (new field, renamed entity, new endpoint) | `contract` alone → re-derive types → report drift → `build` patches the affected views → focused `review`. This is `/app-contract`. |
| **E · Rescue** ⭐ | The app exists and it is **bad** — AI-generated in one shot, or grown without discipline: duplicated components, hardcoded values, dead files, `any` everywhere, only the happy path, real bugs | `audit` (read-only: score, evidence, verdict, plan) → `remediate` (waves 0–7 on a branch, verified between each) → `review`. This is `/app-audit` and `/app-rescue`. See `craft-core/references/remediation.md`. |

**Mode A and C are the normal case.** Do not run the full greenfield pipeline on a project that
already has answers — read them out of the codebase instead. Re-deriving what already exists is
how you end up with two design systems in one repo.

### Adopt or rescue? Judge before you decide

Mode A says *"you are a guest — match the project, don't impose."* Mode E says *"the project's
conventions are the disease — matching them propagates it."* Both are right in their context, and
**picking wrong is the most expensive mistake available here.**

So you do not choose by taste. `prospector` flags a suspect codebase; `examiner` **scores it across
10 dimensions** and the score decides: healthy → adopt · salvageable → rescue · beyond repair →
say a rewrite is cheaper, with the evidence. The full assessment and verdict table live in
`craft-core/references/remediation.md`.

Two things are unconditional: **security holes and reproducible bugs get fixed immediately**,
whatever the verdict — and **nothing is refactored before the safety net exists**
(`craft-core/references/safety-net.md`). Refactoring code you cannot verify is gambling with
someone else's product.

## The Pipeline (the DAG)

```
  init ─► product ─► ia&flows ─┬─► system ──┐
  (mode + ground) (domain,     │  (tokens,  │
                   roles,      │   density, ├─► screens ─┐
                   JTBD,       │   inventory)│  (shell +  │
                   UI refs)    └─► contract ─┘   layouts) │
                                  (the SEAM)              │
                                                          ▼
                                      build ─┬─► states ⭐ ─┐
                                             ├─► motion ────┼─► review ⭯ ─► (deploy)
                                             └─► polish ────┘
```

- **product** — what the app DOES, who uses it (**roles**), the jobs-to-be-done, and a teardown of
  the reference-class UIs in this category. The analogue of market research, aimed at INTERFACE.
- **ia&flows** — the navigation model, the **screen inventory**, the entity model, the route map,
  and the **permission matrix**. This is the app's architecture. Everything downstream reads it.
- **system** — the design system: token layers (incl. dark mode), the UI type scale, **density**,
  and the component inventory **with every component's state matrix**. Headless primitives for
  behaviour, 100% custom tokens for looks.
- **contract** — ⭐ the backend seam: discover the real schema (Drizzle/Prisma/tRPC/OpenAPI/
  GraphQL/server actions) and DERIVE types from it; or, if the backend isn't built yet, SPECIFY
  the contract the frontend needs and emit `app/contract.md` for the backend side.
- **screens** — the app shell (header/sidebar/panels/command palette) + a layout spec per screen.
- **build** — implement. Shell, system, screens, wired to the contract's adapters.
- **states** — ⭐ the pass landings don't need: every screen × every state, actually built.
- **motion / polish** — feedback motion; then density, keyboard, ARIA, contrast, responsive.
- **review** — the gate: the six bars + the a11y gate + the **states gate** + the **contract
  gate** + the hardening gate, looped (max 3) per `craft-core`.
- **deploy** — **greenfield only.** A standalone app gets `courier` (it is stack-agnostic:
  `gh` + Vercel). In **Adopt** mode app-craft does NOT deploy — the host project owns its pipeline,
  and hijacking it would be exactly the kind of orphaned mess the root-change rule forbids.

## Phase → Sub-agent map

Delegate each phase via the host's Task/Agent primitive. Each agent loads the references it needs
and returns a structured artifact under `app/`. Pass PATHS forward, not content.

| Phase | Sub-agent | Loads | Produces |
|-------|-----------|-------|----------|
| init | `prospector` | `adopt-existing` | `app/_init.md` — mode (A–E), stack, existing design system, backend contract sources, auth, tooling |
| Audit ⭐ *(Mode E)* | `examiner` | `remediation`, `codebase-hygiene`, `safety-net` | `app/audit.md` — health score, inventory + tool evidence, per-unit findings, reproduced bugs, gaps, **the verdict + ordered wave plan**. READ-ONLY |
| Remediate ⭐ *(Mode E)* | `renovator` | `remediation`, `safety-net`, `codebase-hygiene` | The rescued codebase — waves 0–7 on a branch, one commit each, verified between every wave |
| 1. Product | `ethnographer` | `app-not-generic`, Firecrawl/WebSearch | `app/product.md` — what it does, **roles**, JTBD, frequent-task ranking, reference-UI teardown |
| 2. IA & flows | `wayfinder` | `ia-and-flows` | `app/ia.md` — nav model, screen inventory, entity model, route map, **permission matrix**, primary flows |
| 3. System | `artificer` | `design-system`, `app-not-generic`, Impeccable, `craft-core/references/assets.md` | `app/system.md` — token layers, type scale, density, **component inventory + state matrix**, the signature token |
| 4. Contract ⭐ | `envoy` | `data-contract` | `app/contract.md` + `src/lib/data/contracts/*` + mock & http adapters. **The backend seam.** |
| 5. Screens | `framer` | `app-shell`, `screen-patterns` | `app/screens.md` — the app shell + a layout spec per screen (regions, hierarchy, actions, states) |
| 6. Build | `joiner` | `craft-core/references/hardening.md`, `design-system`, `screen-patterns` | The running app: shell + system + screens on the contract adapters |
| 7. States ⭐ | `steward` | `states-and-edges` | Every screen × loading/empty/error/permission/offline/overflow, actually implemented + stress-tested |
| 8. Motion | `conductor` | `app-motion.md`, `craft-core/references/animation-levels.md`, `motion-craft` | Feedback motion — ≤200ms, continuity, optimistic UI, reduced-motion safe |
| 9. Polish | `lapidary` | Impeccable, `interaction-a11y`, `craft-core/references/contrast-check.md` | Density, keyboard model, ARIA patterns, focus management, measured AA, responsive |
| 10. Review ⭯ | `magistrate` | `design-review-loop`, all app references, `craft-core/references/hardening.md` | The gate: 6 bars + a11y + states + contract + hardening → phase-routed findings; orchestrator loops (max 3) |

## How to run it

- **`/app <brief>`** → the flagship. Detects the mode, runs everything autonomously end to end.
- **`/app-init`** → scan the ground: mode, stack, existing system, backend contract sources.
- **`/app-new <brief>`** → planning only (product → ia → system → screens), then STOP for approval.
- **`/app-build`** → production (build → states + motion + polish) on the approved plan.
- **`/app-screen <name>`** → ⭐ ONE screen into an existing app, consistent with what's there.
- **`/app-contract`** → ⭐ re-derive the backend contract, report drift, patch the affected views.
- **`/app-audit`** → ⭐ diagnose an existing app (read-only): score, evidence, verdict, wave plan.
- **`/app-rescue`** → ⭐ audit **then** remediate a badly-built app in verified waves.
- **`/app-review`** → the review loop and its fixes (max 3 passes).
- **`/app-continue`** → resume from the last completed phase (reads `app/`).
- **`/app-status`** → where the pipeline is (read-only).

**Interactive vs Auto:** default to Interactive — pause after each phase, show the artifact, ask
"¿seguimos o ajustamos?". Switch to Auto when the user asks for speed (`/app` runs Auto).

## Working hand-in-hand with the backend (the seam)

This is the part that makes app-craft fit a real project, so get it right. Full method in
`references/data-contract.md`; the rules that never bend:

1. **If a schema exists, DERIVE — never invent.** Drizzle/Prisma schema, tRPC router types, an
   OpenAPI/GraphQL document, Supabase generated types, or the server actions' signatures are the
   truth. Field names, nullability, and enums come from there. A frontend that guesses
   `user.fullName` when the schema says `user.full_name` is a bug you shipped on purpose.
2. **If it does not exist yet, SPECIFY it — and say so out loud.** Write the contract the frontend
   needs into `app/contract.md` (entities, fields, types, list/filter/sort/pagination shape, error
   shape, permission rules) and implement against the mock adapter. Hand `app/contract.md` to
   whoever builds the backend. When it lands, `/app-contract` swaps the adapter — **zero UI
   changes**, because the UI never imported anything but the contract.
3. **The UI imports the contract, never a transport.** No `fetch` in a component, no ORM in JSX,
   no raw `process.env`. Components consume the repository interface; one file decides whether
   that's mock or http.
4. **Mock data is HOSTILE by design** — 10.000 rows, 60-character names, nulls in every optional
   field, an error case, an empty case, a slow case. Friendly seed data is how you ship an app that
   dies on contact with production.
5. **Drift is checked, not assumed.** `magistrate` re-reads the source of truth and fails the
   **contract gate** if the adapters no longer satisfy it. A silently diverged contract is worse
   than no contract.

## Adopting an existing project (Mode A — read before you write)

Full method in `references/adopt-existing.md`. The governing rule: **you are a guest until you have
read the house.**

- **Match, don't impose.** The project's router, styling approach, component conventions, naming,
  data layer, and folder structure win. You do not introduce a second way of doing something that
  already has a way.
- **Extract before you design.** If a design system exists (even an implicit one), `artificer`
  EXTRACTS it into `app/system.md`, names the gaps, and upgrades in place — it does not start a
  parallel token set. Two token systems in one repo is the worst outcome available.
- **Never convert the stack.** Pages Router stays Pages Router. CSS Modules stay CSS Modules,
  unless the user explicitly asks to migrate (then it's a separate, deliberate change).
- **Blast radius is bounded.** In Adopt and One-screen modes you touch what the task requires plus
  what the root-change rule obliges you to clean. You do not "improve" unrelated modules.

## Anti-slop guardrails (enforced at every phase)

- **No screen without a job.** Name what the user came to DO here. If you can't, the screen is
  navigation, not a destination — merge it.
- **One primary action per screen**, visually unambiguous. Everything else is secondary/ghost/menu.
- **Density is a decision, not an accident.** Pick the density for the job (a data table is not a
  marketing card grid) and apply it through the scale — see `references/design-system.md`.
- **Tokens first, components second** (`craft-core` rule 8), plus **one signature token** the kit
  doesn't ship. No hardcoded hex/px, ever.
- **Headless primitives for behaviour, custom everything for looks.** Radix/Base UI gives you focus
  traps, roving tabindex, correct ARIA and popover collisions — the things hand-rolled UI gets
  wrong. It gives you **zero** styles, which is exactly the point.
- **Keyboard is not an accessibility checkbox — it's the power-user path.** Every primary action
  reachable without a mouse; `⌘K` where the app has more than a handful of destinations.
- **Every state, every time.** A screen without its empty and error states is unfinished, not
  "MVP". This is a hard review gate.
- **Numbers are tabular.** Money, counts, dates and IDs use tabular numerals and align right.
  Mis-aligned digits in a table is the fastest way to look amateur.
- **Production-hardened** per `craft-core/references/hardening.md` — strict TS, no `any`, reusable
  atomic components, logic in `src/lib`, validated public endpoints, CI + pre-commit.

## Artifacts & continuity

Each phase writes to `app/` in the project: `_init.md · product.md · ia.md · system.md ·
contract.md · screens.md · review.md`. Later phases READ the earlier ones. If engram is available,
mirror under topic keys `app/<name>/<phase>`. **`app/contract.md` is special: it is a shared
artifact with the backend side — treat it as a published interface, and version its changes.**

## Post-launch iteration (the cycle does NOT end at the first screen)

Apps grow forever. Every change gets the same discipline as the build — this is the normal mode of
operation, not an afterthought:

1. **Scope it** — what the user wants, which screens/components/contract it touches.
2. **Contract first, if data is involved** — if the change needs a new field or endpoint, update
   the contract (and `app/contract.md`) BEFORE touching UI. Never let a view invent a field.
3. **Change at the ROOT, clean** — delegate to the owning phase; delete what you replaced in the
   same pass; refactor every caller. No orphans, no "old + new" coexisting.
4. **States are part of the change** — a new view without its empty/error/loading states is not a
   finished change. New field → does the table overflow? Does it sort? Is it null-safe?
5. **Verify the blast radius** — focused `magistrate` on what changed (not the whole app), render
   it, run `tsc`/`lint`. Fix-loop max 3.
6. **End with NO debt.** The app is as clean after the iteration as it was at launch.

## References (load on demand)

- `references/_conventions.md` — **shared rules every app-craft agent follows.** Read first.
- `references/artifact-examples.md` — **worked examples of every `app/` artifact** for one coherent
  product (`_init` · `ia` · `system` · `screens` · `audit`). Load before writing an artifact: copy
  the SHAPE and the level of specificity, never the content. Vague is the failure mode — if a spec
  could describe two different screens, it isn't a spec.
- `references/app-not-generic.md` — **the anti-AI doctrine FOR APPS** (different from a landing's):
  the component-kit fingerprint, the tokens-first fix, the signature token, the tell test.
- `references/ia-and-flows.md` — navigation models, screen inventory, entity model, route map,
  permission matrix, flow mapping. The IA phase.
- `references/design-system.md` — the three token layers, dark mode, the UI type scale, **density
  modes**, the component inventory + **state matrix**, headless-primitive doctrine.
- `references/app-shell.md` — header/sidebar/panels/command palette/responsive collapse; how the
  shell holds every screen without repeating itself.
- `references/screen-patterns.md` — the archetype library: dashboard, list/table, detail, form,
  settings, onboarding, auth, search, inbox, board, calendar, wizard, billing, admin — each with
  its layout, its hierarchy, and its traps.
- `references/states-and-edges.md` — ⭐ the **state matrix**, the stress tests, and the microcopy
  for empty/error states. The bar that catches AI-built apps.
- `references/interaction-a11y.md` — the keyboard model, shortcut design, ARIA patterns for
  complex widgets, focus management, live regions, form errors.
- `references/data-contract.md` — ⭐ the **backend seam**: derive vs. specify, the repository
  interface, mock/http adapters, hostile seed data, the drift check.
- `references/i18n.md` — building for more than one language: strings out of JSX, `Intl` for
  every number/date/currency, layout that survives +40% length, logical CSS properties, RTL,
  and where each phase plugs in. Proportionate — the floor applies even to monolingual apps.
- `references/adopt-existing.md` — brownfield: how to read a codebase and build INTO it.
- **From `craft-core` (Mode E)**: `remediation.md` — the health assessment, the adopt-vs-rescue
  verdict, the audit method, the wave order, the guardrails · `safety-net.md` — how to make an
  untested codebase safe to refactor (strict TS, smoke tests, **Playwright visual baselines**) ·
  `codebase-hygiene.md` — dead-code detection with real tools, the no-hardcode ("nada quemado")
  sweeps, and the structure that survives 10× the screens.
- `references/app-motion.md` — app motion doctrine: feedback over spectacle, the duration budget,
  optimistic UI, shared-element continuity, what NEVER to animate.
- **From `craft-core`**: `hardening.md` · `contrast-check.md` · `animation-levels.md` · `assets.md`.
- **Bundled skills**: `motion-craft`, `design-review-loop`, `web-assets`, `brand-voice` (for UI
  microcopy), Impeccable (aesthetic engine).

## Output Contract

When the workflow finishes, report: the **mode** it ran in, the screens built (and where they
live), the navigation model, the design system's signature (accent + radius + type + the signature
token), the **contract status** (derived from `<source>` / specified in `app/contract.md` awaiting
backend), the states coverage, the review verdict (the 6 bars), and the follow-ups. In greenfield
mode, the live URL. **Never declare "done" until `magistrate` returns a genuine PASS** — and if it
doesn't after 3 passes, say exactly what remains.
