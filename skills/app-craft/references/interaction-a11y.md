# Interaction & accessibility — the keyboard is the power-user path (load in polish + build + review)

In a landing, accessibility is compliance. In an app, **it is the product**: the keyboard model
that makes a11y correct is the same thing that makes the app fast for the person who lives in it
eight hours a day. Build it for speed and you get compliance for free — the reverse never works.

---

## 1. The keyboard model

**Everything is reachable, nothing is a trap.**

| Key | Behaviour — no exceptions |
|---|---|
| `Tab` / `Shift+Tab` | Moves between *components*, in visual order. Not into every item of a list. |
| `Arrows` | Move *within* a composite: menu items, tabs, table rows, board columns, radio groups |
| `Enter` | Activate the focused thing |
| `Space` | Toggle (checkbox, switch); activate a button |
| `Esc` | Dismiss the topmost layer — popover, then dialog, then drawer. Always. |
| `Home` / `End` | First / last item in a composite |
| `⌘K` / `Ctrl+K` | Command palette, from anywhere |
| `/` | Focus search (when not typing in a field) |
| `?` | Show the shortcut sheet — and it must exist |

**Roving tabindex, not tab-through-everything.** A composite (menu, tab list, table, grid) is ONE
tab stop; arrows move inside it. A 10.000-row table with 10.000 tab stops is unusable — this is
what headless primitives give you for free, and what hand-rolled widgets get wrong.

**Focus management is the part everyone skips:**
- Opening a dialog/drawer/popover **moves focus inside** and traps it there.
- Closing **returns focus to the trigger**. Focus lost to `<body>` is a broken app for a keyboard
  user — they're back at the top of the page.
- Deleting the focused row moves focus to the next row, not to nowhere.
- Route change moves focus to the main heading (or the skip target), not the top of the DOM.
- **`:focus-visible` is always designed** with your `--focus-ring` token — never `outline: none`
  without a designed replacement. If you can't see where focus is, nothing else matters.

**Shortcut design:** single letters for the frequent actions in the surface that owns them
(`n` new, `e` edit, `/` search, `j`/`k` navigate), modifiers for global/destructive ones. Never
capture a browser or OS shortcut. Never fire while a text field has focus. **Show the shortcut in
the UI** — in tooltips, menus and the palette — because a shortcut nobody discovers doesn't exist.
Ship a `?` sheet listing them all.

---

## 2. ARIA patterns — use the primitive, don't reinvent it

Radix/Base UI implements these correctly. Reach for the primitive; hand-roll only if there is no
option, and then follow the WAI-ARIA Authoring Practices exactly.

| Widget | Pattern | The part that's usually wrong |
|---|---|---|
| Dialog | `role="dialog"` `aria-modal` + labelled by its title | Focus trap and **return**; Esc; the rest of the page inert |
| Dropdown menu | `menu`/`menuitem`, roving tabindex, type-ahead | Arrow keys, Esc, and returning focus to the trigger |
| Combobox / autocomplete | `combobox` + `listbox` + `aria-activedescendant` | Announcing the result count as results change |
| Tabs | `tablist`/`tab`/`tabpanel`, arrows move, `aria-selected` | Panel association, and not tabbing through every tab |
| Tooltip | `role="tooltip"` + `aria-describedby` | Must be reachable on **focus**, not hover only; never put an action in it |
| Table | Real `<table>` semantics, `aria-sort` on sortable headers | Divs pretending to be a table with no semantics at all |
| Toast | `role="status"` (or `alert` for errors) in a live region | Errors that only appear visually |
| Disclosure | `aria-expanded` + `aria-controls` | Missing `aria-expanded` on the trigger |
| Switch | `role="switch"` + `aria-checked` | Using a checkbox where a switch's immediate-apply semantics are meant |

**Live regions:** async results, toasts, validation summaries, and "saved" indicators need
`aria-live="polite"` (`assertive` only for genuine errors). A screen reader user who never learns
the save succeeded is using a broken app.

**Icon-only buttons always carry an accessible name** (`aria-label`) *and* a tooltip. One without
the other fails somebody.

---

## 3. Forms

- Every input has a **real `<label>`** — placeholder is not a label (it vanishes when typing, and
  fails at 200% zoom and for screen readers).
- Errors: `aria-invalid` + `aria-describedby` pointing at the message. Move focus to the first
  invalid field on submit.
- Group related fields in `<fieldset>` + `<legend>` (address, date parts, radio groups).
- `autoComplete` on everything a browser can fill; `inputMode` for numeric/tel/email on mobile.
- Required marked in text, not colour or an asterisk alone.
- Never disable submit as a validity signal (§Form in `screen-patterns.md`).

---

## 4. Colour, contrast and motion

- **AA measured, not eyeballed** — `craft-core/references/contrast-check.md`, **both themes**,
  including badges, disabled controls, placeholder text, chart series, and focus rings.
- **Never colour alone** to convey state. Status needs an icon, a shape or text alongside — a
  red/green pill is invisible to ~8% of men.
- **Contrast for non-text too** (WCAG 1.4.11 — 3:1): focus rings, input borders, icon-only buttons,
  chart lines, toggle states.
- **Target size**: ≥24×24 CSS px minimum (WCAG 2.2), and ≥44px on coarse pointers.
- **`prefers-reduced-motion`** honored everywhere: no transforms, no parallax, no auto-carousels.
  Cross-fades and instant state changes are fine — see `app-motion.md`.
- **Zoom to 200%**: the layout reflows; nothing is clipped or unreachable. Test it, don't assume it.

---

## 5. Semantics & structure

One `<h1>` per screen (the page title) and a heading order with no skipped levels · real landmarks
(`<header>`, `<nav>`, `<main>`, `<aside>`) so screen-reader users can jump · a **skip link** as the
first tabbable element · `<button>` for actions and `<a>` for navigation (a div with onClick is
invisible to the keyboard and to assistive tech) · lists as real lists · `lang` set, and updated if
content language changes.

---

## 6. Feel — the details that separate a tool from a demo

- **Instant feedback on every interaction.** Under ~100ms it feels direct; past 300ms it needs a
  pending state.
- **Nothing moves under the cursor.** Content that shifts as it loads causes mis-clicks; reserve
  space (that's what skeletons in the right shape are for).
- **Hover intent** — a 100–200ms delay before opening hover menus, so crossing one doesn't fire it.
- **Preserve scroll position** on back-navigation and on refetch.
- **Text is selectable** where a user would want to copy it (IDs, emails, amounts). Blanket
  `user-select: none` is hostile.
- **Double-submit is impossible** — disable on pending and make the mutation idempotent.
- **`autofocus` only where the user's intent is unambiguous** (a search dialog, the first field of
  a create form). On page load it hijacks the screen reader.
- **Respect the OS**: `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast`, and the
  browser's font-size setting (use `rem` for type).

---

## The a11y gate (what `magistrate` verifies — hard FAIL on any miss)

1. **Keyboard-only completion** of every primary flow, on every screen.
2. **Focus is always visible** and never lost or trapped; dialogs return focus to their trigger.
3. **Zero axe-core critical/serious violations** (run it in the review pass, don't guess).
4. **Measured AA** in light AND dark, including non-text contrast at 3:1.
5. Every icon-only control has an accessible name.
6. Every form input has a real label, and errors are programmatically associated.
7. `prefers-reduced-motion` honored across the app.
8. One `<h1>` per screen, ordered headings, real landmarks, a working skip link.
9. Layout holds at 200% zoom and at 320px.
