---
description: Read the ground before building — detect the mode (adopt / greenfield / one screen), the stack, the existing design system, the auth + role model, and where the backend contract lives.
---

Bootstrap **app-craft** for this project.

Load the `app-craft` skill and delegate to `prospector`. **Never assume greenfield** — most runs land
in an existing project, and building over one without reading it is how a repo ends up with two
design systems.

It scans and writes `app/_init.md`:

- **The MODE** — adopt an existing project · greenfield · one screen · contract sync, and why.
- **The stack** — framework + router (App vs Pages, `src/` or not), styling (Tailwind **v3 config
  vs v4 `@theme`** — different worlds), component conventions, naming and export style, package
  manager (from the lockfile).
- **The existing design system** — tokens already present, an installed component kit and whether
  it's themed or default, how dark mode works. Or "none — will be created".
- **The backend contract source** — Drizzle/Prisma schema, tRPC router, OpenAPI, GraphQL, Supabase
  types, server actions, or route handlers. **Which one is authoritative, with its path.** Or
  "none — will be specified".
- **Auth + the role model**, and how roles are represented in code.
- **The project's own instructions** (`CLAUDE.md`, `.cursorrules`) — these **outrank** every default
  in this skill.
- **Tooling readiness** — Node/package manager, `gh`, `vercel`, Playwright, the dev command + port.
- **The constraints downstream phases must respect** (e.g. "Pages Router — do NOT migrate").

Every claim comes with a file path as evidence. Report the mode, the stack in one line, the
contract source, and anything that constrains the plan.
