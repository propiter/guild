# IA & flows — the app's architecture (load in the IA phase)

A landing's structure comes from a persuasion narrative. An app's structure comes from **what
people do, in what order, how often, and with what permission.** Get this wrong and no amount of
polish saves it: users will hunt for things, and every screen you build afterwards inherits the
mistake.

This phase produces `app/ia.md`. Everything downstream — system, contract, screens, build — reads it.

## 1. Rank the tasks by FREQUENCY, not by importance

The most common IA failure is organizing navigation around the org chart, or around what the
founder finds interesting. Organize it around **what happens most.**

| | |
|---|---|
| **Daily** (many times a day) | Must be ≤1 click from anywhere, and keyboard-reachable. This is the app's home. |
| **Weekly** | Top-level nav. |
| **Monthly** | One level in, or in a menu. |
| **Rare / setup** | Settings. Never in the primary nav. |
| **Destructive / irreversible** | Deliberately harder: confirmation, typed name, or a menu — never adjacent to a frequent action. |

Write the ranked list explicitly in `app/ia.md`. If "Settings" and "Inbox" have the same visual
weight in your nav, the ranking never happened.

**Corollary:** the app's default screen after login is the *most frequent task*, not a dashboard of
charts nobody acts on. A dashboard is only the home screen if the user's actual job starts with
"see what changed".

## 2. Pick the navigation model — and justify it

There is no default. Each model fits a shape of product; picking wrong is a structural bug.

| Model | Fits | Breaks when |
|---|---|---|
| **Persistent sidebar** | 5–15 destinations, deep work, desktop-first tools | >15 items (becomes a menu of menus), or mobile-first usage |
| **Top bar only** | ≤6 destinations, shallow, content-forward | The product grows a second level |
| **Sidebar + contextual second pane** (list → detail) | Inbox-shaped work: mail, tickets, records, chats | The detail needs full width (tables, editors, dashboards) |
| **Top bar + section sub-nav** | Distinct areas each with their own sub-pages (billing, admin) | Users move *between* areas constantly |
| **Command-palette-first** (thin chrome + `⌘K`) | Power tools, high-frequency expert users | First-time users — must be paired with visible nav |
| **Bottom tabs** | Mobile-first, ≤5 destinations | Desktop; more than 5 |
| **Workspace/project switcher + nav** | Multi-tenant: the user belongs to several orgs/projects | Single-tenant — the switcher becomes dead chrome |

State the choice AND the reason in `app/ia.md`, then note what happens at 2× the destinations —
navigation must have a growth story, or the tenth feature breaks it.

**Multi-tenancy is an IA decision, not a feature.** If a user can belong to several
orgs/workspaces, decide early: where the switcher lives, whether the tenant is in the URL
(`/o/:org/…` — strongly preferred: it makes links shareable and state debuggable), and what
happens when someone opens a link to a tenant they left.

## 3. The screen inventory — every screen, before any screen

List **every** screen the app needs, with its job. This is the artifact the whole build reads.

| Screen | Route | Job (what the user came to DO) | Archetype | Entities | Permission | Primary action |
|---|---|---|---|---|---|---|
| Invoices | `/invoices` | Find and act on an invoice | list/table | Invoice | `invoice:read` | New invoice |
| Invoice detail | `/invoices/:id` | Understand and change one invoice | detail | Invoice, Customer | `invoice:read` | Mark paid |
| … | | | | | | |

Rules:
- **Every screen names a verb.** If you can't say what the user DOES here, it isn't a destination —
  it's navigation. Merge it into its parent.
- **Pick an archetype per screen** from `screen-patterns.md`. Archetype decides layout, so decide
  it now, not during the build.
- **Do not forget the unglamorous screens** — they are where AI-built apps are visibly incomplete:
  login / signup / forgot-password / accept-invite, empty first-run, 404, 403, 500, offline,
  settings (profile · account · team · billing · notifications · API keys · danger zone),
  search results, notifications, audit log, and the onboarding path.
- **Every entity in the model needs a home.** An entity you can create but never list, or list but
  never inspect, is a hole. Cross-check the entity model against the inventory.

## 4. The entity model — nouns before screens

Sketch the domain: entities, their key fields, and their relationships (1:1, 1:N, N:M). Then check
**CRUD coverage per entity**: can it be created, read in a list, read in detail, updated, archived
or deleted — and where? Missing operations are either a deliberate decision (write it down) or a
gap (fix it now, not after the build).

If a backend schema exists, the entity model is **read from it** (see `data-contract.md`) — you are
transcribing reality, not inventing it. If it doesn't, this sketch becomes the contract spec.

## 5. The route map — URLs are UI

A URL is a shareable, bookmarkable piece of application state. Treat it as designed surface.

- **Nouns, plural, lowercase, kebab:** `/invoices`, `/invoices/:id`, `/settings/team`.
- **State that a user would want to share lives in the URL** — the active filter, the search query,
  the sort, the open tab, the selected row. "Send me that filtered view" must be a link, not a
  screenshot. This is one of the clearest signs an app was built by people who use it.
- **Modals**: a modal you can deep-link to (a record, a share dialog) gets a route; a transient
  confirm does not. Decide per case; be consistent.
- **Every route has a loading and an error boundary** (`loading.tsx`, `error.tsx`, `not-found.tsx`
  in App Router). No route ships without them — that's the states gate.
- Redirects: `/` decides where a logged-in user lands; a permission-less route redirects rather
  than rendering a broken shell.

## 6. The permission matrix — roles are a design input, not an afterthought

Most real apps have roles. Bolting them on later means every screen gets a scatter of
`user.isAdmin &&` and the UI lies to somebody.

| Screen / action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Invoices · view | ✓ | ✓ | ✓ | ✓ |
| Invoices · create | ✓ | ✓ | ✓ | — |
| Invoices · void | ✓ | ✓ | — | — |
| Billing · manage | ✓ | — | — | — |

Then decide the **rule for each denial**, and apply it consistently:

- **Hide** — the user has no concept of this feature (a whole nav section for another plan/role).
- **Show disabled + reason on hover/focus** — the user knows it exists and could get it. Nearly
  always better than hiding: a control that silently vanishes makes people think the app is broken.
- **Show and explain on attempt** — for destructive or plan-gated actions worth an upsell.

Never: render the control and fail silently. Never: rely on hiding for security — **the server
enforces; the UI only communicates.** Write that sentence in `app/ia.md` so the backend side reads
it too.

## 7. Map the primary flows end-to-end

For the top 3–5 jobs, write the flow as steps, including where it goes wrong:

```
Create an invoice
  entry:    Invoices list · empty state · ⌘K "new invoice"
  steps:    pick customer → add lines → set due date → review → send
  states:   validation error per field · customer has no email (blocked, explain) ·
            network failure mid-send (retry, don't lose the draft) · duplicate number (conflict)
  success:  lands on the invoice detail, status=sent, toast with Undo
  exit:     back to the list with the new row highlighted
```

Three things this catches that a screen list never does:
1. **Entry points** — a feature reachable only from one deep menu will not be used.
2. **The failure branches** — which become the error states `steward` must build.
3. **Where the user ends up** — an action that dumps you on a blank screen is a dead end. Every
   flow ends somewhere useful, with the change visible.

## Output — `app/ia.md`

The ranked task list · the navigation model + why + its growth story · the full screen inventory
table · the entity model + CRUD coverage · the route map (incl. URL-state decisions) · the
permission matrix + the denial rule per case · the primary flows with their failure branches.

This is the contract for every phase after it. If a later phase needs a screen that isn't here,
that's an IA change — update this file, don't improvise a screen.
