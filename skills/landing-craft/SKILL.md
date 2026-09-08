---
name: landing-craft
description: "Trigger: build/create/make a landing page, marketing site, product page, hero section, sales page, waitlist, 'armame una landing', 'landing que venda', 'una web que no parezca hecha con IA' — AND rescuing a site that already exists and is badly built: 'esta landing está mal hecha/fea', 'arreglá y limpiá este sitio', 'los botones no van a ningún lado', 'sacá el código muerto'. An end-to-end, phased workflow that LEADS with an autonomous MARKET STUDY (scrapes the product + competitors, mines keywords/intent, profiles the audience — no interrogation), then runs research → strategy → multi-page architecture → copy → visual design → build → motion (configurable depth — subtle/medium/rich, scroll-reactive via Motion+GSAP+Lenis) → polish → SEO → review, and DEPLOYS the result (GitHub + Vercel) — shipping a modern, elegant, intuitive, high-converting landing that does NOT look AI-generated, ready to view live. Also AUDITS and RESCUES an existing site (/landing-audit, /landing-rescue): scores it page by page against the five bars plus the wiring, SEO/GEO, hardening and contrast gates, then remediates in verified waves — safety net, delete dead code, tokens, one shared Header/Footer, dead CTAs and stub forms, copy, craft + ALIVE, SEO/GEO, Core Web Vitals. Next.js + Tailwind by default (no hardcoded tokens); remembers your style preferences."
license: Apache-2.0
metadata:
  author: propiter
  version: "2.2.0"
---

# Landing Craft

A landing page is not a template you fill in. It's an argument that earns a click. This skill is
the **orchestrator**: when someone asks for a landing, you don't write it all yourself — you run
a phased pipeline and delegate each phase to a specialist sub-agent, exactly like SDD does for
features. Your job is to hold one thin thread, launch the right agent at the right time, pass
artifacts between them, and guard the quality bar.

> **Wrong pipeline? Hand off.** This skill builds **marketing sites** — pages that convince a
> stranger once. If the request is for **application UI** (a dashboard, an admin panel, product
> screens, an app shell, a new view or module inside an existing app), that is a different design
> problem with different gates: use **`app-craft`** (`/app`, `/app-screen`) instead. Both pipelines
> share the same engineering spine via **`craft-core`** — read that first either way.

## The Prime Directive

Every landing this workflow ships must clear FIVE bars. If any fails, it is not done:

1. **It does NOT look AI-generated.** No centered-everything, no untouched component library, no
   purple gradient, no generic hero→3-cards→CTA with lorem spacing. Distinct, intentional, modern.
2. **It sells.** A stranger understands *what it is, who it's for, why it's better, and what to do
   next* within 5 seconds of the hero.
3. **It's intuitive.** One obvious primary action per screen. Nothing makes the user think about
   the interface instead of the offer.
4. **It's crafted.** 60fps motion with restraint, real type/spacing/contrast, accessible, fast.
5. **It's ALIVE — it has a vibe.** Real imagery (NOT a generic UI mock on a dark gradient), a
   signature visual idea that's THIS brand, colour with warmth/contrast (not one cold hue), and
   **scroll-reactive motion** — things enter and move as you scroll. "Pretty but generic/dead"
   fails this bar. Run the vibe test in `references/alive-not-generic.md` before sign-off.

## Zero technical debt (always-on, every phase)

Every agent operates under a no-debt rule: **the moment you spot a bug, a flaw, a smell, a broken
edge case, a dead link, duplicated code, or a clear improvement — fix it on the spot and CONTINUE.**
Don't leave a TODO, don't defer it, don't stop to ask. This covers the generated site (a11y/contrast
misses, broken responsive, missing states, hardcoded values, repetition) AND the workflow's own
artifacts. Later phases RE-CHECK earlier work and repair anything that slipped; `review` is the
backstop. When the orchestrator delegates, it tells each sub-agent: *honor zero-debt — fix what you
find and keep going.* The product ships complete — **no known debt, nothing "to fix later".**

**Change at the ROOT — never leave orphans.** When you replace an approach (a component, a lib, a
pattern, an env var, a dependency), DELETE what it replaced in the SAME pass: no orphaned files, no
dead imports/exports, no unused env vars, no commented-out code, no "old + new" coexisting. Refactor
every caller. Leave it as if it had always been this way. This holds during the build AND during
**every post-launch iteration** (see *Post-launch iteration*).

## The Pipeline (the DAG)

```
  init ─► research ─► strategy ─► architecture ─┬─► copy ───┐
  (env)  (market study)                        └─► design ─┴─► build (multi-page) ─► motion ─► polish ─┐
                                                                    build ─► seo ──────────────────────┴─► review ⭯ ─► deploy
```

- **Research** (Phase 0): an AUTONOMOUS market study — scrape the product + competitors, mine
  keywords/intent, profile the audience's emotional drivers, collect alive design references,
  validate positioning. **The skill LEADS; it does NOT interrogate the user.** (`cartographer`)
- **Architecture** (after strategy): the page map (multi-page) + the UNIQUE per-theme section plan.
- **Planning**: `strategy → {copy, design}`, all grounded in the research.
- **Production**: `build` (multi-page) → `motion` → `polish`, with `seo` (researched keywords) off `build`.
- **Gate**: `review` is the comprehensive final audit — renders every page and scores the 5 bars
  (incl. ALIVE) + contrast + the **wiring gate** + the **hardening/security gate** + the **GEO gate**
  (cited-by-AI: AI-crawler robots, `llms.txt`/`llms-full.txt`, entity schema, freshness, no fabricated
  reviews), returning a phase-routed findings list. The **orchestrator loops** review → fixes →
  re-review (see *The review loop*) until PASS or 3 passes.
- **Deploy** (final): GitHub + Vercel — a live URL. Research, SEO and deploy are NOT optional.

## Phase → Sub-agent map

Delegate each phase to its agent via the Task/Agent mechanism. Each agent loads the deep skill it
needs (we already own them) and returns a structured artifact. Pass the prior artifacts forward.

| Phase | Sub-agent | Loads / leans on | Produces |
|-------|-----------|------------------|----------|
| init | `surveyor` | Bash (env + tooling checks) | `_init.md` — framework/tooling readiness; bootstraps `landing/` (auto-runs in the flagship) |
| 0. Research | `cartographer` | `marketing-strategy`, `seo-geo`, Firecrawl, WebSearch | `research.md` — product/competitor teardown, keywords/intent, emotional drivers, alive design refs, the GAP |
| 1. Strategy | `strategist` | `marketing-strategy` | positioning, ICP/JTBD, core promise, offer (grounded in research) |
| 2. Architecture | `draughtsman` | `site-architecture` | the page map (multi-page) + the UNIQUE per-theme section plan |
| 3. Copy | `wordsmith` | `brand-voice` | section + page copy, research-backed, human (anti-slop) |
| 4. Design | `stylist` | `alive-not-generic`, Impeccable, `web-assets` | DESIGN.md: signature visual, real imagery, type/colour/space — NOT generic |
| 5. Build | `wright` | Next.js + Tailwind | the multi-page site (tokens in tailwind.config, no hardcoded) |
| 6. Motion | `choreographer` | `motion-craft`, `animation-levels` | scroll-reactive motion at the chosen intensity, reduced-motion safe |
| 7. Polish | `burnisher` | Impeccable, `contrast-check` | craft pass, responsive, AA contrast (measured), focus states |
| 8. SEO | `crier` | `seo-geo` | meta/OG/JSON-LD/CWV per page + GEO (AI-welcoming `robots.ts`, `llms.txt`+`llms-full.txt`, richer + entity schema from REAL data, freshness dates, AI-referral analytics), targeting the researched keywords |
| 9. Review ⭯ | `arbiter` | `design-review-loop`, `contrast-check`, `alive-not-generic`, `hardening`, `seo-geo` | comprehensive audit (5 bars + contrast + **wiring gate** + **hardening/security gate** + **GEO gate**) → phase-routed findings; orchestrator loops fixes→re-review, max 3 (see *The review loop*) |
| Audit ⭐ *(rescue)* | `assessor` | `craft-core`: `remediation`, `safety-net`, `codebase-hygiene`; + `alive-not-generic`, `playbook`, `instrumentation`, `seo-geo` | `landing/audit.md` — health score, per-page five-bar scoring, wiring/SEO+GEO/hardening findings, measured contrast, reproduced bugs, **the verdict + ordered wave plan**. READ-ONLY |
| Remediate ⭐ *(rescue)* | `restorer` | same + `contrast-check` | The rescued site — waves 0–8 on a branch, one commit each, verified between every wave |
| 10. Deploy | `courier` | `gh`, Vercel CLI | repo pushed + a live URL; installs the CLI if missing & guides first-time auth; **syncs `.env` → Vercel** so redeploys pick up the user's real values |

## How to run it

Detect the mode from the request; if unclear, ask once.

- **`/landing <prompt>`** → the flagship (DEEP mode). The skill **LEADS** and runs EVERYTHING
  autonomously, from init to the deployed product — **init** (detect env + tooling) → research →
  strategy → architecture → copy → design → build (multi-page) → motion → polish → seo → review →
  DEPLOY — **without interrogating you**. Auto-runs init if not done. Hands you a live,
  market-current, multi-page site.
- **`/landing-new <brief>`** → run Planning only (strategy → copy + design), then STOP and show the
  plan + visual direction for approval before building.
- **`/landing-build`** → run Production (build → motion → polish, + seo) on the approved plan.
- **`/landing-review`** → run the review loop and apply fixes (max 3 passes).
- **`/landing-ship <brief>`** → full auto: every phase end-to-end, stopping only if a gate fails.
- **`/landing-init`** → bootstrap the project: detect framework/tooling (Firecrawl, Vercel, gh,
  Next.js), set up `landing/`, load the style profile — so the pipeline runs informed.
- **`/landing-continue`** → resume the pipeline from the last completed phase (reads `landing/`).
- **`/landing-status`** → show pipeline progress (read-only checklist).
- **`/landing-audit`** → ⭐ diagnose an EXISTING site (read-only): the five bars per page, the
  wiring / SEO+GEO / hardening / contrast gates, a health score, a verdict and an ordered plan.
- **`/landing-rescue`** → ⭐ audit **then** remediate a badly-built site in verified waves (safety
  net → delete dead code → tokens → one shared Header/Footer → wiring → copy → craft + ALIVE →
  SEO/GEO → CWV). Use this when a site already exists and is bad — **not** `/landing`, which builds
  a new one. Method: `craft-core/references/remediation.md`.

**Interactive vs Auto:** default to Interactive — pause after each phase, show the artifact, ask
"¿seguimos o ajustamos?". Switch to Auto only when the user asks for speed.

## Phase 0 — Lead, don't interrogate (the skill is in charge)

The user already said what they want ("quiero una landing de X"). You are the **product lead** — you
do NOT run an interview. Gather context by RESEARCHING, not by asking:

1. **Load the saved style profile** (`mem_search` `landing-craft/style-profile`): animation intensity
   (default `medium`), Next.js + Tailwind always, no hardcoded tokens. Use as defaults — don't re-ask.
2. **Infer everything you can** from the prompt; if a URL/product exists, the **research phase scrapes
   it** — never ask what you can scrape.
3. **Ask AT MOST one short thing, and only if it's genuinely blocking** (e.g. no product and no way to
   infer the offer). Anything you can reasonably decide, DECIDE IT — you're the lead.
4. Then run the **full deep pipeline autonomously, end to end** — research → strategy → architecture →
   copy → design → build (multi-page) → motion → polish → seo → review → deploy — without pausing to ask.

**Tokens are not a constraint** — deliver a complete, market-current product, not a quick HTML page.
A landing is the market study + a multi-page site, not a single file. If the user states a lasting
preference ("siempre con muchas animaciones"), `mem_save` it to the profile. Never skip research.

## The review loop (automated quality gate — max 3 passes)

The final audit runs in a CLOSED LOOP the orchestrator drives — the same thorough pass a senior
reviewer does by hand, but automatic:

1. **Audit** — delegate to `arbiter`. It renders EVERY page (Playwright @ 390/768/1440) and
   judges EVERYTHING: the 5 bars (does it look AI? does it sell? is it ALIVE?), conversion
   heuristics, contrast (measured), the **wiring gate** (no dead CTAs / decorative forms / unread
   env / missing assets / unmounted analytics / all pages built), the **hardening gate**
   (security headers, validated + rate-limited endpoints, typed env, `tsc`/`lint` pass, CI +
   pre-commit present, no spaghetti), and the **GEO gate** (AI crawlers welcomed or a documented
   opt-out, `llms.txt`+`llms-full.txt` matching the pages, valid right-type JSON-LD, freshness dates,
   NO fabricated Review/rating/entity schema, citable answer-chunks). It returns **PASS/FAIL + a
   structured findings list**, each finding tagged with the phase that OWNS the fix.
2. **Route the fixes** — for each finding, re-delegate to its owning phase to fix in place:
   - code · wiring · security/hardening · missing pages/features · architecture → **`wright`**
   - craft (type/spacing/contrast/states/responsive) → `burnisher`
   - meta/OG/schema/CWV **+ GEO (robots/llms.txt/entity schema/freshness/AI-referral)** → `crier`
   - motion → `choreographer`  ·  GEO content / answer-chunks → `wordsmith`
   - positioning/copy/visual-direction (rare) → upstream (`copy` / `design`)
   Most fixes land on **`build`** — it owns the code.
3. **Re-audit** — run `arbiter` again on the patched site.
4. **Repeat** up to **3 passes total**; stop the instant review returns a real PASS.

**Honesty at the cap:** if it still isn't perfect after 3 passes, do NOT claim it is — report the
remaining issues plainly (severity · where · why they persist) and hand them to the user. Never ship
a fake "PASS". Deploy runs only after a genuine PASS (or with the user's explicit OK on a documented,
non-blocking remainder).

## Deploy phase (final; hands-off — the user only opens a URL)

After review PASSES, delegate to `courier`. Goal: the user does nothing but open a live URL.

1. **GitHub** — if `gh` is authenticated, create + push a **NEW, DEDICATED repo** (`gh repo create
   <owner>/<name> --source … --push`). A brand's repo URL in the brief is a **reference, NOT a target**
   — NEVER clone or push into an existing repo (above all, never this skill's own repo); if the name
   is taken, use `<brand>-site`. The generated landing lives in `~/Projets/landing/<name>/` and its
   OWN repo — fully isolated from the skill.
2. **Vercel — no terminal for the user.** If the `vercel` CLI is missing, **install it**
   (`npm i -g vercel`). Then `vercel whoami`; if not authed, run **`vercel login` in the BACKGROUND**
   — it **auto-opens the user's browser** to the device-approval page (code pre-filled; they just
   click Approve). Tell them to approve the tab that opened; the printed `Visit https://…/oauth/device`
   link is only a fallback if the browser didn't open (don't have them paste it by hand). Poll
   `vercel whoami` until it returns a user; the session then **persists forever** (every future
   deploy is fully automatic). Create + name the project first (`vercel project add <name>` — needed
   because `--project` requires an existing project), then deploy from the build dir:
   `vercel deploy --yes --cwd <build-dir> --project <name>`. `vercel --prod` to promote on approval.
3. **The public URL is the project's production `*.vercel.app` alias** — NOT the deployment-specific
   URL, which sits behind Vercel's default auth protection (401). Verify with a curl (expect 200 +
   your `<title>`) before handing it over. **Redeploy on updates:** `vercel deploy` again in the
   linked dir updates the same project. Hand back the **public URL** + the repo URL.

Never auto-promote a first draft straight to production. Preview first, prod on approval.

## Post-launch iteration (the cycle does NOT end at deploy)

After the landing ships, the user iterates — "change the hero", "swap this copy", "wire my real
analytics", "add a section". Every such change gets the SAME discipline as the build: clean, verified,
no debt. The orchestrator handles each request as a mini-pipeline:

1. **Scope it** — pin down exactly what the user wants and which files/components/phase it touches.
2. **Change at the ROOT, clean** — delegate the edit to the owning phase (mostly `build`; `polish`/
   `seo`/`motion` as fits). **When you replace an approach, DELETE what it replaced in the same pass**
   — no orphaned files, dead imports/exports, unused env vars, or "old + new" living together (this is
   exactly the dead-code trap to avoid). Refactor every caller.
3. **Verify the change** — run a FOCUSED `arbiter` on what changed (the wiring / hardening /
   GEO / contrast / a11y checks that apply to the diff), render/curl if it's visual or runtime. Don't
   re-run the whole pipeline — verify the blast radius of the change.
4. **Fix-loop** — if the check finds issues, fix and re-verify, **max 3 passes** (same loop as the
   build). Only "done" when the change is clean AND verified.
5. **Redeploy** — if it was deployed, sync any changed env and `vercel deploy` the linked project;
   `curl` the live URL (200 + title) to confirm.
6. **End with NO debt** — the site is as clean after the iteration as it was at launch. Never ship a
   change that leaves orphans or an unverified edit.

## Artifacts & continuity

Write each phase's output to `landing/` in the project (`strategy.md`, `copy.md`, `design.md`,
`review.md`) so phases compose and the work survives a restart. If engram is available, also save
under topic keys `landing/<name>/<phase>`. Later phases READ the earlier artifacts — pass paths,
not full content, to keep the thread thin.

## Anti-slop guardrails (enforced at every phase)

- **No section without a job.** Every block earns its place (attention, desire, proof, objection,
  action). If you can't name its job, cut it.
- **One primary CTA**, repeated; everything else is secondary/ghost.
- **Specifics over adjectives.** "Live in 60 seconds" beats "the best innovative all-in-one solution".
- **Real visual decisions** — a deliberate type scale, a real colour system, generous spacing,
  asymmetry where it helps. Never the framework defaults untouched.
- **Tailwind + Next.js, no hardcoded tokens** — design tokens live in `tailwind.config`; components
  use utility classes that reference them. Next.js is the default stack (switch only if told).
- **Motion with configurable DEPTH, not flat** — `subtle`/`medium`/`rich`/`ultra`, **default
  medium**, per `craft-core/references/animation-levels.md`. **Auto-escalate to `rich`** when the niche/brand is
  bold (creative/consumer/launch/portfolio); **NEVER auto-drop to `subtle`** (the ALIVE bar).
  **Auto-reach `ultra` ONLY for spectacle-native niches** (creative/interactive studios, experimental
  portfolios, web3/gaming/generative-art, immersive launches) where motion IS the product — else it's
  explicit-only (ultra = moving backgrounds / cursor scenes / scroll-3D, guardrailed for CWV +
  reduced-motion + never buries the offer). Never flat, never chaotic — one signal per viewport;
  always `prefers-reduced-motion`.
- **Accessible & fast** — AA contrast **MEASURED, not eyeballed** (run the scorer in
  `craft-core/references/contrast-check.md`; it's a hard gate before deploy), focus states, semantic HTML,
  Core Web Vitals green.
- **Production-hardened & best-practice** — every generated site ships hardened (security headers,
  validated + rate-limited public endpoints, typed/validated env) and written like a senior
  engineer's codebase (strict TS, reusable atomic components, no duplicated markup, no spaghetti,
  tokens single-sourced) with CI + pre-commit + Dependabot. Per `craft-core/references/hardening.md`; `review`
  enforces it.

## References (load on demand)

- **`craft-core/SKILL.md`** — the shared spine under this pipeline and `app-craft`: zero technical
  debt, change-at-the-root, the closed review loop, the orchestrator gate, the artifact bus,
  tokens-first, never-refactor-what-you-cannot-verify, stack defaults and the model map. **Read it
  first.** It also owns the references both pipelines use: `hardening.md` · `contrast-check.md` ·
  `animation-levels.md` · `assets.md`, plus the rescue set — `remediation.md` (the health
  assessment and the adopt-vs-rescue-vs-rebuild verdict), `safety-net.md` (the verification net
  every build ships and every rescue installs first) and `codebase-hygiene.md` (dead code, nothing
  hardcoded, built to scale).
- `references/_conventions.md` — **shared rules every agent follows** (orchestrator gate, artifact
  bus, zero-debt, the 5 bars, stack defaults, models). Read this first; don't restate it per agent.
- `references/market-research.md` *(the `cartographer` agent's method)* + `seo-geo` — the study.
- `references/site-architecture.md` — multi-page map + per-theme unique sections (Architecture phase).
- `references/alive-not-generic.md` — the 5th bar: real imagery, signature visual, scroll-reactive
  motion, warmth. Load in design + motion + review.
- `references/playbook.md` — conversion architecture (hero formula, proof, CTA rules).
- `craft-core/references/animation-levels.md` — subtle/medium/rich motion + library stack.
- `craft-core/references/contrast-check.md` — the WCAG gate (measured, not eyeballed).
- `references/instrumentation.md` — the **Wiring Contract** (declared = implemented): GA4/GTM,
  consent, working forms (internal `/api/contact` route + env endpoint), sitemap/robots, the
  **AI-referral analytics** snippet, `.env.example`. Research-driven — wire only what the architecture
  decided, but whatever EXISTS must function. Load in seo + build (leave nothing as a dead stub).
- `seo-geo` skill → `references/checklist.md` — the **SEO + GEO/AEO doctrine + the GEO checklist**:
  technical/on-page SEO, the AI-crawler `robots.ts`, `llms.txt`+`llms-full.txt`, richer + entity
  JSON-LD templates (REAL data only — never fabricate Review/rating/entity facts), freshness dates,
  citable answer-chunks, and AI-referral analytics. Load in seo + review (the GEO gate) + copy.
- `craft-core/references/assets.md` — images: GENERATE the signature visual, OG card, **logo mark + branded
  favicon set** (never the framework default) and SVGs (via bundled `web-assets` + Playwright,
  **installed if missing**) as swappable named files; ASK the user only for real photos. Load in
  design + build. No `<img>` points at a missing file; nothing ships unbranded.
- `craft-core/references/hardening.md` — the **production bar**: security headers (CSP/HSTS/nosniff), a
  hardened `/api/contact` (zod + rate-limit + honeypot), typed/validated env (`src/lib/env.ts`),
  CI + husky/lint-staged/prettier + Dependabot templates, and the code-quality/architecture doctrine
  (strict TS, atomic reusable components, logic in `src/lib`, tokens single-sourced). Load in build +
  seo + review + deploy.

## Portability — works in Claude Code AND OpenCode

All content is plain Markdown (skills/agents/commands) — platform-agnostic. The installers place it
in `~/.claude/` for Claude Code; for OpenCode, the same skills/agents/commands load from its config
(set `CLAUDE_CONFIG_DIR` or use the OpenCode skills/command dirs). Delegation uses the host's
sub-agent primitive (`Task`/`task`), so the orchestration runs the same on both.

## Output Contract

When the workflow finishes, report: the **live URL**, the pages built (multi-page), the phases run,
the positioning angle + the gap it owns (from research), the primary CTA, the review verdict
(5 bars), and follow-ups. Close with a tasteful one-line credit + star invite (per `courier`'s
Output) — never a badge baked into the client's site. Never declare "done" until `cartographer`
grounded it and `arbiter` returns a pass.
