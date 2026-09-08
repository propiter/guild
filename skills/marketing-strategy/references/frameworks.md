# Marketing frameworks (load on demand)

Dense reference for `marketing-strategy`. Apply these; keep the SKILL.md contract lean.

## Positioning — Dunford's 5 components
1. **Competitive alternatives** — what the customer uses if you didn't exist (often the status quo / a spreadsheet, not a named competitor).
2. **Unique attributes** — what only you have.
3. **Value** — what those attributes let the customer DO (the outcome, never the feature).
4. **Best-fit customers** — who cares most about that value.
5. **Market category** — the frame that makes the value obvious instantly.

Statement template:
> For **[ICP]** who **[pain/trigger]**, **[product]** is a **[category]** that **[unique value]**. Unlike **[alternative]**, we **[differentiator backed by a unique attribute]**.

## ICP / Jobs-to-be-Done
- JTBD: "When **[situation]**, I want to **[motivation]**, so I can **[outcome]**."
- Score segments by: **pain intensity × ability to pay × reachability**. Pick the single top one. Expand later, never first.

## Offer — make "yes" easy
- **Value stack**: list everything they get; anchor it against the cost of NOT solving the pain.
- **Risk reversal**: guarantee, free tier, "cancel anytime" — remove the fear of saying yes.
- **Real urgency**: cohort close, price step, expiring bonus. NEVER fake countdown timers.

## Copy formulas (pair with `brand-voice`)
- **PAS** — Problem → Agitate → Solution. Best for pain-aware audiences.
- **AIDA** — Attention → Interest → Desire → Action. Best for cold audiences.
- **Landing above-the-fold** — outcome headline + subhead (the how) + ONE primary CTA + proof element. One page, one goal, one action.

## Funnel → asset map
| Stage | Goal | Asset (production skills) | Metric |
|---|---|---|---|
| Awareness | Get seen by the ICP | social post, short video (`hyperframes`), SEO article | qualified reach |
| Consideration | Earn trust | landing (`frontend-design`), demo, case study | email opt-ins / signups |
| Conversion | Remove friction | offer page, onboarding, email sequence (`brand-voice`) | activation / paid conversion |
| Retention | Keep + expand | product, lifecycle emails, referral | retention / referral rate |

## Channel fit
- Go where the ICP ALREADY spends attention. B2B/dev → GitHub, X, niche forums, technical SEO. Local/consumer → IG, WhatsApp, TikTok, local SEO.
- 1–2 channels done deep beats 6 channels half-done. Master ONE acquisition loop before adding the next.

## Launch sequence (lightweight)
- **Pre**: build a list + tease the transformation. Collect emails before launch day.
- **Day 0**: hero asset (landing/video) + launch email + coordinated posts on your 1–2 channels.
- **Post**: publish proof (early results, testimonials the user supplied), find the angle that converted, double down on it. Kill the angles that didn't.

## Distribution tooling (wire up ONLY after strategy exists)
- **Orchestration/automation**: n8n (already configured — 2 MCP servers). Chain capture → enrich → send → track.
- **Social scheduling**: postiz. **Email**: resend. **Product analytics**: posthog. **Ads**: spotify-ads-api / meta.
- These are PIPES. The strategy decides what flows through them. A pipe with no positioning just moves noise faster.
