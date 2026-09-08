---
description: Show where the app-craft pipeline is — phases done, screens built vs. specified, contract status, state coverage, and what's next. Read-only.
---

Show the **app-craft** pipeline status for this project. **Read-only — change nothing.**

Read the `app/` folder and the codebase, then report:

**Phases** — ✅ done · 🔄 partial · ⬜ pending, for:
`_init` · `product` · `ia` · `system` · `contract` · `screens` · `build` · `states` · `motion` ·
`polish` · `review`

**Mode** — adopt / greenfield / one screen / contract sync / **rescue**, and what it's working on.

**Rescue** (if `app/audit.md` exists) — the health verdict and score, which waves are done, the
safety-net status (strict TS · lint · build · smoke tests · visual baselines), and the
before/after numbers so far. If waves remain, name the next one and its risk.

**Screens** — specified in `ia.md` vs. actually present in the codebase. Name the gap.

**Contract** — `derived from <path>` or `specified — awaiting backend`; the entities covered; and
**any open question the backend still owes an answer to**.

**States coverage** — which screens have their full matrix (loading · first-run empty · no-results ·
error) and which don't. This is where apps are most often unfinished.

**Design system** — whether `app/system.md` exists, whether the code matches it, and **whether the
Signature token is named**.

**Last review verdict** — PASS/FAIL, the pass count, and any documented remainder.

**Next step** — the single most useful command to run now.

Flag any drift between the artifacts and the code — an artifact that describes something the
codebase doesn't have is fiction, and downstream phases will build on it.
