# Easing Library (load on demand)

Easing is the single biggest lever on how motion *feels*. The browser defaults are weak — they
lack the punch that reads as crafted. Treat these as **tokens**: define once, reuse everywhere.

```css
:root {
  /* Entrances — fast start, soft settle. The everyday workhorse. */
  --ease-out-expo:    cubic-bezier(0.16, 1, 0.30, 1);
  --ease-out-quint:   cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out-quart:   cubic-bezier(0.25, 1, 0.50, 1);

  /* On-screen movement / morph — accelerate then decelerate. */
  --ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);

  /* Surfaces & sheets — iOS/Ionic feel, long graceful tail. */
  --ease-drawer:      cubic-bezier(0.32, 0.72, 0, 1);

  /* Exits that leave the viewport entirely — accelerate away. Use FAST + only here. */
  --ease-in-quint:    cubic-bezier(0.64, 0, 0.78, 0);

  /* Playful overshoot — reserve for rare, delightful moments. */
  --ease-back-out:    cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## Pick by what the element is doing

| Situation | Token | Why |
|-----------|-------|-----|
| Modal / toast / dropdown **opening** | `--ease-out-expo` | Snaps in at the moment the eye lands on it |
| Tooltip, small popover appearing | `--ease-out-quart` | Gentler — small elements don't need a hard snap |
| List reorder, resize, **on-screen** move | `--ease-in-out-cubic` | Real objects accelerate then decelerate |
| Bottom sheet / drawer | `--ease-drawer` | The long tail reads as weight and physicality |
| Element sliding **fully off-screen** | `--ease-in-quint` (≈30% faster than its entrance) | Acceleration away reads as "gone" |
| Hover / colour | short `--ease-out-quart` or plain `ease` | Tiny; doesn't need character |
| Spinner, marquee, progress | `linear` | Constant motion must be constant |
| Success burst, confetti, mascot | `--ease-back-out` | Overshoot = personality; rare moments only |

## Non-negotiable rules

- **Never `ease-in` on anything the user is waiting to see or interact with.** It delays the
  visible start, so the same duration *feels* slower. `ease-in` is allowed in exactly one place:
  an element accelerating completely off-screen.
- **Match the curve to the product's mood.** A banking dashboard is crisp (`out-quart`,
  short). A playful consumer app can afford `back-out`. The curve is part of the brand voice.
- **Don't invent curves from scratch every time.** Reuse the tokens above. Consistency across a
  product is what separates "designed" from "decorated".

## Spring equivalents (Motion / Framer Motion)

When you need interruptibility (gestures, anything reversible mid-flight), reach for a spring
instead of a fixed curve:

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }    // Apple-style — intuitive
{ type: "spring", stiffness: 300, damping: 30 }   // classic physics — precise
{ type: "spring", stiffness: 500, damping: 32 }   // snappy UI (menus, toggles)
{ type: "spring", stiffness: 150, damping: 18 }   // soft, weighty (sheets)
```

Keep `bounce` between 0.1–0.3 and reserve it for drag-to-dismiss and playful interactions.
Bounce on a professional surface reads as toy-like.
