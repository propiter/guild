#!/usr/bin/env bash
# check-ci-parity.sh — el CI corre EXACTAMENTE scripts/verify.sh, no una lista propia.
#
# QUÉ PREVIENE
# ────────────
# Este script existe por la misma razón que todo este ejercicio: el gremio le exige
# a los proyectos que construye que "verify local == CI" (ver
# templates/guardrails/check-ci-parity.mjs, el guardrail que el propio gremio le da
# a sus proyectos hijos). Si .github/workflows/ci.yml alguna vez reimplementa la
# lista de checks en vez de invocar scripts/verify.sh, las dos listas divergen con
# el tiempo — CI suma un paso, verify.sh se queda atrás, y un verify verde en local
# deja main en rojo. No tener este guardrail acá sería, literalmente, no comer de
# la propia comida.
#
# QUÉ MIDE
# ────────
# 1. .github/workflows/ci.yml existe y tiene una línea `run:` que invoca
#    scripts/verify.sh (con o sin `bash` explícito adelante).
# 2. El workflow NO invoca directamente ninguno de los scripts/check-*.sh por su
#    cuenta — eso sería exactamente la lista divergente que este check previene.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

WORKFLOW=".github/workflows/ci.yml"

if [ ! -f "$WORKFLOW" ]; then
  echo "✗ check-ci-parity: no existe $WORKFLOW"
  echo "  qué hacer: creá el workflow de CI y hacé que corra 'bash scripts/verify.sh'."
  exit 1
fi

if ! grep -qE 'run:.*scripts/verify\.sh' "$WORKFLOW"; then
  echo "✗ check-ci-parity: $WORKFLOW no invoca scripts/verify.sh"
  echo "  qué hacer: el job de CI tiene que correr EXACTAMENTE 'bash scripts/verify.sh' —"
  echo "  no una lista de checks reimplementada a mano dentro del workflow."
  exit 1
fi

# Sólo mira líneas `run:` reales — no comentarios que MENCIONEN un check por
# nombre (este mismo workflow tiene uno, explicando por qué existe este script;
# un grep sin anclar a `run:` se autodispararía contra su propia prosa).
DIVERGENT="$(grep -E '^\s*run:' "$WORKFLOW" | grep -oE 'scripts/check-[a-z-]+\.sh' | sort -u || true)"
if [ -n "$DIVERGENT" ]; then
  echo "✗ check-ci-parity: $WORKFLOW invoca checks individuales además de verify.sh:"
  echo "$DIVERGENT" | sed 's/^/  /'
  echo "  qué hacer: sacá esas líneas — verify.sh ya los corre a todos, en orden."
  exit 1
fi

echo "✓ check-ci-parity: $WORKFLOW corre scripts/verify.sh y nada más"
