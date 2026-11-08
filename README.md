# Xiine for Mac and Windows

Download the latest version from **https://xiine.app/download** or from the [Releases](https://github.com/panzexin047-art/xiine-desktop/releases/latest) page:

- Mac with Apple chip (M1, M2, M3, M4): `Xiine-mac-arm64.dmg`
- Mac with Intel chip: `Xiine-mac-x64.dmg`
- Windows 10 / 11: `Xiine-win-x64.exe`

The app opens [xiine.app](https://xiine.app) in its own window, so it is always up to date.

## First time you open it

The app is not yet signed with an Apple or Microsoft certificate, so the system asks once:

- **Mac**: open the `.dmg`, drag Xiine into Applications, then open it. If macOS says it can't verify the developer, go to **System Settings → Privacy & Security** and click **Open Anyway**.
- **Windows**: if you see "Windows protected your PC", click **More info → Run anyway**.

## Build

```bash
npm install
npm run dist:mac   # Mac .dmg files
npm run dist:win   # Windows .exe installer
```
