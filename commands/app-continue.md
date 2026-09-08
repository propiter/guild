---
description: Resume the app-craft pipeline from where it stopped — reads the existing app/ artifacts, finds the last completed phase, and runs the rest to a reviewed result.
---

Resume the **app-craft** pipeline.

Load the `app-craft` skill. Read the `app/` folder to find what's already done:

`_init.md` → `product.md` → `ia.md` → `system.md` → `contract.md` → `screens.md` → *(the built
code)* → `review.md`

1. **Identify the last completed phase** — and verify it's actually complete, not just present. An
   `ia.md` without a permission matrix, a `system.md` without a state matrix, or a `contract.md`
   with unanswered open questions is unfinished; finish it before moving on.
2. **Check the code against the artifacts** — if `screens.md` lists screens that don't exist in the
   codebase, the build phase is incomplete regardless of what any file says.
3. **Run the remaining phases in DAG order**, delegating each to its sub-agent and passing artifact
   PATHS forward.
4. **Always finish with the review loop** (max 3 passes) — never call it done without a genuine
   PASS from `magistrate`.

If `app/` is empty or missing, say so and suggest `/app-new` (plan first) or `/app` (full auto).

Report where you resumed from, what you ran, and the final verdict.
