# Not generic — what makes an APP look human-built (load in system + build + review)

The landing version of this bar (`landing-craft/references/alive-not-generic.md`) asks *does it
have a vibe?* — real imagery, a signature visual, scroll-reactive motion. **Do not apply that to an
app.** An app that performs for you is an app that wastes your time. The app question is different:

> **Does this feel like it was built by a team who uses it every day — or assembled from a kit?**

An app can pass every contrast check, ship every component, and still read as machine-made. Here is
exactly why, and exactly how to fix it.

## The fingerprint — the current tell, precisely

If you have seen ten AI-built apps you know the look. Name it so you can refuse it:

- **Slate or zinc neutrals** as the whole grey scale. This is the single strongest tell.
- **Inter at default sizes**, one weight, no scale decision.
- **8px radius on absolutely everything** — the safe middle, chosen by not choosing.
- **A `Card` with a 1px slate-200 border** wrapping every region on the page, including regions
  that are not cards.
- **The DataTable and the Dialog straight from the docs example**, down to the column padding.
- **A muted indigo/violet primary**, plus a second accent for secondary actions.
- **Uniform density** — a settings form and a 10.000-row table breathing at the same rhythm.
- **`lucide` icons at default size and stroke**, one per nav item, chosen by keyword match.
- **A sidebar with a logo box, 6 nav items, and a user chip at the bottom.** Always.
- **Only the happy path.** No skeletons, no empty states, no error states, no permission states.

The last one is the loudest. Colour choices are taste; a missing empty state is *evidence the
thing was never used by a person*.

## Why it happens (so you can break the cycle)

An agent reaches for **the most common pattern in the codebase.** Install a kit, accept its
defaults, and every subsequent screen an agent writes inherits those defaults — the defaults
compound, and three weeks later the product is visually indistinguishable from every other app
built the same way.

The fix is not to avoid libraries. **The fix is to make sure the most common pattern in the
codebase is YOURS.** That is why app-craft takes headless primitives (behaviour only, zero styles)
and puts a fully owned token layer on top: there is no default to inherit.

## The fix, in the order that actually works

**Tokens move every screen at once. Component edits move one screen at a time.** So:

### 1. Kill the default neutral — this is the highest-leverage single edit
Slate and zinc are the default greys of AI output. Choose a neutral with a temperature and commit
to it across the whole ramp:

| Direction | Feel | Sketch (oklch) |
|---|---|---|
| Warm bone / paper | Editorial, calm, premium | surface `oklch(0.97 0.008 85)` · ink `oklch(0.20 0.015 60)` |
| Cool graphite | Technical, precise, dense | surface `oklch(0.98 0.004 250)` · ink `oklch(0.18 0.012 255)` |
| Taupe / clay | Human, considered, soft | surface `oklch(0.96 0.012 60)` · ink `oklch(0.22 0.02 40)` |
| True near-black | Cinematic, focused | surface `oklch(0.15 0.008 265)` · ink `oklch(0.95 0.005 90)` |

A neutral with a **consistent hue and a little chroma** reads designed. A pure-grey ramp reads
default. Build the full ramp (surface → raised → sunken → border → muted ink → ink) in one hue.

### 2. Take a real radius position
The default is ~8px because it is the safest possible answer. Move off it deliberately:
`0px` (confident, technical, dense), `2–4px` (precise, editorial), `12–16px` (soft, generous),
or full pill for controls only. **And vary radius by role** — a dense table row and a modal do not
want the same corner. Uniform radius everywhere is itself the tell.

### 3. Pick a type pairing and a real scale
Not Inter-at-defaults. Choose an interface face with opinions and pair it deliberately:
a geometric or grotesk UI face + a mono for data/IDs/code, and — if the product has a marketing
surface too — a display face for headings only. Then define a **UI scale that goes DOWN**, not up:
in an app, the sizes that matter are 11/12/13/14px, not 48px. And **tabular numerals on every
number** (`font-variant-numeric: tabular-nums`).

### 4. One saturated accent, used sparingly
One accent that means "the primary action / the selected thing / the brand". Resist a second
accent for secondary actions — **the secondary action is the absence of colour**, not a different
colour. Reserve additional hues strictly for semantic status (success/warning/danger/info), and
make those semantically distinguishable without relying on hue alone.

### 5. Ship ONE token the kit does not have — your fingerprint
This is the move that separates a customized product from a re-themed kit. Add one thing that is
yours, named, and applied consistently everywhere:

- a **signature shadow** (a specific, slightly coloured elevation you use on every raised surface)
- a **grain / noise texture** at 2–4% on surfaces
- a **specific easing curve** used by every transition in the app
- a **non-default border treatment** (an inset highlight, a 1px + inner ring, a hairline at 0.5px)
- a **selected-state treatment** that isn't a tinted background (a left rule, a notch, a lift)

Name it in `app/system.md` (e.g. `--shadow-signature`, `--ease-signature`) and use it everywhere.
One extra token, applied consistently, is what gives a product a fingerprint.

### 6. Density is a design decision
The kit look is uniform breathing room. Real apps modulate: a data table is dense, a settings form
is calm, an onboarding step is generous. Define **density modes** (`compact` / `default` /
`comfortable`) that scale row height, control height, gap and type together, and apply the right
one per surface. See `design-system.md`.

## Beyond tokens — the craft that kits can't give you

Tokens stop the product looking generic. **These** make it feel built by people who use it:

- **A real information hierarchy per screen.** Something is clearly the subject; something is
  clearly secondary; the eye lands in the right place without hunting. Not three equal cards.
- **Empty states that teach.** The best empty state in the product should be worth reading — it
  explains what this screen is for and gives the one action that fills it. See
  `states-and-edges.md`.
- **Keyboard everywhere, `⌘K` if the app has depth.** Nothing signals "made for daily use" faster.
- **Selected / hover / focus / active / disabled states that are visibly designed**, not the
  browser default plus opacity 0.5.
- **Tables that behave** — sticky header, aligned numerals, sortable columns that show their state,
  a row action that doesn't require aiming at a 12px icon.
- **Transitions that mean something** — a panel slides from the edge it belongs to; a deleted row
  collapses; an optimistic update lands instantly and reconciles quietly.
- **Copy written by someone who knows the domain.** "Sin facturas todavía" beats "No data
  available". A domain noun beats a generic one every time.
- **A layout that isn't all cards.** Not every region needs a bordered box. Use rules, spacing,
  and background steps to group — reserve the card for things that are genuinely card-like.
- **One thing that only this product does.** A signature interaction, a smart default, a shortcut
  that fits the real workflow. If nothing here is specific to the domain, it's a template.

## The tell test (run before sign-off, alongside the contrast + states gates)

1. **The screenshot test.** Show one screen with the logo cropped out. Could it be any other SaaS?
   If yes → the token layer never happened. Go back to step 1.
2. **The kit test.** Is there a `Card` with a 1px slate border, an 8px radius, Inter, and a violet
   primary anywhere on screen? If yes → you shipped the defaults.
3. **The empty test.** Delete all the data. Is the screen still useful and still designed? If it's
   a blank region or "No data" → not done.
4. **The keyboard test.** Unplug the mouse. Can you do the primary task? If no → fails bar 3.
5. **The stress test.** A 60-character name, 10.000 rows, a null in every optional field. Does the
   layout hold? If it breaks → fails bar 5.
6. **The density test.** Do the table and the settings form breathe identically? If yes → density
   was never decided.
7. **The fingerprint test.** Name the one token this product has that the kit doesn't. If you
   can't name it → there is no fingerprint.

**If it fails the tell test, it doesn't ship — even if it passes everything else.**
