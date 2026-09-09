#!/usr/bin/env bash
# check-laws.sh — el bloque de Leyes del gremio está presente en TODO agents/*.md.
#
# QUÉ PREVIENE
# ────────────
# Un oficio nuevo (o copiado a las apuradas de otro) que quede sin las leyes
# innegociables del gremio — el bloque que fija el estándar de calidad no
# negociable (cero gaps, cero parches, probado no prometido, la doc no miente) que
# todo oficio lee antes de hacer nada. Sin este guardrail, "todos los oficios citan
# las leyes" es una promesa que nadie verifica hasta que alguien nota, ya en uso,
# que un oficio nuevo no las tiene.
#
# QUÉ MIDE
# ────────
# Que cada agents/*.md contenga el string exacto "Leyes del gremio (innegociables)".
#
# QUÉ NO MIDE
# ───────────
# No verifica que el TEXTO de las leyes sea idéntico palabra por palabra al canon —
# sólo que el encabezado del bloque esté presente. Un oficio con el encabezado y un
# cuerpo distinto no lo atrapa esto; eso se revisa a ojo en el PR.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

FAIL=0
COUNT=0
for f in agents/*.md; do
  COUNT=$((COUNT + 1))
  if ! grep -q "Leyes del gremio (innegociables)" "$f"; then
    echo "✗ $f: no tiene el bloque 'Leyes del gremio (innegociables)'"
    echo "  qué hacer: agregá el bloque '> **Leyes del gremio (innegociables).**' cerca del"
    echo "  inicio del archivo — copiá el bloque completo de cualquier otro agents/*.md."
    FAIL=1
  fi
done

if [ "$FAIL" -eq 1 ]; then
  echo ""
  echo "✗ check-laws: hay oficios sin las leyes del gremio"
  exit 1
fi

echo "✓ check-laws: $COUNT/$COUNT agentes tienen el bloque de leyes del gremio"
