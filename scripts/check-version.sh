#!/usr/bin/env bash
# check-version.sh — assert all version strings across the repo are identical.
# Exits 0 if consistent, exits 1 with a clear diff message if not.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── extract versions ──────────────────────────────────────────────────────────

# plugin.json  →  "version": "X.Y.Z"
V_PLUGIN=$(node -e "
  const fs = require('fs');
  const p = '${REPO_ROOT}/.claude-plugin/plugin.json';
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  process.stdout.write(j.version);
")

# marketplace.json  →  metadata.version  (first occurrence in the plugins[0] block)
V_MARKET_META=$(node -e "
  const fs = require('fs');
  const p = '${REPO_ROOT}/.claude-plugin/marketplace.json';
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  process.stdout.write(j.metadata.version);
")

V_MARKET_PLUGIN=$(node -e "
  const fs = require('fs');
  const p = '${REPO_ROOT}/.claude-plugin/marketplace.json';
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  process.stdout.write(j.plugins[0].version);
")

# README.md  →  badge  version-X.Y.Z-black
V_README=$(grep -oE 'version-[0-9]+\.[0-9]+\.[0-9]+-black' \
  "${REPO_ROOT}/README.md" | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')

# Version-bearing SKILL.md files → frontmatter  version: "X.Y.Z"
# The version may be top-level or nested under a metadata: block — match either.
# The two pipelines and their shared spine ship as one plugin, so they version together.
skill_version() {
  grep -oE 'version:[[:space:]]+"[0-9]+\.[0-9]+\.[0-9]+"' \
    "${REPO_ROOT}/skills/$1/SKILL.md" | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+'
}

V_SKILL=$(skill_version landing-craft)
V_SKILL_CORE=$(skill_version craft-core)
V_SKILL_APP=$(skill_version app-craft)

# ── report ────────────────────────────────────────────────────────────────────

printf '%-50s  %s\n' ".claude-plugin/plugin.json"                "$V_PLUGIN"
printf '%-50s  %s\n' ".claude-plugin/marketplace.json (metadata)" "$V_MARKET_META"
printf '%-50s  %s\n' ".claude-plugin/marketplace.json (plugins[0])" "$V_MARKET_PLUGIN"
printf '%-50s  %s\n' "README.md (badge)"                          "$V_README"
printf '%-50s  %s\n' "skills/craft-core/SKILL.md (frontmatter)"    "$V_SKILL_CORE"
printf '%-50s  %s\n' "skills/landing-craft/SKILL.md (frontmatter)" "$V_SKILL"
printf '%-50s  %s\n' "skills/app-craft/SKILL.md (frontmatter)"     "$V_SKILL_APP"

# ── assert ────────────────────────────────────────────────────────────────────

VERSIONS=("$V_PLUGIN" "$V_MARKET_META" "$V_MARKET_PLUGIN" "$V_README" "$V_SKILL_CORE" "$V_SKILL" "$V_SKILL_APP")
LABELS=(
  ".claude-plugin/plugin.json"
  ".claude-plugin/marketplace.json:metadata.version"
  ".claude-plugin/marketplace.json:plugins[0].version"
  "README.md badge"
  "skills/craft-core/SKILL.md frontmatter"
  "skills/landing-craft/SKILL.md frontmatter"
  "skills/app-craft/SKILL.md frontmatter"
)

CANONICAL="${VERSIONS[0]}"
FAIL=0
for i in "${!VERSIONS[@]}"; do
  if [ "${VERSIONS[$i]}" != "$CANONICAL" ]; then
    echo "" >&2
    echo "VERSION MISMATCH: ${LABELS[$i]} is '${VERSIONS[$i]}', expected '$CANONICAL'" >&2
    FAIL=1
  fi
done

if [ "$FAIL" -eq 1 ]; then
  echo "" >&2
  echo "ERROR: Version strings are out of sync. Run scripts/release.sh <version> to align them." >&2
  exit 1
fi

echo ""
echo "OK: all version strings are consistent at $CANONICAL"
