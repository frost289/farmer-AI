#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -x "$ROOT_DIR/.venv/bin/python" ]]; then
  PYTHON="$ROOT_DIR/.venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON="$(command -v python3)"
else
  echo "Python 3 is required on the Codespaces host." >&2
  exit 1
fi

mkdir -p .docker-wheelhouse

echo "Downloading pinned Python dependencies on the Codespaces host..."
"$PYTHON" -m pip download --only-binary=:all: --dest .docker-wheelhouse \
  -r ai-services/advisory/requirements.txt \
  -r ai-services/vision/requirements.txt \
  -r ai-services/speech/requirements.txt

echo
echo "Wheelhouse prepared at .docker-wheelhouse/"
echo "The Docker AI-service builds can now install dependencies without contacting PyPI."
