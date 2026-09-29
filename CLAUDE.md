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
scripts/write-resource-file.mjs  the `capacitor:copy:after` hook writing the resource file into both native projects
ios/, android/               the native projects, committed; the copied web assets and the resource file are not
```

## Commands

| Command             | Does                                                      |
| ------------------- | --------------------------------------------------------- |
| `npm run build`     | the web bundle into `dist/`                               |
| `npm run sync`      | `cap sync`, which runs the hook writing the resource file |
| `npm run lint`      | Prettier                                                  |
| `npm run typecheck` | TypeScript                                                |
| `npm run dev`       | Vite in the browser, where the SDK is the web no-op       |

Run `npm run fmt` before every commit.
The native builds: `xcodebuild -project ios/App/App.xcodeproj -scheme App -destination 'generic/platform=iOS Simulator' build` and `./gradlew assembleDebug` in `android/`, both after `npm run build && npx cap sync`.

## The resource file

The SDK reads `hotcodepush.json` from the app bundle on iOS and from `assets/` on Android: the project's file plus `builtAt`, `fingerprint`, `embeddedBundleManifest` and `embeddedBundleId`.
`scripts/write-resource-file.mjs` writes it on every `cap copy` and `cap sync`, into `ios/App/App/` — referenced as a resource in the Xcode project — and `android/app/src/main/assets/`.
It is the stopgap for `npx hotcodepush bundle embed`, which replaces it when the CLI ships the command: the script registers no embedded bundle and computes no fingerprint.
`HOTCODEPUSH_FILES_BASE_URL` and `HOTCODEPUSH_UPDATES_BASE_URL` point the SDK at another host, the local stack or staging.

## Dependencies during the build phase

The SDK is pinned to the pkg.pr.new build of one commit, `https://pkg.pr.new/hotcodepush-team/capacitor-live-updates/@hotcodepush/capacitor-live-updates@<sha>`, never `@main`; a bump is one edit of that sha.
Every other dependency is pinned to an exact version and bumped by Renovate.

## Agent workspace

- `.mcp.json` registers the Capacitor server; the HotCodePush server joins when it exists.
- `.claude/skills/` holds the developer skills copied from `hotcodepush-team/.github`, pinned in `skills-lock.json`.
- Commits are conventional commits; `main` is trunk, CI is the gate, and a commit that lands an issue says `Closes #<n>`.
