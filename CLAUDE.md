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
ios/, android/               the native projects, committed; the copied web assets and the resource file are not
```

## Commands

| Command             | Does                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| `npm run build`     | the web bundle into `dist/`                                              |
| `npm run sync`      | `cap sync`, whose hook runs `binary create` and writes the resource file |
| `npm run lint`      | Prettier                                                                 |
| `npm run typecheck` | TypeScript                                                               |
| `npm run dev`       | Vite in the browser, where the SDK is the web no-op                      |

Run `npm run fmt` before every commit.
The native builds: `xcodebuild -project ios/App/App.xcodeproj -scheme App -destination 'generic/platform=iOS Simulator' build` and `./gradlew assembleDebug` in `android/`, both after `npm run build && npx cap sync`.

## The resource file

The SDK reads `hotcodepush.json` from the app bundle on iOS and from `assets/` on Android: the project's file plus `builtAt`, `fingerprint`, `embeddedBundleManifest` and `embeddedBundleId`.
The `capacitor:copy:after` hook, `npx hotcodepush binary create` as `init` wired it, writes it on every `cap copy` and `cap sync`, into `ios/App/App/` — referenced as a resource in the Xcode project — and `android/app/src/main/assets/`, and creates the store build's binary in HotCodePush when the CLI holds a token.
Without a token it writes the file without a channel and creates no binary, and in such a build an explicit check answers `FAILED · UNKNOWN_CHANNEL` while the automatic ones stay silent; in CI a missing token fails the build instead, unless `HOTCODEPUSH_OFFLINE=1` says the build is never shipped, which is what `ci.yml` sets on its two native jobs.
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
