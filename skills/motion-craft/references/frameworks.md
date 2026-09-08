# Framework Matrix (load on demand)

The craft rules are universal; the *idioms* differ. Pick the lightest tool the stack offers
before reaching for a library.

| Stack | Default for simple motion | Enter/exit & gestures | Orchestration / scroll | Reduced motion |
|-------|---------------------------|-----------------------|------------------------|----------------|
| **Vanilla CSS/JS** | `transition` + `@starting-style` | WAAPI (`el.animate`) | GSAP, or `scroll()`/`view()` timelines | `@media (prefers-reduced-motion)` + `matchMedia` |
| **React / Next.js** | CSS Modules / Tailwind transitions | **Motion** (`motion/react`) + `AnimatePresence` | GSAP, or Motion `useScroll` | `useReducedMotion()` |
| **Vue / Nuxt** | `<Transition>` / `<TransitionGroup>` | `<Transition>` + CSS, or Motion-V | GSAP | `usePreferredReducedMotion()` (VueUse) |
| **Svelte** | `transition:` directives (`fade`, `fly`) | built-in `crossfade` / `flip` | GSAP | `prefers-reduced-motion` store |
| **Astro** | CSS + **View Transitions** (first-class) | `transition:animate` | island + GSAP where needed | media query |
| **SwiftUI / RN / Flutter** | platform animation APIs | platform spring/gesture | platform timelines | system "reduce motion" flag |

## Cross-stack rules that never change
- Move only `transform` / `opacity` for anything that animates position or fades.
- Keep interactive UI under ~300ms; exits faster than entrances.
- Custom easing curves over built-in keywords (see `easing-library.md`).
- Every animation degrades under reduced motion — no exceptions.

## React / Motion idioms worth memorizing
```jsx
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const reduce = useReducedMotion();
<motion.div
  initial={reduce ? false : { opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.30, 1] }}
/>
```
`AnimatePresence` is required for exit animations. `layout` / `layoutId` give you FLIP morphs
for free. Prefer `transform` strings over `x`/`y` shorthands when the page may be busy.

## Astro note
Astro ships View Transitions as a first-class primitive (`<ClientRouter />` + `transition:*`
directives). Reach for JS libraries only when you need scrubbing or complex timelines.
