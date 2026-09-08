# The app shell — the frame that holds every screen (load in screens + build)

The shell is the chrome that persists while content changes: navigation, identity, global search,
account. It is built **once**, and every screen composes into it. If a page re-implements a header,
the system already failed.

Its job is to answer, on every screen, without the user thinking: **Where am I? What else is
there? How do I get back? What can I do globally?**

## 1. The regions

```
┌────────────────────────────────────────────────────────────┐
│ TOP BAR   [tenant ▾]  [⌘K search]              [?] [🔔] [avatar ▾] │
├──────────┬─────────────────────────────────────────────────┤
│ SIDEBAR  │ PAGE HEADER  breadcrumb · title · primary action │
│  nav     ├─────────────────────────────────────────────────┤
│  groups  │                                                 │
│          │  CONTENT                        │ CONTEXT PANEL │
│  ────    │                                 │  (optional)   │
│  footer  │                                 │               │
└──────────┴─────────────────────────────────────────────────┘
```

| Region | Holds | Never holds |
|---|---|---|
| **Top bar** | Tenant/workspace switcher, global search (`⌘K`), notifications, help, account menu | Page-specific actions — those belong to the page header |
| **Sidebar** | Primary destinations, grouped; collapse control; secondary items pinned at the bottom | More than ~15 items, or a second scrolling region |
| **Page header** | Breadcrumb, page title, page-level metadata, **the one primary action**, overflow menu | Global concerns |
| **Content** | The screen | A duplicate of the page title |
| **Context panel** | Details for the selection, filters, activity, help — dismissible, its state remembered | Anything required to complete the primary task |

**The two-header trap:** if the top bar and the page header both show a title, the user reads
neither. Top bar = *the product*. Page header = *this screen*. One or the other owns the title.

## 2. Sidebar craft — where the kit look is most obvious

- **Group by frequency, not alphabet** (see `ia-and-flows.md`), with quiet group labels
  (`text-2xs`, `--ink-subtle`, uppercase or not — pick one and be consistent).
- **The active state must be unmistakable and NOT just a tinted pill.** That is the kit default. A
  left rule, a notch, an inset highlight, a weight change, or your `--shadow-signature` reads as
  designed. Active ≠ hover: they must be distinguishable at a glance.
- **Icons are optional — and if you use them, they must be a set with a point of view.** Default
  `lucide` at default stroke, one per item picked by keyword match, is a tell. Either commit to a
  consistent icon language (one family, one stroke, one optical size, chosen for *meaning*) or drop
  icons and let type and grouping do the work. A wrong icon is worse than none.
- **Collapsed mode is a real design**, not `width: 0`. Icons + tooltips, the active state still
  legible, and the collapse state **persisted** (localStorage or a user preference). Nothing is more
  irritating than a sidebar that re-expands on every navigation.
- **Counts and badges** (unread, pending) go inline, right-aligned, tabular, and they must be
  *correct* — a badge showing stale data destroys trust in the whole app.
- **Bottom of the sidebar** is for the low-frequency-but-always-needed: settings, help, the theme
  toggle, the user chip. Not another copy of the account menu from the top bar — pick one home.

## 3. Responsive — the shell must survive 320px

The shell is where responsive breaks first, and where AI-built apps break most visibly.

| Width | Shell behaviour |
|---|---|
| **≥1280px** | Sidebar expanded; context panel may be pinned open |
| **1024–1280px** | Sidebar collapsed to icons; context panel becomes an overlay |
| **768–1024px** | Sidebar becomes a drawer behind a menu button; page header stays |
| **<768px** | Drawer nav (or bottom tabs if ≤5 destinations); page header compresses to title + overflow; the primary action becomes a FAB or moves into a sticky bottom bar |

Hard rules at small widths:
- **The primary action never disappears.** It moves; it does not vanish into an overflow menu.
- **Tables do not shrink into unreadable columns.** Switch to a card/stacked list, or an explicit
  horizontal scroll region with a sticky first column and a visible affordance. Never squeeze eight
  columns into 375px.
- **Drawers trap focus, close on Esc and on route change**, and restore focus to the trigger.
- **Test at 320px.** Not 375. The narrow phone is where 60-character names and long labels expose
  every layout assumption.

## 4. The command palette (`⌘K`) — when and how

Add it once the app has more than a handful of destinations or actions. It is the single fastest
signal that a product was built for daily use.

- **Opens with `⌘K` / `Ctrl+K`**, from anywhere, including inside dialogs (it takes precedence).
- **Mixes navigation, actions, and search results**, grouped and labelled — with recents first when
  the query is empty, because most invocations are repeats.
- **Fuzzy match with visible highlighting**, keyboard-only operation, and Esc to dismiss.
- **Actions respect permissions** — an action the user can't perform doesn't appear (or appears
  disabled with the reason, matching your denial rule from `ia-and-flows.md`).
- **Shows the shortcut** next to any command that has one — this is how users learn them.
- It is an accelerator, **never the only path.** Every command in the palette exists somewhere in
  the UI too. A feature reachable only by `⌘K` does not exist for most users.

## 5. Global surfaces the shell owns

- **Toasts** — one region, bottom-right or top-center, max ~3 stacked, auto-dismiss for success
  (~5s), **persistent for errors**. Every destructive action gets **Undo** in its toast where the
  operation permits it. Undo is worth more than a confirmation dialog for anything reversible.
- **Dialogs** — one at a time; never stack. Focus trapped, Esc closes (unless there are unsaved
  changes — then confirm), focus returns to the trigger.
- **Global loading** — a top progress bar for route transitions. Never a full-screen spinner that
  blanks the shell; the shell is the user's anchor and it must persist while content loads.
- **Offline / connection lost** — a persistent banner in the shell, not a toast. It reports a state,
  not an event.
- **Theme toggle** — light / dark / system, with `system` as the default and the choice persisted.
  Render the initial theme without a flash (inline script before paint).
- **Skip link** — a visible-on-focus "Skip to content" as the first tabbable element. Without it,
  keyboard users tab through the entire sidebar on every single navigation.

## 6. Structure in code

```
src/components/shell/
  app-shell.tsx        # composes the regions; ONE per app
  top-bar.tsx
  sidebar.tsx
  sidebar-nav.tsx      # renders from a typed nav config — never hand-written <li>s
  page-header.tsx      # title · breadcrumb · actions slot
  context-panel.tsx
  command-palette.tsx
src/lib/navigation.ts  # the typed nav config: label, href, icon, permission, group, badge
```

**The nav is data, not markup.** One typed config drives the sidebar, the mobile drawer, the
breadcrumbs and the command palette — so a new destination is one entry, and the four surfaces can
never disagree. A hand-written nav in each surface guarantees they drift.

```ts
// src/lib/navigation.ts
export type NavItem = {
  label: string
  href: string
  icon?: IconName
  permission?: Permission   // from the permission matrix — filtered per user
  group: 'work' | 'manage' | 'settings'
  badge?: () => number | null
}
```

Every page composes: `<AppShell><PageHeader …/>…</AppShell>`. **No page ever renders its own
header or nav** — that duplication is the bug factory the hardening doctrine exists to prevent.
