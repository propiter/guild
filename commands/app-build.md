---
description: Build the approved app plan — contract, shell, design system, screens, then states, motion and polish.
---

Run the **production** phases of app-craft on the approved plan.

Load the `app-craft` skill. Read `app/_init.md`, `app/product.md`, `app/ia.md`, `app/system.md`,
`app/screens.md`. Delegate each phase:

1. **contract** — `envoy`: **derive** the typed contracts from the real schema, or
   **specify** them in `app/contract.md` for the backend side. Build the repository interfaces, the
   **hostile** mock adapter (10k rows · zero rows · nulls · every enum · latency · forced errors,
   with dev-only scenario switches) and the http adapter, behind one switch.
2. **build** — `joiner`: the shell first (once, driven by a typed nav config), then the
   primitives from the system's inventory, then the screens. Wired to the contract — **no `fetch`,
   no ORM, no raw `process.env` in a component.** URL state and permissions as specified. Every
   route gets its loading/error/not-found boundaries.
3. **states** — `steward`: every screen × every state, actually built and actually reachable,
   plus the stress tests (long names · 10k rows · nulls · slow network · 320px · dark · keyboard ·
   double-submit).
4. **motion** — `conductor`: feedback and continuity only. Nothing over 300ms, transform/opacity
   only, optimistic UI where safe, reduced-motion safe. Remove any landing-style motion.
5. **polish** — `lapidary`: the keyboard model, focus management, ARIA patterns, **measured** AA
   contrast in both themes, density, tabular numerals, responsive down to 320px and 200% zoom.

**In Adopt mode:** match the project's router, styling, conventions and package manager. Never
convert the stack. Keep the blast radius to the task plus what change-at-the-root obliges you to
clean.

Enforce zero technical debt throughout — fix what you find, delete what you replace, leave no
orphans. `tsc --noEmit` and lint must pass before you finish. Then run `/app-review`.
