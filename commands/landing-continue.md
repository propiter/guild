---
description: Resume the landing-craft pipeline from where it stopped — reads existing landing/ artifacts, finds the last completed phase, and runs the rest to completion (and deploy).
argument-hint: "(optional) phase to resume from"
---

**Continue** the landing-craft pipeline.

Load the `landing-craft` skill. Inspect the `landing/` folder to determine what's done (presence of
`_init.md → research.md → strategy.md → architecture.md → copy.md → design.md`, the built app, and
`review.md`). Identify the **last completed phase**, then resume autonomously from the next one and
run all remaining phases through review and deploy — no re-doing finished work, no interrogating the
user (per `references/_conventions.md`). If `$ARGUMENTS` names a phase, resume from there instead.

Honor zero-debt: if you find a flaw in already-finished artifacts while resuming, fix it and keep
going. Finish by handing over the live URL.
