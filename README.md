# Personal Daily Planner

Offline notes, tasks, plans, goals, and shopping lists. Linux AppImage and Android APK, light and dark themes. Data stays on the device. No account or cloud.

## Features

- **Today** — overdue tasks, due today, goals, shopping, optional calendar
- **Tasks** — add, check off, due dates
- **Notes** — titled notes
- **Shop** — named lists
- **More** — plans with steps, goals, search, theme (System / Light / Dark)

Data stays on that device. Nothing is uploaded.

## Linux

From source (Node.js 18+):

```bash
git clone https://github.com/PixelofVoid/personal-daily-planner.git
cd personal-daily-planner
npm install
npm run desktop
```

Build a portable AppImage:

```bash
npm run dist:linux
bash scripts/install-appimage.sh
```

GitHub rejects files over 100 MB, so AppImages are not stored in this repo. Attach `dist-linux/Planner-1.0.0.AppImage` to a GitHub Release after building.

If an AppImage cannot mount (`libfuse.so.2` missing), install FUSE 2 or run with `--appimage-extract-and-run`.

## Android

Build an APK:

```bash
npm install
npm run dist:apk
```

Copy `dist-android/Planner.apk` to the phone and open it. Allow installing from that source if Android asks.

Package name: `com.roni.planner`.

Optional development: `npm start` and scan the QR code in Expo Go.

## License

MIT. See [LICENSE](LICENSE).
