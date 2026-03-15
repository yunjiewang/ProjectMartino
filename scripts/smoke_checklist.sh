#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/docs"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="${OUT_DIR}/smoke-checklist-${STAMP}.md"

cat > "${OUT_FILE}" <<'MD'
# Harmonic Orbit Cross-browser Smoke Checklist

> Fill this file during manual verification in Chrome / Safari / Edge.

## Environment
- Date:
- Tester:
- Build/branch:

## Browser Matrix
| Check | Chrome | Safari | Edge | Notes |
|---|---|---|---|---|
| Load `index.html` | ☐ | ☐ | ☐ | |
| Loop parse/apply demo | ☐ | ☐ | ☐ | |
| Landing + zone interaction | ☐ | ☐ | ☐ | |
| Candidate preview/apply audio | ☐ | ☐ | ☐ | |
| Mirror create + compare | ☐ | ☐ | ☐ | |
| Audition trail pin/promote | ☐ | ☐ | ☐ | |
| Session save/restore | ☐ | ☐ | ☐ | |
| Export/import JSON | ☐ | ☐ | ☐ | |
| Dialog keyboard focus | ☐ | ☐ | ☐ | |

## Outcome
- Blocking issues:
- Non-blocking issues:
- Ready for v1.0 gate? (yes/no):
MD

echo "Smoke checklist created: ${OUT_FILE}"
