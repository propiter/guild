# Contrast Gate (WCAG) — MANDATORY before deploy

Contrast is never skipped. A landing that looks fine to you can have an element at **1.1:1** that's
invisible to many users — and a single broad CSS `color` rule can silently override a button via
specificity (this exact bug hit a real build: `.nav-links a { color: muted }` beat
`.btn-primary { color: ink }`, leaving light text on a mint button). The eye misses it; the score
doesn't. So **measure every text/UI element and fail the gate on any miss**, in `burnisher`
and again in `arbiter`, BEFORE deploy.

## Thresholds (WCAG AA)
- Normal text: **≥ 4.5:1**
- Large text (≥ 24px, or ≥ 18.66px bold) and UI/graphical elements: **≥ 3.0:1**

## How to run it
Render the page (the dev server) in Playwright and inject this scorer via `page.evaluate`. It walks
every visible text node, resolves the *effective* background (compositing rgba layers up the tree),
computes the WCAG ratio, and returns every FAILURE. Fix each, then re-run until the list is empty.

```js
() => {
  const parseRGB = s => { const m = s && s.match(/rgba?\(([^)]+)\)/); if(!m) return null;
    const p = m[1].split(',').map(x=>parseFloat(x.trim())); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const over = (f,b) => ({ r:f.r*f.a+b.r*(1-f.a), g:f.g*f.a+b.g*(1-f.a), b:f.b*f.a+b.b*(1-f.a), a:1 });
  const effBg = el => { const ch=[]; let n=el;
    while(n){ const bg=parseRGB(getComputedStyle(n).backgroundColor); if(bg&&bg.a>0) ch.push(bg); n=n.parentElement; }
    ch.push(parseRGB(getComputedStyle(document.body).backgroundColor) || {r:255,g:255,b:255,a:1});
    let res=ch[ch.length-1]; for(let i=ch.length-2;i>=0;i--) res=over(ch[i],res); return res; };
  const lum = c => { const f=v=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};
    return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); };
  const ratio = (fg,bg) => { const o=fg.a<1?over(fg,bg):fg; const L1=lum(o),L2=lum(bg);
    return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05); };
  const hasText = el => [...el.childNodes].some(n=>n.nodeType===3 && n.textContent.trim().length);
  const fails = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!hasText(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility==='hidden' || cs.display==='none' || parseFloat(cs.opacity)===0) continue;
    const r = el.getBoundingClientRect(); if (r.width<2 || r.height<2) continue;
    const fg = parseRGB(cs.color); if (!fg) continue;
    const px = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight)>=700;
    const need = (px>=24 || (px>=18.66 && bold)) ? 3.0 : 4.5;
    const val = ratio(fg, effBg(el));
    if (val < need) fails.push({
      ratio: Math.round(val*100)/100, need,
      text: (el.textContent.trim().slice(0,40)),
      tag: el.tagName.toLowerCase(), cls: el.className?.toString().slice(0,40),
      color: cs.color, px: cs.fontSize,
    });
  }
  return { passed: fails.length===0, failures: fails };
}
```

## The gate
- Run at **two breakpoints minimum** (e.g. 1440 + 390) — effective backgrounds and sizes change.
- Also check **hover/active/focus states** of interactive elements (a hover color can drop below AA).
- `passed:false` ⇒ NOT shippable. Fix the colors (or the specificity bug) and re-run.
- Report the score table to the user; never deploy with a known failure.
