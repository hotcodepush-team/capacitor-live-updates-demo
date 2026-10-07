# Capacitor live updates demo by HotCodePush

The demo app for [Capacitor live updates](https://hotcodepush.com/capacitor-live-updates) with `@hotcodepush/capacitor-live-updates`: one screen showing the bundle version, the current release, the device id, the last sync and the last rollback, a button that syncs now and a button that opens the SDK's debug screen.

## Installation

```sh
nvm use
npm ci
npm run build
npx cap sync
```

`npx cap sync` runs the CLI's build step, `binary create`, which writes the resource file `hotcodepush.json` into both native projects and, when you are logged in with `npx hotcodepush login`, creates the store build's binary in HotCodePush; open `ios/App/App.xcodeproj` in Xcode or `android/` in Android Studio and run the app.
Without a login the file carries no channel and the app takes no updates: a sync answers `FAILED · CHANNEL_UNKNOWN` and the automatic checks stay silent; in CI the same build fails unless `HOTCODEPUSH_OFFLINE=1` marks it as one that is never shipped.
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
npm run sync        # cap sync, whose hook runs binary create and writes the resource file into both native projects
```

The flows in `maestro/` are the update lifecycle contract, the device test the monorepo's `e2e/` runner drives on the simulator and the emulator: `golden-path.yaml` takes a release on a fresh install, `rollback.yaml` survives a build that never signals readiness, `revoke.yaml` leaves a revoked release for the older one, `incompatible.yaml` skips a release its binary does not qualify for, `debug-screen.yaml` opens the debug screen and shares its report, which names that skip's code, `invalid-signature.yaml` shows a build that carries a public key refusing a release that is unsigned or signed with a key it does not trust, and `signed.yaml` takes a signed release on a build whose report names the public key it carries.
Each flow after the first continues where the one before left the app, except these last two, which start on the fresh builds the runner installs with a key in their configuration; the runner publishes the releases in between and passes each flow its numbers. By hand, install the app, release `v2` with the CLI, then `maestro test -e EXPECTED_VERSION=v2 -e EXPECTED_RELEASE_NUMBER=1 maestro/golden-path.yaml`, and each flow's header names what it expects.

## License

See [LICENSE](./LICENSE).
