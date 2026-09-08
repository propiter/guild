# The design system — tokens, density, and the component inventory (load in system + build)

A landing needs a *visual direction*. An app needs a **system**: a finite set of decisions that
compose into hundreds of screens without anyone re-deciding. If screen #14 needs a new grey, the
system failed at screen #1.

This phase produces `app/system.md` **and the code that implements it** — the two must never drift.

> **Tokens first, components second.** Tokens move every screen at once; component edits move one
> screen at a time. Teams that invert this end up with a dozen hand-tuned components inside a
> product that still reads as the default kit.

---

## 1. The three token layers — and why the middle one is the point

```
PRIMITIVE   →   SEMANTIC   →   COMPONENT
--gray-100      --surface       --button-primary-bg
--blue-600      --accent        --table-row-hover
```

| Layer | What it is | Who may use it |
|---|---|---|
| **Primitive** | The raw ramp. `--gray-50…950`, `--accent-50…950`, the spacing scale, the radii, the durations. Numbers, no meaning. | **Only the semantic layer.** A component that reaches for `--gray-200` has bypassed the system. |
| **Semantic** | Meaning: `--surface`, `--surface-raised`, `--surface-sunken`, `--border`, `--border-strong`, `--ink`, `--ink-muted`, `--ink-subtle`, `--accent`, `--accent-ink`, `--success/warning/danger/info` (+ their `-surface` and `-ink` pairs), `--focus-ring`, `--overlay`. | **Everything.** This is the layer components consume. |
| **Component** | Only when a component needs a decision the semantic layer genuinely can't express. Rare — and each one is a small debt. | That component. |

**Why the middle layer is non-negotiable:** dark mode, density, and theming all happen by
re-pointing semantic tokens at different primitives. If components read primitives directly, dark
mode becomes a find-and-replace across the codebase, and it will be wrong somewhere.

```css
/* globals.css — semantic layer flips; components never change */
:root {
  --surface:        var(--bone-50);
  --surface-raised: var(--bone-0);
  --surface-sunken: var(--bone-100);
  --border:         var(--bone-200);
  --ink:            var(--bone-950);
  --ink-muted:      var(--bone-600);
  --accent:         var(--accent-600);
  --accent-ink:     var(--bone-0);
}
.dark {
  --surface:        var(--bone-950);
  --surface-raised: var(--bone-900);   /* raised = LIGHTER in dark, not darker */
  --surface-sunken: var(--bone-975);
  --border:         var(--bone-800);
  --ink:            var(--bone-50);
  --ink-muted:      var(--bone-400);
  --accent:         var(--accent-400);  /* lift chroma/lightness — 600 goes muddy on dark */
  --accent-ink:     var(--bone-950);
}
```

**Dark mode is a re-mapping, not an inversion.** Three traps to avoid:
- **Elevation flips direction.** In light, raised surfaces are lighter and cast shadow. In dark,
  shadow barely reads — raised surfaces get *lighter*, and borders do the work shadows did.
- **Accents shift.** The same accent at the same step looks fine on white and muddy on near-black.
  Point `--accent` at a lighter, slightly less saturated step in dark.
- **Pure black and pure white both fail.** `#000` makes halation on OLED and kills elevation;
  `#fff` at full-screen scale is glare. Use the ends of your ramp, not the extremes.

Both themes must pass the **measured** contrast gate — see `craft-core/references/contrast-check.md`.
Passing in light says nothing about dark.

---

## 2. The scales — decide once, then obey them

**Spacing.** One scale, 4px-based, and every gap comes from it: `2 4 6 8 12 16 20 24 32 40 48 64`.
Ad-hoc `13px` is how alignment rots.

**Radius by ROLE, not one value everywhere.** Uniform radius is itself a tell:
`--radius-control` (buttons, inputs, chips) · `--radius-surface` (cards, panels) ·
`--radius-overlay` (dialogs, popovers) · `--radius-full` (avatars, pills). Pick a *position* — sharp
(0–2px), precise (3–5px), or soft (10–16px) — and let the roles vary around it.

**Elevation.** Three levels, maximum: `flat` (border only) · `raised` (cards, dropdowns) ·
`overlay` (dialogs, popovers). Each is a token, each includes its dark-mode counterpart. More than
three and nobody can tell them apart — which means they communicate nothing.

**Motion durations** live here too: `--dur-instant: 80ms` · `--dur-fast: 140ms` ·
`--dur-base: 200ms` · `--ease-signature`. See `app-motion.md`.

---

## 3. Type for interfaces — the scale goes DOWN

A landing's type scale climbs to 72px. An app's scale lives at **11–16px**, and that's where the
craft is.

| Token | Size / line | Use |
|---|---|---|
| `text-2xs` | 11 / 16 | Table meta, timestamps, keyboard hints. Use sparingly and never below AA. |
| `text-xs` | 12 / 16 | Labels, badges, column headers, helper text |
| `text-sm` | 13 / 20 | **The workhorse** — table cells, form inputs, most UI text |
| `text-base` | 14–15 / 22 | Body copy, descriptions, dense reading |
| `text-lg` | 17 / 24 | Section titles, card headings |
| `text-xl` | 20 / 28 | Page title |
| `text-2xl` | 24 / 32 | The rare hero moment (dashboard KPI, onboarding) |

Rules that matter more than the numbers:
- **Two weights carry an app** (regular + medium/semibold). A third is a decision, not a default.
- **Tabular numerals on every number**: `font-variant-numeric: tabular-nums` on tables, KPIs,
  money, counts, IDs, timers. Non-tabular digits in a column is the fastest way to look amateur.
- **Right-align numbers, left-align text, and align the DECIMAL** for money.
- **Line-height tightens as size grows** — 1.5 at 13px, 1.25 at 24px.
- **Truncate with intent**: names get `truncate` + a `title`/tooltip; IDs truncate in the middle
  (`inv_9f…c21`, keep both ends); descriptions get `line-clamp-2`. Never let text just overflow.
- **A mono face for data** — IDs, hashes, code, API keys, and diff-like content. It signals
  "this is a literal value" better than any label.

---

## 4. Density — the decision the kit look never makes

Uniform breathing room across an entire app is a tell. Real tools modulate: a table is dense, a
settings form is calm, an onboarding step is generous.

Define density as a **scale-wide mode**, not per-component guesswork:

| | `compact` | `default` | `comfortable` |
|---|---|---|---|
| Row height | 32px | 40px | 52px |
| Control height | 28px | 34px | 40px |
| Cell padding-x | 8px | 12px | 16px |
| Section gap | 12px | 20px | 32px |
| Body size | 12px | 13px | 14px |

Implement it as tokens flipped by a `data-density` attribute on a subtree — so a dense table can
live inside a comfortable page without either fighting the other:

```css
[data-density='compact'] { --row-h: 32px; --control-h: 28px; --cell-px: 8px; }
[data-density='comfortable'] { --row-h: 52px; --control-h: 40px; --cell-px: 16px; }
```

**Choose per surface:** data tables and lists → `compact`. Forms, settings, detail pages →
`default`. Onboarding, empty states, marketing-adjacent surfaces → `comfortable`. If the users are
professionals living in this app 8 hours a day, ship a **user-facing density preference** — it is a
small feature that reads as deep respect for the user.

**Touch targets are exempt from density.** Even in `compact`, anything tappable keeps a ≥44px
touch target on coarse pointers (`@media (pointer: coarse)`), using padding or a pseudo-element so
the *hit area* grows without the *visual* growing.

---

## 5. Behaviour from primitives, looks from you

Use **Radix UI / Base UI** (or whatever headless layer the project already has) for the mechanics
that are genuinely hard and that hand-rolled UI reliably gets wrong:

focus trapping and restoration · roving tabindex · type-ahead in menus and selects · correct ARIA
roles and relationships · portalling · collision detection and flipping for popovers · scroll
locking · dismissal (Esc, outside click, focus loss) · controlled/uncontrolled state.

They ship **zero styles** — which is exactly the point. You get correct keyboard and screen-reader
behaviour with **no visual identity to inherit**, so there is no kit look to escape.

**Never** ship a pre-styled kit's default theme. If the project already uses one (common in Adopt
mode), do not rip it out — **re-token it** (§1) so every component reads your semantic layer, then
replace components only where tokens can't reach. Ripping out a working component layer mid-project
is the kind of churn that leaves orphans.

---

## 6. The component inventory — WITH the state matrix

List every component the screen inventory needs, and — this is the part that gets skipped — **every
state each one must implement.** A component "done" without its states is the root cause of an app
that only has a happy path.

**Primitives (`src/components/ui/`)**
Button (primary/secondary/ghost/danger · sm/md/lg · icon-only) · IconButton · Input · Textarea ·
Select · Combobox · Checkbox · Radio · Switch · Slider · DatePicker · FileUpload · Label ·
FieldError · Badge · Avatar · Tooltip · Popover · Dropdown · Dialog · Sheet/Drawer · Tabs ·
Breadcrumb · Pagination · Toast · Skeleton · Spinner · Separator · Kbd · Card · EmptyState ·
ErrorState · ProgressBar · Command (⌘K)

**Compositions (`src/components/patterns/`)**
DataTable (sort · filter · select · bulk actions · sticky header · column visibility · virtualized ·
row actions) · FilterBar · SearchInput · FormLayout · DetailHeader · StatCard · Timeline ·
ActivityFeed · ConfirmDialog · DangerZone · PageHeader · SectionCard · KeyValueList

**Every interactive component implements, deliberately:**

| State | Must be visibly designed |
|---|---|
| default · hover · **focus-visible** · active · disabled | Focus is a designed ring using `--focus-ring`, never the browser default, never `outline: none` |
| loading / pending | In-place; the control keeps its width so nothing reflows |
| error / invalid | Colour **plus** an icon or text — never colour alone |
| selected / active-route | Distinct from hover; a tinted background alone is the kit look — consider a rule, a notch, or weight |
| empty (for containers) | A real EmptyState, not a blank box |
| read-only vs disabled | Different things: read-only shows a value you can't change; disabled shows an action you can't take. Say which and why |

**Write the inventory into `app/system.md` with a build checklist**, so `magistrate` can verify
each one — an unlisted component is one someone will re-invent inline on screen #9.

---

## 7. The signature — the token the kit doesn't ship

Pick ONE thing that is yours, name it, and apply it everywhere:

- `--shadow-signature` — a specific, slightly hue-tinted elevation on every raised surface
- `--texture-grain` — 2–4% noise on surfaces
- `--ease-signature` — one curve every transition in the app uses
- a border treatment — an inset highlight, a hairline, a 1px + inner ring
- a selected-state treatment that isn't a tinted background

Record it in `app/system.md` under **Signature**. If nobody can name it, the product has no
fingerprint — and `magistrate`'s tell test will fail it.

---

## Output — `app/system.md`

The three token layers (with real values, light + dark) · spacing/radius/elevation/duration scales ·
the UI type scale + numeral rules · the density modes + which surface uses which · the
headless-primitive choice · the full component inventory + the state matrix + the build checklist ·
**the Signature** · and the a11y notes (focus ring token, minimum sizes, contrast results).

Then implement it: tokens in `globals.css` / `tailwind.config`, primitives in
`src/components/ui/`. **`app/system.md` and the code are one artifact in two forms — they never
drift.** In Adopt mode, this file EXTRACTS what already exists first, names the gaps, and upgrades
in place. Two token systems in one repo is the worst outcome available.
