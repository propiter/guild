# Motion Anti-Patterns — the slop catalog (load on demand)

Cheap-feeling motion is rarely *too little* — it's the wrong thing, too much, or in the way.
This is the catalog the Review mode scans for. Each entry: the tell, why it's wrong, the fix.

| # | The tell | Why it feels cheap / broken | Fix |
|---|----------|-----------------------------|-----|
| 1 | `transition: all` | Animates props you never meant to (and forces extra style/layout work) | Name them: `transition: transform 200ms var(--ease-out-expo)` |
| 2 | Animating `width`/`height`/`top`/`left`/`margin`/`padding` | Triggers layout reflow every frame → jank | Re-express with `transform: translate()/scale()` |
| 3 | Entry from `transform: scale(0)` | Nothing real appears from a single point | Start at `scale(0.95)` + `opacity: 0` |
| 4 | `ease-in` on something opening/appearing | Delays the visible start → feels laggy at the exact moment the eye is on it | `ease-out` (custom curve) |
| 5 | Built-in `ease`/`ease-out` everywhere | Weak curves read as "default", not "designed" | Custom `cubic-bezier` tokens |
| 6 | Duration > 300ms on interactive UI | Slow = unresponsive | 150–250ms; exits faster still |
| 7 | Same speed for enter and exit | The decision is already made — get out of the way | Make the exit ~30% faster |
| 8 | Animation on a high-frequency action (shortcut, command palette, toggle) | Repetition turns delight into drag | Remove it entirely — instant is premium here |
| 9 | Hover transform with no media query | Sticky hover states fire on tap on touch devices | Wrap in `@media (hover: hover) and (pointer: fine)` |
| 10 | Keyframes on a rapidly re-triggered element | Keyframes restart from zero on interrupt → stutter | CSS `transition` (retargets smoothly) |
| 11 | No `prefers-reduced-motion` handling | Accessibility failure — can cause motion sickness | Add the reduced-motion block; keep opacity, drop movement |
| 12 | `transform-origin: center` on an anchored popover | Surface grows from the wrong place | Bind origin to the trigger (Radix/Base UI var) |
| 13 | Bounce/overshoot on a professional surface | Reads as toy-like, undermines trust | Reserve bounce (0.1–0.3) for playful/rare moments |
| 14 | Scroll-jacking (overriding native scroll speed/direction) | Fights the user, breaks momentum & a11y | Scroll-*scrub* that follows the user, never drives |
| 15 | Ten micro-animations competing at once | If everything moves, nothing is signal | One orchestrated hero moment; cut the rest |
| 16 | `will-change` left on many elements permanently | Each promoted layer costs memory → whole page slows | Apply right before the animation, remove after |
| 17 | Motion's `x`/`y`/`scale` shorthand under heavy load | Runs on the main thread → drops frames during load/hydration | Animate the full `transform` string, or use CSS |
| 18 | Heavy `blur()` to mask a transition | Expensive, especially in Safari | Keep blur ≤ 8px and brief |

## The one-line test
If you can't answer **"what does this animation communicate?"** in a sentence — *orientation,
feedback, continuity, or explanation* — delete it. "It looks cool" only earns its place in rare,
first-run moments. Everywhere else, cool-for-its-own-sake is friction in a nice coat.
