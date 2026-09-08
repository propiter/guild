# The safety net — how to make an untested codebase safe to refactor (load in audit + remediate + build)

You are about to delete files, collapse components and move logic in a codebase with no tests. Any
one of those can silently break the product. **Before improving anything, build the net that tells
you when you broke something.** Refactoring what you cannot verify is gambling with someone else's
product.

The net is six layers, cheapest first. Each one catches a class of breakage the one before it
can't see. You do not need all six for every project — you need enough to cover what you're about
to touch.

---

## Layer 1 — The compiler (the free test suite)

Turn strict TypeScript ON before anything else:

```jsonc
// tsconfig.json
{ "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
}}
```

It will produce a large error list. **That list is not noise — it is the bug backlog**, ranked for
free. `noUncheckedIndexedAccess` alone surfaces the `arr[i]` that is `undefined` at runtime, which
is the single most common crash in generated code.

`tsc --noEmit` must reach zero before the rescue is done, and must **stay** at zero between waves.
Once it's green, it is the fastest breakage detector you have: rename a contract field and the
compiler hands you the exact list of call sites to fix.

If the project is JavaScript, add `checkJs` + JSDoc types incrementally, or accept that layers 4–5
carry more weight. Say which, don't pretend.

## Layer 2 — Lint

`eslint` with the framework's config, plus rules that catch what a rescue creates:
unused imports/vars, `no-explicit-any`, exhaustive-deps, and import cycles
(`import/no-cycle`). Must be green between waves.

## Layer 3 — The build

`next build` (or equivalent) must pass. It catches what `tsc` and lint don't: bad imports across
server/client boundaries, missing modules, invalid route exports, and a broken static build.
Record the **bundle size per route** at baseline — wave 7 needs the comparison, and an accidental
regression is otherwise invisible.

## Layer 4 — Route smoke tests (the cheapest real safety)

This is the highest value-per-minute layer in a rescue. Every route, rendered, asserted:

```ts
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test'

// Keep this list generated from the router if you can; a stale list is a blind spot.
const ROUTES = ['/', '/invoices', '/invoices/inv_1', '/settings', '/settings/team']

for (const route of ROUTES) {
  test(`smoke ${route}`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', m => m.type() === 'error' && errors.push(m.text()))
    page.on('pageerror', e => errors.push(e.message))

    const res = await page.goto(route, { waitUntil: 'networkidle' })
    expect(res?.status(), 'HTTP status').toBeLessThan(400)

    // The page rendered something real — not an error boundary, not a blank shell.
    await expect(page.locator('main')).toBeVisible()

    // Generated apps leak these constantly; a rescue must never reintroduce them.
    const body = await page.locator('body').innerText()
    for (const leak of ['undefined', 'NaN', 'Invalid Date', '[object Object]']) {
      expect(body, `rendered "${leak}"`).not.toContain(leak)
    }

    expect(errors, 'console errors').toEqual([])
  })
}
```

Thirty lines, and it catches the great majority of "the refactor broke a page" — including the
ones a human reviewer scrolls past.

## Layer 5 — Visual baselines (how "it still looks right" gets MEASURED)

Screenshot every page × viewport × theme, commit the images, and diff after every wave. This is
what turns *"it looks fine"* from a claim into evidence.

```ts
// e2e/visual.spec.ts
const VIEWPORTS = [{ w: 320, h: 800 }, { w: 768, h: 1024 }, { w: 1440, h: 900 }]

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    for (const theme of ['light', 'dark'] as const) {
      test(`visual ${route} ${vp.w} ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.w, height: vp.h })
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await page.goto(route, { waitUntil: 'networkidle' })
        await expect(page).toHaveScreenshot(`${route}-${vp.w}-${theme}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.01,
        })
      })
    }
  }
}
```

**Making them stable — do this or the baselines are useless:**
- **Freeze the data.** Point at the mock adapter with a fixed seed (`data-contract.md`). Live or
  random data makes every run a false positive, and a suite that cries wolf gets ignored.
- **Freeze time** — `page.clock.setFixedTime()` or a fixed date in the seed. "hace 5 minutos"
  changes every run.
- **Kill motion** — `reducedMotion: 'reduce'`, and wait for the network to settle.
- **Mask the genuinely dynamic** (a live chart, an avatar from a remote URL) with Playwright's
  `mask` option rather than lowering the threshold for the whole page.

**The rule:** during waves 1–5 the visual diff must be **zero** — those waves change structure,
not appearance. A diff there is a regression you just caught. Wave 6 changes appearance on
purpose: review each diff by eye, accept it deliberately, re-record the baselines, and **say in
the report that you did**. Never let an intended change hide an unintended one.

## Layer 6 — Characterization tests (only where logic moves)

When you extract non-trivial logic out of a component (pricing, permissions, sorting, date math),
write a test that pins its CURRENT behaviour **before** you move it — including the behaviour you
think is wrong.

```ts
// Pin what it does TODAY, bugs included. Then refactor. Then fix the bug as its own change,
// updating the test in the same commit so the fix is visible in review.
it('sorts amounts as strings (known bug — see audit #12)', () => {
  expect(sortByAmount(['1000', '9'])).toEqual(['1000', '9'])
})
```

That separation matters: a refactor that also changes behaviour is unreviewable, because nobody
can tell which diff was the move and which was the fix.

---

## For a NEW build: the net ships WITH the product

Everything above is written for rescuing inherited code, but **a product you just built needs the
same net** — and it is far cheaper to install on day one than to retrofit later. A greenfield app
that ships without one starts accumulating debt with its second change: nobody can tell whether an
edit broke a screen they weren't looking at.

So every app this workflow builds ships with the net **as part of the product**, not as a chore
someone does afterwards:

```
e2e/
  routes.ts            the route list — generated from the router, never hand-maintained
  smoke.spec.ts        every route: status, renders, no console errors, no leaked undefined/NaN
  visual.spec.ts       every route × 320/768/1440 × light/dark, against committed baselines
  __screenshots__/     the baselines, committed
playwright.config.ts   webServer starts the dev/prod server; seeded mock data; motion disabled
```

```jsonc
// package.json
{ "scripts": {
    "test:e2e":    "playwright test",
    "test:visual": "playwright test visual.spec.ts",
    "test:update": "playwright test --update-snapshots",   // deliberate, reviewed, never routine
    "verify":      "npm run lint && npm run typecheck && npm run build && npm run test:e2e"
}}
```

`npm run verify` is the single command that answers *"did I break anything?"* — for you now, for
the user later, and for CI. Add it to the CI workflow after the build step, and to the pre-commit
hook only if the suite is fast enough to stay there (smoke yes, full visual usually no).

**Proportionality.** Smoke + visual is the floor for every app, because it costs ~50 lines and
catches the majority of real regressions. Unit tests are for `lib` — the pure logic you extracted
out of JSX — and are worth writing where the logic has branches worth pinning (money, permissions,
dates, sorting). **Do not scaffold a test framework nobody asked for and write assertions with no
judgment behind them**; a suite of tests that assert nothing is worse than none, because it buys
false confidence.

**A landing needs a smaller version of this** — smoke over every page plus the visual baselines.
It has no data layer to characterize, so layers 1–5 are the whole net.

## The workflow

```
baseline:  tsc ✓  lint ✓  build ✓  smoke ✓  visual: record
   ↓
wave N:    change
   ↓
verify:    tsc ✓  lint ✓  build ✓  smoke ✓  visual: 0 diff (or reviewed + re-recorded)
   ↓
commit the wave  →  next wave
```

If a check fails, **fix it before moving on.** Never carry a red gate into the next wave — you lose
the ability to attribute the breakage, and a rescue with an unattributable regression is worse than
no rescue.

## When you can't build the net

Be explicit, in the report:

- **No dev server / can't run the app** → layers 4 and 5 are impossible. Refactoring is then
  limited to what `tsc` and lint can verify — deletion of provably-unused code, type fixes,
  token extraction. **Do not restructure logic you cannot run.**
- **Data requires real credentials** → run against the mock adapter, and say the visual baseline
  covers mock states only.
- **Playwright unavailable** → install it (`npx playwright install chromium`). If the environment
  forbids it, say layer 5 is missing and reduce the refactor's ambition accordingly.

**An honest "I could not verify this area, so I left it alone" beats a confident refactor of code
you never saw run.**
