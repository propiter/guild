#!/usr/bin/env bash
# check-delegations.sh — todo oficio referenciado entre backticks en commands/*.md
# resuelve a un agents/<nombre>.md que existe de verdad.
#
# QUÉ PREVIENE
# ────────────
# Un oficio se renombra o se borra (agents/envoy.md → agents/contratista.md) y el
# comando que lo delega se queda diciendo `envoy` para siempre — nadie lo nota
# porque el texto del comando "se lee bien", sólo falla en runtime cuando alguien
# intenta delegar a un oficio que ya no existe.
#
# QUÉ MIDE
# ────────
# Busca, dentro de commands/*.md, las tres formas en que este repo asigna un
# oficio a una fase (las tres conviven hoy, verificado contra el texto real):
#   A. "delegate to `X`" / "delegá a `X`" / "delegá **solo** a `X`"
#   B. "N. **fase** — `X`: ..."  (lista numerada, em-dash, backtick)
#   C. "agente(s): `X` (...), `Y` (...) y `Z` (...)."
# Para cada token capturado, excluye los que son nombres de skill (no son oficios)
# y una denylist corta de herramientas/lenguajes que aparecen en el mismo formato
# ("**Between every wave**: `tsc`") pero no son oficios. Lo que queda tiene que
# resolver a agents/<token>.md.
#
# QUÉ NO MIDE
# ───────────
# No tiene cobertura de fraseos libres sin backtick (ej. "delegate to the
# **surveyor** sub-agent") — el enunciado del pedido pide explícitamente backticks,
# y ampliar la ventana de búsqueda para cazar esos casos generaría falsos positivos
# (capturaría el primer backtick de la oración siguiente, que puede ser un nombre
# de skill). Gap conocido, no escondido.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

python3 - <<'PYEOF'
import glob
import os
import re
import sys

AGENTS = {os.path.basename(p)[:-3] for p in glob.glob("agents/*.md")}
SKILLS = {os.path.basename(os.path.dirname(p)) for p in glob.glob("skills/*/SKILL.md")}

# Herramientas/lenguajes conocidos que aparecen en el mismo formato visual que una
# delegación real ("**Between every wave**: `tsc`") pero no son oficios del gremio.
DENYLIST = {
    "tsc", "eslint", "knip", "depcheck", "madge", "jscpd", "gh", "vercel",
    "node", "npm", "npx", "yarn", "pnpm", "git", "docker", "curl", "jq",
    "python", "python3", "pip", "bash", "fetch", "sed", "awk", "grep",
    "find", "uv", "ruff", "mypy", "pytest",
}

PATTERNS = [
    # A: "delegate to `X`" / "delegá a `X`" / "delegá **solo** a `X`"
    re.compile(
        r"delega\w*\s+(?:\*\*[^*]+\*\*\s+)?(?:a|to)\s+(?:the\s+)?`([a-z][a-z0-9-]*)`",
        re.IGNORECASE,
    ),
    # B: "N. **fase** — `X`" o "**fase** — `X`" (con o sin numeración delante)
    re.compile(r"\*\*[^*]{1,60}\*\*\s*—\s*`([a-z][a-z0-9-]*)`"),
]


def find_refs(text):
    refs = []
    for pat in PATTERNS:
        for m in pat.finditer(text):
            refs.append((m.start(1), m.group(1)))
    # C: "agente(s): `x` (...), `y` (...) y `z` (...)."
    for m in re.finditer(r"agentes?:\s*(.+?)(?:\.\s|\.\n|\n\n|$)", text, re.DOTALL):
        segment = m.group(1)
        base = m.start(1)
        for tm in re.finditer(r"`([a-z][a-z0-9-]*)`", segment):
            refs.append((base + tm.start(1), tm.group(1)))
    return refs


problems = []
checked = 0
for path in sorted(glob.glob("commands/*.md")):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    seen_at_pos = set()
    for pos, token in find_refs(text):
        if pos in seen_at_pos:
            continue
        seen_at_pos.add(pos)
        if token in SKILLS or token in DENYLIST:
            continue
        checked += 1
        if token not in AGENTS:
            line = text.count("\n", 0, pos) + 1
            problems.append((path, line, token))

if problems:
    print("")
    print("✗ check-delegations: hay oficios referenciados que no existen en agents/")
    print("")
    for path, line, token in problems:
        print(f"  {path}:{line}: `{token}` no resuelve a agents/{token}.md")
    print("")
    print("  qué hacer: si el oficio fue renombrado, actualizá la referencia en el")
    print("  comando; si es un oficio nuevo, creá el agents/<nombre>.md que falta.")
    sys.exit(1)

print(f"✓ check-delegations: {checked} referencias a oficios entre backticks, "
      "todas resuelven a agents/*.md")
PYEOF
