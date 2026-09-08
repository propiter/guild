#!/usr/bin/env bash
# release.sh — bump version across all four version-bearing locations.
# Usage: scripts/release.sh <new-version>   (e.g. 1.11.0)
# Does NOT commit or push — review the diff, then commit manually.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── validate argument ─────────────────────────────────────────────────────────

NEW_VERSION="${1:-}"
if [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <new-version>  (e.g.  1.11.0)" >&2
  exit 1
fi

if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "ERROR: version must be semver X.Y.Z (got: '$NEW_VERSION')" >&2
  exit 1
fi

# ── discover current version from plugin.json ─────────────────────────────────

OLD_VERSION=$(node -e "
  const fs = require('fs');
  const j = JSON.parse(fs.readFileSync('${REPO_ROOT}/.claude-plugin/plugin.json', 'utf8'));
  process.stdout.write(j.version);
")

if [ "$OLD_VERSION" = "$NEW_VERSION" ]; then
  echo "Already at $NEW_VERSION — nothing to bump." >&2
  exit 0
fi

echo "Bumping $OLD_VERSION → $NEW_VERSION"

# ── bump helpers ──────────────────────────────────────────────────────────────

# Bump a JSON file field via node (safe, no sed fragility on JSON values).
bump_json_field() {
  local file="$1" field_path="$2" value="$3"
  node -e "
    const fs = require('fs');
    const p = '${file}';
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    const parts = '${field_path}'.split('.');
    let obj = j;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      const m = k.match(/^(.+)\[(\d+)\]$/);
      obj = m ? obj[m[1]][parseInt(m[2])] : obj[k];
    }
    obj[parts[parts.length - 1]] = '${value}';
    fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
  "
}

# ── 1. .claude-plugin/plugin.json ────────────────────────────────────────────

bump_json_field \
  "${REPO_ROOT}/.claude-plugin/plugin.json" \
  "version" \
  "$NEW_VERSION"
echo "  bumped .claude-plugin/plugin.json"

# ── 2. .claude-plugin/marketplace.json  (two occurrences) ────────────────────

bump_json_field \
  "${REPO_ROOT}/.claude-plugin/marketplace.json" \
  "metadata.version" \
  "$NEW_VERSION"

bump_json_field \
  "${REPO_ROOT}/.claude-plugin/marketplace.json" \
  "plugins[0].version" \
  "$NEW_VERSION"
echo "  bumped .claude-plugin/marketplace.json (metadata + plugins[0])"

# ── 3. README.md badge ────────────────────────────────────────────────────────

# Pattern: version-X.Y.Z-black  (inside a badge URL)
sed -i "s/version-${OLD_VERSION}-black/version-${NEW_VERSION}-black/g" \
  "${REPO_ROOT}/README.md"
echo "  bumped README.md badge"

# ── 4. version-bearing SKILL.md frontmatter ──────────────────────────────────

# The pipelines and their shared spine version together — they ship as one plugin.
# Pattern:  version: "X.Y.Z"  — may be top-level or indented (metadata: block).
# The sed matches any leading whitespace so it handles both forms.
for skill in craft-core landing-craft app-craft; do
  sed -i "s/\(^[[:space:]]*version:[[:space:]]*\)\"${OLD_VERSION}\"/\1\"${NEW_VERSION}\"/" \
    "${REPO_ROOT}/skills/${skill}/SKILL.md"
  echo "  bumped skills/${skill}/SKILL.md"
done

# ── validation pass ───────────────────────────────────────────────────────────

echo ""
echo "Running post-bump checks…"

bash "${REPO_ROOT}/scripts/check-version.sh"

echo ""
echo "Validating JSON…"
node -e "
  const fs = require('fs');
  JSON.parse(fs.readFileSync('${REPO_ROOT}/.claude-plugin/plugin.json', 'utf8'));
  console.log('  .claude-plugin/plugin.json      OK');
  JSON.parse(fs.readFileSync('${REPO_ROOT}/.claude-plugin/marketplace.json', 'utf8'));
  console.log('  .claude-plugin/marketplace.json  OK');
"

echo ""
echo "Validating install.sh syntax…"
bash -n "${REPO_ROOT}/install.sh"
echo "  install.sh  OK"

echo ""
echo "✅  bumped to ${NEW_VERSION} — review the diff, then commit & push"
