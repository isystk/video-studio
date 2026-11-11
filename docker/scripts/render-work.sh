#!/bin/bash
set -eu -o pipefail

WORK="${1:-}"
C_BASE="/workspace"
C_REMOTION="$C_BASE/remotion"

if [ -z "$WORK" ]; then
  echo "エラー: WORK を指定してください（例: works/2026-05-14_タイトル）"
  exit 1
fi

WORK_DIR="$C_BASE/$WORK"
CONFIG="$WORK_DIR/video.config.json"

if [ ! -f "$CONFIG" ]; then
  echo "エラー: video.config.json が見つかりません: $CONFIG"
  exit 1
fi

OUT_NAME=$(basename "$WORK_DIR")
COMP_ID=$(jq -r '.id' "$CONFIG")

mkdir -p "$C_BASE/output"

cd "$C_REMOTION" && npx remotion render src/index.ts "$COMP_ID" \
  --props="$CONFIG" \
  --timeout=120000 \
  --concurrency=1 \
  "$C_BASE/output/$OUT_NAME.mp4"
