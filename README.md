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

Download **[Planner-1.0.0.AppImage](https://github.com/PixelofVoid/personal-daily-planner/releases/download/v1.0.0/Planner-1.0.0.AppImage)** from [Releases](https://github.com/PixelofVoid/personal-daily-planner/releases/latest):

```bash
chmod +x Planner-1.0.0.AppImage
./Planner-1.0.0.AppImage
```

If the AppImage cannot mount (`libfuse.so.2` missing), install FUSE 2 or run with `--appimage-extract-and-run`.

From source (Node.js 18+):

```bash
git clone https://github.com/PixelofVoid/personal-daily-planner.git
cd personal-daily-planner
npm install
npm run desktop
```

To build the AppImage yourself:

```bash
npm run dist:linux
bash scripts/install-appimage.sh
```

## Android

Download **[Planner-1.0.0.apk](https://github.com/PixelofVoid/personal-daily-planner/releases/download/v1.0.0/Planner-1.0.0.apk)** from [Releases](https://github.com/PixelofVoid/personal-daily-planner/releases/latest). Copy it to the phone and open it. Allow installing from that source if Android asks.

Package name: `com.roni.planner`.

To build the APK yourself:

```bash
npm install
npm run dist:apk
```

Optional development: `npm start` and scan the QR code in Expo Go.

## License

MIT. See [LICENSE](LICENSE).
