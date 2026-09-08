---
name: web-assets
description: "Trigger: favicon, .ico, app icon, PWA icon, OG image, open graph, social card, Twitter card, export PNG, rasterize SVG, generate image assets, og/social. Produce production web image assets from HTML/SVG using only local tools."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

Generating shippable web image assets: favicons, app/PWA icons, Open Graph / social cards, or rasterizing an SVG/HTML design to an exact-size PNG. Uses ONLY locally installed tools — no cloud, no new global deps.

## Toolchain (what's actually installed)

- **Playwright MCP** = the rasterizer. Render any HTML/SVG at an EXACT viewport, then `browser_take_screenshot`. Most reliable HTML/SVG→PNG path on this machine.
- **icotool** (`/usr/bin/icotool`, from icoutils) = bundle PNGs into a multi-resolution `.ico`.
- **ffmpeg** = fallback convert and any video-frame work.
- NO ImageMagick / sharp / rsvg-convert installed — do NOT assume them.

## Recipes

### Favicon + app icons
1. Author one square master (SVG or HTML), transparent bg, ~10% safe padding.
2. Render PNGs via Playwright at: 16, 32, 48, 180 (apple-touch), 192, 512.
3. Bundle the small sizes into `.ico`:
   `icotool -c -o favicon.ico icon-16.png icon-32.png icon-48.png`
4. Emit head tags: `icon` (svg + 32 png), `apple-touch-icon` (180), and a webmanifest referencing 192/512.

### OG / social card (1200×630)
1. Build an HTML template (brand type/colors — see `brand-voice` + `frontend-design`).
2. Playwright: `browser_resize` to 1200×630, navigate, `browser_take_screenshot` (viewport, NOT full-page).
3. Variants on request: 1080×1080 (square), 1080×1920 (story/reel).

## Hard Rules

- ALWAYS render at the literal target pixel size (set the viewport); NEVER scale a smaller screenshot up — upscaling = blur.
- `.ico` must carry at least 16+32; add 48 for crispness. `apple-touch-icon` must be 180px and NON-transparent (Safari fills transparency black).
- OG text must be large and high-contrast (renders thumbnail-small); put the key line in the top-left third.
- Confirm output dimensions after export; don't assume them.

## Output Contract

Return: files generated with their exact dimensions, the tool used per asset, and the `<head>`/manifest snippet to wire them in.
