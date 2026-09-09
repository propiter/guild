---
description: "The flagship — one prompt to a deployed, market-current, multi-page site. The skill LEADS: it researches, builds, and deploys autonomously, init → product. Hands you a live URL."
argument-hint: "<lo que querés, ej: 'una landing para mi SaaS'>"
---

Run the full **landing-craft** DEEP flow for: **$ARGUMENTS**

Load the `landing-craft` skill. You are the **product lead** — do NOT interrogate the user
(see `references/_conventions.md`). Run EVERYTHING autonomously, end to end, from init to the
deployed product, delegating each phase to its sub-agent and passing artifacts forward:

1. **init** — `surveyor`: detect env + tooling (Firecrawl, Vercel, gh, Next.js), bootstrap `landing/`.
2. **research** — `cartographer`: scrape product + competitors, keywords/intent, audience drivers, alive refs, the GAP.
3. **strategy** → **architecture** (multi-page map + unique per-theme sections) → **copy** → **design**.
4. **build** (multi-page Next.js + Tailwind) → **motion** (scroll-reactive) → **polish**, with **seo** off the build.
5. **review** — score the FIVE bars + the contrast gate; loop until PASS (max 3).
6. **deploy** — `courier`: GitHub + Vercel (preview by default), installs the CLI + guides the one-time login.

Enforce the FIVE bars at every phase (not-AI-looking · sells · intuitive · crafted · **ALIVE**) and
**zero technical debt** (fix anything you find, keep going). Finish with the live URL + the pages
built + the positioning angle, and "approve → I promote to production".
