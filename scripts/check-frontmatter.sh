#!/usr/bin/env bash
# check-frontmatter.sh — YAML frontmatter estricto en agents/*.md, commands/*.md y
# skills/*/SKILL.md.
#
# QUÉ PREVIENE
# ────────────
# Un frontmatter que "se ve bien" pero no es YAML válido — típicamente una
# `description:` sin comillas que contiene un `:` (ej. "Trigger: build/design..."),
# que YAML interpreta como el inicio de una clave nueva y rompe el parseo en
# silencio en cualquier herramienta que lo lea en serio (Claude Code, un indexador,
# este mismo repo). Un regex "parece que están las claves" NO atrapa esto — hace
# falta un parser YAML real. Este bug ya ocurrió varias veces en este repo antes de
# esta guardia (v1 solo tenía un regex de `node`, ver git log).
#
# QUÉ MIDE
# ────────
# 1. El frontmatter (entre las dos primeras líneas `---`) parsea con
#    `yaml.safe_load` SIN excepción, y el resultado es un mapping.
# 2. Están presentes (y no vacíos) los campos requeridos según el tipo de archivo:
#      agents/*.md        → name, description   (tools/model opcionales: sin tools = todas)
#      commands/*.md       → description
#      skills/*/SKILL.md   → name, description, version
#                            (version puede estar en la raíz o en metadata.version —
#                            ambas formas conviven hoy en el repo, se acepta cualquiera)
#
# QUÉ NO MIDE
# ───────────
# No valida el CONTENIDO de los campos (que `tools` liste herramientas reales, que
# `model` sea un modelo válido) — sólo que existan y no estén vacíos.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

python3 - <<'PYEOF'
import glob
import sys
import yaml

REQUIRED = {
    "agents": ["name", "description"],   # tools/model son OPCIONALES en Claude Code: omitir tools = todas las herramientas (intencional en los oficios builder/review)
    "commands": ["description"],
    "skills": ["name", "description", "version"],
}


def frontmatter(path):
    with open(path, encoding="utf-8") as f:
        content = f.read()
    lines = content.split("\n")
    if not lines or lines[0].strip() != "---":
        return None, "el archivo no empieza con una línea `---` — no tiene frontmatter."
    body = []
    closed = False
    for line in lines[1:]:
        if line.strip() == "---":
            closed = True
            break
        body.append(line)
    if not closed:
        return None, "no se encontró la segunda línea `---` que cierra el frontmatter."
    return "\n".join(body), None


def check_group(pattern, kind, label):
    problems = []
    files = sorted(glob.glob(pattern))
    for path in files:
        block, err = frontmatter(path)
        if err:
            problems.append((path, err,
                              "Agregá un bloque de frontmatter YAML válido al inicio del archivo."))
            continue
        try:
            data = yaml.safe_load(block)
        except yaml.YAMLError as e:
            msg = str(e).replace("\n", " ")
            problems.append((
                path,
                f"YAML inválido: {msg}",
                "Revisá el campo señalado — lo más común es un `:` suelto dentro de "
                "`description` sin comillas. Envolvé el valor completo entre comillas dobles.",
            ))
            continue
        if not isinstance(data, dict):
            problems.append((path, "el frontmatter no parsea a un mapping (clave: valor).",
                              "Revisá la indentación del bloque YAML."))
            continue

        missing = []
        for field in REQUIRED[kind]:
            if field == "version" and kind == "skills":
                value = data.get("version") or (data.get("metadata") or {}).get("version")
            else:
                value = data.get(field)
            if value is None or (isinstance(value, str) and not value.strip()):
                missing.append(field)
        if missing:
            campos = ", ".join(f"`{m}:`" for m in missing)
            problems.append((path, f"faltan campos requeridos: {campos}",
                              f"Agregá {campos} al frontmatter de {path}."))
    print(f"  {label}: {len(files)} archivos, {len(problems)} con problemas")
    return files, problems


total = 0
all_problems = []
for pattern, kind, label in [
    ("agents/*.md", "agents", "agents/*.md"),
    ("commands/*.md", "commands", "commands/*.md"),
    ("skills/*/SKILL.md", "skills", "skills/*/SKILL.md"),
]:
    files, problems = check_group(pattern, kind, label)
    total += len(files)
    all_problems.extend(problems)

if all_problems:
    print("")
    print("✗ check-frontmatter: frontmatter roto o incompleto")
    print("")
    for path, problem, fix in all_problems:
        print(f"  {path}")
        print(f"    problema: {problem}")
        print(f"    qué hacer: {fix}")
        print("")
    sys.exit(1)

print("")
print(f"✓ check-frontmatter: {total} archivos, frontmatter YAML válido y completo")
PYEOF
