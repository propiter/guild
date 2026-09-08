---
description: Bootstrap landing-craft for this project — detect the environment, check tooling (Firecrawl, Vercel, gh, Next.js), and set up the landing/ artifacts so the deep pipeline runs informed.
argument-hint: "(optional) project path or note"
---

Run **landing-craft init** for: $ARGUMENTS (or the current project).

Load the `landing-craft` skill and delegate to the **surveyor** sub-agent: detect the framework
/ existing app / brand assets / git, check tool readiness (`gh auth status`, `vercel whoami` —
install Vercel if missing, Firecrawl reachability, engram), load/create the style profile, and
create the `landing/` artifact dir. Apply zero-debt (fix what you can; install what's missing).

Report the environment + a readiness table + the single one-time action the user may need (e.g.
`vercel login`). Then tell them they can run `/landing "<product>"` and it'll go end to end.
