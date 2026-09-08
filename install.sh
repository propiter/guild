#!/usr/bin/env bash
#
# guild installer — el gremio entero, en un comando, para Claude Code · OpenCode · Cursor.
#
#   local:   ./install.sh
#   remoto:  curl -fsSL https://raw.githubusercontent.com/propiter/guild/main/install.sh | bash
#
# Instala TODO por defecto. Elegí con flags:
#   --only=landing,system     instala solo esos pipelines (de: landing app system security)
#   --no-impeccable           no traer Impeccable (motor estético de landing/app)
#   --no-firecrawl            no configurar Firecrawl (research de landing)
#   --no-gentle-ai            NO correr el instalador de Gentle AI (por defecto SÍ se corre)
#   --gentle-ai-channel=beta  canal de Gentle AI (default: stable)
#   --uninstall               quitar lo que este instalador puso (solo lo del gremio)
#   --dry-run                 mostrar qué haría, sin tocar nada
#   --help                    esta ayuda
#
# Idempotente. Sin sudo, sin npm global, nada corre en segundo plano.
# Impeccable (pbakaus/impeccable, MIT) se copia. Gentle AI (Gentleman-Programming/gentle-ai) NO se
# copia: se corre su instalador oficial (por defecto). Es código de un tercero que reconfigura tu
# entorno — pasá --no-gentle-ai para saltarlo.
set -euo pipefail

REPO="${GUILD_REPO:-https://github.com/propiter/guild}"
BRANCH="${GUILD_BRANCH:-main}"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
OPENCODE_DIR="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
CURSOR_DIR="${CURSOR_CONFIG_DIR:-$HOME/.cursor}"

WITH_IMPECCABLE="${GUILD_IMPECCABLE:-1}"
WITH_FIRECRAWL="${GUILD_FIRECRAWL:-1}"
WITH_GENTLE_AI="${GUILD_GENTLE_AI:-1}"        # default on: corre el instalador oficial de Gentle AI
GENTLE_AI_CHANNEL="${GUILD_GENTLE_AI_CHANNEL:-stable}"
ONLY=""                                        # vacío = todos los pipelines
MODE="install"

for arg in "$@"; do
  case "$arg" in
    --only=*)              ONLY="${arg#*=}" ;;
    --no-impeccable)       WITH_IMPECCABLE=0 ;;
    --no-firecrawl)        WITH_FIRECRAWL=0 ;;
    --no-gentle-ai)        WITH_GENTLE_AI=0 ;;
    --with-gentle-ai)      WITH_GENTLE_AI=1 ;;   # (default; mantiene compatibilidad)
    --gentle-ai-channel=*) GENTLE_AI_CHANNEL="${arg#*=}" ;;
    --uninstall)           MODE="uninstall" ;;
    --dry-run)             MODE="dry-run" ;;
    --help|-h)             MODE="help" ;;
    *) echo "Opción desconocida: $arg (usá --help)" >&2; exit 2 ;;
  esac
done

say() { printf '\033[1m[guild]\033[0m %s\n' "$1"; }

if [ "$MODE" = "help" ]; then sed -n '2,26p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0; fi

# ── qué pipeline posee cada skill/agente/comando ──────────────────────────────
# craft-core y los skills auxiliares van SIEMPRE (son la columna compartida).
skill_pipeline() { case "$1" in
  landing-craft) echo landing;; app-craft) echo app;; system-craft) echo system;;
  security-craft) echo security;; *) echo core;; esac; }

# Un agente/ comando pertenece a un pipeline si su nombre está en la lista del pipeline.
# (Los oficios no llevan prefijo, así que mantenemos un índice explícito.)
LANDING_ROLES="surveyor cartographer strategist draughtsman wordsmith stylist wright choreographer burnisher crier arbiter courier assessor restorer"
APP_ROLES="prospector ethnographer wayfinder artificer framer envoy joiner steward conductor lapidary magistrate examiner renovator"
SYSTEM_ROLES="scout architect quartermaster archivist codifier foreman herald navigator mason inspector smith"
SECURITY_ROLES="sentinel breaker warden locksmith"

role_pipeline() { for r in $LANDING_ROLES; do [ "$1" = "$r" ] && { echo landing; return; }; done
  for r in $APP_ROLES; do [ "$1" = "$r" ] && { echo app; return; }; done
  for r in $SYSTEM_ROLES; do [ "$1" = "$r" ] && { echo system; return; }; done
  for r in $SECURITY_ROLES; do [ "$1" = "$r" ] && { echo security; return; }; done
  echo core; }

wanted() { # $1 = pipeline de la pieza. core siempre entra.
  [ "$1" = core ] && return 0
  [ -z "$ONLY" ] && return 0
  case ",$ONLY," in *",$1,"*) return 0;; *) return 1;; esac; }

# ── de dónde sale la fuente ───────────────────────────────────────────────────
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP=""
if [ -d "$SELF_DIR/skills" ] && [ -d "$SELF_DIR/agents" ]; then
  SRC="$SELF_DIR"; [ "$MODE" = install ] && say "Fuente local: $SRC"
else
  TMP="$(mktemp -d)"; trap 'rm -rf "${TMP:?}"' EXIT
  say "Descargando guild…"
  if command -v git >/dev/null 2>&1; then git clone --depth 1 --branch "$BRANCH" "$REPO" "$TMP/guild" >/dev/null 2>&1; SRC="$TMP/guild"
  else curl -fsSL "$REPO/archive/refs/heads/$BRANCH.tar.gz" -o "$TMP/g.tar.gz"; tar -xzf "$TMP/g.tar.gz" -C "$TMP"; SRC="$TMP/guild-$BRANCH"; fi
fi

# ── desinstalar ───────────────────────────────────────────────────────────────
if [ "$MODE" = "uninstall" ]; then
  for base in "$CLAUDE_DIR" "$OPENCODE_DIR" "$CURSOR_DIR"; do
    [ -d "$base" ] || continue
    for d in "$SRC"/skills/*/; do rm -rf "$base/skills/$(basename "$d")"; done
    for ad in agents agent;    do [ -d "$base/$ad" ] && for f in "$SRC"/agents/*.md;   do rm -f "$base/$ad/$(basename "$f")"; done; done
    for cd in commands command; do [ -d "$base/$cd" ] && for f in "$SRC"/commands/*.md; do rm -f "$base/$cd/$(basename "$f")"; done; done
  done
  say "Desinstalado el gremio. (Impeccable, Gentle AI, settings.json y tu shell NO se tocaron.)"; exit 0
fi

DRY=""; [ "$MODE" = "dry-run" ] && DRY="1"

# OpenCode/Cursor rechazan el frontmatter `tools:` de Claude → transform.
oc_transform() { awk -v k="$3" 'BEGIN{fm=0}
  /^---[[:space:]]*$/{print;fm++;if(fm==1&&k=="agent")print "mode: subagent";next}
  fm==1&&/^(tools|model|effort|argument-hint):/{next}{print}' "$1" > "$2/$(basename "$1")"; }

install_into() { # $1 = base dir, $2 = agent-subdir, $3 = cmd-subdir, $4 = transform(1/0)
  local base="$1" asub="$2" csub="$3" tr="$4"
  mkdir -p "$base/skills" "$base/$asub" "$base/$csub"
  for d in "$SRC"/skills/*/; do n="$(basename "$d")"
    wanted "$(skill_pipeline "$n")" || continue
    [ -n "$DRY" ] && continue; rm -rf "$base/skills/$n"; cp -R "$d" "$base/skills/$n"; done
  # Impeccable (si se copió a la fuente) va con landing/app o si no hay --only
  for f in "$SRC"/agents/*.md; do n="$(basename "$f" .md)"
    wanted "$(role_pipeline "$n")" || continue
    [ -n "$DRY" ] && continue
    if [ "$tr" = 1 ]; then oc_transform "$f" "$base/$asub" agent; else cp "$f" "$base/$asub/"; fi; done
  for f in "$SRC"/commands/*.md; do
    [ -n "$DRY" ] && continue
    if [ "$tr" = 1 ]; then oc_transform "$f" "$base/$csub" command; else cp "$f" "$base/$csub/"; fi; done
}

# ── Impeccable (terceros, MIT) — se copia a la fuente para que todo destino lo reciba ──
if [ "$WITH_IMPECCABLE" = 1 ] && [ -z "$DRY" ] && [ ! -d "$SRC/skills/impeccable" ] \
   && { [ -z "$ONLY" ] || case ",$ONLY," in *,landing,*|*,app,*) true;; *) false;; esac; } \
   && command -v git >/dev/null 2>&1; then
  say "Trayendo Impeccable… (GUILD_IMPECCABLE=0 o --no-impeccable para saltarlo)"
  _it="${TMP:-$(mktemp -d)}"
  git clone --depth 1 https://github.com/pbakaus/impeccable.git "$_it/imp" >/dev/null 2>&1 \
    && [ -d "$_it/imp/.agents/skills/impeccable" ] && cp -R "$_it/imp/.agents/skills/impeccable" "$SRC/skills/impeccable" || true
fi

SK=$(find "$SRC"/skills -maxdepth 1 -mindepth 1 -type d | wc -l|tr -d ' ')
AG=$(find "$SRC"/agents -name '*.md'|wc -l|tr -d ' ')
CM=$(find "$SRC"/commands -name '*.md'|wc -l|tr -d ' ')

if [ -n "$DRY" ]; then
  say "[dry-run] Fuente: $SK skills · $AG agentes · $CM comandos"
  say "[dry-run] Pipelines: ${ONLY:-todos} · Impeccable=$WITH_IMPECCABLE · Firecrawl=$WITH_FIRECRAWL · GentleAI=$WITH_GENTLE_AI"
  say "[dry-run] Destinos: Claude Code$([ -d "$OPENCODE_DIR" ]||command -v opencode>/dev/null 2>&1 && echo ' + OpenCode') $([ -d "$CURSOR_DIR" ]||command -v cursor>/dev/null 2>&1 && echo '+ Cursor')"
  say "[dry-run] Nada se modificó."; exit 0
fi

say "Instalando ${ONLY:+pipelines $ONLY }en Claude Code…"
install_into "$CLAUDE_DIR" agents commands 0
INST="Claude"
if [ -d "$OPENCODE_DIR" ] || command -v opencode >/dev/null 2>&1; then install_into "$OPENCODE_DIR" agent command 1; INST="$INST OpenCode"; fi
if [ -d "$CURSOR_DIR" ]   || command -v cursor   >/dev/null 2>&1; then install_into "$CURSOR_DIR" agents commands 1; INST="$INST Cursor"; fi
say "Instalado en: $INST"
say ""
say "Pipelines:  /landing · /app · /proyecto · /seguridad   (oficios en docs/OFICIOS.md)"

# ── Firecrawl (opcional — solo un aviso si no está) ───────────────────────────
if [ "$WITH_FIRECRAWL" = 1 ]; then
  if [ -n "${FIRECRAWL_URL:-}" ] || { [ -f "$CLAUDE_DIR/settings.json" ] && grep -q FIRECRAWL_URL "$CLAUDE_DIR/settings.json" 2>/dev/null; }; then
    say "Firecrawl ya configurado — ok."
  else
    say "Firecrawl (opcional, research de landing): definí FIRECRAWL_URL en tu shell cuando quieras."
  fi
fi

# ── Gentle AI (terceros — NO se corre en silencio) ────────────────────────────
GENTLE_CMD="curl -fsSL https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/scripts/install.sh | bash"
[ "$GENTLE_AI_CHANNEL" != stable ] && GENTLE_CMD="$GENTLE_CMD -s -- --channel $GENTLE_AI_CHANNEL"
say ""
if [ "$WITH_GENTLE_AI" = 1 ]; then
  say "Gentle AI: corriendo su instalador oficial (Gentleman-Programming/gentle-ai)…"
  bash -c "$GENTLE_CMD" || say "  El instalador de Gentle AI falló o se canceló — guild ya quedó instalado igual."
else
  say "Gentle AI (memoria + SDD + skills, de Gentleman-Programming) NO se instaló."
  say "  Es un instalador de terceros que configura tu entorno. Si lo querés, corré su comando oficial:"
  say "    $GENTLE_CMD"
  say "  O reinstalá sin --no-gentle-ai para que lo corra por vos."
fi
say ""
say "Recargá tu herramienta (Claude: /reload-plugins) y probá /proyecto o /seguridad."
