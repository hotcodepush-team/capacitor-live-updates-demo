# Capacitor live updates demo by HotCodePush

The demo app for [Capacitor live updates](https://hotcodepush.com/capacitor-live-updates) with `@hotcodepush/capacitor-live-updates`: one screen showing the bundle version, the current release and the device id, and a button that syncs now.

## Installation

```sh
nvm use
npm ci
npm run build
npx cap sync
```

`npx cap sync` writes the resource file `hotcodepush.json` into both native projects; open `ios/App/App.xcodeproj` in Xcode or `android/` in Android Studio and run the app.
Point it at another host, the local stack or staging, by setting `HOTCODEPUSH_FILES_BASE_URL` and `HOTCODEPUSH_UPDATES_BASE_URL` before `npx cap sync`.

## Usage

Run the app once: it shows `v1` and the current release `embedded`.
Change `VERSION` in `src/main.ts`, run `npm run build`, release the bundle with the HotCodePush CLI, and reopen the app to see the new label.

## Documentation

The SDK reference is at [hotcodepush.com/docs/capacitor](https://hotcodepush.com/docs/capacitor).

## Development

```sh
npm run lint        # Prettier
npm run typecheck   # TypeScript
npm run build       # the web bundle into dist/
npm run sync        # cap sync, then the resource file into both native projects
```

The golden path in `maestro/golden-path.yaml` is the device test the monorepo's `e2e/` runner drives on the simulator and the emulator; by hand, install the app, release `v2` with the CLI, then `maestro test -e EXPECTED_VERSION=v2 -e EXPECTED_RELEASE_NUMBER=1 maestro/golden-path.yaml`.

## License

See [LICENSE](./LICENSE).
