# Motion Patterns (load on demand)

A catalog of named, reusable motion patterns. Each has a *purpose* — that's the price of
admission. If you can't name what a pattern communicates, don't ship it.

---

## Staggered reveal
**Purpose:** orientation — group content arrives as a cascade, guiding the eye top-to-bottom.
**Cost/impact:** lowest cost, highest "premium" payoff. Use on first paint or scroll-in.

```css
.item { opacity: 0; transform: translateY(16px);
        animation: rise 0.6s var(--ease-out-expo) forwards; }
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 60ms; }
.item:nth-child(3) { animation-delay: 120ms; }
@keyframes rise { to { opacity: 1; transform: none; } }
```
Keep step delay 40–80ms. Stagger is decorative — never block interaction while it plays.

---

## Optimistic press
**Purpose:** feedback — the UI confirms it heard the tap before the network does.

```css
.button { transition: transform 120ms var(--ease-out-expo); }
.button:active { transform: scale(0.97); }   /* subtle: 0.95–0.98 */
```

---

## Origin-aware popover
**Purpose:** continuity — the surface grows from its trigger, not from nowhere.

```css
.popover { transform-origin: var(--radix-popover-content-transform-origin); /* or --transform-origin */
           transition: opacity 160ms var(--ease-out-expo), transform 160ms var(--ease-out-expo); }
.popover[data-closed] { opacity: 0; transform: scale(0.96); }
```
**Modals are the exception** — not anchored, so they stay `transform-origin: center`.

---

## Shared-element / FLIP morph
**Purpose:** continuity — an element appears to *move* between two states/pages instead of
cross-fading. The platform does this now:

```js
if (document.startViewTransition) document.startViewTransition(() => updateDOM());
```
```css
.thumb, .detail-hero { view-transition-name: hero; }   /* same name = morph */
```
For non-supporting browsers or fine control, use Motion's `layoutId` (FLIP under the hood).

---

## Drag-to-dismiss (momentum)
**Purpose:** feedback + spatial logic. Dismiss on a quick flick, not just past a threshold.

```js
const velocity = Math.abs(offset) / elapsedMs;       // px per ms
if (Math.abs(offset) > THRESHOLD || velocity > 0.4) dismiss();
```
Apply damping past the natural boundary (the further they drag, the less it moves) and capture
the pointer so the drag survives leaving the element. Springs make this interruptible.

---

## Scroll-scrub with pin
**Purpose:** explanation — tie progress through a section to scroll position. CSS can't
orchestrate this; use GSAP ScrollTrigger.

```js
gsap.to(".panel", {
  yPercent: -100,
  scrollTrigger: { trigger: ".panel", scrub: true, start: "top top", end: "+=100%", pin: true },
});
```
Never *scroll-jack* (hijack native speed/direction). Scrub follows the user; it doesn't drive.

---

## Skeleton → content
**Purpose:** preventing jarring change — fade the real content in over the skeleton, don't pop.

```css
.content { opacity: 0; transition: opacity 240ms var(--ease-out-expo); }
.content[data-loaded] { opacity: 1; }
```
A faster shimmer makes the wait *feel* shorter even when the load time is identical.

---

## Height/accordion expand
**Purpose:** continuity. Animating `height` reflows — prefer the grid-rows trick (composited-ish)
or measure + animate `max-height` / use `interpolate-size: allow-keywords` where supported.

```css
.accordion { display: grid; grid-template-rows: 0fr;
             transition: grid-template-rows 240ms var(--ease-out-expo); }
.accordion[data-open] { grid-template-rows: 1fr; }
.accordion > div { overflow: hidden; }
```

---

## Number ticker
**Purpose:** feedback — a value that changes should *count*, not jump.

Use `requestAnimationFrame` to interpolate the number, or Motion's `useSpring` + `useTransform`.
Respect reduced motion: snap to the final value instead of animating.

---

## Reduced-motion variant (every pattern needs one)
Reduced ≠ removed. Keep the opacity fade that aids comprehension; drop the translation/scale/spin.

```css
@media (prefers-reduced-motion: reduce) {
  .item, .content { animation: none; opacity: 1; transform: none; transition: opacity 200ms; }
}
```
