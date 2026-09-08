---
description: Plan an app — product, IA & flows, design system and screen specs — then STOP and show the plan for approval before any code is written.
argument-hint: "<lo que querés, ej: 'una app de gestión de proyectos para equipos remotos'>"
---

Run the **planning** phases of app-craft for: **$ARGUMENTS**

Load the `app-craft` skill. Delegate each phase and pass artifact PATHS forward. **Stop before
building.**

1. **init** — `prospector`: the mode, the stack, the existing design system, the backend contract
   source. Never assume greenfield.
2. **product** — `ethnographer`: what it does, the roles, the jobs ranked **by frequency**, the
   reference-UI teardown, and the anti-pattern to refuse.
3. **ia** — `wayfinder`: the navigation model + why (and what happens at 2× the destinations), the
   FULL screen inventory including the unglamorous screens (auth · settings · 404/403/500 ·
   onboarding), the entity model + CRUD coverage, the route map with URL-state decisions, the
   permission matrix + the denial rule per case, and the primary flows with their failure branches.
4. **system** — `artificer`: the three token layers (light + dark), the UI type scale, the density
   modes, the component inventory **with its state matrix**, and **the Signature token**.
5. **screens** — `framer`: the app shell + a layout spec per screen, each with its full state
   matrix and its empty/error microcopy.

Then **STOP**. Present:

- the mode and what you're building into
- the navigation model and why
- the screen inventory by archetype
- the design system's decisions: neutral · accent · radius position · type pairing · density · **the
  Signature**
- the contract situation (what will be derived, what must be specified for the backend)
- the open questions the backend owes an answer to

Ask whether to adjust or proceed. Run `/app-build` when approved.
