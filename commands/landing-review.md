---
description: Review the landing — render at mobile/tablet/desktop, score craft + conversion heuristics, and apply fixes (max 3 passes).
argument-hint: "(optional) URL or path of the running landing"
---

Run the **landing-craft** REVIEW gate.

Delegate to the **arbiter** sub-agent: load `design-review-loop`, render the running
landing at 390 / 768 / 1440 (start the dev server if needed; URL/path: $ARGUMENTS or auto-detect),
and score it against BOTH bars — craft (does it look designed, not AI) and conversion (the
playbook heuristics: 5-second test, single CTA, proof, objection handled, mobile hero, a11y, LCP).

Return PASS/FAIL with a `Severity · Where · Fix` table. On FAIL, route fixes to **burnisher**
(or upstream for copy/design issues) and re-review, up to 3 passes. Save `landing/review.md` and
report the final verdict.
