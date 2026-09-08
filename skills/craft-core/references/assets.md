# Assets — every image is real or crafted, never a broken placeholder (load in design + build)

A landing dies on missing/ugly images (the #1 "alive" lever — see `alive-not-generic.md`). So the
workflow PRODUCES real assets and leaves the user a clean slot for the few it can't invent. Lean on
the bundled **`web-assets`** skill (rasterise HTML/SVG → PNG via Playwright + icotool — no
ImageMagick needed) and the `design.md` imagery spec.

## 1. Make the assets folder
Create the project's static dir: **Next.js → `public/`** (`public/images/`, `public/og/`,
favicons at `public/`). All `<img src>`/`background` paths point here. Never reference an asset that
doesn't exist.

## 2. Split: what we GENERATE vs what the user PROVIDES
From `design.md`'s imagery spec:

**Generate (do it — don't leave stubs):**
- **Signature hero visual** — the brand's one distinctive graphic. Author it as a crafted **SVG**
  (gradients, the brand motif, geometric/illustrative) OR an HTML scene rendered to PNG via
  `web-assets` (à la the network-nodes seal we built — tools, not stock). This is the page's soul.
- **Decorative SVGs** — backgrounds, dividers, motif accents, icon set (inline SVG / lucide-style).
- **OG / social card** — 1200×630, on-brand, via `web-assets` (HTML → Playwright screenshot).
- **Logo / wordmark** — an on-brand **SVG mark + wordmark** (the brand's initial/motif as a crafted
  glyph, not text in a grey box). Ships as a swappable DEFAULT so the site is never unbranded; the
  user replaces `public/logo.svg` later with **no code change**.
- **Favicons** — `favicon.ico` (16/32/48 via icotool) + `favicon.svg` + `apple-touch-icon.png` +
  `manifest` icons, **derived from that logo mark**. NEVER ship the framework / Next / Vercel default
  favicon — a default favicon is the #1 "unfinished / template" tell.

**Ask the user (only what truly can't be invented — real photos):**
- **Real product/team photos.** If RESEARCH scraped a real logo URL, fetch it to `public/logo.svg`
  (overwriting the generated placeholder). Everything visual ships GENERATED and on-brand, so the
  site is never broken or unbranded before the user swaps anything.
- **Swap without touching code.** Every asset is a clearly-named file in `public/` (`logo.svg`,
  `favicon.ico`, `og-image.png`, `images/product-1.jpg`). Tell the user in the final report exactly
  which files to replace with their real ones (same names) — no code edit, just drop-in files.

## 3. Tooling (install if missing — don't fail)
- **Playwright** for rendering HTML/SVG scenes and the OG card. If browsers aren't present:
  `npx playwright install chromium` (or use the Playwright MCP if available). Serve a temp HTML over
  `python3 -m http.server` and screenshot at the exact size (file:// is blocked) — the `web-assets`
  pattern.
- **icotool** (from `icoutils`) for `.ico`. If absent, ship PNG favicons + the `.svg` and note it.

## 4. Quality bar for generated images
On-brand colours/tokens, crisp (2× for raster where it matters), `alt` text on every `<img>`,
correct dimensions (no CLS), lazy-load below the fold, modern formats (SVG/WebP) where possible.
Generated images must pass the same "not generic / alive" test — no stock-looking filler.

## Output
`public/` populated: signature hero visual + OG card + **branded favicon set + logo mark** +
decorative SVGs, ALL generated (never the framework default favicon). Real photos either fetched or
left as named on-brand placeholders, each with a clear "replace this file — no code change" swap
instruction in the final report. No `<img>` points at a missing file; nothing ships unbranded.
