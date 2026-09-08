---
description: Full auto — run the whole landing-craft pipeline end to end (research → … → review) WITHOUT deploying. Same as /landing but stops before publishing.
argument-hint: "<product / brief>"
---

Run the **complete landing-craft** pipeline for: **$ARGUMENTS** in AUTO mode — same as `/landing`
but **without the deploy step** (build it, don't publish).

Load the `landing-craft` skill (you're the product lead — don't interrogate; see
`references/_conventions.md`) and run every phase end to end, delegating each to its sub-agent and
passing artifacts forward:

`surveyor → cartographer → strategist → draughtsman → {wordsmith, stylist} → wright → choreographer → burnisher` (+ `crier` off the build) `→ arbiter` (loop until PASS, max 3).

Enforce the FIVE bars (not-AI-looking · sells · intuitive · crafted · **ALIVE**) and **zero
technical debt** at every phase. Report the local preview URL, the pages built, the positioning
angle, and the review verdict. To publish, run `/landing` or delegate to `courier`.
