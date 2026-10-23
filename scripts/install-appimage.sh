#!/usr/bin/env bash
# Install Planner for the current user from the AppImage (no root, no FUSE unpack).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APPIMAGE="$ROOT/dist-linux/Planner-1.0.0.AppImage"
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
TARGET="$BIN_DIR/Planner.AppImage"

if [[ ! -x "$APPIMAGE" && ! -f "$APPIMAGE" ]]; then
  echo "AppImage not found at:"
  echo "  $APPIMAGE"
  echo "Rebuild with:  npm run dist:linux"
  exit 1
fi

mkdir -p "$BIN_DIR" "$APP_DIR" "$ICON_DIR"
cp -f "$APPIMAGE" "$TARGET"
chmod +x "$TARGET"
if [[ -f "$ROOT/assets/icon.png" ]]; then
  cp -f "$ROOT/assets/icon.png" "$ICON_DIR/planner.png"
fi

cat > "$APP_DIR/planner.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Planner
Comment=Notes, plans, tasks, goals, and shopping lists
Exec=$TARGET --no-sandbox --ozone-platform=x11 --disable-features=Vulkan
Icon=planner
Terminal=false
Categories=Office;Utility;
StartupNotify=true
EOF
chmod +x "$APP_DIR/planner.desktop"
update-desktop-database "$APP_DIR" >/dev/null 2>&1 || true
ln -sfn "$TARGET" "$BIN_DIR/planner"

echo "Installed Planner for $USER"
echo "  launcher: $APP_DIR/planner.desktop"
echo "  command:  planner"
echo "  file:     $TARGET"
echo
echo "If the AppImage cannot mount (missing FUSE), run:"
echo "  $TARGET --appimage-extract-and-run"
echo
echo "Android: copy dist-android/Planner.apk to the phone and open it to install."
