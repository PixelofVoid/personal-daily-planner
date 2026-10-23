#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=android-env.sh
source "$ROOT/scripts/android-env.sh"

if [ ! -x "$ANDROID_HOME/platform-tools/adb" ]; then
  echo "Android SDK not found at $ANDROID_HOME"
  echo "Install command-line tools and packages, then retry."
  exit 1
fi

cd "$ROOT"
npx expo prebuild -p android --non-interactive
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > android/local.properties

cd android
chmod +x gradlew
if ! ./gradlew assembleRelease; then
  echo "Release build needs a signing key; building a debug APK instead (still installable)."
  ./gradlew assembleDebug
fi

mkdir -p "$ROOT/dist-android"
APK="$(find "$ROOT/android/app/build/outputs/apk" -name '*.apk' | sort | tail -1)"
cp -f "$APK" "$ROOT/dist-android/Planner.apk"
echo "APK written to $ROOT/dist-android/Planner.apk"
