#!/usr/bin/env bash
# wait-for-healthy.sh — espera a que servicios de Docker Compose estén
# HEALTHY, no solo "arrancados".
#
# POR QUÉ EXISTE
# ──────────────
# `docker compose up -d` devuelve el control apenas el PROCESO del contenedor
# arranca — típicamente en un puñado de cientos de milisegundos. Postgres
# tarda del orden de 1-3 segundos más en terminar su inicialización real y
# aceptar conexiones. Sin esperar ese segundo estado, el primer test que corre
# justo después de `db:up` falla con `ECONNREFUSED` de forma INTERMITENTE: a
# veces la máquina fue rápida y ya estaba listo, a veces no. Un fallo
# intermitente es el peor tipo de fallo para diagnosticar porque no se
# reproduce siempre — este script convierte esa carrera en una espera
# explícita y determinística.
#
# QUÉ MIDE (y qué NO)
# ────────────────────
# Lee el healthcheck que YA declaró cada servicio en su docker-compose (ver
# `docker-compose.dev.yml.template` / `docker-compose.yml.template`) vía
# `docker inspect`, y espera a que reporte "healthy". NO define healthchecks
# nuevos ni sabe nada del protocolo de cada motor — depende enteramente de que
# el compose tenga un healthcheck real declarado. Si un servicio no tiene
# healthcheck, este script lo dice explícitamente y sale en rojo, en vez de
# reportar éxito sin haber comprobado nada (ver la ADVERTENCIA de
# `templates/guardrails/README.md`: ninguna rama de "no pude averiguarlo"
# devuelve éxito).
#
# SIN DEPENDENCIAS EXTERNAS: sólo `docker` (que ya hace falta para todo lo
# demás de este archivo) y utilidades POSIX estándar.
#
# Uso:
#   wait-for-healthy.sh <archivo-compose> <servicio> [servicio...]
#
# Variables de entorno opcionales:
#   WAIT_TIMEOUT_SEGUNDOS   default 60. Subilo si tu máquina/CI es más lenta.

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Uso: wait-for-healthy.sh <archivo-compose> <servicio> [servicio...]" >&2
  exit 2
fi

COMPOSE_FILE="$1"
shift
SERVICIOS=("$@")
TIMEOUT="${WAIT_TIMEOUT_SEGUNDOS:-60}"
INTERVALO=1

if ! command -v docker >/dev/null 2>&1; then
  echo "🚨 No encuentro el comando 'docker' en el PATH. Instalá Docker (o Docker" >&2
  echo "   Desktop/Engine) antes de correr esto — no hay alternativa sin él." >&2
  exit 2
fi

for servicio in "${SERVICIOS[@]}"; do
  echo "→ esperando a que '$servicio' esté healthy (timeout ${TIMEOUT}s)…"
  transcurrido=0

  while true; do
    cid="$(docker compose -f "$COMPOSE_FILE" ps -q "$servicio" 2>/dev/null || true)"

    if [ -z "$cid" ]; then
      estado="sin-contenedor"
    else
      estado="$(docker inspect -f '{{.State.Health.Status}}' "$cid" 2>/dev/null || echo "sin-healthcheck")"
    fi

    case "$estado" in
      healthy)
        echo "  ✓ $servicio healthy"
        break
        ;;
      unhealthy)
        echo "🚨 '$servicio' respondió UNHEALTHY. Esperar más no lo va a arreglar." >&2
        echo "   Para diagnosticar: docker compose -f $COMPOSE_FILE logs $servicio" >&2
        exit 1
        ;;
      "sin-healthcheck"|"<no value>")
        echo "🚨 '$servicio' no tiene un healthcheck declarado en $COMPOSE_FILE (o el" >&2
        echo "   contenedor todavía no existe). Este script sólo puede esperar servicios" >&2
        echo "   CON healthcheck — agregale uno al servicio, o sacalo de la lista de" >&2
        echo "   servicios a esperar." >&2
        exit 2
        ;;
    esac

    if [ "$transcurrido" -ge "$TIMEOUT" ]; then
      echo "🚨 Timeout de ${TIMEOUT}s esperando a que '$servicio' esté healthy (último" >&2
      echo "   estado visto: $estado)." >&2
      echo "   Para diagnosticar: docker compose -f $COMPOSE_FILE logs $servicio" >&2
      echo "   Si tu máquina (o el runner de CI) es más lenta, subí el timeout con" >&2
      echo "   WAIT_TIMEOUT_SEGUNDOS=120 antes del comando." >&2
      exit 1
    fi

    sleep "$INTERVALO"
    transcurrido=$((transcurrido + INTERVALO))
  done
done

echo "✓ todos los servicios pedidos están healthy: ${SERVICIOS[*]}"
