---
description: Start a new landing — run the planning phases (strategy → copy + design) and present the plan for approval before building.
argument-hint: "<product / brief, e.g. 'a project-management app for remote teams'>"
---

Start the **landing-craft** workflow for: **$ARGUMENTS**

Load the `landing-craft` skill and run the PLANNING phases only:

1. Delegate to the **strategist** sub-agent → `landing/strategy.md`.
2. Then, in parallel, delegate to **wordsmith** and **stylist** → `landing/copy.md`, `landing/design.md`.

If the brief is thin, draft the strategy and confirm with me — don't skip it (assume I don't know
marketing; that's your job). When the three artifacts exist, STOP and show me: the positioning
one-liner, the hero (headline + sub + CTA), and the visual direction (aesthetic + accent + type).
Ask whether to adjust or proceed to `/landing-build`. Do NOT write code yet.
