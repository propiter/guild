# Animation Levels — configurable depth (load before the motion phase)

A landing that just fades the hero in is flat. A landing that moves on every pixel is exhausting.
The answer is a **dial**: four intensity levels (default **medium**), each a coherent system — not
random effects. Every level is 60fps (`transform`/`opacity` only) and degrades under
`prefers-reduced-motion`. Pair this with the `motion-craft` skill for the craft rules (easing,
duration, restraint).

## How the level is chosen (research-driven — default up, never down)
- **Default = `medium`.** Start here for everything.
- **Auto-escalate to `rich`** when the niche/brand makes bold motion indispensable — decided in
  strategy/design from brand personality + category: creative/design studios, consumer apps,
  product launches, fashion/lifestyle, entertainment, portfolios, AI/web3-forward brands. Motion is
  part of THEIR story, so reach for `rich` without being asked.
- **Stay at `medium`** for trust-first categories where clarity > spectacle: B2B SaaS, fintech,
  healthcare, legal, enterprise. Motion supports the offer, never dominates it.
- **NEVER auto-drop to `subtle`.** The 5th bar is ALIVE — a dead-quiet landing fails it. Use
  `subtle` ONLY when the user explicitly asks for less at the start (or an a11y/perf mandate).
- **Auto-reach `ultra` ONLY for spectacle-native niches** — where motion IS the product/expectation:
  creative & interactive studios, awwwards-style or experimental portfolios, web3/gaming/generative-
  art, immersive product launches. For everything else `ultra` is explicit-only — it's easily
  *recargada* (overloaded), so never reach for it as a generic "more is better". The guardrails in
  its section are non-negotiable at every use.
- A saved user preference (below) overrides this rule. Reduced-motion is honored at every level.

## The stack (Next.js + Tailwind — researched, current)

| Tool | Role | When |
|------|------|------|
| **Motion** (`motion`, ex–Framer Motion) | Declarative React enter/exit, layout, gestures, `useScroll` | Default for React/Next — every level |
| **GSAP** (free, all plugins) + ScrollTrigger | Scroll-scrub, pinning, timelines, SVG | medium (light) → rich |
| **Lenis** (`lenis`) | Buttery smooth-scroll momentum (doesn't break sticky) | medium → rich (the "premium feel") |
| **Aceternity UI** / **Magic UI** (copy-paste, Tailwind + Motion) | Pro effects: 3D cards, magnetic buttons, spotlight, animated beams, aurora/grid backgrounds | rich (pick 1–2, don't dump) |
| **Three.js / React-Three-Fiber**, shaders, **Rive**, custom cursor | WebGL/moving backgrounds, cursor-driven scenes, scroll-3D | `ultra` ONLY — lazy-loaded, mobile-degraded |
| `tailwindcss-motion` | 5KB CSS utilities for simple reveals | subtle, or as fallback |

Install only what the chosen level needs (per-project deps, never global). The **tokens stay in
`tailwind.config`** — animations reference Tailwind theme values, never hardcoded hex/px.

## Level 0 — `subtle` (menos) — explicit request only, NEVER auto-selected
Quiet and fast. Use ONLY when the user asks for less motion at the start, or an accessibility /
performance mandate requires it. For tools, dashboards, conservative B2B.
- Hero: one staggered reveal (headline → sub → CTA), `ease-out-expo`, 40–60ms step.
- Scroll: fade + small `translateY` on section enter, once (Motion `whileInView`, `once:true`).
- Interactive: button `:active` scale(0.97), hover color/underline. Visible focus rings.
- **No** smooth-scroll, no parallax, no scroll-scrub. Reduced-motion ≈ already minimal.

## Level 1 — `medium` (DEFAULT) ← start here
Premium and alive without shouting. The everyday "this feels designed".
- Everything in `subtle`, **plus**:
- **Lenis smooth scroll** (the single biggest "premium" upgrade for the cost).
- **Card hover depth** — lift (`translateY(-4px)`), border/glow shift, subtle `scale(1.01)`, content
  reveal (an arrow slides in, a stat counts up). This is the "cards que al pasar el mouse animan".
- **Section reveals with movement** + light stagger across grids (60–80ms).
- **Number counters** on metrics (count up on scroll-in), animated underlines on nav/links.
- **CTA emphasis** — a soft animated gradient border or glow pulse on the ONE primary CTA.
- **Light pointer interaction** — a magnetic pull or hover-follow glow on the ONE primary CTA, or a
  soft spotlight that tracks the cursor on the hero card. ONE element only — pointer flair belongs
  here at a whisper; full cursor-driven scenes live in `ultra`.
- Optional one **GSAP scroll-scrub** moment (e.g. the hero product panel parallax).

## Level 2 — `rich` (más / muchas animaciones) — AUTO-selected for bold/creative niches
The spectacle tier — for marketing/launch pages that must stop the scroll. Reach for this WITHOUT
being asked when the brand is bold/creative/consumer/launch/portfolio (see "How the level is chosen").
- Everything in `medium`, **plus** (pick 2–4, curated — not all at once):
- **Magnetic buttons** & **3D tilt cards** (Aceternity), **spotlight / animated beams / aurora or
  retro-grid backgrounds** (Magic UI) — copy-paste, already Tailwind+Motion.
- **GSAP scroll-scrubbed sequences**: pinned sections, horizontal scroll, step-through reveals,
  SVG draw-on (the network-nodes motif animating node-by-node).
- **Parallax layers**, depth on the hero, image clip-path reveals on scroll.
- Optional Lottie/Rive for one hero illustration; particles only if on-brand.
- Still 60fps, still one signal per viewport — richness ≠ chaos. Curate, don't carpet-bomb.

## Level 3 — `ultra` (experimental) — auto ONLY for spectacle-native niches, else explicit
The maximal tier — for creative & interactive studios, experimental/awwwards portfolios, launches,
web3/gaming/generative-art brands that WANT to be a spectacle. For THOSE niches, where motion IS the
product, the design phase may select `ultra` on its own; for every other niche it's explicit-only.
Everything in `rich`, **plus** (curate HARD — 1–2 hero moments, never everywhere):
- **Moving backgrounds**: animated WebGL/shader gradients, particle/aurora fields, flowing mesh, or
  grids that react to scroll or cursor.
- **Cursor-driven scenes**: a custom cursor, trailing/following elements, hover-warped imagery, a
  spotlight that reveals content, magnetic everything.
- **Scroll-driven canvas/3D**: pinned scroll-storytelling, image-sequence scrub, light Three.js /
  React-Three-Fiber or Rive scenes, horizontal-scroll chapters.

**Guardrails (non-negotiable — this is exactly where landings turn tacky and slow):**
- **Core Web Vitals stay GREEN** — lazy-load the heavy scene, never block LCP, cap main-thread cost.
- **`prefers-reduced-motion` collapses `ultra` down to a calm `medium`.**
- **It must STILL sell** — never bury the offer or the CTA under the spectacle. If the motion
  competes with the message, it's wrong. Ultra is seasoning, not the meal.
- **Mobile gets a lighter variant** — heavy WebGL/cursor effects degrade or disable on touch/low-power.

## The intensity is REMEMBERED
Read the user's saved preference at intake (engram `landing-craft/style-profile`,
`animation_intensity`). A saved preference **overrides** the auto-rule above; otherwise apply "How the
level is chosen". Don't re-ask every time. If the user says "más/menos animaciones", "siempre con
muchas", or asks for `ultra`, **update the profile** so it sticks across future landings.

## reduced-motion at EVERY level (non-negotiable)
`@media (prefers-reduced-motion: reduce)` (or Motion's `useReducedMotion()`): keep opacity/colour
fades that aid comprehension; drop movement, parallax, scroll-scrub, magnetic/tilt, counters→snap to
final. A rich landing must still be calm for users who asked for less motion.

## Anti-slop guardrails (carry over from motion-craft)
- Move only `transform`/`opacity`. Custom easing, not weak defaults. Interactive < 300ms.
- One orchestrated signal per viewport. Don't animate high-frequency actions. Never scroll-jack
  (Lenis ≠ scroll-jacking; it smooths, it doesn't hijack speed/direction).
- Run `motion-craft`'s scanner before sign-off; respect the contrast gate after motion is added
  (hover/focus states must still clear AA).
