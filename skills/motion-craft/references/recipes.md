# Motion Craft — Recipes (load on demand)

Production patterns to copy. Every recipe moves only `transform`/`opacity` and degrades under
`prefers-reduced-motion`. Libraries are **per-project npm deps**, never global installs.

## Install (per project)

| Tool | Install | Import |
|------|---------|--------|
| Motion (React, ex–framer-motion) | `npm i motion` | `import { motion, AnimatePresence } from "motion/react"` |
| GSAP | `npm i gsap` | `import gsap from "gsap"; import { ScrollTrigger } from "gsap/ScrollTrigger"` |
| Lottie | `npm i lottie-web` or `@lottiefiles/dotlottie-web` | per docs |
| CSS / View Transitions | — native — | nothing to install |

## Easing tokens (paste once, reuse everywhere)

```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.30, 1);
  --ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1);
  --ease-drawer:   cubic-bezier(0.32, 0.72, 0, 1);
  --dur-press: 120ms;
  --dur-ui:    220ms;
  --dur-hero:  600ms;
}
```

## Accessibility wrapper (always on)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

In Motion: `const reduce = useReducedMotion()` → keep opacity, drop transforms.

## CSS — the first rung

```css
/* Press feedback */
.button { transition: transform var(--dur-press) var(--ease-out-expo); }
.button:active { transform: scale(0.97); }

/* Enter on mount, no JS, modern way */
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity var(--dur-ui) var(--ease-out-expo),
              transform var(--dur-ui) var(--ease-out-expo);
  @starting-style { opacity: 0; transform: translateY(8px); }
}

/* CSS-only staggered reveal (no JS) */
.reveal { opacity: 0; transform: translateY(16px);
          animation: rise var(--dur-hero) var(--ease-out-expo) forwards; }
.reveal:nth-child(2) { animation-delay: 60ms; }
.reveal:nth-child(3) { animation-delay: 120ms; }
.reveal:nth-child(4) { animation-delay: 180ms; }
@keyframes rise { to { opacity: 1; transform: none; } }
```

## Motion (React) — the workhorse

```jsx
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

// Enter on load
<motion.h1
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.30, 1] }}
/>

// Staggered list — highest impact, lowest cost "premium" cue
<motion.ul initial="hide" animate="show"
  variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
  {items.map((i) => (
    <motion.li key={i.id}
      variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} />
  ))}
</motion.ul>

// Reveal on scroll into view, once
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-15%" }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.30, 1] }}
/>

// Exit needs AnimatePresence (and should be faster than enter)
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.30, 1] }} />
  )}
</AnimatePresence>

// Press/hover micro-interaction + interruptible spring on layout
<motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} />
<motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} />
```

## GSAP — timelines, scroll-scrub, pinning

```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// Orchestrated hero with overlap
const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.6 } });
tl.from(".hero-title", { y: 40, opacity: 0 })
  .from(".hero-sub",   { y: 24, opacity: 0 }, "-=0.35")
  .from(".hero-cta",   { scale: 0.9, opacity: 0 }, "-=0.25");

// Scroll-scrub with pin (CSS can't do this)
gsap.to(".panel", {
  yPercent: -100,
  scrollTrigger: { trigger: ".panel", scrub: true, start: "top top", end: "+=100%", pin: true },
});

// Respect reduced motion
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.set("[data-animate]", { clearProps: "all" });
}
```

## View Transitions API — native morphs, zero deps

```js
// Same-document state change — browser cross-fades / morphs matched elements
if (document.startViewTransition) {
  document.startViewTransition(() => updateTheDOM());
} else {
  updateTheDOM(); // graceful fallback
}
```

```css
/* Name the elements that should morph between states/pages */
.hero-image { view-transition-name: hero; }

/* Cross-document (MPA) — opt in, no JS */
@view-transition { navigation: auto; }

/* Reduced motion: the browser still swaps, just instantly */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation: none; }
}
```

## Web Animations API (WAAPI) — JS control, compositor performance

```js
el.animate(
  [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
  { duration: 600, fill: "forwards", easing: "cubic-bezier(0.16,1,0.30,1)" }
);
```

## Lottie — designer-authored vector animation

```js
import { DotLottie } from "@lottiefiles/dotlottie-web";
const dot = new DotLottie({ canvas, src: "/anim.lottie", autoplay: true, loop: false });
// Pause for users who asked for less motion
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) dot.pause();
```

## Rules baked into every recipe above

- Move only `transform`/`opacity`. `cubic-bezier(.16,1,.3,1)` (expo-out) reads premium for entrances.
- Exits are shorter than entrances. Never `ease-in` on something appearing.
- One orchestrated hero beats scattered micro-animations.
- Every recipe degrades under `prefers-reduced-motion` — no exceptions.
