#!/usr/bin/env bash
# install.sh — instala los hooks de Git del perfil Python.
#
# POR QUÉ `core.hooksPath` Y NO COPIAR A .git/hooks/
# ────────────────────────────────────────────────────
# `.git/hooks/` NUNCA se trackea en Git — vive dentro del directorio `.git`,
# no del árbol de trabajo. Copiar los hooks ahí los deja funcionando en TU
# clon, pero invisibles para todos los demás: no aparecen en el diff de
# ningún PR, un clon nuevo no los tiene hasta que alguien se acuerda de correr
# este script otra vez, y una edición futura del hook se desincroniza en
# silencio de lo que el resto del equipo (o un agente clonando de cero) tiene
# instalado. Es el mismo modo de falla que el `install.sh` de la raíz de este
# kit evita con symlinks en vez de copias — acá el equivalente es un archivo
# TRACKEADO en el repo del proyecto, no un symlink (los symlinks no aplican:
# estos hooks viven DENTRO del repo del proyecto que se está bootstrapeando,
# no en `~/.claude`).
#
# `git config core.hooksPath hooks` le dice a Git que busque los hooks en una
# carpeta DENTRO del árbol de trabajo — versionada, visible en cada PR que la
# toque, igual para todo el equipo y para cualquier agente que clone el repo.
# Es exactamente lo que Husky hace por vos en el perfil TypeScript (con un
# mecanismo distinto por dentro); acá se hace explícito porque Python no
# tiene un paquete equivalente instalado por defecto.
#
# LA ÚNICA DESVENTAJA REAL: mientras `core.hooksPath` está seteado, Git deja
# de mirar `.git/hooks/` por completo. Si alguna herramienta de terceros
# instala ahí un hook propio (poco común, pero pasa con algunos IDEs o
# gestores de paquetes), hay que fusionarlo a mano dentro de `hooks/`.
#
# Uso: bash hooks/install.sh   (una vez, después de clonar)

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "🚨 No estás dentro de un repositorio Git. Corré esto desde la raíz del" >&2
  echo "   proyecto, después de haber hecho 'git init' o 'git clone'." >&2
  exit 1
}
cd "$REPO_ROOT"

if [ ! -f hooks/pre-commit ] || [ ! -f hooks/pre-push ]; then
  echo "🚨 No encuentro hooks/pre-commit y hooks/pre-push en $REPO_ROOT." >&2
  echo "   Este script asume que ya se bootstrapearon desde" >&2
  echo "   templates/profiles/python/hooks/ a la carpeta hooks/ del proyecto." >&2
  echo "   Si tu proyecto los puso en otro lado, ajustá HOOKS_DIR más abajo." >&2
  exit 1
fi

chmod +x hooks/pre-commit hooks/pre-push
git config core.hooksPath hooks

echo "✓ hooks instalados — core.hooksPath -> hooks/"
echo "  Verificalo con: git config core.hooksPath"
echo "  pre-commit corre en cada 'git commit' (~1s); pre-push corre 'make verify' completo."
