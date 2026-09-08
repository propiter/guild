---
description: Show where the landing-craft pipeline is — which phases are done, what's next, and any blockers.
argument-hint: ""
---

Report the **landing-craft pipeline status**.

Load the `landing-craft` skill and inspect the `landing/` folder. Show a checklist of the phases —
init · research · strategy · architecture · copy · design · build · motion · polish · seo · review ·
deploy — marking each ✅ done / ▸ next / ⬜ pending, based on which artifacts exist (and whether the
app builds + the review passed + a deploy URL exists). End with the single next action (e.g. "run
`/landing-continue`" or "needs `vercel login`"). Read-only — do not run any phase.
