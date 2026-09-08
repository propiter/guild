# Alive, not generic — what makes a landing feel made-by-humans (load with design + motion)

A landing can pass every contrast/conversion check and still feel **dead** — "pretty but generic,
made-with-AI". The four bars catch *broken*; they don't catch *soulless*. This is the fifth bar:
**does it have a vibe — a sense that a specific brand, made by people who care, built this?**

## The diagnosis: why "competent dark SaaS" reads as AI-made

The most common failure (a competent "dark SaaS" build): technically clean, but:
- **No real imagery** — just text + a fake UI panel on a dark gradient. The eye has nothing
  tangible or human to land on.
- **Monochromatic & cold** — one dark hue + one accent. No warmth, no colour story, no contrast pop.
- **The "AI-SaaS template" aesthetic** — dark navy + a teal/violet accent + a faint dot grid +
  mono labels. It's the *default look of AI output now*. Craft can't save a generic concept.
- **Predictable structure** — hero → 3 cards → steps → CTA, in textbook order. No surprise.
- **Decorative, one-shot motion** — a single fade-up on load and nothing reacts after.

Feeling = cold, corporate, forgettable. Fix the *concept*, not the polish.

## What the alive ones actually do (analysed, not guessed)

- **LangGraph** (dark, technical — like ours, but alive): a **custom animated conceptual hero
  graphic** (flowing agent-graph lines) that *is* the product idea, plus generous space and one
  blue gradient that breathes. Life comes from a **signature moving visual**, not a UI mock.
- **Zola** (warm consumer): **real human photography**, a warm teal brand colour, tangible product
  cards, a **bento grid** of varied sizes, emotional copy ("from 'save the date' to 'thanks so
  much'"). Life from **humanity + warmth + real images**.
- **Estarter** (LATAM B2B): **real product photos** (the actual vehicles) on branded colour blobs
  for depth, bright and clean — and **the vehicles slide IN as you scroll**. Life from **real
  product imagery + scroll-reactive motion**.
- **Netflix / Amazon**: real content/product imagery wall-to-wall, motion on hover and scroll,
  colour and density. Never abstract.

## The principles (apply every one)

### 1. Real, specific imagery is non-negotiable — the #1 differentiator
Every landing needs tangible visuals: **real product screenshots, photography (human faces where it
fits), a custom conceptual graphic/illustration, or a signature animated hero.** NEVER ship "text +
a generic UI mock on a dark gradient". If assets don't exist, propose them (and generate
placeholders with intent), don't default to abstraction. *For a B2B infra/automation product: real
photos of the team working, an actual dashboard, or a custom animated "orchestration" graphic — like
LangGraph's — instead of a faux chat panel.*

### 2. A signature visual idea — one thing that's THIS brand, not a template
Pick one distinctive concept and run it through the page (LangGraph's flowing graph, Zola's teal +
photography, Estarter's blue blobs). If the hero could belong to any AI-SaaS, it's generic.

### 3. Colour & warmth with intent — escape monochrome
Don't default to dark-navy + one accent. Use a real palette with warmth, contrast, and a pop or
two. Even dark sites need a living gradient/colour moment. Light, bright, and warm is often MORE
distinctive than dark right now (dark = the AI default).

### 4. Scroll-reactive, story-driven motion — the page responds as you move
THE big one for "vibe". Elements should **enter with direction and life as you scroll**, not a
single load-fade:
- **Directional reveals** — sections/cards slide in from the side, images enter from off-screen
  (Estarter's vehicles), staggered per item — tied to scroll position (Motion `whileInView` with
  `x`/`y`, or GSAP ScrollTrigger).
- **Parallax & depth** — background/foreground move at different rates; a hero visual drifts as you
  scroll.
- **Scroll-scrubbed sequences** — a diagram draws itself, numbers count, a product rotates, pinned
  sections step through — progress tied to scroll (GSAP ScrollTrigger `scrub`).
- **Smooth momentum scroll** (Lenis) under it all — the single biggest "premium feel" upgrade.
- Always `prefers-reduced-motion` safe; never scroll-jack (smoothing ≠ hijacking).
*(See `craft-core/references/animation-levels.md` — this is the heart of the `medium`/`rich` tiers.)*

### 5. Unexpected, varied sections — break the template
Bento grids, oversized display type, asymmetric splits, an interactive demo, a horizontal-scroll
band, a full-bleed image moment, a marquee of logos. Vary rhythm and section shape. Predictable
order is the tell.

### 6. Emotional, human copy — connect, then inform
Lead with what the reader *feels/wants*, in their voice, before the feature list. A line of
personality or a bold claim beats a tidy value-prop. (Pairs with `brand-voice`.)

## The vibe test (run it before sign-off, alongside the contrast/conversion gates)
1. Cover the logo — could this hero belong to any other AI-SaaS? If yes → generic, redo the concept.
2. Is there at least one **real image** (product/photo/custom graphic) above the fold? If no → dead.
3. As you **scroll**, does the page *respond* (things enter, move, react)? If it's static → dead.
4. Is there **warmth or colour contrast**, or is it one cold hue? One hue → cold.
5. Does one **signature moment** make it memorable? If nothing → forgettable.

If it fails the vibe test, it doesn't ship — even if it passes everything else.
