# CLAUDE.md

The HotCodePush Capacitor demo: a minimal Capacitor 8 app on `@hotcodepush/capacitor-live-updates`, the app that receives every update, the SDK's device test and the docs' screenshots.
Stack: plain TypeScript with Vite, no framework; the iOS project on Swift Package Manager, the Android project on Gradle.

The plan is the private `handbook` repo, checked out beside this one: `../handbook/docs/`.
`sdk-api.md` is the SDK's specification — the configuration, the resource file and the methods; `onboarding.md` describes the demo loop this app exists for.
When code and plan disagree, stop and surface it; never improvise.

## Layout

```
index.html, src/             the one screen: main.ts and style.css
hotcodepush.json             the project's configuration, as `init` writes it; placeholder ids until the app is created
capacitor.config.ts          webDir `dist`
ios/, android/               the native projects, committed; the copied web assets are not, and the resource file is written into the built app
```

## Commands

| Command             | Does                                                |
| ------------------- | --------------------------------------------------- |
| `npm run build`     | the web bundle into `dist/`                         |
| `npm run sync`      | `cap sync`, the web build into both native projects |
| `npm run lint`      | Prettier                                            |
| `npm run typecheck` | TypeScript                                          |
| `npm run dev`       | Vite in the browser, where the SDK is the web no-op |

Run `npm run fmt` before every commit.
The native builds: `xcodebuild -project ios/App/App.xcodeproj -scheme App -destination 'generic/platform=iOS Simulator' build` and `./gradlew assembleDebug` in `android/`, both after `npm run build && npx cap sync`; each runs the build step. `xcodebuild archive` with the same destination and `./gradlew assembleRelease` are the store builds that create the binary, the archived app at `<archive>/Products/Applications/App.app` and the release build signed with the debug key.

## The resource file

The SDK reads `hotcodepush.json` from the app bundle on iOS and from `assets/` on Android: the project's file plus `builtAt`, `fingerprint`, `embeddedBundleManifest` and `embeddedBundleId`.
The build step `init` wired into the native builds writes it into the built app: the Xcode phase "Create HotCodePush binary" runs the SDK's `scripts/binary-create-xcode.sh`, the `apply from` line in `android/app/build.gradle` the SDK's `android/hotcodepush.gradle`. An Xcode archive or a Gradle release variant runs `binary create`, which also creates the store build's binary in HotCodePush when the CLI holds a token; every other build runs `resource-file write` and creates nothing.
Without a token the file carries no channel and creates no binary, and in such a build an explicit check answers `FAILED · CHANNEL_UNKNOWN` while the automatic ones stay silent; in CI a store build without a token fails, unless `HOTCODEPUSH_OFFLINE=1` says the build is never shipped; `ci.yml` builds Debug, which never fails for a missing token.
The CLI is the `hotcodepush` devDependency, pinned like the SDK to the pkg.pr.new build of one commit, so `npx hotcodepush` resolves from `node_modules`.
`HOTCODEPUSH_FILES_BASE_URL` and `HOTCODEPUSH_UPDATES_BASE_URL` point the SDK at another host, the local stack or staging.

## Dependencies during the build phase

The SDK is pinned to the pkg.pr.new build of one commit, `https://pkg.pr.new/hotcodepush-team/capacitor-live-updates/@hotcodepush/capacitor-live-updates@<sha>`, never `@main`; a bump is one edit of that sha.
The CLI is pinned the same way, `https://pkg.pr.new/hotcodepush-team/cli/hotcodepush@<sha>`.
The SDK's Android core comes from core-android's `maven` branch at the commit the SDK pins, a repository the plugin adds to every project of the app's build itself, so `android/build.gradle` lists nothing for it; its iOS core resolves through Swift Package Manager on its own.
Every other dependency is pinned to an exact version and bumped by Renovate.

## Agent workspace

- `.mcp.json` registers the Capacitor server; the HotCodePush server joins when it exists.
- `.claude/skills/` holds the developer skills copied from `hotcodepush-team/.github`, pinned in `skills-lock.json`.
- Commits are conventional commits; `main` is trunk, CI is the gate, and a commit that lands an issue says `Closes #<n>`.
