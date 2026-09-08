# Adopting an existing project (load in init + system + build — Mode A and C)

**This is the normal case, not the exception.** Most of the time there is already a Next.js
monolith, a half-built product, a backend with real endpoints, or a design that someone started.
app-craft's job then is to build INTO that project — matching it — not to arrive with opinions and
leave two of everything.

> **You are a guest until you have read the house.** The single worst outcome available is a repo
> with two design systems, two data layers, or two ways to write a page. Every rule below exists to
> prevent that.

> ### ⚠️ First check whether adopting is the right mode at all
>
> Everything in this file assumes the project is **sound** — its conventions are worth matching.
> When the codebase is genuinely bad (AI-generated in one shot, duplicated components, hardcoded
> values everywhere, `any` as a type system, only the happy path), **"match, don't impose" becomes
> a rule that propagates the disease.** That is **Mode E — rescue**, and it inverts most of what
> follows.
>
> You don't choose between them by taste. `examiner` **scores the codebase across 10 dimensions**
> and the score decides — healthy → adopt (this file) · salvageable → rescue · beyond repair → say
> a rewrite is cheaper. The assessment and the verdict table are in
> `craft-core/references/remediation.md`.
>
> **The signals that you should stop and audit instead of adopting:** the same component
> implemented more than twice · hex/px values scattered through JSX · `any`/`@ts-ignore` in
> quantity · business logic inside components · no empty or error states anywhere · `process.env`
> read straight from a component · files over ~400 lines. Two or more of these = run `/app-audit`
> before you build into it.
>
> **Regardless of mode:** a security hole or a reproducible bug you find gets fixed immediately —
> that is the zero-debt rule, and it does not wait for a verdict.

---

## 1. The adopt scan — before designing anything (`prospector` writes `app/_init.md`)

Answer every question by READING THE CODE. Do not ask the user what the repo can tell you.

### Framework & routing
- Next.js? Which major version? **App Router or Pages Router** (or both — a partial migration)?
- `src/` prefix or not? Route groups? Middleware? Where does auth gate routes?
- Is it Next at all — Vite/React Router, Remix, Astro, a Rails/Django app with an embedded SPA?

### Styling
- Tailwind (which version — **v3 `tailwind.config` vs. v4 CSS-first `@theme` are different worlds**),
  CSS Modules, styled-components, vanilla-extract, plain CSS?
- **Do design tokens already exist?** CSS variables, a Tailwind theme, a `tokens.ts`? Where?
- Is a component kit installed (shadcn/ui, MUI, Mantine, Chakra, Ant)? Themed or default?
- Dark mode: how is it implemented (`class`, `data-theme`, media-query-only)? Does it work?

### Components
- Where do components live, and how are they grouped?
- Naming: kebab files/PascalCase components? Default or named exports?
- Is there a real `Button`/`Input`, or is markup copy-pasted across pages?
- Is there a shell/layout component, or does each page render its own header?

### Data
- ORM/schema location · tRPC routers · REST route handlers · server actions · GraphQL · Supabase.
- **How does the UI currently get data** — RSC direct calls, TanStack Query, SWR, raw `fetch`?
- Is there a validation layer (zod/valibot)? Is it shared client/server?
- Auth: which library, where is the session read, how are roles represented?

### Tooling & conventions
- Package manager (**the lockfile decides** — never introduce a second one).
- TypeScript strictness · ESLint/Prettier config · CI · pre-commit hooks · test setup.
- `CLAUDE.md` / `.cursorrules` / `CONTRIBUTING.md` — **project instructions outrank every default
  in this skill.** Read them and obey them.

Write it all into `app/_init.md` with **file paths as evidence**. A claim without a path is a
guess, and downstream phases will build on it.

---

## 2. Match, don't impose

| Situation | What you do |
|---|---|
| Pages Router | **Build Pages Router.** Do not migrate unasked. |
| Tailwind v3 with `tailwind.config` | Extend that config. Do not introduce v4 `@theme`. |
| CSS Modules | Write CSS Modules. Consistency beats your preference. |
| A component kit is installed | **Re-token it** (`design-system.md` §1) so it reads your semantic layer. Do not rip it out. |
| Named exports everywhere | Named exports. Match the convention, always. |
| pnpm lockfile | `pnpm`. Never create a second lockfile. |
| No tests | Don't bolt on a test framework as a side effect. Mention it; don't do it unasked. |
| `CLAUDE.md` says something different from this skill | **`CLAUDE.md` wins.** Say so in your output. |

**The stack conversion rule:** converting a router, a styling approach, or a data layer is a
deliberate, separately-approved change — never a side effect of "add a screen". If the existing
approach genuinely blocks the task, STOP and say so with the reason and the cost. Don't half-migrate.

---

## 3. Extract the design system before you design one

If ANY visual system exists — even an implicit one — `artificer` **extracts it first**:

1. **Inventory the reality.** Grep every colour, radius, shadow, font-size and spacing value in
   use. You will typically find 14 greys, 5 radii and 3 accents. That inventory IS the current
   system, whether or not anyone designed it.
2. **Find the intent.** Which values dominate? What was the actual accent? Which radius is the real
   one? Cluster the near-duplicates (`#f8f9fa` and `#f8f9fb` are one colour).
3. **Name it as semantic tokens** (`design-system.md` §1) and write it into `app/system.md`,
   mapping old value → new token.
4. **Name the gaps honestly** — no dark mode, no focus ring token, no density scale, no state
   matrix, no elevation system.
5. **Upgrade in place, at the root.** Introduce the semantic layer, then **migrate call sites and
   delete the hardcoded values in the same pass.** Migrating half the app and leaving the rest is
   how you end up with two systems — the exact failure this file exists to prevent.
6. **If the migration is too large for this task's blast radius**, do not start it. Write the plan
   into `app/system.md`, apply the tokens to the new work only, and report it as a known, scoped
   remainder. A stated remainder is honest; a half-done migration is debt.

**Never create a parallel token set** because the existing one is imperfect. Improve the one that's
there.

---

## 4. Blast radius — the discipline that makes app-craft safe in a real repo

You touch: **what the task requires**, plus **what change-at-the-root obliges you to clean** (if
you replaced something, its old version and every caller go with it).

You do NOT touch: unrelated modules, screens nobody asked about, formatting of files you didn't
change, dependency upgrades, or "while I was in here" refactors. Improvements outside the radius
get **reported in the output**, not performed.

Before finishing, verify you left the house as you found it, plus your work:
- `git diff --stat` — is every changed file explainable by the task?
- No reformatted files you only read.
- No new dependency that the task didn't need. New dependency = a decision you state, not a
  side effect.
- No second lockfile, no second config, no second way of doing a thing that already had one.

---

## 5. One-screen mode (Mode C) — the most common request

"agregá la vista de facturas" is a **small, surgical** operation. Do not re-plan the app.

1. **Read** `app/_init.md`, `app/system.md`, `app/ia.md` if they exist. If they don't, do a fast
   scan (§1) and write a minimal `_init.md` — the next request will thank you.
2. **Contract first.** Does this screen need data the contract doesn't cover? Derive it from the
   schema, or specify it in `app/contract.md`. **Never let the view invent a field.**
3. **Pick the archetype** (`screen-patterns.md`) and reuse the existing shell, primitives and
   density. If you need a component that doesn't exist, add it to `src/components/ui` as a real
   reusable primitive — **never inline a one-off**, because the next screen will copy it.
4. **Build every state** (`states-and-edges.md`). A new screen with only a happy path fails the
   gate exactly like a whole app would.
5. **Wire it in** — the nav config, the route, the permission entry, the breadcrumb, and the
   command palette. A screen you can't navigate to isn't shipped.
6. **Update `app/ia.md`'s inventory** with the new screen. The artifact tracks reality or it's fiction.
7. **Focused review** — the six bars on this screen, the a11y gate, the states gate, `tsc`/`lint`.

---

## 6. Working alongside a backend agent (parallel full-stack)

When another agent or dev is building the backend at the same time:

- **`app/contract.md` is the shared interface.** Read it before you build; update it when you need
  something new; treat every change as an API change (additive vs. breaking, stated).
- **Never block on the backend.** Implement against the mock adapter that satisfies the identical
  interface, and keep moving. That is the entire point of the seam.
- **Never invent an endpoint quietly.** If you need one, it goes in `app/contract.md` under
  operations, with its permission and its error cases — so the other side can implement exactly it.
- **Re-sync deliberately** with `/app-contract` when the backend lands or changes: re-derive types,
  let `tsc` show you the blast radius, patch the views and their states, update the doc.
- **Report the seam's status in every output**: `derived from prisma/schema.prisma` /
  `specified, awaiting 3 operations`. Whoever reads it must know whether the app is running on real
  data or a mock — never leave that ambiguous. An app demoed on mock data and described as "done"
  is the kind of dishonesty this pipeline exists to prevent.
