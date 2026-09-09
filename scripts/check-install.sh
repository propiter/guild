#!/usr/bin/env bash
# check-install.sh — install.sh es sintácticamente válido y --dry-run no toca nada
# ni falla.
#
# QUÉ PREVIENE
# ────────────
# install.sh es el único punto de entrada real para instalar el gremio (local o vía
# `curl | bash`). Un error de sintaxis o un --dry-run que explota deja a CUALQUIER
# persona nueva bloqueada en el primer comando que corre — y ningún test de unidad
# lo nota, porque este repo no tiene "unidades de código", tiene Markdown.
#
# QUÉ MIDE
# ────────
# 1. `bash -n install.sh` — el script parsea sin ejecutar una sola línea.
# 2. `./install.sh --dry-run` sale con código 0 y no requiere red ni sudo.
#
# QUÉ NO MIDE
# ───────────
# No prueba la instalación REAL (eso escribiría en el $HOME de quien corre el
# check). El modo --dry-run es, por diseño de install.sh, la única superficie que
# se puede probar en CI sin efectos secundarios.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if ! bash -n install.sh; then
  echo ""
  echo "✗ check-install: install.sh tiene un error de sintaxis"
  echo "  qué hacer: corré 'bash -n install.sh' localmente y arreglá el error que señale."
  exit 1
fi

if ! OUTPUT="$(./install.sh --dry-run 2>&1)"; then
  echo ""
  echo "✗ check-install: './install.sh --dry-run' terminó con error"
  echo ""
  echo "$OUTPUT" | sed 's/^/  /'
  echo ""
  echo "  qué hacer: reproducí './install.sh --dry-run' en local y arreglalo en"
  echo "  install.sh. --dry-run nunca debería fallar ni requerir red/sudo."
  exit 1
fi

echo "✓ check-install: bash -n OK, ./install.sh --dry-run OK"
