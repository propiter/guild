#!/usr/bin/env bash
#
# guild installer — el gremio entero, en un comando, para Claude Code · OpenCode · Cursor.
#
#   local:   ./install.sh
#   remoto:  curl -fsSL https://raw.githubusercontent.com/propiter/guild/main/install.sh | bash
#
# Una fuente, varios destinos (sin duplicar contenido). Detecta qué herramientas de IA tenés e
# instala en cada una. Idempotente. Sin sudo, sin npm global, nada corre en segundo plano.
#
#   --uninstall   quita todo lo que este instalador puso (solo lo del gremio)
#   --dry-run     muestra qué haría, sin tocar nada
#
set -euo pipefail

REPO="${GUILD_REPO:-https://github.com/propiter/guild}"
BRANCH="${GUILD_BRANCH:-main}"
WITH_IMPECCABLE="${GUILD_IMPECCABLE:-1}"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
OPENCODE_DIR="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
CURSOR_DIR="${CURSOR_CONFIG_DIR:-$HOME/.cursor}"

MODE="install"
case "${1:-}" in
  --uninstall) MODE="uninstall" ;;
  --dry-run)   MODE="dry-run" ;;
  "") ;;
  *) echo "Opción desconocida: $1" >&2; exit 2 ;;
esac

say() { printf '\033[1m[guild]\033[0m %s\n' "$1"; }

# OpenCode/Cursor rechazan el frontmatter `tools:` de Claude → se quitan claves solo-Claude y se
# marca el agente `mode: subagent`. (Claude recibe los archivos tal cual; solo estos destinos se transforman.)
oc_transform() {  # $1 archivo, $2 dir destino, $3 = agent|command
  awk -v k="$3" 'BEGIN{fm=0}
    /^---[[:space:]]*$/{print;fm++;if(fm==1&&k=="agent")print "mode: subagent";next}
    fm==1&&/^(tools|model|effort|argument-hint):/{next}
    {print}' "$1" > "$2/$(basename "$1")"
}

# ── de dónde sale la fuente ───────────────────────────────────────────────────
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP=""
if [ -d "$SELF_DIR/skills" ] && [ -d "$SELF_DIR/agents" ]; then
  SRC="$SELF_DIR"                       # ejecutado desde el repo (modo local)
  say "Fuente local: $SRC"
else
  TMP="$(mktemp -d)"; trap 'rm -rf "${TMP:?}"' EXIT
  say "Descargando guild…"
  if command -v git >/dev/null 2>&1; then
    git clone --depth 1 --branch "$BRANCH" "$REPO" "$TMP/guild" >/dev/null 2>&1
    SRC="$TMP/guild"
  else
    curl -fsSL "$REPO/archive/refs/heads/$BRANCH.tar.gz" -o "$TMP/g.tar.gz"
    tar -xzf "$TMP/g.tar.gz" -C "$TMP"; SRC="$TMP/guild-$BRANCH"
  fi
fi

# ── desinstalar ───────────────────────────────────────────────────────────────
if [ "$MODE" = "uninstall" ]; then
  for base in "$CLAUDE_DIR" "$OPENCODE_DIR" "$CURSOR_DIR"; do
    [ -d "$base" ] || continue
    for sd in skills; do for d in "$SRC"/skills/*/; do rm -rf "$base/$sd/$(basename "$d")"; done; done
    for ad in agents agent;   do [ -d "$base/$ad" ] && for f in "$SRC"/agents/*.md;   do rm -f "$base/$ad/$(basename "$f")"; done; done
    for cd in commands command; do [ -d "$base/$cd" ] && for f in "$SRC"/commands/*.md; do rm -f "$base/$cd/$(basename "$f")"; done; done
  done
  say "Desinstalado. (settings.json y tu perfil de shell NO se tocaron.)"
  exit 0
fi

DRY=""; [ "$MODE" = "dry-run" ] && DRY="1"
copy_skills() { [ -n "$DRY" ] && return 0; for d in "$SRC"/skills/*/; do n="$(basename "$d")"; rm -rf "${1:?}/${n:?}"; cp -R "$d" "$1/$n"; done; }

# Impeccable (terceros, Apache-2.0) — motor estético que landing-craft/app-craft usan.
if [ "$WITH_IMPECCABLE" = "1" ] && [ -z "$DRY" ] && [ ! -d "$SRC/skills/impeccable" ] && command -v git >/dev/null 2>&1; then
  say "Trayendo Impeccable… (el paso lento — unos segundos; GUILD_IMPECCABLE=0 para saltarlo)"
  if git clone --depth 1 https://github.com/pbakaus/impeccable.git "${TMP:-$SELF_DIR/.tmp}/imp" >/dev/null 2>&1 \
     && [ -d "${TMP:-$SELF_DIR/.tmp}/imp/.agents/skills/impeccable" ]; then
    cp -R "${TMP:-$SELF_DIR/.tmp}/imp/.agents/skills/impeccable" "$SRC/skills/impeccable"
  fi
fi

SKILL_COUNT=$(find "$SRC"/skills -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d ' ')
AGENT_COUNT=$(find "$SRC"/agents -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')
CMD_COUNT=$(find "$SRC"/commands -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')
INSTALLED=""

if [ -n "$DRY" ]; then
  say "[dry-run] Instalaría $SKILL_COUNT skills · $AGENT_COUNT agentes · $CMD_COUNT comandos en Claude Code"
  [ -d "$OPENCODE_DIR" ] || command -v opencode >/dev/null 2>&1 && say "[dry-run] … y en OpenCode"
  [ -d "$CURSOR_DIR" ]   || command -v cursor   >/dev/null 2>&1 && say "[dry-run] … y en Cursor"
  say "[dry-run] Nada se modificó."
  exit 0
fi

say "Instalando $SKILL_COUNT skills · $AGENT_COUNT agentes · $CMD_COUNT comandos…"

# ── Claude Code (además alimenta a OpenCode, que lee ~/.claude/skills/) ────────
mkdir -p "$CLAUDE_DIR/skills" "$CLAUDE_DIR/agents" "$CLAUDE_DIR/commands"
copy_skills "$CLAUDE_DIR/skills"
cp "$SRC"/agents/*.md   "$CLAUDE_DIR/agents/"
cp "$SRC"/commands/*.md "$CLAUDE_DIR/commands/"
INSTALLED="$INSTALLED Claude(~/.claude)"

# ── OpenCode ──────────────────────────────────────────────────────────────────
if [ -d "$OPENCODE_DIR" ] || command -v opencode >/dev/null 2>&1; then
  mkdir -p "$OPENCODE_DIR/skills" "$OPENCODE_DIR/agent" "$OPENCODE_DIR/command"
  copy_skills "$OPENCODE_DIR/skills"
  for f in "$SRC"/agents/*.md;   do oc_transform "$f" "$OPENCODE_DIR/agent"   agent;   done
  for f in "$SRC"/commands/*.md; do oc_transform "$f" "$OPENCODE_DIR/command" command; done
  INSTALLED="$INSTALLED OpenCode(~/.config/opencode)"
fi

# ── Cursor (best-effort) ──────────────────────────────────────────────────────
if [ -d "$CURSOR_DIR" ] || command -v cursor >/dev/null 2>&1; then
  mkdir -p "$CURSOR_DIR/skills" "$CURSOR_DIR/agents" "$CURSOR_DIR/commands"
  copy_skills "$CURSOR_DIR/skills"
  for f in "$SRC"/agents/*.md;   do oc_transform "$f" "$CURSOR_DIR/agents"   agent;   done
  for f in "$SRC"/commands/*.md; do oc_transform "$f" "$CURSOR_DIR/commands" command; done
  INSTALLED="$INSTALLED Cursor(~/.cursor)"
fi

say "Instalado en:$INSTALLED"
say ""
say "Los cuatro pipelines del gremio:"
say "  landing  →  /landing \"<tu producto>\"          un sitio de marketing, desplegado"
say "  app      →  /app \"<lo que necesitás>\"          la interfaz de una aplicación"
say "  system   →  /proyecto \"<tu sistema>\"           el proyecto entero, con arquitectura y CI"
say "  security →  /seguridad \"<qué endurecer>\"       ataca tu propia obra y la endurece"
say ""

# ── Firecrawl (opcional — landing-craft lo usa para investigación de mercado) ──
_profile="$HOME/.profile"
case "${SHELL##*/}" in zsh) _profile="$HOME/.zshrc" ;; bash) _profile="$HOME/.bashrc" ;; esac
_fc_found=""
if [ -n "${FIRECRAWL_URL:-}" ]; then _fc_found="shell env"
elif [ -f "$CLAUDE_DIR/settings.json" ] && grep -q 'FIRECRAWL_URL' "$CLAUDE_DIR/settings.json" 2>/dev/null; then _fc_found="~/.claude/settings.json"
elif grep -q '^export FIRECRAWL_URL=' "$_profile" 2>/dev/null; then _fc_found="$_profile"; fi
if [ -n "$_fc_found" ]; then
  say "Firecrawl ya configurado (en $_fc_found) — se omite."
else
  say "Firecrawl (opcional, para investigación de mercado de landing-craft): definí FIRECRAWL_URL en tu shell cuando quieras."
fi

say ""
say "Recargá tu herramienta (Claude: /reload-plugins · OpenCode: reiniciar) y probá /proyecto o /seguridad."
