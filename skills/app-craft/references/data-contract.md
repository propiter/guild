# The data contract — the seam between the frontend and the backend (load in contract + build + review)

app-craft is the frontend half of a full-stack effort. The backend either **already exists**, or is
**being built in parallel** by another agent or dev, or **doesn't exist yet**. All three cases work
if — and only if — there is one explicit, typed **contract** between them.

> **The contract is the seam.** The frontend imports the contract, never a transport. The backend
> implements the contract, never a screen. Either side can be rebuilt internally without touching
> the other. That is what "los dos se complementan perfecto" means in code.

Without it you get the two classic failures: a beautiful UI wired to invented field names that
breaks the day the real API arrives, or a UI so coupled to `fetch` calls that changing the backend
means editing thirty components.

---

## 1. First: DERIVE or SPECIFY — decide which, and say so

Before writing a single type, find the source of truth. In order of authority:

| Source | Where to look | How to derive |
|---|---|---|
| **Drizzle schema** | `src/db/schema.ts`, `drizzle/schema.ts` | `InferSelectModel<typeof table>` / `InferInsertModel` — the table IS the type |
| **Prisma schema** | `prisma/schema.prisma` | the generated `@prisma/client` types; enums come from the schema |
| **tRPC router** | `src/server/api/root.ts`, `routers/*` | `inferRouterOutputs<AppRouter>` — end-to-end types, no duplication |
| **OpenAPI / Swagger** | `openapi.yaml`, `/api/docs`, `/swagger.json` | generate types (`openapi-typescript`); the doc is the contract |
| **GraphQL schema** | `schema.graphql`, introspection | codegen; operations are typed from the schema |
| **Supabase** | `supabase/migrations`, generated `database.types.ts` | `Database['public']['Tables']['x']['Row']` |
| **Next server actions** | `src/app/**/actions.ts` (`'use server'`) | the exported functions' signatures ARE the contract |
| **Plain REST routes** | `src/app/api/**/route.ts` | read the handlers; write zod schemas that match what they actually return |
| **Nothing** | — | **SPECIFY** (§5) and say plainly that it awaits a backend |

**The rule that never bends: if a source of truth exists, field names, types, nullability and enums
come FROM IT.** A frontend that writes `user.fullName` when the schema says `full_name` is a bug
you shipped on purpose. When you derive, say so in `app/contract.md`:
`Derived from: prisma/schema.prisma @ 2026-08-11`.

**Never re-declare what you can infer.** If the project has tRPC or generated Prisma/Supabase
types, import them — a hand-written duplicate is a second source of truth, which means it will
diverge. Your contract layer then *narrows and names* those types for the UI, it doesn't retype them.

---

## 2. The shape on disk

```
src/lib/data/
  contracts/
    common.ts          # Result, Paginated, ListQuery, AppError, Permission — shared vocabulary
    invoice.ts         # zod schema + inferred types + InvoiceRepository interface
    customer.ts
    index.ts           # re-exports
  adapters/
    mock/
      invoice.mock.ts  # hostile seed data (§4)
      customer.mock.ts
    http/
      invoice.http.ts  # the real backend (fetch / tRPC / server action / ORM)
      customer.http.ts
  index.ts             # ONE switch: which adapter set is live
```

The UI imports **only** from `@/lib/data` (the switch) and `@/lib/data/contracts` (the types).
Nothing else. That single import boundary is what makes the swap free.

### The shared vocabulary (`contracts/common.ts`)

Define these once; every entity reuses them. Inconsistent list/error shapes across entities is how
a codebase grows five different loading patterns.

```ts
import { z } from 'zod'

/** Every fallible read/write returns this — no thrown errors across the seam. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError }

/** The ONLY error shape the UI knows how to render. Map every backend error into it. */
export const AppErrorSchema = z.object({
  /** Drives which UI state renders — see states-and-edges.md */
  kind: z.enum(['not_found', 'forbidden', 'validation', 'conflict', 'rate_limited', 'network', 'server', 'unknown']),
  /** Safe to show a user. Never a stack trace, never an internal id. */
  message: z.string(),
  /** Field-level messages for forms: { email: ['Already in use'] } */
  fields: z.record(z.string(), z.array(z.string())).optional(),
})
export type AppError = z.infer<typeof AppErrorSchema>

/** One list-query shape for every collection. Cursor-based: offsets drift under writes. */
export const ListQuerySchema = z.object({
  search: z.string().optional(),
  filters: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
  sort: z.object({ field: z.string(), dir: z.enum(['asc', 'desc']) }).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
})
export type ListQuery = z.infer<typeof ListQuerySchema>

export type Paginated<T> = {
  items: T[]
  nextCursor: string | null
  /** null when the backend genuinely cannot count cheaply — the UI must handle that. */
  total: number | null
}
```

> **Why `Result` instead of throwing:** an error is a *rendered state*, not an exception. Returning
> it forces every call site to decide what the user sees, and makes "did we handle the error?" a
> compile-time question. `error.kind` maps 1:1 to the states in `states-and-edges.md`.

### An entity contract (`contracts/invoice.ts`)

```ts
import { z } from 'zod'
import type { ListQuery, Paginated, Result } from './common'

/** Runtime schema — validate at the boundary so bad data never reaches a component. */
export const InvoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  customerId: z.string(),
  customerName: z.string(),        // denormalized for the list view — see the note below
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'void']),
  /** Minor units (cents). Never a float for money. */
  amountCents: z.number().int(),
  currency: z.string().length(3),
  issuedAt: z.string().datetime(),
  dueAt: z.string().datetime(),
  paidAt: z.string().datetime().nullable(),   // nullable ≠ optional — the UI must render "—"
  notes: z.string().nullable(),
})
export type Invoice = z.infer<typeof InvoiceSchema>

export const InvoiceDraftSchema = InvoiceSchema.pick({
  customerId: true, amountCents: true, currency: true, dueAt: true, notes: true,
})
export type InvoiceDraft = z.infer<typeof InvoiceDraftSchema>

/** The interface BOTH adapters implement. This is the seam. */
export interface InvoiceRepository {
  list(query: ListQuery): Promise<Result<Paginated<Invoice>>>
  get(id: string): Promise<Result<Invoice>>
  create(draft: InvoiceDraft): Promise<Result<Invoice>>
  update(id: string, patch: Partial<InvoiceDraft>): Promise<Result<Invoice>>
  markPaid(id: string): Promise<Result<Invoice>>
  remove(id: string): Promise<Result<void>>
}
```

**Denormalize for the view, deliberately.** `customerName` on the list row exists so the table does
not fire N+1 lookups. Write down *why* in `app/contract.md` — it is a request TO the backend, not
an accident.

---

## 3. Next.js App Router: where each adapter actually runs

This is where naive repository advice falls apart. Be explicit:

- **Server Components / server actions / route handlers** call the repository **directly**. If the
  http adapter talks to an ORM or an internal service, it is server-only — mark the module
  `import 'server-only'` so importing it from a client component is a build error, not a leak.
- **Client Components never import a repository.** They receive data as props from a Server
  Component, or they call a **server action** that calls the repository. The action is the
  transport; the contract is still the type.
- **Mutations go through server actions** that return `Result<T>` — the same shape — so the form's
  error handling is identical whether the data is mocked or real.
- If the project uses a client-side data layer (TanStack Query, SWR), the query/mutation functions
  call the server actions and keep the `Result` shape. Do not let a raw `fetch` appear in a
  component.

```ts
// src/lib/data/index.ts — the ONE switch
import 'server-only'
import { env } from '@/lib/env'
import { invoiceMock } from './adapters/mock/invoice.mock'
import { invoiceHttp } from './adapters/http/invoice.http'
import type { InvoiceRepository } from './contracts/invoice'

const useMock = env.DATA_SOURCE === 'mock'

export const invoices: InvoiceRepository = useMock ? invoiceMock : invoiceHttp
```

One line decides the world. When the backend lands, flip `DATA_SOURCE` — **zero UI changes**,
because no component ever imported anything but `invoices` and `Invoice`.

---

## 4. Mock data is HOSTILE by design

Friendly seed data is how you ship an app that dies on contact with production. The mock adapter is
not a placeholder — it is **the test rig for bars 4 and 5** (complete, survives stress). It must be
able to produce, on demand:

- **10.000 rows** — so virtualization, pagination and sort are exercised for real.
- **Zero rows** — the first-run empty state.
- **Zero rows *after a filter*** — the no-results state, which is a DIFFERENT screen.
- **A 60-character name, an emoji, an RTL string, and a 3-character name** — layout stress.
- **`null` in every nullable field** — proves the UI renders "—" instead of "null" or crashing.
- **Every enum value**, including the rare one (`void`, `overdue`) — proves every badge exists.
- **A deliberate latency** (300–1500ms) — so skeletons are seen, not theoretical.
- **A forced error per `kind`** — so every error state is reachable in development.

Make the hostile cases *reachable*, not hypothetical:

```ts
// src/lib/data/adapters/mock/invoice.mock.ts
// Scenario switch: ?mock=empty | filtered-empty | error | slow | huge
// Wire it through a dev-only query param or env so EVERY state is one URL away.
// If a state cannot be reached in dev, it will not be built — and review will fail it.
```

> **Rule:** if you cannot reach a state in the browser in under five seconds, that state does not
> really exist. `steward` uses these scenarios; `magistrate` verifies they render.

---

## 5. When the backend does NOT exist yet — SPECIFY it

Write `app/contract.md` and hand it to whoever builds the backend. This is the artifact that makes
parallel work possible. It is a **published interface**: complete, unambiguous, and versioned.

```markdown
# Data contract — <app name>
Status: SPECIFIED (awaiting backend)   ·   Version: 1.2.0   ·   Updated: 2026-08-11
Frontend implements this against the mock adapter. Swap is one env var.

## Conventions
- Timestamps: ISO-8601 UTC strings. Money: integer minor units + ISO-4217 `currency`.
- IDs: opaque strings — the frontend never parses them.
- Lists: cursor pagination (`cursor`/`nextCursor`), `total` may be `null`.
- Errors: `{ kind, message, fields? }` with `kind` from the fixed union. HTTP status maps to `kind`.
- `nullable` means "present and may be null" (UI renders "—"). `optional` means "may be absent".

## Entity: Invoice
| Field | Type | Null? | Notes |
|---|---|---|---|
| id | string | no | opaque |
| number | string | no | unique, user-visible |
| customerName | string | no | **denormalized** — avoids N+1 in the list view |
| status | enum(draft,sent,paid,overdue,void) | no | `overdue` is DERIVED server-side from dueAt |
| amountCents | integer | no | minor units |
| paidAt | datetime | **yes** | null unless status=paid |

## Operations
| Op | Signature | Permission | Notes |
|---|---|---|---|
| list | `(ListQuery) → Paginated<Invoice>` | `invoice:read` | sortable: number, issuedAt, amountCents, status |
| markPaid | `(id) → Invoice` | `invoice:write` | idempotent; 409 `conflict` if already paid |

## Open questions for the backend
1. Is `overdue` computed server-side or must the client derive it from `dueAt`? (We assume server.)
2. Max page size? (We assume 200.)
```

**Assumptions are stated, never hidden.** Every assumption in that file is a question the backend
must answer — and `magistrate` reports unanswered ones as findings, not as done.

---

## 6. The contract gate — drift is checked, not assumed

A contract nobody verifies is a comment. `magistrate` runs this gate and FAILS on any of:

1. **Source drift** — re-read the source of truth (schema/router/OpenAPI). Every field the contract
   declares still exists, with the same type and nullability. A renamed or removed field = FAIL.
2. **Interface parity** — the mock and http adapters both satisfy the interface. Enforce it at
   compile time, not by reading:
   ```ts
   // Both files end with this. If either drifts, `tsc` fails — the cheapest possible gate.
   export const invoiceMock: InvoiceRepository = { /* … */ }
   ```
3. **No transport in the UI** — grep the component tree: no `fetch(`, no `axios`, no ORM import,
   no `process.env` outside `src/lib/env.ts`. Any hit = FAIL.
4. **Boundary validation** — the http adapter parses responses with the zod schema before returning
   (`safeParse`, mapping failure to `kind: 'server'`). Trusting an unvalidated response is how a
   backend change becomes a white screen.
5. **Every `error.kind` is rendered somewhere.** An unhandled kind is an unbuilt state.
6. **Open questions answered** — if `app/contract.md` still has unanswered questions, they are
   reported in the review output. Not a blocker, but never silently dropped.

---

## 7. Live data — when the contract pushes instead of pulling

Some apps need data that updates without a refetch: a shared board, presence, a job that finishes,
a notification. **This is still the same seam** — do not let a WebSocket become a second data layer
that bypasses the contract.

Extend the repository interface with a subscription that returns an unsubscribe function, and keep
the payload types identical to the ones `list`/`get` return:

```ts
export interface InvoiceRepository {
  list(query: ListQuery): Promise<Result<Paginated<Invoice>>>
  /** Optional. Absent adapter → the UI falls back to polling or manual refresh, and still works. */
  subscribe?(query: ListQuery, onChange: (e: ChangeEvent<Invoice>) => void): () => void
}

export type ChangeEvent<T> =
  | { type: 'created'; item: T }
  | { type: 'updated'; item: T }
  | { type: 'deleted'; id: string }
```

The rules that keep live data from becoming a bug factory:

- **The mock adapter implements it too** — emitting scripted changes on a timer. Otherwise the live
  path is only ever exercised against a real backend, which means it is never tested.
- **Degrade, don't break.** A transport that drops must fall back to polling or a manual refresh,
  and the UI must say the data is stale (`states-and-edges.md` — the *stale* state) rather than
  silently showing old numbers. Silently-stale data is worse than an error, because people act on it.
- **Reconcile, don't clobber.** A push that arrives while the user is editing must not overwrite
  their draft. Merge, or surface the conflict (`kind: 'conflict'`) and let them choose.
- **Never animate a live value's change with a count-up** (`app-motion.md`) — a brief highlight,
  then quiet. Something changing under the reader's eyes every few seconds is unusable.
- **Presence and cursors are ephemeral, not entities.** Keep them out of the persisted contract;
  they have their own short-lived shape and they never block a task if they fail.

## 8. When the backend changes (`/app-contract`)

1. Re-read the source of truth; diff it against `contracts/*`.
2. Update the contract types **first** — `tsc` now tells you exactly which views break. That is the
   contract earning its keep: the compiler becomes your impact analysis.
3. Patch the affected views (and their states — a new nullable field needs its "—", a new enum
   value needs its badge, a new column needs its overflow behaviour).
4. Update `app/contract.md`: bump the version, note additive vs. breaking, delete anything that no
   longer exists — **change at the root, no orphans.**
5. Focused `magistrate` on the blast radius.

**Never patch a view to paper over a contract change.** If the backend renamed a field, the fix
goes in the contract and the adapter — not a `?? item.old_name` in a component. That fallback is
exactly the debt that makes a codebase unmaintainable six months later.
