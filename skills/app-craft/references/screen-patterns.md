# Screen patterns — the archetype library (load in screens + build)

Every app screen is one of a dozen archetypes. Knowing which one you're building tells you the
layout, the hierarchy, the states, and — most usefully — **the traps**. Pick the archetype in the
IA phase (`ia-and-flows.md`), then build it here.

**The universal rule:** every screen answers *where am I · what is this · what can I do · what's
the ONE action*. If a screen has no primary action, it is a report — say so and design it as one.

---

## 1. List / table — the backbone of most apps

**Layout:** page header (title · count · primary action) → filter bar (search · filters · saved
views · density/column controls) → the table → pagination. Selection turns the filter bar into a
**bulk action bar** in place — don't push the layout around.

**Get right:**
- **Sticky header row**; sticky first column when it scrolls horizontally.
- **Sort state is visible and in the URL** — which column, which direction, restored on reload.
- **Filters live in the URL** so a filtered view is a shareable link. This single detail separates
  tools people trust from demos.
- **Numbers right-aligned, tabular; text left; dates one consistent format** with relative on
  recency and absolute on hover.
- **Row click = the primary intent** (usually open detail). Row *actions* live in a trailing menu
  with a real hit area — not a 12px icon you must aim at.
- **Virtualize past ~200 rows.** Paginate or infinite-scroll past that; show honest totals
  ("200 de 12.480") and never lie about a count you can't compute.
- **Column visibility + density controls** for tables people live in; persist the choice.
- **Empty states, plural** — first-run vs. filtered (`states-and-edges.md`).

**Traps:** every column equally weighted (nothing is scannable — establish a primary column with
weight); horizontal scroll with no affordance; bulk-select with no bulk action; a "delete" icon
adjacent to the row-open click target; re-fetching the whole table to change a sort.

---

## 2. Detail / record — one entity, deeply

**Layout:** breadcrumb → detail header (title · status · key metadata · primary + overflow
actions) → tabs or sections → content, with a context rail (activity, related records, metadata).

**Get right:**
- **Status is unmistakable at the top** — the first thing anyone came to check.
- **Prev/next navigation** within the list's current filter, keyboard-driven (`j`/`k` or arrows).
  Returning to the list to open the next record is a tax you charge on every use.
- **Inline edit for single fields**; a full form only for multi-field changes.
- **An activity/audit trail** for anything shared between people — "who changed this and when" is
  the question every team asks.
- **Deep-linkable tabs** (`?tab=activity`) — see `ia-and-flows.md` §5.
- **The URL survives a cold open** — no reliance on state passed from the list.

**Traps:** losing the list's filter on back; a destructive action sitting in the primary action
row; metadata dumped as an unlabelled grid; tabs that hide something the user needs constantly.

---

## 3. Form / editor — where trust is won or lost

**Layout:** one column, grouped sections with a short intro per group; labels **above** fields;
help text under; actions in a sticky footer for long forms.

**Get right:**
- **Validate on blur, re-validate on change once invalid.** Validating every keystroke from the
  start punishes people mid-typing.
- **Errors inline, first invalid field focused on submit**, and a summary only for long forms.
- **Never lose input.** On failure, on navigation away (warn), on refresh (draft where it matters).
- **Disable submit only while pending**, never as a "form isn't valid yet" state — that hides *why*
  the user can't proceed. Let them submit and tell them what's wrong.
- **Pending state on the button, in place**, with the label changing ("Guardando…"); the button
  keeps its width so nothing reflows.
- **Sensible input types and autocomplete** — `inputMode`, `autoComplete`, `type="email"`.
  On mobile this is the difference between a good and an infuriating form.
- **Optional is marked, not required** — in most forms most fields are required, so mark the
  exception.
- **The same zod schema on client and server** — one source of truth for validation (see
  `data-contract.md`).

**Traps:** placeholder-as-label (disappears when typing, fails a11y); a red asterisk as the only
required signal; a toast for a field error; two competing submit buttons; a "Cancel" that discards
without warning.

---

## 4. Dashboard / overview

Only build one if the user's job actually starts with "see what changed". Otherwise the home
screen should be the most frequent task.

**Layout:** a row of KPI tiles (≤4) → one primary chart → supporting breakdowns → a recent activity
or action list.

**Get right:**
- **Every metric has a comparison** ("+12% vs. mes anterior"). A bare number means nothing.
- **Every tile is clickable** through to the filtered detail it summarizes.
- **The time range is global, visible, and in the URL.**
- **Charts are held to the same bar as the rest of the UI** — series colours drawn from the token
  layer (never a library's default palette, which is the chart equivalent of the kit look),
  distinguishable without relying on hue alone, labelled axes with units, no chartjunk, **measured**
  contrast in both themes, an accessible text alternative (a table or a summary), and a real empty
  state. If a `dataviz` skill is installed, load it for the deeper method; otherwise these rules
  stand on their own.
- **Loading is per-tile** so one slow query doesn't hold the page.

**Traps:** vanity metrics nobody acts on; a chart with no empty state; a dashboard that's the
default screen but has no action; five accent colours competing.

---

## 5. Settings

**Layout:** section nav (left or tabs) → one column of grouped settings → **danger zone last**.

**Get right:** group by *concept* (Profile · Account · Team · Billing · Notifications · API keys ·
Danger) · **auto-save with a clear saved indicator, or an explicit save bar — pick one and be
consistent across every section** · explain what each setting does in one line · destructive
actions in a visually separated danger zone requiring typed confirmation · show the current plan/
role/limits, not just the toggles.

**Traps:** a settings page with 40 ungrouped switches; unclear whether changes are saved; team
management with no way to see *who has what role*; an API key you can't rotate or revoke.

---

## 6. Onboarding / first-run

**Get right:** the shortest path to first value · progress that's honest (3 of 4) · skippable and
resumable · **sensible defaults so most people can skip everything** · the payoff visible at the
end, not a "You're all set!" dead end.

**Traps:** a 6-step wizard before the user sees anything of value; a modal tour over an empty app;
asking for data the app could infer; no way back to a completed step.

---

## 7. Auth (login · signup · forgot · reset · accept invite · verify)

The most-skipped screens in AI-built apps, and the first thing every user sees.

**Get right:** one clear path per screen · errors that don't leak whether an account exists ·
password rules stated **before** submit · show/hide password · a real "check your email" screen
(not a toast) · expired/used token states · invite acceptance that names the org and the inviter ·
post-login redirect back to the originally requested URL.

---

## 8. Search results

Echo the query prominently · show result counts per type · group or filter by type · highlight the
match · handle zero results with suggestions and a filter-clear · keyboard navigable · make the
query a URL param. If search is central, it belongs in `⌘K` too.

---

## 9. Inbox / feed (list → detail, two-pane)

Unread is visually distinct **and** count-accurate · keyboard-first (`j`/`k`, `e` archive, `⌘Enter`
send) · bulk actions · optimistic read-marking · the detail pane keeps the list in view on desktop
and becomes a full screen on mobile with a real back affordance · Undo on every archive/delete.

---

## 10. Board / kanban

Column WIP counts · drag with a clear drop indicator and **a keyboard alternative** (move-to menu —
drag-only is an accessibility failure) · optimistic move with rollback · collapsed columns · empty
column states · virtualize long columns.

---

## 11. Calendar / scheduler

Day/week/month with a persistent "today" anchor · timezone stated explicitly (the #1 source of
support tickets) · overlapping events resolved deliberately · drag to create *and* a click path ·
keyboard navigation across dates · a real empty day.

---

## 12. Wizard / multi-step

Honest progress · back without data loss · per-step validation before advancing · a review step
before anything irreversible · resumable if the user leaves · each step deep-linkable when
resuming is supported.

---

## 13. Billing / subscription

Current plan and its limits stated plainly · usage against the limit · what happens at the limit ·
invoice history with downloadable documents · payment method management · **cancellation that is
findable** (hiding it is a dark pattern and a trust killer) · proration explained in words.

---

## 14. Admin / internal tools

Dense by default · powerful filters · bulk operations with a confirmation that names the count ·
impersonation clearly indicated in the chrome while it's active · an audit trail · destructive
operations gated by role. Internal does not mean ugly — it means *dense and fast*.

---

## Cross-cutting checklist for every screen

- [ ] Its **job** is nameable in one verb phrase.
- [ ] Exactly **one primary action**, visually unambiguous.
- [ ] The **full state matrix** is built (`states-and-edges.md`).
- [ ] **Keyboard-completable** primary flow (`interaction-a11y.md`).
- [ ] Shareable/bookmarkable **URL state** (filters, sort, tab, selection).
- [ ] Composes the **shell** — no re-implemented header or nav.
- [ ] Uses only **semantic tokens** and existing primitives — no new one-off styles.
- [ ] Right **density** for the surface.
- [ ] Passes the **stress tests** at 320px and 1440px, light and dark.
