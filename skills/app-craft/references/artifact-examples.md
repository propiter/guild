# Worked artifact examples (load when writing any `app/` artifact)

Every phase's artifact is described in prose in its own reference. This file shows what they
actually look like, **for one coherent product**, so you can see them fit together instead of
inferring the shape. Copy the SHAPE, never the content.

The product: **Facturia** — invoicing for small design studios. Two roles (owner, member), an
existing Next.js App Router monolith with a Drizzle schema and no design system worth the name.

> These are excerpts, trimmed to show structure and the level of specificity expected. A real
> artifact covers every screen, every entity, every finding. **Vague is the failure mode** — if a
> spec could describe two different screens, it isn't a spec.

---

## `app/_init.md` (excerpt)

```markdown
## Mode
**A · Adopt**, with a rescue recommendation. A Next.js 15 App Router project exists at `src/`.
Health triage tripped 3 of 7 signals → recommend `/app-audit` before building into it:
- `Button` implemented 4× — `components/Button.tsx`, `ui/btn.tsx`, inline in `app/invoices/page.tsx:88`, `app/settings/page.tsx:31`
- 61 hardcoded hex values across `src/app` and `src/components` (`grep -rcE '#[0-9a-fA-F]{6}'`)
- `tsc --noEmit` with strict ON: 143 errors; 27 `any`, 4 `@ts-ignore` without a reason

## Stack (evidence)
| What | Value | Evidence |
|---|---|---|
| Framework | Next.js 15.1, App Router, `src/` | `package.json:14`, `src/app/layout.tsx` |
| Styling | Tailwind v3 (`tailwind.config.ts`) — **do NOT introduce v4 `@theme`** | `tailwind.config.ts:1` |
| Tokens | none — raw Tailwind palette + inline hex | `src/app/globals.css` (12 lines, no vars) |
| Kit | none installed | no `components.json`, no Radix in deps |
| Dark mode | not implemented | no `dark:` classes, no theme provider |
| Package manager | pnpm | `pnpm-lock.yaml` |
| Auth | better-auth, session in `src/lib/auth.ts`; role on `user.role` ('owner' \| 'member') | `src/lib/auth.ts:22` |

## Backend contract source (authoritative)
**`src/db/schema.ts` (Drizzle).** Tables: `users`, `invoices`, `customers`, `lineItems`.
→ contracts DERIVE from it. Server actions in `src/app/invoices/actions.ts` are the transport.

## Project instructions that override defaults
`CLAUDE.md:8` — "never introduce a state management library". Respected: server state stays in RSC.

## Constraints for downstream phases
- Pages Router is NOT in use — App Router only. Do not migrate anything.
- Tailwind **v3**: extend `tailwind.config.ts`; CSS variables go in `globals.css`.
- No dark mode today → the system phase introduces it as a new capability, not a fix.
```

---

## `app/ia.md` (excerpt)

```markdown
## 1. Tasks ranked by FREQUENCY
| Frequency | Task | Placement |
|---|---|---|
| Daily | Check which invoices went overdue | ≤1 click — this is the home screen |
| Daily | Mark an invoice paid | row action + `⌘K` |
| Weekly | Create an invoice | primary action on the list |
| Monthly | Add/edit a customer | one level in |
| Rare | Billing, team, API keys | Settings |
| Destructive | Void an invoice | overflow menu + typed confirmation, never adjacent to "mark paid" |

**Home after login = `/invoices?status=overdue`**, not a dashboard. The job starts with "who owes me".

## 2. Navigation model
**Persistent sidebar**, 6 destinations. Reason: desktop-first daily tool, deep work in one list.
At 2× destinations (12+) it still holds with the existing groups; past that, introduce `⌘K` as the
primary path and demote the sidebar to the top 6. Single-tenant → **no workspace switcher** (dead
chrome).

## 3. Screen inventory
| Screen | Route | Job (a verb) | Archetype | Entities | Permission | Primary action |
|---|---|---|---|---|---|---|
| Invoices | `/invoices` | Find and act on an invoice | list/table | Invoice | `invoice:read` | New invoice |
| Invoice detail | `/invoices/[id]` | Understand and change one invoice | detail | Invoice, Customer | `invoice:read` | Mark paid |
| New invoice | `/invoices/new` | Issue an invoice | form | Invoice, Customer | `invoice:write` | Send |
| Customers | `/customers` | Find a customer | list/table | Customer | `customer:read` | Add customer |
| Settings · profile | `/settings` | Change my details | settings | User | — | Save |
| Settings · team | `/settings/team` | See and change who has access | settings | User | `team:manage` | Invite |
| Settings · billing | `/settings/billing` | Manage the subscription | billing | Subscription | `billing:manage` (owner) | Change plan |
| Login | `/login` | Get in | auth | — | public | Sign in |
| Accept invite | `/invite/[token]` | Join the studio | auth | — | public | Accept |
| 404 / 403 / 500 / offline | — | Recover | error | — | — | Back to invoices |

## 5. URL state (shareable views are the point)
`/invoices?status=overdue&q=acme&sort=dueAt:asc&cursor=…` — status, search, sort and cursor all live
in the URL. "Mandame esa vista" must be a link, not a screenshot.

## 6. Permission matrix
| Action | Owner | Member | Denial rule |
|---|---|---|---|
| Invoice · view / create | ✓ | ✓ | — |
| Invoice · void | ✓ | — | **disabled + reason on hover** ("Solo el dueño puede anular") |
| Billing · manage | ✓ | — | **hidden** — a member has no concept of the subscription |
| Team · invite | ✓ | — | disabled + reason |

The server enforces; the UI only communicates.

## 7. Flow — "cobrar una factura vencida"
entry:   `/invoices?status=overdue` (the home) · `⌘K` "overdue"
steps:   scan list → open detail → send reminder OR mark paid
states:  customer has no email (blocked — explain, offer to add it) · already paid elsewhere
         (409 conflict → reload, don't overwrite) · send fails (retry, reminder not lost)
success: row updates in place, status badge changes, toast with Undo
exit:    back to the list, filter preserved, the changed row briefly highlighted
```

---

## `app/system.md` (excerpt — the parts most often left vague)

```markdown
## Signature
`--shadow-signature: 0 1px 2px oklch(0.25 0.03 60 / 0.08), 0 8px 24px -12px oklch(0.25 0.03 60 / 0.18)`
A warm-tinted elevation on every raised surface. Nothing else in the app casts a shadow.
*This is the token the kit doesn't ship — if it's absent, review fails the fingerprint test.*

## Semantic tokens (light → dark)
| Token | Light | Dark | Note |
|---|---|---|---|
| `--surface` | `oklch(0.98 0.006 85)` | `oklch(0.17 0.008 85)` | warm bone, NOT slate |
| `--surface-raised` | `oklch(1 0 0)` | `oklch(0.21 0.008 85)` | raised = **lighter** in dark |
| `--border` | `oklch(0.90 0.008 85)` | `oklch(0.28 0.008 85)` | borders do the work shadows can't in dark |
| `--ink` | `oklch(0.22 0.014 70)` | `oklch(0.96 0.004 85)` | measured 14.8:1 / 15.1:1 on surface |
| `--ink-muted` | `oklch(0.52 0.012 70)` | `oklch(0.68 0.008 85)` | measured 5.1:1 / 5.4:1 — AA ✓ |
| `--accent` | `oklch(0.55 0.17 28)` | `oklch(0.68 0.15 28)` | lifted in dark or it goes muddy |

## Radius by role (position: precise, 3–4px — NOT the 8px default)
`--radius-control: 4px` · `--radius-surface: 6px` · `--radius-overlay: 10px` · `--radius-full: 9999px`

## Density
Invoices/customers tables → `compact` (row 32px). Forms, settings, detail → `default` (40px).
Login, invite, empty states → `comfortable` (52px). Touch targets stay ≥44px on coarse pointers.

## Component inventory — state matrix (excerpt)
| Component | default | hover | focus-visible | active | disabled | loading | error | selected |
|---|---|---|---|---|---|---|---|---|
| Button/primary | ✓ | ✓ | ring `--focus-ring` | ✓ | ✓ | spinner, **width fixed** | — | — |
| DataTable row | ✓ | surface-raised | ring inset | ✓ | — | skeleton row | — | left rule + weight (**not** a tinted pill) |
| Input | ✓ | — | ring | — | ✓ | — | border + icon + message | — |
```

---

## `app/screens.md` (excerpt — one screen, fully specified)

```markdown
### Invoices — `/invoices` — archetype: list/table — density: compact

**Job:** find an invoice and act on it. **Primary action:** New invoice (top-right of page header).

**Regions:** PageHeader (breadcrumb · "Facturas" · count · New invoice) → FilterBar (search ·
status chips · date range · saved views · column visibility) → DataTable → cursor pagination.
Selecting rows swaps the FilterBar for a BulkActionBar **in place** (no layout shift).

**Hierarchy:** `number` is the primary column (medium weight); `customerName` secondary;
`amountCents` right-aligned tabular; `status` a badge; `dueAt` relative with absolute on hover.
The eye lands on number → status → amount.

**Data:** `invoices.list(ListQuery)` → `Paginated<Invoice>`. Fields exactly as `contracts/invoice.ts`.

**URL state:** `?status=&q=&sort=&cursor=`. Sort is visible in the header and restored on reload.

**Permissions:** `void` in the row overflow — owner only; member sees it **disabled with the reason**.

**Responsive:** <768px the table becomes a stacked card list (number + status + amount + due);
the New invoice action moves to a sticky bottom bar. Never eight squeezed columns.

**States**
| State | What renders |
|---|---|
| Loading | Skeleton **in the table's shape** — 8 rows at 32px, real column widths. Nothing under 200ms |
| Empty · first-run | "Todavía no hay facturas" · "Cuando emitas una factura va a aparecer acá, con su estado y su vencimiento." · [Crear factura] · Importar desde CSV |
| Empty · no results | "Sin resultados para «acme»" · [Limpiar filtros] — **different screen**, echoes the query |
| Error · fetch | "No pudimos cargar las facturas." + [Reintentar]. Scoped to the table; header stays |
| Permission | Not reachable — `invoice:read` is granted to both roles |
| Overflow | Virtualized past 200 rows; footer reads "200 de 12.480" |
| Success | Row updates in place + toast with Undo |
```

---

## `app/audit.md` (excerpt — the rescue verdict)

```markdown
## Verdict: RESCUE (score 17/30 — salvageable)
| Dimension | Score | Evidence |
|---|---|---|
| Type safety | 3 | 143 `tsc` errors under strict; 27 `any`; 4 bare `@ts-ignore` |
| Duplication | 3 | `Button` ×4; the nav pasted into 5 page files (`jscpd`: 89% similarity) |
| Hardcoding | 3 | 61 hex, 214 px literals outside the theme; 1 API URL in `invoices/page.tsx:12` |
| Architecture | 2 | Currency formatting + sorting inside 3 components; no `lib/` |
| Dead weight | 2 | `knip`: 9 unused files, 23 unused exports, 4 unused deps |
| States | 3 | Zero empty states, zero error states across all 7 screens |
| Security | 1 | Headers absent; `/api/contact` validates nothing — **fixed immediately, not queued** |
| A11y | 2 | Table rows are `<div onClick>`; focus invisible; 6 contrast failures |
| Correctness | 2 | 3 bugs reproduced (below) |
| Craft | 2 | Uniform density; default favicon; no dark mode |

## Bugs REPRODUCED (not inferred)
1. **Amount sort is lexical** — `/invoices?sort=amount:asc` puts $1.000 before $9. `InvoiceTable.tsx:143`
   sorts the formatted string. → wave 5, fixed as its own commit.
2. **Due date off by one in UTC-3** — `new Date(dueAt).toLocaleDateString()` on a date-only string.
   Invoices due today show as yesterday before 03:00. `format.ts:8`.
3. **Double-submit creates two invoices** — no pending disable, no idempotency. `new/page.tsx:64`.

## Cannot be verified here
`/settings/billing` needs live Stripe credentials → **out of scope for refactoring**. Reported, not touched.

## Wave plan
| Wave | What | Blast radius | Risk | Verified by |
|---|---|---|---|---|
| 0 | Safety net + strict TS | repo | — | tsc/lint/build/smoke/visual recorded |
| 1 | Delete 9 files, 23 exports, 4 deps | 13 files | low | knip clean, smoke, visual 0 |
| 2 | Tokens (warm bone + accent), repoint 275 literals | 31 files | low | **visual diff must be 0** |
| 3 | One Button/Header/Table; delete 3 copies | 18 files | medium | visual 0, smoke |
| … | | | | |
```
