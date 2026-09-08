---
name: brand-voice
description: "Trigger: write copy, marketing, landing page text, headline, CTA, value prop, email, social, ad, anti-slop, humanize content, brand voice, tono de marca. Write persuasive on-brand copy that does not read like AI."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

Any user-facing words meant to persuade or sell: landing pages, headlines, CTAs, value props, onboarding, emails, ads, social. Pairs with `frontend-design` (the visuals); this skill owns the words.

## Brand Brief (read FIRST)

Before writing, load the project brand brief if present: `docs/brand-voice.md`. If absent, ask for these 5 minimum and do not proceed without them: (1) what it is, (2) who it's for, (3) the pain it removes, (4) the feeling it should leave, (5) words/claims to avoid. NEVER invent brand facts, stats, testimonials, or features.

## Anti-Slop Rules (mandatory ban list)

Cut on sight — these are AI tells:

- Filler openers: "In today's fast-paced world", "In the realm of", "Unlock/Unleash the power of", "Elevate your".
- Hype empties: "seamless", "robust", "cutting-edge", "game-changer", "revolutionary", "supercharge", "effortlessly", "next-level".
- Hedge/bloat: "very", "really", "actually", "it's important to note", "delve", "leverage" (as a verb), "tapestry", "landscape", "journey".
- Symmetry tics: "It's not just X, it's Y", triadic lists everywhere, em-dash overuse, every sentence the same length.
- Emoji-as-punctuation and exclamation spam.

## Voice Patterns

| Move | Do |
|------|-----|
| Lead with the benefit | First line states the outcome the reader wants, in their words. |
| Concrete over abstract | Name the specific thing/number/moment, not the category. |
| One idea per line | Short. Vary rhythm — let a 3-word line land after a long one. |
| Speak to "you" | Second person, active voice, present tense. |
| Earn every claim | Back a superlative with a specific proof, or cut it. |
| CTA = verb + value | "Start free", "See it live" — not "Submit", "Learn more". |

## Hard Rules

- Read-it-aloud test: if a human wouldn't say it to a friend, rewrite it.
- Match the brand brief's tone words; flag any line that drifts.
- No claim without a proof the user supplied. Don't fabricate.

## Output Contract

Return: the copy, plus a one-line note on the tone choices made and any brand facts still missing.
