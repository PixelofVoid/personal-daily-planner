#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WRAPPER="$ROOT/scripts/run-desktop.sh"
BIN="$ROOT/dist-linux/linux-unpacked/planner-android"
if [ ! -x "$BIN" ]; then
  echo "Unpacked desktop app not found. Run: npm run dist:linux"
  exit 1
fi
chmod +x "$WRAPPER"
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/512x512/apps"
mkdir -p "$BIN_DIR" "$APP_DIR" "$ICON_DIR"
ln -sfn "$WRAPPER" "$BIN_DIR/planner"
cp -f "$ROOT/assets/icon.png" "$ICON_DIR/planner.png"
cat > "$APP_DIR/planner.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Planner
Comment=Notes, plans, tasks, goals, and shopping lists
Exec=$WRAPPER
Icon=planner
Terminal=false
Categories=Office;Utility;
StartupNotify=true
EOF
chmod +x "$APP_DIR/planner.desktop"
update-desktop-database "$APP_DIR" >/dev/null 2>&1 || true
echo "Installed desktop launcher: $APP_DIR/planner.desktop"
echo "You can also run: $BIN_DIR/planner"
