# Site Architecture — multi-page + unique sections per theme (load after research)

A landing is rarely ONE page. A real product needs a small **site**, and its sections must fit
THIS theme — never a fixed hero→3-cards→CTA template. The section plan is DERIVED from
`landing/research.md` (the competitor gap, the audience's drivers, the niche), not copy-pasted.

## 1. The page map — decide which pages this product needs

Always: the **landing** (home). Then add only what the product/theme genuinely needs:

| Page | Add when | Notes |
|------|----------|-------|
| **Pricing** | there are paid tiers | can be a landing section OR its own page if complex |
| **About / Manifesto** | brand/trust matters (services, premium, founder-led) | the human story |
| **Blog / Resources** | SEO + content marketing is in scope | index + post template; fuels keyword ranking |
| **Contact** | leads come by form/booking | form or calendar embed |
| **FAQ** | objection-heavy / complex offer | or a landing section |
| **Legal: Terms, Privacy** | ALWAYS for a real launch | required for ads, payments, trust, app stores |
| **Cookies / Refund** | e-commerce / EU traffic / subscriptions | as the market requires |
| **Product / Features / Use-cases** | multi-feature SaaS | one per major use-case for SEO |

Generate the legal pages with real, sensible copy (clearly marked as templates to review with a
lawyer — never invent false legal claims). Keep nav + footer consistent across all pages.

## 2. Section libraries BY THEME — pick what fits, don't template

The home/landing's sections come from the research. Start from the theme's library, then cut/add
based on the *gap* and *emotional hook* you found. Lead with the unexpected, not the obvious.

- **SaaS / API / dev tool** — signature animated product visual; "how it works" with a real
  interface/code; integration logos; interactive demo or sandbox; metrics/uptime; security/trust;
  pricing; docs/DX proof.
- **E-commerce / physical product** — full-bleed product photography; benefit-led gallery; social
  proof with UGC/reviews + stars; comparison vs alternatives; bundle/offer; guarantee/returns;
  shipping; sticky add-to-cart.
- **Course / info-product / creator** — the transformation (before→after); curriculum preview;
  instructor authority + face; testimonials with results; bonuses/stack; price anchor + guarantee;
  FAQ; urgency (cohort/seats).
- **Local service / B2B service** — real work/team photography; process in 3 steps; results/cases
  with numbers; service area/coverage; trust (licenses, years, clients); booking/quote CTA.
- **Mobile app** — device mockups in motion; feature scroll-story; app-store badges + ratings;
  screenshots carousel; privacy posture.
- **Agency / portfolio** — bold work showcase (the work IS the hero); selected cases; process;
  capabilities; team; bold contact CTA.
- **Event / launch / waitlist** — countdown; what/when/where; speakers/lineup; FOMO + social proof;
  one capture (register/waitlist).
- **Restaurant / hospitality** — appetite-driving photography; menu highlights; ambience; location +
  hours + map; reserve CTA.

For each chosen section, demand its JOB (attention / desire / proof / objection / action) and a
**unique treatment** (don't render the SaaS-card cliché for a restaurant). Cross-check against
`alive-not-generic.md` — real imagery, signature visual, scroll-reactive motion, warmth.

## 3. Consistency across the site
One design system (the Tailwind theme) and one voice across every page. Shared header/footer.
The legal/blog pages can be calmer, but never off-brand. SEO: each page gets its own
title/description/JSON-LD targeting its keyword cluster from the research.

## Output (the architecture phase writes `landing/architecture.md`)
The page map (which pages + why) + the home section plan (ordered, each with job + unique
treatment, tied to the research) + the per-page SEO target. This drives copy, build and SEO.
