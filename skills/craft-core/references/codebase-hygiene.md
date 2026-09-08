# Codebase hygiene — dead code, nothing hardcoded, built to scale (load in audit + remediate + build)

Three properties every codebase this workflow touches must end up with, whether it was generated
today or inherited from someone else:

1. **Nothing dead** — no file, export, dependency, route, env var or style that nothing uses.
2. **Nothing hardcoded** — no value baked into a component that belongs in a token, a config, a
   contract or an env var.
3. **Scalable** — the structure still works at 10× the screens, without anyone reorganizing it.

These are measured with tools, not judged by eye.

---

## 1. Dead code — find it mechanically, prove it before deleting

### The tools

| Tool | Finds | Command |
|---|---|---|
| **knip** | unused files, exports, types, dependencies, and unlisted deps — the best single tool | `npx knip` |
| **ts-prune** | unused exports (second opinion on knip) | `npx ts-prune` |
| **depcheck** | unused + missing `package.json` deps | `npx depcheck` |
| **madge** | circular dependencies + orphan modules | `npx madge --circular --extensions ts,tsx src/` |
| **jscpd** | copy-paste duplication, with a similarity % | `npx jscpd src --min-lines 10 --threshold 0` |
| **eslint** | unused imports/vars, per-file | `npx eslint . --rule '{"no-unused-vars":"error"}'` |
| **Coverage of a route crawl** | code never executed by any page | Playwright + `page.coverage` (optional, heavy) |

Run knip first — it subsumes most of the others and reports at the file level, which is where the
biggest wins are.

### What the tools MISS — check before every delete

Static analysis cannot see:

- **Dynamic imports and computed paths** — `import(\`./icons/${name}\`)`, `require(variable)`
- **String-referenced routes/components** — a router map, a CMS field, a feature flag, a
  `component: 'InvoiceTable'` string in config
- **CSS used by markup the analyzer can't attribute** — global styles, classes composed at runtime
- **Anything reached via reflection or a registry**
- **The public API of a library/package** — exports exist *for consumers*, not for internal callers
- **Files a build step or framework consumes by convention** — `middleware.ts`, `robots.ts`,
  `sitemap.ts`, `instrumentation.ts`, `not-found.tsx`, generated types, migrations, config

So the deletion rule is:

```
tool flags it  →  grep the whole repo for the basename AND the symbol
               →  grep for it as a STRING (quoted, dynamic use)
               →  check it isn't a framework convention file
               →  delete, then: tsc + lint + build + smoke + visual diff
uncertain at any step  →  DO NOT DELETE. Report it as "suspected dead, unverified".
```

**Delete in its own wave and its own commit.** A deletion mixed into a refactor is impossible to
revert cleanly, and deletions are the changes most likely to need reverting.

**Delete completely.** A "dead" component's styles, tests, fixtures, assets, translation keys, env
vars and its entry in any registry go with it. Half a deletion is a new kind of dead code.

---

## 2. Nothing hardcoded ("nada quemado")

A hardcoded value is one that has an owner somewhere else. Find them by category — each has a
different home:

| What | Grep for | Belongs in |
|---|---|---|
| **Colours** | `#[0-9a-fA-F]{3,8}`, `rgb(`, `hsl(`, `oklch(` outside the token file | semantic tokens |
| **Sizes/spacing** | `\d+px`, `\d+rem` outside the token/scale definition | the spacing/type/radius scale |
| **Durations/easing** | `\d+ms`, `cubic-bezier(` | motion tokens |
| **URLs & endpoints** | `https?://` in components | `env.ts` / the data adapter |
| **Secrets & keys** | `sk_`, `pk_`, `api[_-]?key`, long base64 | server env only — **never** `NEXT_PUBLIC_*` |
| **Magic numbers** | unexplained literals in logic (`* 0.21`, `> 86400000`) | a named constant in `lib`, with its unit |
| **User-facing strings** | literals in JSX | a content module (or i18n, if the app needs it) |
| **Enum-ish strings** | `'draft'`, `'paid'` inline | the contract's enum type |
| **Dates/timezones** | `new Date('2026-…')`, `-03:00` | config or the contract |
| **Row limits, page sizes, timeouts** | `50`, `3000` inline | named constants / the contract's `ListQuery` |

A quick sweep that finds most of it:

```bash
# Colours and pixel values living in component files (the two worst offenders)
grep -rnE '#[0-9a-fA-F]{6}\b|[^a-z-][0-9]+px' src/components src/app \
  --include='*.tsx' --include='*.ts' | grep -v '\.test\.'

# Absolute URLs and probable secrets anywhere in the client tree
grep -rnE "https?://[^\"'\` ]+|sk_[a-zA-Z0-9]|api[_-]?key\s*[:=]" src/ --include='*.ts*'

# process.env reached directly instead of through the typed env module
grep -rn 'process\.env\.' src/ --include='*.ts*' | grep -v 'lib/env'
```

**The migration order is the same as everywhere else: tokens first.** Extracting the palette and
scale into semantic tokens and pointing components at them fixes hundreds of literals in one pass —
and it changes the *look* of nothing, so the visual diff stays at zero and proves you did it right.
Chasing literals component-by-component is the slow, error-prone way.

**Two things that are NOT hardcoding** — don't churn them: a genuinely one-off layout value that no
token models, and a well-named local constant used once in the file that owns it. The test is
*"does this value have an owner elsewhere?"*, not *"is this a literal?"*.

---

## 3. Built to scale

Scalable does not mean "abstracted". It means **the structure still works when there are ten times
as many screens, and a newcomer can still find things.**

### Structure
```
src/
  app/                    routes only — page.tsx, layout.tsx, loading/error/not-found, api/
  components/
    ui/                   atomic primitives (button, input, dialog) — no domain knowledge
    patterns/             composed, reusable (data-table, form-layout, page-header)
    shell/                the app frame — built once
  features/<domain>/      domain-owned components + hooks + logic, when a domain grows past ~5 files
  lib/                    env.ts, utils, pure logic, data/ (contracts + adapters)
```

- **Named exports.** Default exports rename themselves on every import and defeat grep.
- **One component per file**; kebab-case files, PascalCase components.
- **A feature folder owns its internals.** Cross-feature imports go through the feature's index or
  through `lib` — never deep into another feature's internals.
- **Domain logic never lives in `app/`.** Routes compose; they don't implement.

### The limits that keep it honest

| Signal | Threshold | Why it matters |
|---|---|---|
| Component file length | > ~200 lines → split | A god component is where states and bugs hide |
| Component responsibilities | > 1 → split | If it renders three unrelated things, it's three components |
| Props on one component | > ~8 → the shape is wrong | Usually wants composition or an object prop |
| Prop drilling depth | > 2 levels → context or composition | Drilling is a refactor that never happened |
| Duplicate blocks | 2nd copy → extract | Extract on the second, not the fifth. Not on the first — premature abstraction is its own debt |
| Circular imports | any → fix | `madge --circular`. They break tree-shaking and reason |
| `useEffect` for derived state | any → derive during render | The #1 source of stale-state bugs in generated code |
| Client Components | only where interactivity lives | A `'use client'` at the top of a page ships the whole tree to the browser |

### Data and boundaries
Data access sits behind the contract (`data-contract.md`) — components never call a transport.
Logic lives in `lib` as pure, named functions; **JSX renders, it does not compute.** That one rule
is what makes a codebase testable, and it's the one generated apps break most often.

### Bundle discipline
Record bundle size per route at baseline. Watch for: a heavy library imported for one helper, a
date library where `Intl` suffices, icon packs imported wholesale, and moment-of-truth client
components. Code-split what's genuinely below the fold or behind an interaction — and **measure
before and after**, because unmeasured optimization is just churn.

---

## The hygiene gate (review verifies)

- `npx knip` reports **zero** unused files, exports and dependencies — or every remaining item is
  listed in the report with the reason it's a false positive.
- `npx madge --circular` reports **zero** cycles.
- The hardcode sweeps return nothing outside the token/config files.
- No `process.env` outside `lib/env.ts`; no secret in any `NEXT_PUBLIC_*`.
- No file over ~200 lines without a stated reason; no business logic inside JSX.
- Duplication: no second copy of a component that should be a primitive (`jscpd` clean at the
  threshold you set, and one `Button`/`Header`/`Table` in the tree).
