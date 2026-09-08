---
name: seo-geo
description: "Trigger: SEO, posicionamiento web, ranking, meta tags, schema, JSON-LD, structured data, sitemap, robots, Core Web Vitals, GEO, AEO, AI search, get cited by ChatGPT/Perplexity/Google AI, technical SEO, on-page. Make a site rank in search AND get cited by AI answer engines."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

Building or auditing any public page/landing/site that must be FOUND — in Google AND in AI answer engines (ChatGPT, Perplexity, Google AI Overviews). Keywords/intent come from `marketing-strategy` (the ICP); words from `brand-voice`; OG/social tags from `web-assets`. Run the checklist before shipping any page.

## THE HONESTY RULE (read this first — it governs all of GEO)

`Review` / `AggregateRating`, testimonials, and entity facts (founder, ratings, `sameAs`, awards,
`foundingDate`) are emitted **ONLY from REAL data** the research/brand provided. **NEVER fabricate
them** — fake review/rating schema earns a Google **manual penalty**, is dishonest, and teaches AI
engines to distrust the brand. If a fact isn't real, **OMIT that schema gracefully**. A thinner-but-
true entity graph beats a rich lie. When in doubt, leave it out.

## The 3 layers (do in order)

1. **Technical** — crawlable, fast, structured. Foundation; nothing ranks without it.
2. **On-page** — title/meta/headings/content match the searcher's intent.
3. **GEO/AEO** — get CITED by AI answer engines (ChatGPT, Perplexity, Google AI Overviews, Claude,
   Copilot) — the 2026 edge. Five moves: **let AI crawlers in** (a `robots.ts` that deliberately
   welcomes `GPTBot`/`ClaudeBot`/`PerplexityBot`/`Google-Extended`/`CCBot`/… with a documented
   opt-out), **feed them clean text** (`llms.txt` + `llms-full.txt` per llmstxt.org), **describe your
   entities** (richer + entity schema: `BreadcrumbList`, `SoftwareApplication`, `WebSite`+`SearchAction`,
   `Article` with dates, entity-deep `Organization` with real `sameAs`/founder), **write extractable
   answers** (self-contained answer chunks, comparison tables, FAQ, definitions, sourced stats), and
   **measure it** (AI-referral analytics by referrer hostname → a GA4 event).

Full checklists, the `robots.ts`/`llms.txt` patterns + JSON-LD templates: `references/checklist.md`.

## Hard Rules

- Validate every JSON-LD block (valid JSON, real schema.org `@type`, `https://schema.org` context) BEFORE shipping.
- **Emit schema only for what the page ACTUALLY is, only from REAL data.** No `Review`/`AggregateRating` unless real; no `SearchAction` without a search route. Omit gracefully when a fact isn't there.
- One page = one primary intent / keyword cluster. Answer the query in the first 100 words, in the searcher's words.
- Core Web Vitals targets: **LCP <2.5s, INP <200ms, CLS <0.1** — measure with Lighthouse/PSI, never guess.
- NEVER keyword-stuff or fabricate. Human first, machine second. `<title>`/`<h1>` must match the real content (no bait).
- GEO: write self-contained answer chunks (a clear claim + its supporting fact together) with real numbers/dates — that's what AI engines quote.
- Welcome AI crawlers for a marketing site (so it can be cited) but keep `/api/` and sensitive paths blocked for every bot; ship the opt-out toggle so a privacy-sensitive client can decline.
- Keep `llms.txt` + `llms-full.txt` IN SYNC with the real pages — a fact in them that contradicts the page is debt.
- Put real `datePublished` + `dateModified` on pages/articles and `<lastmod>` in the sitemap — freshness strengthens a citation.

## Output Contract

Return: the meta/title/canonical/OG block, the JSON-LD schema, the heading outline mapped to intent, the Core Web Vitals check, and any gap (missing sitemap, slow LCP, thin content).

## Escalate to the heavy pack when needed

For a deep competitive audit (0–100 score, backlink/keyword data, multi-site rank tracking, PDF/Excel reports) the `claude-seo` pack (by AgriciDaniel) is registered and one command away:
`claude plugin install claude-seo@agricidaniel-claude-seo`
It adds a GLOBAL `Edit|Write` schema-validation hook (safe, local-only) — enable it for a focused SEO push, then `claude plugin disable` it. For build-time on-page / technical / GEO work, THIS skill is enough.
