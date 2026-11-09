# CLAUDE.md

The HotCodePush Capacitor demo: a minimal Capacitor 8 app on `@hotcodepush/capacitor-live-updates`, the app that receives every update, the SDK's device test and the docs' screenshots.
Stack: plain TypeScript with Vite, no framework; the iOS project on Swift Package Manager, the Android project on Gradle.

The plan is the private `handbook` repo, checked out beside this one: `../handbook/docs/`.
`sdk-api.md` is the SDK's specification — the configuration, the resource file and the methods; `onboarding.md` describes the demo loop this app exists for.
When code and plan disagree, stop and surface it; never improvise.

## Layout

```
index.html, src/             the one screen: main.ts and style.css
hotcodepush.json             the project's configuration, as `init` writes it; it names the demo's own app in the HotCodePush organization on production
capacitor.config.ts          webDir `dist`, which the CLI's upload reads as the web build, the role `dir` had in `hotcodepush.json`
ios/, android/               the native projects, committed; the copied web assets are not, and the resource file is written into the built app
```

## Commands

| Command             | Does                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| `npm run build`     | the web bundle into `dist/`                                                        |
| `npm run sync`      | `cap sync`, the web build into both native projects                                |
| `npm run lint`      | Prettier                                                                           |
| `npm run typecheck` | TypeScript                                                                         |
| `npm run dev`       | Vite in the browser, where every SDK call rejects with Capacitor's `UNIMPLEMENTED` |

Run `npm run fmt` before every commit.
The native builds: `xcodebuild -project ios/App/App.xcodeproj -scheme App -destination 'generic/platform=iOS Simulator' build` and `./gradlew assembleDebug` in `android/`, both after `npm run build && npx cap sync`; each runs the build step. `xcodebuild archive` with the same destination and `./gradlew assembleRelease` are the store builds that create the binary, the archived app at `<archive>/Products/Applications/App.app` and the release build signed with the debug key.

`release.yml` builds the downloads, the Android release APK and the iOS simulator app, on every merge to `main` with `HOTCODEPUSH_TOKEN`, so the build step writes the channel into the app.
It stamps their label `v1`, publishes them as the rolling GitHub release `downloads` and ships the OTA release after them, so a download always takes the newest release and shows the label on `main`.

## The resource file

The SDK reads `hotcodepush.json` from the app bundle on iOS and from `assets/` on Android: the project's file with `channelId` in place of `channel`, every option the project left out at its default, `extraFingerprintPaths` dropped, plus `builtAt`, `fingerprint`, `embeddedBundleManifest` and `embeddedBundleId`; the embedded manifest leaves out `cordova.js`, `cordova_plugins.js` and `plugins/`, which the binary serves.
The build step `init` wired into the native builds writes it into the built app: the Xcode phase "Create HotCodePush binary" runs the SDK's `scripts/binary-create-xcode.sh`, the `apply from` line in `android/app/build.gradle` the SDK's `android/hotcodepush.gradle`. An Xcode archive or a Gradle release variant runs `binary create`, which also creates the store build's binary in HotCodePush when the CLI holds a token; every other build runs `resource-file write` and creates nothing.
Without a token the file carries no channel and creates no binary, and in such a build an explicit check answers `failed · channel_unknown` while the automatic ones stay silent; in CI a store build without a token fails, unless `HOTCODEPUSH_OFFLINE=1` says the build is never shipped; `ci.yml` builds Debug, which never fails for a missing token.
The CLI is the `hotcodepush` devDependency, pinned to an exact npm release, so `npx hotcodepush` resolves from `node_modules`.
`HOTCODEPUSH_FILES_BASE_URL` and `HOTCODEPUSH_UPDATES_BASE_URL` point the SDK at another host, the local stack or staging.

## Dependencies during the build phase

The SDK is pinned to its published release, `0.1.0`, bumped by hand when the SDK releases.
The CLI is pinned to an exact npm release in `devDependencies`, and the release workflow reads that pin as `cli-version`, so one bump moves the native builds and the release together.
The SDK's Android core comes from core-android's `maven` branch at the commit the SDK pins, a repository the plugin adds to every project of the app's build itself, so `android/build.gradle` lists nothing for it; its iOS core resolves through Swift Package Manager on its own.
Every other dependency is pinned to an exact version and bumped by Renovate.

## Comments

- Comment only what the code cannot say: the why behind a choice, an outside quirk or limit, what a regex matches, a TODO with its issue link. Never what the code does.
- Before adding a comment, try a clearer name or a small extracted function first.
- One or two short plain sentences. Capital letter, full stop, own line above the code. No run-on sentences, no chains of possessives.
- Doc comments (JSDoc, KDoc, `///`, docstrings) only on a package's public API: one line that says what it does, then only what a caller must know.
- Never: section banners, commented-out code, change history, the same comment in two places.

## Agent workspace

- `.mcp.json` registers the Capacitor server; the HotCodePush server joins when it exists.
- `.claude/skills/` holds the developer skills copied from `hotcodepush-team/.github` with the skills CLI and pinned in `skills-lock.json`; update them with `npx skills update`.
- `.github/copilot-instructions.md` holds the review criteria, the only Copilot-specific file.
- Commits are conventional commits; `main` is trunk, CI is the gate, and a commit that lands an issue says `Closes #<n>`.
