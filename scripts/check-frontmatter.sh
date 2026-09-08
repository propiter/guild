#!/usr/bin/env bash
# check-frontmatter.sh — validate YAML frontmatter in agents/*.md and skills/*/SKILL.md.
# Checks that each file has a frontmatter block (between the first two ---) containing
# at least the keys  name  and  description .
# Prints ✓/✗ per file.  Exits 1 if any file fails.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

FAIL=0

check_file() {
  local file="$1"
  local rel="${file#${REPO_ROOT}/}"

  # Extract frontmatter: text between first --- and second ---
  # Use node for reliable multi-line extraction without bashisms.
  local result
  result=$(node -e "
    const fs = require('fs');
    const content = fs.readFileSync('${file}', 'utf8');
    const lines = content.split('\n');
    let inFm = false, started = false, fm = [];
    for (const line of lines) {
      if (!started && line.trim() === '---') { inFm = true; started = true; continue; }
      if (inFm && line.trim() === '---') { inFm = false; break; }
      if (inFm) fm.push(line);
    }
    if (!started) { process.stdout.write('NO_FRONTMATTER'); process.exit(0); }
    const block = fm.join('\n');
    const hasName = /^name[[:space:]]*:/m.test(block) || /^name\s*:/m.test(block);
    const hasDesc = /^description\s*:/m.test(block);
    // re-check with proper regex
    const hN = /^name\s*:/m.test(block);
    const hD = /^description\s*:/m.test(block);
    if (!hN && !hD) { process.stdout.write('MISSING_BOTH'); }
    else if (!hN)   { process.stdout.write('MISSING_NAME'); }
    else if (!hD)   { process.stdout.write('MISSING_DESCRIPTION'); }
    else             { process.stdout.write('OK'); }
  " 2>/dev/null || echo "NODE_ERROR")

  if [ "$result" = "OK" ]; then
    printf '  ✓  %s\n' "$rel"
  else
    printf '  ✗  %s  [%s]\n' "$rel" "$result" >&2
    FAIL=1
  fi
}

# ── gather files ──────────────────────────────────────────────────────────────

FILES=()
while IFS= read -r -d '' f; do
  FILES+=("$f")
done < <(find "${REPO_ROOT}/agents" -name "*.md" -print0 2>/dev/null)

while IFS= read -r -d '' f; do
  FILES+=("$f")
done < <(find "${REPO_ROOT}/skills" -name "SKILL.md" -print0 2>/dev/null)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "WARNING: no agent or SKILL.md files found under ${REPO_ROOT}"
  exit 0
fi

echo "Checking frontmatter (name + description required):"
for f in "${FILES[@]}"; do
  check_file "$f"
done

if [ "$FAIL" -eq 1 ]; then
  echo ""
  echo "ERROR: one or more files are missing required frontmatter fields." >&2
  exit 1
fi

echo ""
echo "OK: all frontmatter checks passed."
