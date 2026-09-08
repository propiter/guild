#!/usr/bin/env bash
# db-reset.sh — tira abajo los contenedores de datos Y sus volúmenes, y
# arranca de cero.
#
# POR QUÉ EXISTE
# ──────────────
# `docker compose down` sin `-v` deja los VOLÚMENES vivos — que es lo que
# querés casi siempre (no perder los datos de desarrollo por accidente). Pero
# a veces el estado de la base quedó en algo que ningún test puede arreglar
# (una migración a medio aplicar, datos de prueba corruptos a mano) y hace
# falta empezar de cero de verdad. `db:reset` (o `make db-reset`) es ESE
# comando explícito — separado de `db:down` a propósito, para que borrar
# datos nunca sea un accidente de un `down` de rutina.
#
# Uso:
#   db-reset.sh <archivo-compose> <servicio> [servicio...]

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Uso: db-reset.sh <archivo-compose> <servicio> [servicio...]" >&2
  exit 2
fi

COMPOSE_FILE="$1"
shift
SERVICIOS=("$@")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ENV_FILE="$(dirname "$COMPOSE_FILE")/.env"
ENV_FLAG=()
if [ -f "$ENV_FILE" ]; then
  ENV_FLAG=(--env-file "$ENV_FILE")
fi

echo "→ docker compose down -v (borra TAMBIÉN los volúmenes de datos)…"
docker compose -f "$COMPOSE_FILE" "${ENV_FLAG[@]}" down -v

echo "→ levantando de nuevo, en un estado limpio…"
"$SCRIPT_DIR/db-up.sh" "$COMPOSE_FILE" "${SERVICIOS[@]}"

echo "✓ reset completo — base y cache en un estado limpio"
