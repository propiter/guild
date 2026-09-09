#!/usr/bin/env bash
# release.sh — bumpea la versión del gremio en TODOS los lugares que la declaran.
# Uso: scripts/release.sh <version-nueva>   (ej. 1.1.0)
#
# Reescrito por completo: la versión anterior bumpeaba `.claude-plugin/plugin.json` y
# `.claude-plugin/marketplace.json` — archivos que NO EXISTEN en este repo. Quedó
# desconectada de la realidad, exactamente lo que la ley "la doc no miente ni
# envejece" prohíbe. La fuente de verdad hoy es VERSION en la raíz;
# scripts/check-version.sh compara los 12 skills/*/SKILL.md contra ese archivo.
#
# No commitea ni pushea — revisá el diff y commiteá a mano.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

NEW_VERSION="${1:-}"
if [ -z "$NEW_VERSION" ]; then
  echo "Uso: $0 <version-nueva>   (ej. 1.1.0)" >&2
  exit 1
fi
if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "ERROR: la versión debe ser semver X.Y.Z (recibí: '$NEW_VERSION')" >&2
  exit 1
fi

OLD_VERSION="$(tr -d '[:space:]' < VERSION)"
if [ "$OLD_VERSION" = "$NEW_VERSION" ]; then
  echo "Ya está en $NEW_VERSION — nada que bumpear."
  exit 0
fi

echo "Bumpeando $OLD_VERSION → $NEW_VERSION"
echo ""

printf '%s\n' "$NEW_VERSION" > VERSION
echo "  VERSION"

for skill_file in skills/*/SKILL.md; do
  python3 - "$skill_file" "$OLD_VERSION" "$NEW_VERSION" <<'PYEOF'
import re
import sys

path, old, new = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path, encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r'(^\s*version:\s*)"' + re.escape(old) + r'"', re.MULTILINE)
new_content, n = pattern.subn(lambda m: m.group(1) + '"' + new + '"', content)

if n == 0:
    print(f"  AVISO: no encontré 'version: \"{old}\"' en {path} — revisalo a mano.")
else:
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"  {path}")
PYEOF
done

echo ""
echo "Validando…"
bash scripts/check-version.sh
bash -n install.sh && echo "  install.sh sintaxis OK"

echo ""
echo "✅ bumpeado a ${NEW_VERSION} — revisá el diff y commiteá"
