#!/usr/bin/env node
/**
 * audit-motion.mjs — the Review mode, as a tool.
 *
 * Scans CSS/JSX/TSX/Vue/Svelte/Astro files for common motion anti-patterns and prints a
 * Smell · Fix · Why report with file:line references. Pure and safe: NO network, NO writes,
 * NO dependencies — just reads the files you point it at.
 *
 *   node audit-motion.mjs [path ...]      # defaults to the current directory
 *
 * Exit code 1 if any issue is found (handy in CI), 0 if clean.
 * Part of the `motion-craft` skill. See references/anti-patterns.md for the full catalog.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const EXTS = new Set(['.css', '.scss', '.sass', '.less', '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte', '.astro']);
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.astro', 'out', 'coverage']);

// Each rule flags a single line. File-level rules run once per file (see below).
const LINE_RULES = [
  {
    id: 'transition-all',
    test: (l) => /transition(-property)?\s*:\s*[^;]*\ball\b/.test(l),
    smell: 'transition: all',
    fix: 'Name the properties: `transition: transform 200ms var(--ease-out-expo)`',
    why: 'Animates props you never meant to and forces extra style/layout work.',
  },
  {
    id: 'layout-prop',
    test: (l) => /transition(-property)?\s*:\s*[^;]*\b(width|height|top|left|right|bottom|margin|padding)\b/.test(l),
    smell: 'Animating a layout property (width/height/top/left/margin/padding)',
    fix: 'Re-express with `transform: translate()/scale()`',
    why: 'Layout props reflow every frame → dropped frames.',
  },
  {
    id: 'scale-zero',
    test: (l) => /\bscale\(\s*0\s*\)/.test(l) || /\bscale:\s*0\b/.test(l),
    smell: 'Entry/exit from scale(0)',
    fix: 'Start at `scale(0.95)` paired with `opacity: 0`',
    why: 'Nothing real appears from a single point.',
  },
  {
    id: 'ease-in-enter',
    test: (l) => /(transition|animation)[^;]*\beease?-in\b(?!-out)/.test(l) || /\bease-in\b(?!-out)/.test(l) && /(transition|animation|enter|in:)/.test(l),
    smell: 'ease-in on a transition/animation',
    fix: 'Use `ease-out` (custom curve) — reserve `ease-in` only for elements leaving the viewport',
    why: 'ease-in delays the visible start, so it feels laggy where the eye is watching.',
  },
  {
    id: 'slow-ui',
    test: (l) => {
      const m = /transition[^;]*?(\d+)\s*ms/.exec(l);
      if (m && Number(m[1]) > 300) return true;
      const s = /transition[^;]*?(\d+(?:\.\d+)?)\s*s\b/.exec(l);
      return Boolean(s && Number(s[1]) > 0.3 && Number(s[1]) < 5);
    },
    smell: 'Transition longer than ~300ms',
    fix: 'Drop interactive UI to 150–250ms (hero/marketing motion may stay longer — review)',
    why: 'Slow transitions feel unresponsive.',
  },
];

// File-level: warn once if a file animates but never mentions reduced motion.
function fileLevelFindings(text) {
  const animates = /(transition|animation|@keyframes|whileHover|whileTap|animate=|view-transition)/.test(text);
  const guarded = /prefers-reduced-motion|useReducedMotion|usePreferredReducedMotion/.test(text);
  if (animates && !guarded) {
    return [{
      id: 'no-reduced-motion',
      smell: 'File animates but never handles prefers-reduced-motion',
      fix: 'Add a `@media (prefers-reduced-motion: reduce)` block (or useReducedMotion). Reduced ≠ removed: keep fades, drop movement.',
      why: 'Unbounded motion is an accessibility failure — it can cause motion sickness.',
    }];
  }
  return [];
}

function walk(target, out) {
  let st;
  try { st = statSync(target); } catch { return; }
  if (st.isDirectory()) {
    for (const name of readdirSync(target)) {
      if (SKIP.has(name) || name.startsWith('.') && name !== '.') continue;
      walk(join(target, name), out);
    }
  } else if (EXTS.has(extname(target))) {
    out.push(target);
  }
}

const roots = process.argv.slice(2);
const files = [];
for (const r of roots.length ? roots : ['.']) walk(r, files);

let total = 0;
const byFile = new Map();

for (const file of files) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  const findings = [];
  text.split('\n').forEach((line, i) => {
    for (const rule of LINE_RULES) {
      try { if (rule.test(line)) findings.push({ line: i + 1, ...rule }); } catch { /* skip bad regex on a line */ }
    }
  });
  for (const f of fileLevelFindings(text)) findings.push({ line: 0, ...f });
  if (findings.length) { byFile.set(file, findings); total += findings.length; }
}

// ── Report ──────────────────────────────────────────────────────────────────
const bold = (s) => (process.stdout.isTTY ? `\x1b[1m${s}\x1b[0m` : s);
const dim = (s) => (process.stdout.isTTY ? `\x1b[2m${s}\x1b[0m` : s);

console.log(bold('\n  motion-craft · review\n'));
if (total === 0) {
  console.log('  ✓ No motion anti-patterns found in ' + files.length + ' file(s).\n');
  process.exit(0);
}

for (const [file, findings] of byFile) {
  console.log(bold('  ' + file));
  for (const f of findings) {
    const loc = f.line ? `:${f.line}` : '';
    console.log(`    ${dim(loc.padEnd(6))} ${f.smell}`);
    console.log(`    ${dim('     →')} ${f.fix}`);
    console.log(`    ${dim('      ')} ${dim(f.why)}`);
  }
  console.log('');
}

console.log(`  ${total} finding(s) across ${byFile.size} file(s). See references/anti-patterns.md.\n`);
process.exit(1);
