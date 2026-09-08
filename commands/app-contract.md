---
description: Sync the backend contract — re-derive types from the real schema, report drift, patch the affected views and their states. Run it whenever the backend changes.
argument-hint: "[entidad o alcance, ej: 'invoices' — vacío = todo]"
---

Sync the frontend/backend contract: **$ARGUMENTS**

Load the `app-craft` skill and delegate to `envoy` (see
`app-craft/references/data-contract.md` §7). This is **Mode D — contract sync.**

1. **Re-read the source of truth** (`app/_init.md` names it: Drizzle/Prisma schema, tRPC router,
   OpenAPI, GraphQL, Supabase types, or the server actions) and **diff it** against
   `src/lib/data/contracts/*`.
2. **Update the contract types FIRST.** Then `tsc` tells you exactly which views break — that is
   the contract earning its keep: the compiler becomes your impact analysis.
3. **Patch the affected views AND their states** — a new nullable field needs its "—", a new enum
   value needs its badge, a new column needs its overflow behaviour, a removed field needs its call
   sites cleaned.
4. **Update `app/contract.md`** — bump the version, state **additive vs. breaking**, and delete
   anything that no longer exists. Change at the root; no orphans.
5. **Verify** — both adapters still satisfy the interface (`tsc` proves it), the http adapter still
   validates responses, every `error.kind` is still handled, no `fetch`/ORM/`process.env` leaked
   into a component.
6. **Focused review** on the blast radius.

**Never patch a view to paper over a contract change.** If the backend renamed a field, the fix
goes in the contract and the adapter — not a `?? item.old_name` fallback in a component.

Report: what changed (additive/breaking), the views patched, the states touched, and any open
question the backend still owes an answer to.
