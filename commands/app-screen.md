---
description: Add ONE screen or module to an existing app — consistent with its design system, shell, contract and state doctrine. The surgical entry point; no re-planning of the whole app.
argument-hint: "<la pantalla, ej: 'la vista de facturas' o 'el módulo de equipo con roles'>"
---

Add this screen to the existing app: **$ARGUMENTS**

Load the `app-craft` skill. This is **Mode C — one screen.** It is surgical: do NOT re-plan the
app, do NOT redesign the system, do NOT touch unrelated modules.

1. **Read the ground.** Load `app/_init.md`, `app/system.md`, `app/ia.md`, `app/contract.md` if
   they exist. If they don't, delegate a fast scan to `prospector` and write a minimal `_init.md`
   (the next request will thank you).
2. **Contract first** — `envoy`: does this screen need data the contract doesn't cover?
   **Derive** it from the real schema, or **specify** it in `app/contract.md` for the backend side.
   Never let the view invent a field name.
3. **Spec it** — `framer`: pick the archetype from `screen-patterns.md`, reuse the existing
   shell, primitives and density, and write the **full state matrix** with its empty/error microcopy.
   If a needed component doesn't exist, add it to the system's inventory as a real reusable
   primitive — never inline a one-off, because the next screen will copy it.
4. **Build it** — `joiner`, matching the project's conventions exactly.
5. **States** — `steward`: a new screen with only a happy path fails the gate exactly like a
   whole app would.
6. **Wire it in** — the nav config, the route, the permission entry, the breadcrumb, the command
   palette. A screen you can't navigate to isn't shipped. Update `app/ia.md`'s inventory.
7. **Focused review** — `magistrate` on THIS screen: the six bars, the a11y gate, the states gate,
   `tsc`/lint. Fix-loop max 3.

**Blast radius:** what this screen requires, plus what change-at-the-root obliges you to clean.
Improvements outside that radius get reported, not performed.
