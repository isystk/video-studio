#!/bin/bash
set -eu -o pipefail

WORK="${1:-}"
C_BASE="/workspace"
C_REMOTION="$C_BASE/remotion"
C_WORKS="$C_BASE/works"
C_ASSETS="$C_BASE/assets"

if [ -n "$WORK" ]; then
  LATEST="$C_BASE/$WORK"
else
  LATEST=$(ls -td "$C_WORKS"/*/ 2>/dev/null | head -1)
  LATEST="${LATEST%/}"
fi

if [ -z "$LATEST" ]; then
  echo "worksフォルダが見つかりません"
  exit 1
fi

echo "コピー元 (works): $LATEST"

rm -rf "$C_REMOTION/public/current"
mkdir -p "$C_REMOTION/public/current/audio" \
         "$C_REMOTION/public/current/assets" \
         "$C_REMOTION/public/current/bgm" \
         "$C_REMOTION/public/current/clips" \
         "$C_REMOTION/public/current/images"

while IFS= read -r path; do
  [ -n "$path" ] || continue
  cp "$LATEST/audio/$(basename "$path")" "$C_REMOTION/public/current/audio/" 2>/dev/null || true
done < <(jq -r '.audioTracks[].path' "$LATEST/video.config.json")

while IFS= read -r path; do
  [ -n "$path" ] || continue
  cp "$LATEST/assets/$(basename "$path")" "$C_REMOTION/public/current/assets/" 2>/dev/null || true
done < <(jq -r '.layers[].path' "$LATEST/video.config.json")

cp "$C_ASSETS/bgm/"*.mp3 "$C_REMOTION/public/current/bgm/" 2>/dev/null || true
cp "$C_ASSETS/clips/"*.mp4 "$C_REMOTION/public/current/clips/" 2>/dev/null || true
cp "$C_ASSETS/images/"* "$C_REMOTION/public/current/images/" 2>/dev/null || true

find "$C_REMOTION/public/current" -name "*.mp4" | while read -r f; do
  tmp="${f%.mp4}_fs.mp4"
  ffmpeg -y -i "$f" -c copy -movflags +faststart "$tmp" -loglevel quiet < /dev/null && mv "$tmp" "$f"
done

echo "コピー完了（faststart変換済み）"
