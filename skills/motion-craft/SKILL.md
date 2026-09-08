---
name: motion-craft
description: "Trigger: web animation, motion design, micro-interactions, transitions, hover/press/scroll effects, page reveals, route/view transitions, Framer Motion / Motion, GSAP + ScrollTrigger, Lottie, easing curves, spring physics, prefers-reduced-motion, 60fps. Two modes — BUILD motion (pick the right tool and ship it with craft) and REVIEW motion (audit existing animation against a checklist)."
license: Apache-2.0
metadata:
  author: propiter
  version: "2.1.0"
---

# Motion Craft

Animation is not decoration you sprinkle at the end. It is how an interface explains
itself: where things come from, where they go, and whether the software heard you. This
skill makes two decisions well — **which tool** to reach for, and **how to ship the motion
with restraint, 60fps, and accessibility baked in.**

## Two Modes

Detect intent from the request and pick a mode. If unclear, ask which one.

- **BUILD** — "add an animation", "animate this", "make this feel premium", "transition between X and Y". Use the Tool Decision Gate, then the craft rules.
- **REVIEW** — "review my animations", "why does this feel janky/cheap/slow", "audit this motion". Skip straight to the **Review Mode** section and return the audit table.

When invoked with no specific task, respond only with one line: *"Motion Craft ready — tell me what to animate, or point me at code to review."* Do not dump the whole skill.

## The First Question: should it move at all?

Most motion problems are solved by deleting the motion. Before anything else, weigh how
often the user sees it against what the motion *earns*:

- **Seen constantly** (keyboard shortcuts, command palette, a toggle hit 100× a day) → **no animation.** Repetition turns delight into drag. Instant is the premium experience here.
- **Seen often** (hovers, list navigation, tab switches) → minimal and fast, or none.
- **Occasional** (modals, drawers, toasts, dropdowns) → standard, purposeful motion. This is the sweet spot.
- **Rare / first-run** (onboarding, success states, empty states) → you can afford delight.

Then demand a reason. Every animation must answer **"what does this communicate?"** Valid
answers: *orientation* (where did this come from / go to), *feedback* (the click registered),
*continuity* (don't pop things in and out — bridge the change), *explanation* (show how a
feature works). "It looks cool" is only a valid reason for rare, first-run moments. Everywhere
else, cool-for-its-own-sake is friction wearing a nice coat.

## Tool Decision Gate

Climb this ladder only when the rung below genuinely can't express what you need. Reaching
for a JS library when a CSS transition would do is the most common over-engineering in motion.

| Need | Reach for | Don't |
|------|-----------|-------|
| Hover, focus, press, simple state/colour change | CSS `transition` | A JS animation lib (overkill, ships bytes for nothing) |
| Element enter/exit on mount, no JS state | CSS `@starting-style` + `transition` | A `useEffect(setMounted)` dance, if support allows |
| Enter/exit tied to React state, layout shift, gestures | **Motion** (`motion/react`, ex–Framer Motion) | Hand-rolled refs + `setState` keyframes |
| Same-page or cross-page element morph | **View Transitions API** | Heavy JS when the platform does it natively |
| Orchestrated timeline, scroll-scrub, pinning, SVG draw/morph, sequencing | **GSAP** (+ ScrollTrigger) | CSS — it can't orchestrate or scrub |
| Designer-authored vector animation (After Effects export) | **lottie-web / dotLottie** | Rebuilding it by hand and losing fidelity |

**Default ladder: CSS → View Transitions → Motion → GSAP.** Lottie is sideways — only for AE
exports. The code for each lives in `references/recipes.md`; load it when you actually write.

## Easing — the single biggest lever on "feel"

Easing decides whether motion feels intentional or accidental. The browser defaults
(`ease`, `ease-in`, `ease-out`) are weak — they lack the punch that reads as crafted. Define
custom curves and reuse them as tokens.

```css
:root {
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.30, 1);   /* entrances: snaps in, settles soft */
  --ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1);   /* on-screen movement / morph */
  --ease-drawer:    cubic-bezier(0.32, 0.72, 0, 1);   /* iOS-ish sheets & drawers */
}
```

Pick the curve by what the element is doing:

| Situation | Curve | Why |
|-----------|-------|-----|
| **Entering / appearing** (modal, toast, dropdown opens) | `ease-out` (custom) | Starts fast → instant response at the exact moment the eye is on it |
| **Moving / morphing** on screen (reorder, resize, layout) | `ease-in-out` | Real objects accelerate then decelerate |
| **Leaving the viewport entirely** (slide fully off-screen) | `ease-in`, **and faster than the entrance** | Acceleration *away* reads as "gone"; fine ONLY when it fully exits |
| Hover / colour change | short `ease` or `ease-out` | Tiny, doesn't need character |
| Continuous (spinner, marquee, progress) | `linear` | Constant motion must be constant |

**The hard rule: never `ease-in` on anything the user is waiting to see or interact with.**
`ease-in` delays the visible start, so a dropdown opening with `ease-in` *feels* slower than
the same duration with `ease-out`, even though the clock says otherwise. `ease-in` is allowed
in exactly one place: an element accelerating completely off-screen.

## Duration — fast, with intent

| Element | Duration |
|---------|----------|
| Press / tap feedback | 80–150 ms |
| Hover | 100–200 ms |
| Tooltips, small popovers | 120–200 ms |
| Dropdowns, menus, selects | 150–250 ms |
| Modals, drawers, sheets | 200–350 ms (exits ~30% faster) |
| Page / hero reveal | 400–700 ms (marketing/explanatory can run longer) |

**Keep interactive UI under ~300 ms.** Two craft details that punch above their cost:
*exits are quicker than entrances* (the user already decided — get out of the way), and
*perceived speed beats real speed* — a snappier spinner makes a load feel faster even when the
millisecond count is identical.

## Springs — for motion that can be interrupted

Springs simulate physics, so they have no fixed duration — they settle. Their superpower is
**interruptibility**: a spring keeps its velocity when you reverse it mid-flight, while a CSS
keyframe restarts from zero. Use them for drag/gesture, anything "alive", and interactions a
user can change halfway.

```jsx
// Motion (motion/react)
transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}   // Apple-style — easier to reason about
transition={{ type: "spring", stiffness: 300, damping: 30 }}  // classic physics — more control
```

Keep `bounce` subtle (0.1–0.3) and reserve it for playful or drag-to-dismiss moments. Bounce
on a professional dashboard reads as toy-like. **Match the motion to the product's mood.**

## Non-negotiable rules

1. **Animate only `transform` and `opacity`** for anything that moves or fades. They are
   GPU-composited — they skip layout and paint. Animating `width`, `height`, `top`, `left`,
   `margin`, or `padding` triggers reflow and drops frames. Move with `translate()`/`scale()`.
2. **Honor `prefers-reduced-motion: reduce`** — always. Reduced does NOT mean *none*: keep
   opacity/colour transitions that aid comprehension, drop the movement (translation, scale,
   parallax, spin). This is accessibility, not a nice-to-have.
3. **Restraint.** One orchestrated hero moment beats ten scattered micro-animations. Motion
   directs attention; if everything moves, nothing is signal.
4. **Never animate from `scale(0)`.** Nothing in the real world appears from a literal point.
   Start at `scale(0.95)` paired with `opacity` so the entrance has a shape.

## Micro-interactions & components

- **Pressables feel responsive** when they react to touch: `:active { transform: scale(0.97) }`
  with a ~120 ms `ease-out`. Subtle (0.95–0.98), but the UI now "listens".
- **Popovers scale from their trigger, not their center.** Default `transform-origin: center`
  is wrong for anything anchored. With Radix/Base UI, bind it to the provided CSS variable
  (e.g. `var(--radix-popover-content-transform-origin)`). **Modals are the exception** — they
  aren't anchored, so they stay centered.
- **Stagger grouped entrances** by 40–80 ms per item for a cascade that feels alive without
  feeling slow. Stagger is decorative — never block interaction while it plays.
- **Mask imperfect crossfades with a touch of `blur`** (≤ 8 px) during the transition so the
  eye reads one morph instead of two overlapping states. Heavy blur is expensive, especially
  in Safari.

## Performance

- **CSS / WAAPI run off the main thread; JS `requestAnimationFrame` does not.** When the page
  is busy (loading, hydrating, painting), JS-driven motion drops frames while CSS stays smooth.
  Use **CSS or the Web Animations API for predetermined motion**, JS libs for dynamic/interruptible.
- **`will-change` is a loan, not a gift.** It promotes an element to its own layer; leave it on
  everything and you blow the memory budget. Apply right before the animation, remove after.
- In Motion, the shorthand `x`/`y`/`scale` props are convenient but go through the main thread.
  For motion that must survive jank, animate the full `transform` string.

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
/* Then re-enable gentle, comprehension-aiding fades deliberately where needed. */
```

Gate hover-driven transforms so touch devices don't fire them on tap:

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); }
}
```

## Review Mode

When auditing existing motion, scan for the smells below and **return a markdown table** with
exactly these columns: **Smell · Fix · Why**. One row per issue. Be specific — quote the
offending value and give the replacement.

For a fast first pass over a codebase, run the bundled scanner — pure, dependency-free, and
read-only (it never writes or phones home):

```bash
node skills/motion-craft/scripts/audit-motion.mjs [path]   # exits non-zero if issues found → CI-friendly
```

It prints `file:line` findings; then deepen the audit by hand using the full catalog in
`references/anti-patterns.md`.

| Smell | Fix | Why |
|-------|-----|-----|
| `transition: all` | Name the properties: `transition: transform 200ms var(--ease-out-expo)` | `all` animates unexpected props and forces extra style work |
| `width`/`height`/`top`/`margin` animated | Re-express with `transform: translate()/scale()` | Layout props reflow; transforms composite on the GPU |
| Entry from `scale(0)` | `scale(0.95)` + `opacity: 0` | Things don't appear from a single point |
| `ease-in` on something opening/appearing | `ease-out` (custom curve) | `ease-in` delays the visible start → feels laggy |
| Built-in `ease`/`ease-out` everywhere | A custom `cubic-bezier` token | Defaults are weak; custom curves read as intentional |
| Duration > 300 ms on interactive UI | 150–250 ms | Snappier feels more responsive |
| Same speed for enter and exit | Make the exit ~30% faster | The decision is made; clear the way |
| Hover transform with no media query | Wrap in `@media (hover: hover) and (pointer: fine)` | Avoids sticky hover states on touch |
| Keyframes on a rapidly re-triggered element | CSS `transition` (interruptible) | Keyframes restart from zero on interrupt; transitions retarget |
| No `prefers-reduced-motion` handling | Add the reduced-motion block | Motion sensitivity is an accessibility requirement |
| Animation on a high-frequency action (shortcut, palette) | Remove it | Repetition turns motion into lag |
| `transform-origin: center` on an anchored popover | Bind origin to the trigger | Anchored elements should grow from where they live |

## Reference Map (load on demand)

Pull these in only when the task needs them — keep the base skill lean.

| File | Load it when… |
|------|---------------|
| `references/recipes.md` | You're writing code and need paste-ready CSS / Motion / GSAP / View Transitions / Lottie |
| `references/easing-library.md` | Choosing a curve — named `cubic-bezier` tokens + spring presets by situation |
| `references/patterns.md` | Building a known move — staggered reveal, FLIP morph, drag-to-dismiss, scroll-scrub, accordion… |
| `references/anti-patterns.md` | Reviewing — the full slop catalog the scanner is built from |
| `references/frameworks.md` | Working in a specific stack — React/Vue/Svelte/Astro/vanilla idioms |
| `scripts/audit-motion.mjs` | You want an automated first-pass review of a codebase |

## Output Contract

Every BUILD answer states: the **tool chosen and why** (which rung of the ladder), the
**properties animated** (must be `transform`/`opacity` for anything moving), the **easing +
duration**, and the **`prefers-reduced-motion` fallback**. Every REVIEW answer is the
Smell · Fix · Why table — nothing animated is signed off without a reduced-motion story.
