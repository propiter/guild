#!/usr/bin/env bash
# db-up.sh — levanta los servicios de docker-compose.dev.yml y espera a que
# estén HEALTHY antes de devolver el control.
#
# POR QUÉ EXISTE
# ──────────────
# `docker compose up -d` sin más es exactamente la mitad del trabajo: arranca
# los contenedores pero no garantiza que estén LISTOS. Encadenar acá mismo la
# espera (`wait-for-healthy.sh`) es lo que hace que `db:up` (o `make db-up`)
# sea seguro de llamar justo antes de una suite de tests — nadie tiene que
# acordarse de correr dos comandos en el orden correcto.
#
# Es IDEMPOTENTE: si los servicios ya están arriba y healthy, `docker compose
# up -d` no los recrea (los deja como están) y la espera resuelve casi
# instantáneo. Por eso este script es seguro de poner delante de
# `test:integration` en CADA corrida de `verify`, no sólo la primera.
#
# Uso:
#   db-up.sh <archivo-compose> <servicio> [servicio...]

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Uso: db-up.sh <archivo-compose> <servicio> [servicio...]" >&2
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
else
  echo "→ no encuentro $ENV_FILE — sigo con los defaults del compose (ver .env.example)." >&2
fi

echo "→ docker compose up -d (${SERVICIOS[*]})…"
docker compose -f "$COMPOSE_FILE" "${ENV_FLAG[@]}" up -d "${SERVICIOS[@]}"

"$SCRIPT_DIR/wait-for-healthy.sh" "$COMPOSE_FILE" "${SERVICIOS[@]}"
