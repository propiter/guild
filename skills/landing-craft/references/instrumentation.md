# Instrumentation — leave it production-ready (analytics, consent, forms, sitemap/robots)

A landing that can't measure or convert is half-built. Wire all of this so the user only has to drop
in their IDs. Use env vars for IDs (placeholders the user fills) — never hardcode account IDs.

## The Wiring Contract
**Build only what the research + architecture decided to include — but whatever you include MUST be
fully wired. A declared thing that does not work is debt.** Scaffolding without implementation is
forbidden: adding an env var, a `<form>`, or an asset reference and stopping does NOT count as done.

This is research-driven, not a checklist. **NOT every page needs a form or analytics** — the
architecture decides what exists. The contract only governs what EXISTS: it enforces COHERENCE
between what was declared/built and what actually functions. If architecture decided a page has no
form, there is nothing to wire there. If it decided GA + a lead form, those must be fully wired.

If a thing is present, it MUST function:
- **Every CTA resolves to a REAL destination** — a route, an anchor to a real on-page section, a
  signup/booking URL, or a working form. NEVER `href="/"` or `href="#"` as a dead loop.
- **Every `<form>` submits to a real endpoint** with success/error states — no decorative forms.
- **Every var in `.env.example` is READ by code somewhere.** An unread var is debt → wire it or
  remove it.
- **Every referenced asset** (`og:image`, favicon, any `<img src>`) EXISTS as a generated file —
  never reference a file you didn't create.
- **Analytics/consent, IF the strategy calls for them, are ACTUALLY injected/mounted** (the
  component is in the rendered DOM), not just an env var.

## 1. Analytics — GA4 and/or Google Tag Manager (ship READY; the ID is a POST-LAUNCH step)
**Ship the site analytics-READY, but the real Measurement ID is a post-launch user step** (see
"§1B Analytics is a post-launch step"). At build you wire the component **env-gated** (renders only
when the ID is set); the site launches fine with the ID empty.

**Use the official, SERVER-RENDERED integration — NEVER a `useEffect` injector.** On Next.js use
`@next/third-parties/google` (or `next/script` with `strategy="afterInteractive"`). A hand-rolled
`useEffect` that appends a `<script>` is unreliable — wrong hydration timing, never in the SSR HTML,
easy to miss — and is exactly what makes "GA shows nothing". **One analytics implementation only.**

```tsx
// app/layout.tsx
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
// ...inside <body>, after children (renders nothing until the ID exists):
{process.env.NEXT_PUBLIC_GTM_ID && <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />}
{process.env.NEXT_PUBLIC_GA_ID  && <GoogleAnalytics  gaId={process.env.NEXT_PUBLIC_GA_ID} />}
```

- Prefer **GTM** when the user will manage many tags (ads pixels, etc.); **GA4 directly** for just
  analytics. Wire BOTH behind env so the user picks.
- Env: `NEXT_PUBLIC_GA_ID` (`G-XXXX`), `NEXT_PUBLIC_GTM_ID` (`GTM-XXXX`). EMPTY placeholders in
  `.env.example`; document in the README. **These are inlined at BUILD time → they must live in
  Vercel (not just `.env.local`), or production ships without analytics.** The deploy phase syncs
  them; a redeploy is what activates them.

## 1B. Analytics is a POST-LAUNCH step — guide the user, don't block the launch
The site does NOT need a GA ID to ship — analytics is a 2-minute follow-up the user does AFTER the
landing is live (a separate iteration). At hand-off, tell them plainly, step by step:
1. Create a **GA4 property** at analytics.google.com → copy the **Measurement ID** (`G-XXXXXXXXXX`).
   (Or a GTM container ID `GTM-XXXXXXX`.)
2. Send it to me — I add `NEXT_PUBLIC_GA_ID` to `.env.local` **and Vercel**, then redeploy.
3. To verify: open the live site, **accept the cookie banner** (Consent Mode v2 starts denied, so
   GA only sends full data after consent), then watch **GA4 → Realtime**.
Never fake or guess an ID, and never fail the build/review just because analytics isn't connected yet
— it's expected to be empty at launch.

## 2. Conversion tracking — the CTA is the whole point
Fire an event on the primary CTA so the user can see conversions:
```tsx
onClick={() => window.gtag?.('event', 'generate_lead', { cta: 'hero_agendar' })}
```
Track the form submit and any signup/booking too. Name events consistently.

## 2A. AI-referral tracking — measure GEO ROI (ships with analytics)
When analytics ships, also classify traffic arriving FROM AI answer engines (the GEO payoff) so the
user can SEE it. Map `document.referrer`'s hostname to a source and fire a GA4 custom event:

```ts
// src/lib/ai-referrals.ts
export const AI_REFERRERS: Record<string, string> = {
  'chat.openai.com': 'chatgpt', 'chatgpt.com': 'chatgpt',
  'perplexity.ai': 'perplexity', 'www.perplexity.ai': 'perplexity',
  'gemini.google.com': 'gemini', 'bard.google.com': 'gemini',
  'claude.ai': 'claude', 'copilot.microsoft.com': 'copilot',
}
export function aiSourceFromReferrer(ref: string): string | null {
  try { return AI_REFERRERS[new URL(ref).hostname] ?? null } catch { return null }
}
```
```tsx
// client component mounted in layout.tsx — fires once on mount
useEffect(() => {
  const src = aiSourceFromReferrer(document.referrer)
  if (src) window.gtag?.('event', 'ai_referral', { ai_source: src })
}, [])
```
Register `ai_source` as a GA4 custom dimension. CSP-safe — it only calls the already-allowed `gtag`.
Full GEO rationale + the hostname list: `seo-geo` → `references/checklist.md` §4E.

## 3. Consent (GDPR/cookies) — required with analytics/ads
Ship a small **cookie-consent banner** and gate non-essential tags behind it (Google **Consent
Mode v2**: default denied → granted on accept). Keep essential cookies working without consent. Don't
load ad/analytics scripts before consent in EU traffic.

## 4. Forms that actually work — not decorative
*(Only if the architecture called for a form. If it didn't, skip this — nothing to wire.)*

A contact/lead form must submit somewhere real, and be **testable the moment it ships** — never dead
out of the box. Ship a **working default**: the form posts to an internal Next.js route handler
(`app/api/contact/route.ts`) that FORWARDS to the user's endpoint if one is set, and otherwise
accepts the submission and returns success in a "test mode". The form is NEVER dead by default.

```ts
// app/api/contact/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const data = await req.json()
  const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT
  if (endpoint) {
    // Real endpoint configured → forward the submission (n8n / Formspree / Web3Forms / etc.).
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 })
    return NextResponse.json({ ok: true })
  }
  // No endpoint yet → test mode: accept and succeed so the form is never dead.
  return NextResponse.json({ ok: true, testMode: true })
}
```

The form `POST`s to `/api/contact` by default. Validate, show success/error states, honeypot for
spam. **The user sets their real endpoint via `NEXT_PUBLIC_FORM_ENDPOINT` in `.env` (or the Vercel
dashboard) and a redeploy picks it up** — no code change needed. In `.env.example`, use a GENERIC
placeholder (e.g. `https://your-n8n-or-formspree-endpoint.example/webhook`) — NEVER a real or
private URL. Never leave a `<form>` that goes nowhere.

## 5. SEO + GEO infrastructure (Next App Router)
- `app/sitemap.ts` → generate `sitemap.xml` for ALL pages (incl. blog posts), with `lastModified` dates.
- `app/robots.ts` → `robots.txt` that **deliberately welcomes the AI answer-engine crawlers**
  (`GPTBot`/`ClaudeBot`/`PerplexityBot`/`Google-Extended`/`CCBot`/…) so the site can be CITED, with a
  documented opt-out toggle, still blocking `/api/` + sensitive paths (per `seo-geo` §4A).
- Per-page `metadata` (title/description) + canonical; OG/Twitter image (generate via `web-assets`).
- JSON-LD per page, richer + entity-deep, REAL DATA ONLY (Organization with founder/`sameAs` /
  SoftwareApplication / FAQPage / BreadcrumbList / WebSite+SearchAction / Article for posts) with
  freshness `datePublished`+`dateModified`. NEVER fabricate Review/rating/entity facts (per `seo-geo`).
- `llms.txt` + `llms-full.txt` at the root for AI-search ingestion + citation (per `seo-geo` §4B).

## 6. Performance & misc to leave ready
- Analytics/scripts load after interactive (`@next/third-parties` handles this) — don't block LCP.
- `favicon` + PWA icons + `apple-touch-icon` (via `web-assets`), `theme-color`, `manifest.json`.
- A `404`/`not-found` page on brand.
- `.env.example` listing every var — and **every var in it must be READ by code somewhere** (an
  unread var is debt). README documents what the user must fill (GA/GTM IDs, form endpoint via the
  generic `https://your-n8n-or-formspree-endpoint.example/webhook` placeholder, production URL for
  canonical).

## Output
The SEO + analytics + consent + forms are all wired behind env placeholders, and `.env.example` +
the README tell the user exactly what to fill. Whatever the architecture decided to include WORKS;
nothing is left as a dead stub or an unread var.
