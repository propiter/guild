#!/usr/bin/env bash
# check-version.sh — todo `version:` en skills/*/SKILL.md coincide con VERSION.
#
# QUÉ PREVIENE
# ────────────
# El gremio versiona como una unidad: VERSION en la raíz es la fuente de verdad.
# Bumpear la versión y olvidar uno de los 12 SKILL.md deja un skill publicado con un
# número de versión mentiroso — exactamente lo que la ley "la doc no miente ni
# envejece" prohíbe. release.sh bumpea todos los archivos a la vez, pero nada
# impedía (antes de esta guardia) un commit manual que tocara sólo alguno.
#
# La versión anterior de este script comparaba contra `.claude-plugin/plugin.json`
# y `.claude-plugin/marketplace.json` — ARCHIVOS QUE NO EXISTEN EN ESTE REPO. Estaba
# desconectado del todo; nunca corrió en verde ni en rojo, simplemente reventaba con
# "no such file". Este reemplazo usa la fuente de verdad real: VERSION.
#
# QUÉ MIDE
# ────────
# Parsea con YAML el frontmatter de cada skills/*/SKILL.md, extrae `version` (de
# nivel superior o anidado en `metadata.version` — ambas formas conviven hoy en el
# repo) y lo compara contra el contenido (trimmed) de VERSION.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

python3 - <<'PYEOF'
import glob
import re
import sys
import yaml

with open("VERSION", encoding="utf-8") as f:
    canonical = f.read().strip()

if not re.match(r"^\d+\.\d+\.\d+$", canonical):
    print(f"✗ check-version: VERSION contiene '{canonical}', que no es semver X.Y.Z")
    print("  qué hacer: corregí el archivo VERSION en la raíz a un semver válido.")
    sys.exit(1)


def frontmatter(path):
    with open(path, encoding="utf-8") as f:
        content = f.read()
    lines = content.split("\n")
    body, closed = [], False
    for line in lines[1:]:
        if line.strip() == "---":
            closed = True
            break
        body.append(line)
    return "\n".join(body) if closed else None


problems = []
files = sorted(glob.glob("skills/*/SKILL.md"))
for path in files:
    block = frontmatter(path)
    data = yaml.safe_load(block) if block else None
    version = None
    if isinstance(data, dict):
        version = data.get("version") or (data.get("metadata") or {}).get("version")
    if not version:
        problems.append((path, "no tiene campo `version` (ni de nivel superior ni en metadata.version)"))
    elif str(version) != canonical:
        problems.append((path, f"tiene version '{version}', VERSION dice '{canonical}'"))

if problems:
    print("")
    print(f"✗ check-version: desincronizado contra VERSION ({canonical})")
    print("")
    for path, problem in problems:
        print(f"  {path}: {problem}")
    print("")
    print(f"  qué hacer: actualizá el/los campo(s) \"version\" a \"{canonical}\", o corré")
    print(f"  scripts/release.sh {canonical} para sincronizar todo el gremio de una vez.")
    sys.exit(1)

print(f"✓ check-version: VERSION={canonical}, {len(files)} skills sincronizados")
PYEOF
