# SEO + GEO/AEO checklist & schema templates (load on demand)

Dense reference for `seo-geo`. Apply per page before shipping. Layers 1–2 make you RANK; layer 3
makes you get CITED by AI answer engines (ChatGPT, Perplexity, Google AI Overviews, Claude,
Copilot). In 2026 the citation is the prize — be the source the model quotes, not just the link
Google ranks.

## THE HONESTY RULE (non-negotiable — read before any schema)

`Review` / `AggregateRating`, testimonials, and entity facts (founder, ratings, `sameAs`, awards,
`foundingDate`) are emitted **ONLY from REAL data** the research/brand provided. **NEVER fabricate
them.** Fake review/rating schema earns a Google **manual penalty** and is dishonest — it also
teaches AI engines to distrust the brand's entity. If a fact isn't real, **OMIT that schema
gracefully** (drop the property or the whole block); a thinner-but-true graph beats a rich lie.
Every JSON-LD block is validated (valid JSON, real `schema.org` `@type`, `https://schema.org`
context) before shipping. When in doubt, leave it out.

## 1. Technical SEO — ship checklist

- One `<h1>`; logical `<h2>`/`<h3>` outline. Semantic landmarks (`header/nav/main/article/footer`).
- `<title>` ≤60 chars, primary term first. `<meta name="description">` ≤155 chars, benefit + term.
- `<link rel="canonical">` on every page. Clean readable URLs (`/producto/nombre`, not `?id=92`).
- `robots.txt` (allow crawl, link the sitemap) — and DELIBERATELY welcome AI crawlers (see §4A).
- XML `sitemap.xml` listing canonical URLs (incl. blog posts), with `<lastmod>` dates.
- Open Graph + Twitter card tags (generate the image via `web-assets`).
- `alt` on every meaningful image; descriptive `<a>` text (never "click here").
- `lang` attribute; `hreflang` if multi-language.
- Core Web Vitals: LCP <2.5s, INP <200ms, CLS <0.1. Lazy-load below-the-fold, set image dimensions to avoid CLS, preload the LCP image.

## 2. On-page — intent match

- Map each page to ONE keyword cluster + intent (informational / commercial / transactional) from the `marketing-strategy` ICP.
- First 100 words answer the query directly, in the user's vocabulary.
- Headings phrased as the questions users actually type.
- Internal links with descriptive anchors to related pages (build topical depth).
- No thin content: every page earns its place or gets merged/removed.

## 3. GEO / AEO — get cited by AI engines

The 2026 edge: structured + quotable + crawlable-by-AI so answer engines extract and attribute YOU.
Four pillars: **let the AI crawlers in** (§4A), **feed them clean text** (§4B `llms.txt`),
**describe your entities in schema** (§4C), **write extractable answers** (§4D), and **measure the
AI traffic you earn** (§4E).

---

## 4A. AI-crawler policy — `app/robots.ts` (Tier 1, every site)

A marketing site WANTS to be cited, so it **deliberately allows the AI answer-engine crawlers** —
the bots that read pages to ground and cite answers. Generate `app/robots.ts` that welcomes them,
still blocks `/api/` and sensitive paths, and ships a **documented TOGGLE** to opt out later.

The AI bots to welcome (marketing site default = ALLOW): `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`
(OpenAI), `ClaudeBot`, `anthropic-ai`, `Claude-User`, `Claude-SearchBot` (Anthropic), `PerplexityBot`,
`Perplexity-User` (Perplexity), `Google-Extended` (Gemini/AI Overviews grounding), `Applebot-Extended`
(Apple Intelligence), `CCBot` (Common Crawl — feeds many models), `Bytespider` (TikTok/Doubao).

```ts
// app/robots.ts — marketing site: WELCOME AI answer-engine crawlers so we can be CITED.
import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

// ── AI CRAWLER TOGGLE ──────────────────────────────────────────────────────
// Marketing sites benefit from AI citations, so we ALLOW these by default.
// To OPT OUT (block AI training/answer crawlers), set NEXT_PUBLIC_ALLOW_AI_BOTS="false"
// in .env — every bot below then gets `disallow: '/'`. Default (unset) = allow.
const AI_BOTS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  'ClaudeBot', 'anthropic-ai', 'Claude-User', 'Claude-SearchBot',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider',
]
const ALLOW_AI = env.NEXT_PUBLIC_ALLOW_AI_BOTS !== 'false' // default ON
const BLOCKED = ['/api/', '/admin/', '/draft/'] // never expose these to ANY bot

export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_SITE_URL // e.g. https://acme.com
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: BLOCKED },
      ...AI_BOTS.map((userAgent) =>
        ALLOW_AI
          ? { userAgent, allow: '/', disallow: BLOCKED }
          : { userAgent, disallow: '/' },
      ),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
```

Rules: `NEXT_PUBLIC_ALLOW_AI_BOTS` and `NEXT_PUBLIC_SITE_URL` go in `.env.example` and are READ via
`src/lib/env.ts` (no unread vars). NEVER expose `/api/` or sensitive paths to any bot. The toggle
exists so a privacy-sensitive client can opt out without a code change.

## 4B. `llms.txt` AND `llms-full.txt` — clean text for LLM ingestion (Tier 1, every site)

Per [llmstxt.org](https://llmstxt.org): give models a curated, markdown view of the site so they
ingest the RIGHT content (not a JS-rendered DOM). Ship BOTH, served from `public/` at the root, and
keep them IN SYNC with the real pages (regenerate when copy changes).

- **`/llms.txt`** = a concise INDEX. An `# H1` title, a `>` one-line blockquote summary, then
  `##`-grouped lists of the key pages as `- [Title](url): one-line summary`, plus key links
  (pricing, docs, contact). Short — a map, not the territory.
- **`/llms-full.txt`** = the full primary CONTENT of the key pages concatenated as clean markdown
  (headings, prose, FAQ Q&A, comparison tables, definitions, quotable stats with dates/sources).
  No nav chrome, no boilerplate — just the substance an LLM should quote.

```text
# Acme — Invoicing for freelancers

> Acme turns billable hours into paid invoices in under 60 seconds. Built for solo freelancers
> and small studios who hate admin. Founded 2021, used by 12,000+ freelancers.

## Pages
- [Home](https://acme.com/): What Acme is, who it's for, the core 60-second promise.
- [Pricing](https://acme.com/pricing): Plans from $0 (free) to $19/mo (Pro). No card to start.
- [How it works](https://acme.com/how-it-works): The 3-step flow — track, generate, get paid.
- [FAQ](https://acme.com/faq): Billing, exports, integrations, data ownership.

## Key facts
- Founded: 2021 · Founder: Jane Roe · HQ: Berlin
- Pricing: Free $0 · Pro $19/mo (as of 2026-06)
- Integrations: Stripe, PayPal, QuickBooks

## Links
- [Contact](https://acme.com/contact) · [Status](https://status.acme.com)
```

`llms-full.txt` then expands each page into full markdown sections. Treat both as build artifacts:
every fact must be REAL and match the live page; a number in `llms.txt` that contradicts the page
is debt. Reference them in `<head>` is optional, but they MUST exist as real files at the root.

## 4C. Schema templates — emit ONLY what the page truly is (validate before shipping)

Keep the existing `Organization` / `FAQPage` / `Service` / `Offer`. ADD the richer + entity types
below — each only when the page genuinely is that thing and the data is REAL.

```jsonc
// Organization — site-wide, in <head> of home. Entity depth + E-E-A-T.
// founder / foundingDate / sameAs / contactPoint ONLY if research gave real values — else OMIT.
{ "@context":"https://schema.org","@type":"Organization",
  "name":"Acme","url":"https://acme.com","logo":"https://acme.com/logo.png",
  "foundingDate":"2021",                              // omit if unknown
  "contactPoint":{"@type":"ContactPoint","email":"hello@acme.com","contactType":"customer support"},
  "founder":{"@type":"Person","name":"Jane Roe",      // omit the whole founder block if not real
    "sameAs":["https://www.linkedin.com/in/jane-roe","https://x.com/janeroe"]},
  "sameAs":["https://x.com/acme","https://www.linkedin.com/company/acme","https://github.com/acme"] }
  // sameAs = REAL profile URLs from research, listed CONSISTENTLY on every page → the entity graph
  // AI engines build and TRUST. No real profiles → omit sameAs entirely.
```

```jsonc
// SoftwareApplication — for tools / SaaS / products. AggregateRating ONLY if ratings are REAL.
{ "@context":"https://schema.org","@type":"SoftwareApplication",
  "name":"Acme","applicationCategory":"BusinessApplication","operatingSystem":"Web",
  "offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},
  "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.8","reviewCount":"312"} }
  // ↑ aggregateRating: include ONLY with real, verifiable ratings (e.g. a real G2/Trustpilot score).
  //   No real ratings → DELETE this property entirely. Never invent a score or a count.
```

```jsonc
// BreadcrumbList — on EVERY subpage (not the home root). Helps AI place the page in the site.
{ "@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Home","item":"https://acme.com"},
  {"@type":"ListItem","position":2,"name":"Pricing","item":"https://acme.com/pricing"} ]}
```

```jsonc
// WebSite + SearchAction — ONLY if the site actually HAS a working search endpoint.
{ "@context":"https://schema.org","@type":"WebSite","url":"https://acme.com",
  "potentialAction":{"@type":"SearchAction",
    "target":{"@type":"EntryPoint","urlTemplate":"https://acme.com/search?q={query}"},
    "query-input":"required name=query"} }
  // No real /search route → OMIT this block. Don't claim a search the site doesn't have.
```

```jsonc
// FAQPage — mirror REAL questions/answers from the page. Double duty: AI answers + rich results.
{ "@context":"https://schema.org","@type":"FAQPage","mainEntity":[
  {"@type":"Question","name":"How fast can I send an invoice?",
   "acceptedAnswer":{"@type":"Answer","text":"In under 60 seconds — track hours, click Generate, send."}} ]}
```

```jsonc
// Article / BlogPosting — for blog posts. FRESHNESS: real datePublished + dateModified.
{ "@context":"https://schema.org","@type":"BlogPosting",
  "headline":"How freelancers cut invoicing time by 80%","mainEntityOfPage":"https://acme.com/blog/cut-invoicing-time",
  "author":{"@type":"Person","name":"Jane Roe"},
  "datePublished":"2026-03-01","dateModified":"2026-06-10",
  "publisher":{"@type":"Organization","name":"Acme","logo":{"@type":"ImageObject","url":"https://acme.com/logo.png"}} }
```

**Freshness everywhere:** put real `datePublished` + `dateModified` on pages/articles (and `<lastmod>`
in the sitemap). AI engines prefer fresh, dated facts — an undated claim is a weaker citation.

## 4D. GEO content patterns — what AI engines actually extract (enforce in copy)

This is the citability layer, verified in review and written by `copy`/`brand-voice`:

- **Self-contained answer chunks** — a clear claim + its supporting fact, WITH a real number AND a
  date, together in one passage. *"Acme generates an invoice in under 60 seconds — measured across
  10,000 invoices in Q1 2026."* The model can lift that whole sentence and cite it. A claim whose
  proof sits three paragraphs away is NOT extractable.
- **Comparison tables** — "X vs Y", "best tools for Z". Markdown/HTML tables of options with a few
  honest dimensions. AI engines love structured comparisons and quote them verbatim.
- **FAQ marked up as `FAQPage`** — real questions phrased as users ask them, concise factual answers.
- **Crisp definitions** — "What is X?" answered in one tight sentence near the top.
- **Quotable stats with sources** — a number, a unit, a date, and where it came from. Sourced
  specifics beat hedged prose. Definitive, attributable statements get cited; "may help improve"
  does not.

## 4E. AI-referral analytics — measure the GEO ROI (Tier 2, research-driven)

If the strategy includes analytics, classify traffic arriving FROM AI engines by referrer hostname
and send a GA4 event so the user can SEE AI-sourced traffic. Wire the client snippet (CSP-safe — it
only calls `gtag`, already allowed). Full wiring detail lives in `landing-craft` →
`references/instrumentation.md` §2A; the source-of-truth map:

```ts
// src/lib/ai-referrals.ts — map a referrer hostname to an AI engine source.
export const AI_REFERRERS: Record<string, string> = {
  'chat.openai.com': 'chatgpt', 'chatgpt.com': 'chatgpt',
  'perplexity.ai': 'perplexity', 'www.perplexity.ai': 'perplexity',
  'gemini.google.com': 'gemini', 'bard.google.com': 'gemini',
  'claude.ai': 'claude', 'copilot.microsoft.com': 'copilot',
  'www.bing.com': 'bing-copilot', 'edgeservices.bing.com': 'copilot',
}
export function aiSourceFromReferrer(ref: string): string | null {
  try { return AI_REFERRERS[new URL(ref).hostname] ?? null } catch { return null }
}
```

```tsx
// Fire once on mount (client component mounted in layout). GA4 custom event `ai_referral`.
useEffect(() => {
  const src = aiSourceFromReferrer(document.referrer)
  if (src) window.gtag?.('event', 'ai_referral', { ai_source: src })
}, [])
```

Register `ai_source` as a GA4 custom dimension so the user can segment AI-sourced sessions and
measure GEO ROI. Only ships when analytics ships (research-driven).

## Validate (every block, every page)

- JSON parses; `@type` is a real schema.org type; `@context` is `https://schema.org`.
- **No fabricated `Review`/`AggregateRating`/entity facts** — every value traces to real research.
- Schema reflects what the page ACTUALLY is (no `SoftwareApplication` on an about page, no
  `SearchAction` without a search route).
- Freshness dates present and real on pages/articles + sitemap `<lastmod>`.
- `robots.ts` welcomes AI crawlers (or a documented opt-out toggle is present) and blocks `/api/`.
- `llms.txt` + `llms-full.txt` exist at the root and match the live pages' facts.
- Test rich results (Google Rich Results Test) and run Lighthouse SEO + Performance before done.
