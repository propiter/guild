#!/usr/bin/env bash
# verify.sh — el comando que un humano corre antes de pushear. Es EXACTAMENTE lo
# que corre el CI (.github/workflows/ci.yml invoca `bash scripts/verify.sh`, nada
# más) — la paridad la fuerza scripts/check-ci-parity.sh.
#
# Corre, EN ORDEN, los 6 guardrails que el gremio le exige a los proyectos que
# construye, aplicados sobre sí mismo:
#   1. check-frontmatter     — YAML estricto + campos requeridos
#   2. check-laws             — las leyes del gremio están en los 46 oficios
#   3. check-delegations      — los comandos delegan a oficios que existen de verdad
#   4. check-version          — VERSION y los 12 skills están sincronizados
#   5. check-no-private-refs  — cero fugas de clientes/infra privada
#   6. check-install          — install.sh parsea y --dry-run no rompe nada
# más un 7mo check extra (check-ci-parity) que confirma que ESTE MISMO script es lo
# único que el CI invoca — el punto entero del ejercicio.
#
# Corre TODOS aunque alguno falle (no aborta en el primero) para dar el panorama
# completo de una sola pasada. Sale 1 si CUALQUIERA falló.
set -uo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

CHECKS=(
  "check-frontmatter:scripts/check-frontmatter.sh"
  "check-laws:scripts/check-laws.sh"
  "check-delegations:scripts/check-delegations.sh"
  "check-version:scripts/check-version.sh"
  "check-no-private-refs:scripts/check-no-private-refs.sh"
  "check-install:scripts/check-install.sh"
)

RESULTS=()
OVERALL=0

echo "══════════════════════════════════════════════════════════════"
echo " guild verify — el gremio corre sus propios guardrails"
echo "══════════════════════════════════════════════════════════════"

for entry in "${CHECKS[@]}"; do
  name="${entry%%:*}"
  script="${entry#*:}"
  echo ""
  echo "▶ ${name}"
  echo "──────────────────────────────────────────────────────────────"
  if bash "$script"; then
    RESULTS+=("✅ ${name}")
  else
    RESULTS+=("❌ ${name}")
    OVERALL=1
  fi
done

# check-ci-parity: extra, fuera de los 6 — confirma que este mismo verify.sh es lo
# único que el CI invoca (ver scripts/check-ci-parity.sh para el porqué completo).
echo ""
echo "▶ check-ci-parity (extra)"
echo "──────────────────────────────────────────────────────────────"
if bash scripts/check-ci-parity.sh; then
  RESULTS+=("✅ check-ci-parity (extra)")
else
  RESULTS+=("❌ check-ci-parity (extra)")
  OVERALL=1
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo " Resumen"
echo "══════════════════════════════════════════════════════════════"
for r in "${RESULTS[@]}"; do
  echo " $r"
done
echo ""

if [ "$OVERALL" -eq 0 ]; then
  echo "✅ verify: todo en verde"
else
  echo "❌ verify: hay checks en rojo — revisá el detalle arriba"
fi

exit "$OVERALL"
