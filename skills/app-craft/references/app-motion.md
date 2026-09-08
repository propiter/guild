# App motion — feedback, not spectacle (load in motion + review)

A landing's motion tells a story: things enter as you scroll, a hero reveals, a diagram draws
itself. **Do not bring any of that into an app.** `craft-core/references/animation-levels.md`
describes that dial; in an app you are permanently near its quiet end, and the reason is simple:

> A landing is seen once by a stranger. **An app screen is seen four hundred times by the same
> person.** Anything charming on view #1 is friction on view #40.

App motion has exactly three jobs. If an animation isn't doing one of them, delete it.

1. **Feedback** — the system received your input and is doing something.
2. **Continuity** — this thing came from there, went there, or turned into that.
3. **Attention** — something changed that you didn't cause, and you need to know.

---

## The duration budget (hard limits)

| Motion | Duration | Easing |
|---|---|---|
| Hover / focus / press | **80–120ms** | `ease-out` |
| Toggle, checkbox, switch | 120–160ms | `ease-out` |
| Dropdown, popover, tooltip | 120–180ms | `ease-out` in, `ease-in` out (faster out) |
| Dialog, drawer, sheet | 180–240ms | your `--ease-signature` |
| Route / view transition | 200–300ms | `ease-in-out` |
| Toast in/out | 200ms | `ease-out` |
| Skeleton shimmer | 1200–1600ms loop | linear, low contrast |

**Nothing in an app animates for longer than 300ms.** If it needs more, it isn't feedback — it's a
performance, and the user is waiting for it. Exit animations run **faster than entrances** (~0.7×):
you're already done with the thing.

**Never animate:** a value the user is reading, a table sort/filter re-render, numbers counting up
in a live dashboard, focus rings, anything on the critical path of a frequent task, or a loading
state that could just be instant. A count-up animation is delightful once and infuriating daily.

---

## The patterns that earn their place

**Optimistic UI** — the highest-value "motion" in an app is *the absence of waiting*. Toggle,
reorder, mark-as-read, add-to-list: render the result **instantly**, reconcile in the background,
and roll back with an explanation if the server disagrees. Never optimistic for money, deletion, or
anything irreversible (`states-and-edges.md`).

**Shared-element continuity** — a row expands into a detail; a card grows into a dialog; a drawer
enters from the edge it belongs to. This is orientation, and it is worth the milliseconds. Use the
View Transitions API where supported, `motion`'s `layoutId` otherwise, and make sure the reduced-
motion path is a plain cross-fade.

**Enter/exit with direction and origin** — a popover scales from its trigger's corner
(`transform-origin`), a drawer slides from its edge, a toast enters from the region it lives in.
Direction says *where this came from*; a fade says nothing.

**List changes** — new rows fade+slide in ~8px; removed rows collapse their height so the list
doesn't jump. Never animate the *whole list* on filter/sort — that's a re-render, not a transition,
and animating it makes the app feel slow and makes the data feel unstable.

**Pending in place** — a button's label swaps to a spinner **without changing width**. Any reflow
on click is a mis-click waiting to happen.

**Attention, sparingly** — a row that just changed gets a brief highlight that fades (~600ms, then
gone). A live-updating value gets a subtle flash. This is the one place a slightly longer duration
is correct, because the user didn't cause it.

---

## Performance

- **Only `transform` and `opacity`.** Animating `width`, `height`, `top`, `left`, `margin` or
  `box-shadow` triggers layout/paint and drops frames. To animate size, use `scale` or the View
  Transitions API — or animate `grid-template-rows` (`0fr → 1fr`), which is the one modern exception
  worth knowing.
- **No `will-change` sprinkled everywhere** — it costs memory and can make things worse.
- **60fps or delete it.** A janky animation is strictly worse than none.
- Prefer **CSS transitions** for state changes (hover/focus/open) and reach for a library only for
  orchestration, layout animation, gestures and exit animations.
- Long lists: motion on virtualized rows must not run on off-screen items.

## Library choice

Most app motion is **CSS transitions on token-driven durations and your `--ease-signature`.** That
covers hover, focus, open/close, and pending states — the vast majority.

Add `motion` (Framer Motion) only where you genuinely need: exit animations, layout/shared-element
transitions, gestures, or orchestrated sequences. **Do not install GSAP, Lenis, ScrollTrigger or a
smooth-scroll library in an app** — those are landing tools. Smooth-scroll hijacking in a
productivity tool is actively hostile: it fights the user's scroll, breaks `Home`/`End`, and makes
long tables miserable.

## Reduced motion — non-negotiable

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Then restore what still communicates: **cross-fades and instant state changes are fine** under
reduced motion — it's *vestibular* motion (transforms, parallax, scale, slide) that must go. Test
the app with the setting on: everything must still be usable, and every state change must still be
perceivable. If a state change is only communicated by movement, it's broken for those users
anyway.

## The motion gate (what `magistrate` verifies)

1. Nothing exceeds 300ms; hover/focus feedback is ≤120ms.
2. Only `transform`/`opacity` (or documented exceptions); 60fps under a 6× CPU throttle.
3. `prefers-reduced-motion` honored, and every state change still perceivable with it on.
4. No scroll-jacking, no smooth-scroll library, no count-up on recurring values.
5. Every animation does feedback, continuity, or attention — **name the job or remove it.**
6. Pending states don't reflow; exits are faster than entrances.
