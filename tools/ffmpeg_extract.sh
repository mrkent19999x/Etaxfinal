#!/usr/bin/env bash
set -euo pipefail

# Usage: tools/ffmpeg_extract.sh <mp4> <out_dir> [fps]
# Example: tools/ffmpeg_extract.sh "Clone ui -20251031T125433Z-1-001/93a0bc46eeb958dd2304bfc1d1c4c317.mp4" "Clone ui -20251031T125433Z-1-001/video_frames_10fps" 10

MP4=${1:-}
OUT=${2:-}
FPS=${3:-10}

if [[ -z "${MP4}" || -z "${OUT}" ]]; then
  echo "Usage: $0 <mp4> <out_dir> [fps]" >&2
  exit 1
fi

ROOT_DIR="$(dirname "$0")/.."
FFMPEG_BIN="${ROOT_DIR}/Clone ui -20251031T125433Z-1-001/ffmpeg"

if [[ ! -x "${FFMPEG_BIN}" ]]; then
  echo "ffmpeg binary not found at: ${FFMPEG_BIN}" >&2
  echo "Tip: run the analysis step that downloads static ffmpeg (already done in this workspace)." >&2
  exit 1
fi

mkdir -p "${OUT}"
"${FFMPEG_BIN}" -y -i "${MP4}" -vf fps=${FPS},scale=360:-1 "${OUT}/frame_%06d.jpg"
echo "Extracted frames to: ${OUT} (fps=${FPS})"

