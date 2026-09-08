# States & edges — the bar that catches AI-built apps (load in states + build + review)

**Only-the-happy-path is THE tell.** Bigger than any colour choice, any font, any radius. An app
built by people who use it has empty states, error states and permission states because those
people HIT them. An app assembled from a prompt has one state: the one with perfect data.

This is a **hard review gate**. A screen without its states is unfinished, not "MVP".

---

## 1. The state matrix — every screen × every state

For every screen in the inventory, decide and BUILD each of these. Put the completed matrix in
`app/screens.md`; `magistrate` checks it against the code.

| State | When | What it must do |
|---|---|---|
| **Loading (first)** | No data yet, nothing cached | **Skeleton in the real layout's shape** — not a centered spinner. The user should see where things will be. |
| **Loading (refetch)** | Data on screen, refreshing | Keep the data visible; a subtle inline indicator. **Never blank the screen you already earned.** |
| **Empty · first-run** | Zero records ever | Explain what this screen is for + **the one action** that fills it. This is the most-read screen in a new account. |
| **Empty · no results** | A search/filter matched nothing | **A different screen.** Show the active query, offer "clear filters", suggest a broadening. Never the first-run copy — it's confusing and slightly insulting. |
| **Partial** | Some data, some failed | Show what you have; mark what failed **where it failed**, with a scoped retry. Never discard good data because one widget errored. |
| **Error · fetch** | The read failed | What happened, in the user's terms + **Retry**. Never a raw status code as the whole message. |
| **Error · mutation** | The write failed | Keep the user's input. Say what to change. Never lose typed work — that is unforgivable. |
| **Error · validation** | Bad input | Inline, next to the field, on blur/submit — not a toast. First invalid field gets focus. |
| **Permission denied** | Role/plan lacks access | Per your denial rule (`ia-and-flows.md`): hidden, disabled + reason, or explained. Never a broken shell or a silent no-op. |
| **Offline** | No connection | Persistent shell banner; disable writes with an explanation; queue or block deliberately — decide, don't leave it ambiguous. |
| **Overflow** | Far more data than designed for | Virtualize, paginate, or cap with an honest "showing 200 of 12.480". Never render 10.000 DOM rows. |
| **Stale** | Data changed elsewhere | "Updated 2m ago · Refresh", or live-update. Silently showing old data is how users make wrong decisions. |
| **Success** | The action worked | Visible confirmation **where the user is looking** + the changed state reflected. With Undo if reversible. |

**Reachability rule:** if you cannot reach a state in the browser in under five seconds, that state
does not really exist. Wire the mock scenarios from `data-contract.md` (`?mock=empty|filtered-empty|
error|slow|huge`) so every state is one URL away — for you now, and for whoever maintains it later.

---

## 2. Loading: skeletons in the shape of the truth

- **Skeletons mirror the real layout** — same row heights, same column widths, same card grid. A
  generic pulsing rectangle tells the user nothing and causes layout shift when the real thing
  lands.
- **The shell never blanks.** Nav, page header and breadcrumbs render immediately; only the content
  region loads. The shell is the user's anchor.
- **Under ~200ms, show nothing.** A skeleton that flashes is worse than no skeleton — it reads as a
  glitch. Delay the skeleton's appearance rather than flickering.
- **Optimistic where it's safe** (toggles, reorder, marking read, adding to a list): show the result
  instantly, reconcile quietly, and roll back **with an explanation** if the server disagrees.
- **Never optimistic for money, deletion, or anything irreversible.** Those wait for the server and
  say so.
- Streaming/RSC: use `loading.tsx` and `<Suspense>` boundaries **per region**, so a slow widget
  doesn't hold the whole page. One boundary around everything defeats the purpose.

---

## 3. Empty states: the most under-built screen in software

A first-run empty state is the screen a new user reads most carefully in their entire life with
your product. Treat it as a designed destination, not a fallback.

```
[ a shape that isn't a shrug illustration — a diagram of what goes here,
  a preview of the real thing, or nothing but strong type ]

  Todavía no hay facturas
  Cuando emitas una factura va a aparecer acá, con su estado y su vencimiento.

  [ Crear factura ]    Importar desde CSV
```

- **Title = the state, in the domain's noun.** "Todavía no hay facturas" — not "No data available".
- **One sentence that teaches** what belongs here and why it matters.
- **One primary action** that fills the void, plus at most one alternate path (import, invite,
  sample data).
- **A different empty state per cause.** First-run ≠ no-results ≠ permission-denied ≠ error. Same
  blank region, four different screens.
- **No-results specifically** must echo the query ("Sin resultados para «acme»") and offer
  `Clear filters` — the user's most likely next action is undoing their own filter.
- Skip the generic shrug illustration. A faint structural preview of the real content, or confident
  typography, both beat clip-art.
- **Bonus that reads as craft:** offer to load sample data in an empty workspace, so a new user can
  see the product working before they've done any work.

---

## 4. Errors: say what happened and what to do next

Every error message answers two questions. If it answers only the first, it's a complaint.

| ✗ Never | ✓ Instead |
|---|---|
| "Oops! Something went wrong 😅" | "No pudimos cargar las facturas." + **Reintentar** |
| "Error 500" | "El servidor no respondió. Reintentá en unos segundos." (log the code) |
| "Invalid input" | "El email ya está en uso. Probá con otro o iniciá sesión." |
| A toast for a form error | Inline, under the field, with focus moved to it |
| Losing the user's typed data | Keep every character; re-render the form with the error |
| A stack trace or an internal id | A human sentence; the id goes to the console/log |

**Map `error.kind` → UI** (the union from `data-contract.md`), consistently across the whole app:

| `kind` | UI |
|---|---|
| `not_found` | The screen's not-found state + a way back to the list |
| `forbidden` | The permission state (per the denial rule) — never a generic error |
| `validation` | Inline field errors, focus the first invalid field |
| `conflict` | Explain what changed + offer reload/merge. This is not a generic failure |
| `rate_limited` | "Demasiados intentos. Probá de nuevo en X." — with the real wait if known |
| `network` | Retry + the offline banner if the connection is down |
| `server` / `unknown` | Human message + Retry + a quiet "report" path |

**Errors are scoped to the smallest region that failed.** One failing widget shows its own error
inside its card; it does not blank the page. Route-level `error.tsx` is the last resort, not the
first line of defense.

**Destructive actions:** confirm only when it's genuinely irreversible, and make the confirmation
*specific* — name the thing being deleted and its consequence ("Se van a eliminar 3 facturas y sus
adjuntos"), require typing the name for the truly dangerous, and default focus to Cancel. For
anything reversible, **prefer Undo over a confirmation dialog** — it's faster for the 99% and safer
for the 1%.

---

## 5. The stress tests (bar 5 — run them, don't imagine them)

Run every one of these against every screen before sign-off:

| Test | Passes when |
|---|---|
| **Long content** | A 60-character name, a 200-character description, a 40-char email: truncates with a tooltip; nothing overflows, wraps into the next column, or pushes the layout |
| **Short content** | A 1-character name, empty optionals: no collapsed rows, no orphaned labels, no jumping alignment |
| **Null everywhere** | Every nullable field null: renders "—", never "null", "undefined", "Invalid Date", or a crash |
| **Zero rows** | The right empty state (first-run vs. filtered) |
| **10.000 rows** | Virtualized or paginated; scroll stays at 60fps; sort/filter don't freeze the tab |
| **Every enum** | Each status/badge/variant has a designed appearance — including the rare one |
| **Slow network** | Skeletons appear, nothing double-submits, the UI never lies about being done |
| **Failure mid-flow** | Input preserved, clear recovery, no orphaned half-created record |
| **320px** | Nothing overflows horizontally; the primary action is reachable |
| **Dark mode** | Every screen, every state, measured AA — including badges, charts and disabled controls |
| **Zoom 200%** | Layout reflows, nothing is clipped or unreachable (WCAG 1.4.10) |
| **Keyboard only** | The whole primary flow is completable; focus is always visible and never trapped |
| **Long language** | German/Spanish labels run ~30–40% longer than English: buttons and nav still hold |
| **Double-click submit** | Exactly one record created. Buttons disable on pending, mutations are idempotent |
| **Back button mid-flow** | Sane state, no zombie modal, no lost work |
| **Deep link cold** | Opening a detail URL directly works — no dependency on state from the previous screen |

---

## 6. Microcopy rules (apply the `brand-voice` skill's anti-slop discipline)

- **The domain's nouns, always.** "facturas", not "items"; "equipo", not "entities".
- **Buttons are verbs and say what happens**: "Crear factura", not "Enviar"/"OK"/"Continuar".
- **No blame, no cutesy.** Not "Oops!", not "You forgot to…". State the fact, offer the fix.
- **Numbers get units and context**: "3 de 12 pagadas", not "3".
- **Relative time for recency, absolute on hover** ("hace 5 min" / `2026-08-11 14:03`). Always show
  the absolute somewhere for anything auditable.
- **Confirmations state the consequence**, not the mechanism.
- **One voice across the app** — the same tone in an error, an empty state and a tooltip.

---

## The states gate (what `magistrate` verifies — hard FAIL on any miss)

1. Every screen has: loading skeleton · first-run empty · no-results empty · error + retry.
2. Every route has `loading.tsx`, `error.tsx`, and `not-found.tsx` where applicable.
3. Every `error.kind` in the contract renders somewhere.
4. Every mock scenario (`empty` / `filtered-empty` / `error` / `slow` / `huge`) renders correctly.
5. No screen loses user input on failure.
6. Every destructive action is confirmed or undoable.
7. The stress tests in §5 pass — **measured, at 320px and 1440px, in light and dark.**
8. No "No data", "Oops", raw status codes, `null`, `undefined`, or `Invalid Date` anywhere in the
   rendered output.
