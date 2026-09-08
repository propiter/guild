---
description: Review the app — render every screen and state at 320/768/1440 in light and dark, score the six bars and the five hard gates, and apply the fixes (max 3 passes).
argument-hint: "[alcance opcional, ej: 'la vista de facturas' — vacío = toda la app]"
---

Run the app-craft **review loop**: **$ARGUMENTS**

Load the `app-craft` skill and delegate to `magistrate`.

1. **Audit** — it renders every screen at **320 / 768 / 1440**, in **light and dark**, and drives
   every state through the mock scenarios (`?mock=empty|filtered-empty|error|slow|huge`). It scores:
   - the **SIX bars** — not AI-generated (the tell test: crop the logo · the kit test · the density
     test · **name the Signature token**) · learnable in 60s · fast to OPERATE (keyboard-only) ·
     **COMPLETE (every state)** · survives stress · crafted but quiet
   - the **states gate** — skeletons, both empties, errors + retry, route boundaries, every
     `error.kind`, no lost input, no `null`/`undefined`/`Invalid Date`/"No data"/"Oops" rendered
   - the **a11y gate** — keyboard completion, focus visible and returned, **axe-core clean**,
     measured AA both themes incl. non-text 3:1, labels, landmarks, skip link, 200% zoom
   - the **contract gate** — no drift from the source of truth, both adapters satisfy the
     interface, no `fetch`/ORM/`process.env` in components, responses validated
   - the **motion gate** — nothing over 300ms, transform/opacity, 60fps, reduced-motion honored
   - the **hardening gate** — `tsc`/lint clean, typed env, validated endpoints, zero duplicated
     markup, tokens single-sourced

2. **Route the fixes** to the owning phase: code/wiring/missing screens → `joiner` · states →
   `steward` · tokens/density/components → `artificer` · keyboard/a11y/contrast/responsive →
   `lapidary` · animation → `conductor` · contract/types → `envoy` · layout specs →
   `framer` · navigation/permissions → `wayfinder`.

3. **Re-audit** the patched app. **Repeat up to 3 passes**; stop the instant it's a genuine PASS.

**Honesty at the cap:** if it still isn't there after 3 passes, do NOT claim it is. Report what
remains — severity · where · why it persists — and hand it over. A dishonest PASS ends the loop
that would have fixed it.
