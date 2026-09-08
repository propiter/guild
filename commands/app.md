---
description: The flagship for applications — one prompt to a working, crafted app UI. Detects whether to adopt your existing project or start fresh, negotiates the backend contract, and runs every phase to a reviewed result.
argument-hint: "<lo que querés, ej: 'el dashboard de facturación' o 'la app de gestión de proyectos'>"
---

Run the full **app-craft** flow for: **$ARGUMENTS**

Load the `app-craft` skill (and `craft-core` first). You are the **product lead** — do NOT
interrogate the user. Run everything autonomously, delegating each phase to its sub-agent and
passing artifact PATHS forward:

1. **init** — `prospector`: **detect the MODE first.** Adopt an existing project (the normal case),
   greenfield, one screen, or contract sync. Scan the stack, the existing design system, the auth +
   role model, and **where the backend contract lives**. Never assume greenfield.
2. **product** — `ethnographer`: what it does, the roles, the jobs ranked **by frequency**, and a
   teardown of the reference-class UIs in this category.
3. **ia** — `wayfinder`: the navigation model + why, the FULL screen inventory (including auth,
   settings, and the error/empty screens), the entity model, the route map with URL state, the
   permission matrix, and the primary flows with their failure branches.
4. **system** + **contract** — `artificer` (tokens → density → component inventory + state matrix
   → **the Signature token**) and `envoy` (**derive** the types from the real schema, or
   **specify** `app/contract.md` for the backend side and run on the hostile mock).
5. **screens** — `framer`: the app shell + a layout spec per screen, each with its full state
   matrix and its empty/error microcopy.
6. **build** → **states** → **motion** → **polish**.
7. **review** — `magistrate`: the SIX bars + the states / a11y / contract / motion / hardening
   gates. Loop fixes → re-review until PASS (max 3), then be honest about any remainder.

Enforce the SIX bars at every phase (not-AI-looking · learnable in 60s · fast to OPERATE ·
**COMPLETE — every state** · survives stress · crafted but quiet) and **zero technical debt** (fix
what you find, change at the root, no orphans).

**In Adopt mode you are a guest:** match the project's router, styling, conventions and package
manager; never convert the stack; keep the blast radius to the task.

Finish with: the mode, the screens built, the navigation model, the design system's Signature, the
**contract status** (derived from `<path>` / specified and awaiting a backend), the state coverage,
and the review verdict.
