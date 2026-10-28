# Capacitor live updates demo by HotCodePush

The demo app for [Capacitor live updates](https://hotcodepush.com/capacitor-live-updates) with `@hotcodepush/capacitor-live-updates`: one screen showing the bundle version, the current release, the device id, the last sync and the last rollback, a button that syncs now and one that opens the SDK's debug screen.

## Getting started

```sh
nvm use
npm ci
npx hotcodepush login
npm run build
npx cap sync
```

Open `ios/App/App.xcodeproj` in Xcode or `android/` in Android Studio and run the app.
Every native build runs the CLI's build step, which writes `hotcodepush.json` into the app; an Xcode archive or an Android release build also registers the store build in HotCodePush.
Without a login the file names no channel and the app takes no updates.
Set `HOTCODEPUSH_FILES_BASE_URL` and `HOTCODEPUSH_UPDATES_BASE_URL` before the native build to point it at the local stack or staging.

## Usage

Run the app once: it shows `v1` and the current release `embedded`.
Change `VERSION` in `src/main.ts`, run `npm run build`, release with `npx hotcodepush release create --path dist`, and reopen the app to see the new label.

## Development

```sh
npm run dev         # Vite in the browser, where every SDK call rejects
npm run build       # the web bundle into dist/
npm run sync        # cap sync
npm run lint && npm run typecheck
npm run fmt         # run before every commit
```

The flows in `maestro/` are the update lifecycle contract the monorepo's `e2e/` runner drives on the simulator and the emulator; each flow's header names what it expects.
By hand: install the app, release `v2`, then `maestro test -e EXPECTED_VERSION=v2 -e EXPECTED_RELEASE_NUMBER=1 maestro/golden-path.yaml`.
`CLAUDE.md` holds the native build commands and the wiring.

## Documentation

See [hotcodepush.com/docs/capacitor](https://hotcodepush.com/docs/capacitor).

## License

See [LICENSE](./LICENSE).
