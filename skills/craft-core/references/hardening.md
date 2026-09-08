# Hardening — every generated site ships production-grade (security, validated endpoints, typed env, CI) AND best-practice code

A landing that converts but leaks, breaks under a malformed POST, or rots into spaghetti is NOT
done. This reference is the **production bar**: the security, validation, tooling and architecture
every generated site MUST satisfy. It composes with the **Wiring Contract**
(`instrumentation.md`) — that one says *what exists must FUNCTION*; this one says *what ships must be
SAFE and MAINTAINABLE*. Both are non-negotiable.

Everything here is research-proportionate: you only harden what the architecture decided to build.
No lead form → no `/api/contact` to validate. But the parts that DO exist ship hardened — and the
headers, typed env, strict TS, atomic components, CI and pre-commit apply to **every** site.

Paths use the `src/` App Router layout (`src/app`, `src/lib`, `src/components`). If a project is
not on `src/`, drop the prefix (`app/…`) — the rules are identical.

---

## 1. Security headers (`next.config.ts`)

Ship security headers for ALL routes via `async headers()`. The hard rule on CSP: **a broken CSP
must NEVER break the site.** Ship the report-only header first if you are unsure, watch the console
for violations, then promote to the enforcing header. The default below is tested-safe for a
Next.js app with GA/GTM + a form endpoint on Vercel.

```ts
// next.config.ts
import type { NextConfig } from 'next'

// Single source of truth for the origins the site legitimately talks to.
// Add the user's real form endpoint origin here if NEXT_PUBLIC_FORM_ENDPOINT is on another host.
const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT
let formOrigin = ''
try {
  if (FORM_ENDPOINT) formOrigin = new URL(FORM_ENDPOINT).origin
} catch {
  // invalid/placeholder endpoint → ignore; same-origin /api/contact still works
}

const analytics = 'https://www.googletagmanager.com https://www.google-analytics.com'

// 'unsafe-inline' for scripts/styles is the PRAGMATIC default: Next's inline hydration bootstrap
// and GA/GTM inject inline script, and Tailwind/Next emit inline <style>. A strict nonce-based CSP
// is stronger but requires wiring a per-request nonce into every inline tag (and GTM makes that
// brittle). Ship 'unsafe-inline' now; graduate to nonces only when the site is locked down.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${analytics}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${analytics} ${formOrigin}`.trim(),
  `frame-src 'self'`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self' ${formOrigin}`.trim(),
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join('; ')

const securityHeaders = [
  // Start with Report-Only if unsure, then switch the key to 'Content-Security-Policy'.
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
```

**CSP rollout, the safe way:** if you cannot test the enforcing CSP against every rendered page,
ship it as `Content-Security-Policy-Report-Only` FIRST (same value, different key). The browser
reports violations to the console without blocking anything — you watch GA/GTM and the form, confirm
zero violations, then flip the key to `Content-Security-Policy`. NEVER let a CSP you didn't test
ship as enforcing on a client's live site.

**Why each header:**
- `Strict-Transport-Security` — forces HTTPS, kills SSL-strip downgrade attacks. `preload` is
  optional but recommended for a fresh domain.
- `X-Content-Type-Options: nosniff` — stops MIME-sniffing (an uploaded/served file can't be
  reinterpreted as a script).
- `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'none'` — clickjacking defense (legacy + CSP).
- `Referrer-Policy: strict-origin-when-cross-origin` — don't leak full URLs/paths to third parties.
- `Permissions-Policy` — deny camera/mic/geolocation by default; a landing never needs them.

---

## 2. Hardened API route (`src/app/api/contact/route.ts`)

The contact/lead route from `instrumentation.md` is a PUBLIC, unauthenticated endpoint — treat it as
hostile input. Upgrade it with: **zod** body validation, a **body-size guard**, **rate-limiting**, the
**honeypot**, and **structured errors that never leak internals**.

```ts
// src/app/api/contact/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'

// 1) Schema — the ONLY shape we accept. Unknown keys are stripped, bad types rejected.
const ContactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email').max(160),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  // Honeypot: a hidden field real users never fill. Bots do. If present & non-empty → silent drop.
  company: z.string().max(0).optional(),
})

// 2) Body-size guard — reject oversized payloads before parsing (cheap DoS shield).
const MAX_BODY_BYTES = 32 * 1024 // 32 KB is generous for a contact form

// 3) Rate limit — lightweight in-memory token bucket per IP. Good for a single instance.
//    PRODUCTION UPGRADE: on serverless (Vercel), memory is per-instance and resets on cold start —
//    use Upstash Ratelimit + Vercel KV (or Redis) for a shared, durable limiter. See note below.
const RATE_LIMIT = 5 // requests
const WINDOW_MS = 60_000 // per minute
const buckets = new Map<string, { count: number; resetAt: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  if (b.count >= RATE_LIMIT) return true
  b.count += 1
  return false
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  // Rate limit FIRST — cheapest rejection.
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
  }

  // Body-size guard via Content-Length (and a hard cap when reading).
  const declaredLen = Number(req.headers.get('content-length') ?? 0)
  if (declaredLen > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Payload too large' }, { status: 413 })
  }

  // Parse defensively — malformed JSON must NOT 500.
  let raw: unknown
  try {
    const text = await req.text()
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: 'Payload too large' }, { status: 413 })
    }
    raw = JSON.parse(text)
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate — reject anything that doesn't match the schema.
  const parsed = ContactSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  // Honeypot tripped → pretend success so bots don't learn they were caught.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true })
  }

  const { company: _hp, ...payload } = parsed.data
  const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT

  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        // Log the real status server-side; return a generic message to the client.
        console.error('[contact] upstream failed', res.status)
        return NextResponse.json({ ok: false, error: 'Could not deliver message' }, { status: 502 })
      }
      return NextResponse.json({ ok: true })
    } catch (err) {
      console.error('[contact] upstream error', err)
      return NextResponse.json({ ok: false, error: 'Could not deliver message' }, { status: 502 })
    }
  }

  // No endpoint yet → test mode: accept and succeed so the form is never dead.
  return NextResponse.json({ ok: true, testMode: true })
}
```

**Why:** a public endpoint with no validation, no rate limit, and leaky errors is the single most
common production hole in a "looks finished" site. zod gives you a typed, trusted payload; the
size + rate guards blunt abuse; the structured error never tells an attacker *why* it failed.

**Serverless production upgrade (Upstash Ratelimit + Vercel KV):** the in-memory bucket resets on
every cold start and isn't shared across instances — fine for a single long-lived server, weak on
serverless. When the site sees real traffic, swap in a durable limiter:

```ts
// src/lib/rate-limit.ts  (optional production upgrade)
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

export const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  prefix: 'ratelimit:contact',
})
// In the route: const { success } = await ratelimit.limit(clientIp(req)); if (!success) → 429
```

Requires `@upstash/ratelimit` + `@vercel/kv` and a KV store provisioned in the Vercel dashboard.

---

## 3. Typed, validated env (`src/lib/env.ts`)

Validate every env var at startup with zod so **misconfig fails fast** (at build/boot, not as a
mystery `undefined` at runtime) and TS gets real types. Components and routes import from here —
**never `process.env` directly**. This composes with the Wiring Contract's "every var is read"
rule: `env.ts` is where they're read.

```ts
// src/lib/env.ts
import { z } from 'zod'

// NEXT_PUBLIC_* are inlined at build time and shipped to the browser — they are public by design.
// List ONLY the vars the architecture actually decided to use (unread var = debt). Mark optional
// the ones a site can run without (analytics, form endpoint) so a fresh clone boots in test mode.
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_GA_ID: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
  NEXT_PUBLIC_GTM_ID: z.string().regex(/^GTM-[A-Z0-9]+$/).optional(),
  NEXT_PUBLIC_FORM_ENDPOINT: z.string().url().optional(),
})

// process.env keys must be referenced statically so Next can inline NEXT_PUBLIC_* — do NOT loop.
const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_FORM_ENDPOINT: process.env.NEXT_PUBLIC_FORM_ENDPOINT,
})

if (!parsed.success) {
  // Fail LOUD and early — a typo'd env var should never become a silent runtime bug.
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
```

Usage everywhere else:

```ts
import { env } from '@/lib/env'

if (env.NEXT_PUBLIC_GA_ID) { /* mount GA */ }
const canonical = env.NEXT_PUBLIC_SITE_URL
```

**Why:** `process.env.X` is `string | undefined` and silently wrong when misspelled or unset.
`env.ts` makes the contract explicit, typed, and self-documenting — the same list the README and
`.env.example` describe. If the architecture added server-only vars, add a separate `serverSchema`
(no `NEXT_PUBLIC_` prefix) parsed the same way and import it ONLY from server code.

---

## 4. Generated-repo CI (TEMPLATE → write into the project at `.github/workflows/ci.yml`)

> This is a TEMPLATE the build phase writes INTO the GENERATED project. It does NOT belong in the
> landing-craft skill repo.

CI catches what local "looks fine" misses. On push + PR: install, lint, typecheck, build. Detect the
package manager from the lockfile (`pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, else npm) and emit
the matching commands.

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm # → 'pnpm' or 'yarn' if that lockfile is present
      - run: npm ci # → 'pnpm install --frozen-lockfile' / 'yarn install --frozen-lockfile'
      - run: npm run lint
      - run: npm run typecheck # tsc --noEmit
      - run: npm run build

      # Only when the project ships the verification net (see safety-net.md). An app always
      # should; a landing ships the smoke half. Omit these two steps entirely if there is no
      # e2e/ directory — a CI step that runs nothing is noise, and one that fails on a missing
      # script is worse.
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

If you scaffold with pnpm, also add `pnpm/action-setup@v4` before `setup-node`. Keep the four gates
(install → lint → typecheck → build) regardless of manager, plus `test:e2e` wherever the net exists.

**Commit the visual baselines**, and regenerate them only through a deliberate, reviewed
`test:update` — never as a reflex when CI goes red. A baseline updated to make a failure disappear
is a regression you signed off on.

---

## 5. Pre-commit (TEMPLATES → husky + lint-staged + prettier)

Catch issues before they're even committed. husky runs lint-staged on staged files; lint-staged runs
`eslint --fix` + `prettier --write`, and a project-wide `tsc --noEmit`.

`package.json` scripts (merge into the generated project's `package.json`):

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx,json,css,md}": ["prettier --write"]
  }
}
```

`.husky/pre-commit`:

```sh
npx lint-staged
npm run typecheck
```

`.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Install once: `npm i -D husky lint-staged prettier prettier-plugin-tailwindcss` then `npx husky init`
(creates `.husky/` and the `prepare` script). `prettier-plugin-tailwindcss` auto-sorts Tailwind
classes — consistent class order across the whole codebase for free.

**Why:** the same checks CI runs, run locally before the commit lands — fast feedback, and `main`
stays green. `tsc --noEmit` in pre-commit is the cheap insurance that a type error never reaches CI.

---

## 6. Dependabot (TEMPLATE → `.github/dependabot.yml`)

Weekly, grouped npm updates so the site doesn't rot and security patches land automatically.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: '/'
    schedule:
      interval: weekly
    groups:
      production-dependencies:
        dependency-type: production
      development-dependencies:
        dependency-type: development
  - package-ecosystem: github-actions
    directory: '/'
    schedule:
      interval: weekly
```

Grouping collapses many bumps into a couple of PRs — reviewable, not noise.

---

## 7. Performance budget (brief — optional but recommended)

Tie the "crafted/fast" bar to a measurable budget. Lighthouse-CI on PRs keeps Core Web Vitals from
silently regressing.

```json
// lighthouserc.json (optional)
{
  "ci": {
    "collect": { "url": ["http://localhost:3000/"], "startServerCommand": "npm run start" },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

Run via `@lhci/cli` (`lhci autorun`) in a CI job after `build`. Keep it a `warn` for CWV timings at
first so a flaky run never blocks a merge; make `performance`/`accessibility` scores hard errors.

---

## 8. Code quality & architecture (the heart of the bar — non-negotiable)

A site that's secure but spaghetti is debt the day after launch. Every generated site is written
like a senior engineer's codebase: strict types, atomic reusable components, logic out of JSX,
a scalable structure, zero duplication. Tie each rule to WHY.

### Strict TypeScript
- `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`. NO `any`. NO `@ts-ignore`
  without a one-line reason comment (`// @ts-expect-error <why>`).

```jsonc
// tsconfig.json (the parts that matter)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

  **Why:** the compiler is a free reviewer. `noUncheckedIndexedAccess` forces you to handle the
  `arr[i]` that might be `undefined` — the bug that ships otherwise. `any` deletes all of it.

### Reusable, atomic components — ZERO duplicated markup
- ONE `Button`, ONE `Header`, ONE `Footer`, ONE `Section`. Sections COMPOSE these primitives; they
  never re-implement a button or re-paste a nav.
- **Presentational vs container split:** presentational components take props and render (no data
  fetching, no business logic); container components fetch/derive data and pass it down.
- Small, focused components — one job each. If a component renders three unrelated things, split it.

  **Why:** when the brand colour or the CTA label changes, you edit ONE file, not fifteen. Duplicated
  markup is the bug factory — the day you fix the header on page 1 and forget pages 2–6.

### Logic in `src/lib` — never business logic inside JSX
- Pure, named functions and data modules live in `src/lib`: `*-data.ts` (the section content as
  typed data), `seo.ts` (metadata builders), `env.ts` (above), `utils.ts`.
- JSX renders; it does not compute. No inline data transforms, no business rules buried in a
  component body. Components map over typed data from `lib`.

  **Why:** logic in `lib` is testable, reusable, and readable. Logic tangled in JSX is none of those
  — it's the start of the spaghetti.

### Scalable structure
```
src/
  app/                  # routes only (page.tsx, layout.tsx, api/)
  components/
    ui/                 # atomic primitives: button.tsx, container.tsx, badge.tsx
    sections/           # composed sections: hero.tsx, pricing.tsx, faq.tsx
    motion/             # reveal.tsx, parallax.tsx (motion wrappers)
  lib/                  # env.ts, seo.ts, *-data.ts, utils.ts (pure logic + data)
```
- **Named exports** (no `export default` for components — better refactors and grep-ability).
- Consistent naming: kebab-case files (`hero-section.tsx`), PascalCase components (`HeroSection`).
- **One component per file.**

  **Why:** a newcomer (or you in three months) finds anything by category in seconds. Routes in
  `app`, primitives in `ui`, content in `lib`. Predictable beats clever.

### No spaghetti, no premature abstraction
- Reusable over clever. Extract a component the SECOND time you'd copy-paste it — not before
  (premature abstraction is its own debt), not the fifth time (that's already copy-paste rot).
- **Design tokens in `tailwind.config` — single source of truth.** NO hardcoded hex/px in JSX or
  CSS. Colour, type scale, spacing, radius are theme tokens; components use utilities that reference
  them.

  **Why:** one place to change the look, one place to read it. Hardcoded values scattered across
  files are unmaintainable by definition — and they're the #1 tell of an AI-generated site.

---

## The hardening gate (what `arbiter` verifies — research-proportionate)

A site fails review if any of these is missing for what it actually built:

- **Security headers present** — `curl -I <url>` shows `Content-Security-Policy` (or Report-Only),
  `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`. Missing = FAIL.
- **Public endpoints validated + rate-limited** — IF a `/api/contact` (or any public POST) exists, it
  uses zod validation and a rate limiter. An unvalidated public endpoint = FAIL.
- **Env typed & validated** — `src/lib/env.ts` exists and components import from it, not raw
  `process.env`. (Only the vars the architecture uses; an unread var is debt.)
- **Types & lint pass** — `tsc --noEmit` and `lint` both exit 0. No `any`/`@ts-ignore` without
  reason.
- **CI + pre-commit ship in the repo** — `.github/workflows/ci.yml`, husky + lint-staged,
  `.prettierrc`, `.github/dependabot.yml` exist.
- **Architecture** — reusable atomic components (one `Button`/`Header`/`Footer`/`Section`, no
  duplicated markup), logic in `src/lib`, tokens in `tailwind.config` (no hardcoded values).

The CSP must allow EXACTLY the analytics domains `crier` injected (GA/GTM) and the form
endpoint origin — coordinate so analytics and the form never break under the policy.
