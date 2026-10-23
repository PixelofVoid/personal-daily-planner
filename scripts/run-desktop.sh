#!/usr/bin/env bash
# Launch Planner without FUSE (AppImage needs libfuse.so.2, which many systems lack).
set -euo pipefail
ROOT="$(cd "$(dirname "$(readlink -f "$0")")/.." && pwd)"
BIN="$ROOT/dist-linux/linux-unpacked/planner-android"
if [ ! -x "$BIN" ]; then
  echo "Planner desktop build not found at:"
  echo "  $BIN"
  echo "Rebuild with: cd $ROOT && npm run dist:linux"
  exit 1
fi
# AppImage needs libfuse.so.2 (not installed here). Unpacked binary does not.
# Hyprland/Wayland + Electron Vulkan is unreliable; use X11.
export ELECTRON_OZONE_PLATFORM_HINT=x11
exec "$BIN" --no-sandbox --ozone-platform=x11 --disable-features=Vulkan "$@"
