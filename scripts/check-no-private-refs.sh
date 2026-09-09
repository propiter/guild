#!/usr/bin/env bash
# check-no-private-refs.sh — cero referencias a clientes/infra privada en el
# contenido público del gremio.
#
# QUÉ PREVIENE
# ────────────
# El gremio nace de proyectos reales (clientes, infraestructura propia) y esos
# nombres se filtran fácil a un oficio/skill/comando escrito "citando el ejemplo
# que tenía a mano". Publicar agents/skills/commands con el nombre de un cliente
# adentro es una fuga de información y, además, un genérico roto — el siguiente
# que use el gremio en OTRO proyecto hereda una referencia que no le sirve para
# nada.
#
# QUÉ MIDE
# ────────
# grep -rniE del patrón de términos prohibidos sobre agents/, skills/ y commands/.
# Case-insensitive porque una fuga no respeta mayúsculas. La URL pública
# github.com/propiter no dispara este check — ningún término de la lista aparece
# en esa URL, no hace falta una excepción explícita en el patrón.
#
# QUÉ NO MIDE
# ───────────
# No es una lista exhaustiva de PII — es la lista conocida de términos de clientes
# e infra propia que ya aparecieron una vez. Un término nuevo que se filtre no lo
# atrapa hasta que se agregue acá.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

PATTERN='emitia|puntto|cotizador|eleventa|DIAN|INVIMA|whitelabel|vanguardistas|dokploy'

MATCHES="$(grep -rniE "$PATTERN" agents/ skills/ commands/ 2>/dev/null || true)"

if [ -n "$MATCHES" ]; then
  echo ""
  echo "✗ check-no-private-refs: hay referencias privadas en contenido público"
  echo ""
  echo "$MATCHES" | sed 's/^/  /'
  echo ""
  echo "  qué hacer: sacá la referencia y reemplazala por un ejemplo genérico (nunca"
  echo "  el nombre de un cliente o de infraestructura propia real)."
  exit 1
fi

echo "✓ check-no-private-refs: 0 coincidencias en agents/, skills/, commands/"
