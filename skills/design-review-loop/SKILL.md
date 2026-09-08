---
name: design-review-loop
description: "Trigger: review UI design, critique screenshot, iterate on a page/component, does this look good, visual QA, polish frontend, design feedback. Drive a Playwright screenshot then critique then refine loop against a quality rubric."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

After building or changing any visual UI, run this loop before calling it done. It closes the gap between "the code compiles" and "this looks designed." Requires the Playwright MCP (`browser_navigate`, `browser_take_screenshot`, `browser_resize`).

## The Loop

1. **Render**: navigate to the running page (or open the built HTML file URL).
2. **Capture**: screenshot at 3 widths — 390 (mobile), 768 (tablet), 1440 (desktop). Full-page for layout, viewport for above-the-fold.
3. **Critique**: score against the rubric below. Be specific and ruthless — name the exact element and the issue, not "looks nice."
4. **Refine**: fix the top 2–3 issues in code.
5. **Repeat** until no rubric row scores below "good." Cap at ~3 passes; stop when returns diminish.

## Rubric

| Dimension | Looking for |
|-----------|-------------|
| Hierarchy | Eye lands on the right thing first. One clear primary action. |
| Spacing rhythm | Consistent scale (4/8px). No cramped or orphaned elements. Edges aligned. |
| Typography | Distinctive, readable. Line length ~60–75ch, sane line-height, real scale contrast. |
| Color & contrast | Cohesive palette. Body text passes WCAG AA (4.5:1). |
| Composition | Intentional layout, not default stacking. Balance, alignment, negative space. |
| Responsive | No overflow or broken wrap. Touch targets ≥44px at 390. |
| Motion | Load/interaction feedback present and tasteful (see `web-motion`). |
| Slop check | No generic AI tells: Inter/system font, purple-on-white gradient, evenly-timid palette. |

## Hard Rules

- ALWAYS look at the actual screenshot — never claim it "looks good" without rendering and viewing it.
- Compare against the stated aesthetic direction (from `frontend-design`); flag any drift.
- Report findings as a short prioritized list, not prose.

## Output Contract

Return: screenshots taken (which widths), the rubric rows scoring below "good" with the specific fix for each, and what changed on each pass.
