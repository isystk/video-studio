#!/bin/bash
set -eu -o pipefail

WORK="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$DOCKER_DIR/.." && pwd)"

C_REMOTION="$PROJECT_ROOT/remotion"
C_WORKS="$PROJECT_ROOT/works"

if [ -n "$WORK" ]; then
  CONFIG="$PROJECT_ROOT/$WORK/video.config.json"
  if [ ! -f "$CONFIG" ]; then
    echo "video.config.json が見つかりません: $CONFIG"
    exit 1
  fi
  jq -s '.' "$CONFIG" > "$C_REMOTION/src/registry.json"
else
  CONFIGS=""
  for d in "$C_WORKS"/*/; do
    f="${d}video.config.json"
    if [ -f "$f" ]; then
      CONFIGS="$CONFIGS $f"
    fi
  done

  if [ -z "$CONFIGS" ]; then
    echo "[]" > "$C_REMOTION/src/registry.json"
  else
    jq -s '.' $CONFIGS > "$C_REMOTION/src/registry.json"
  fi
fi

echo "registry.json 生成完了（$(jq length "$C_REMOTION/src/registry.json") 件）"
