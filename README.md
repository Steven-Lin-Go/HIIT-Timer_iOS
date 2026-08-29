# HIIT Timer

iOS-only HIIT interval timer built with Expo, React Native, TypeScript, and Zustand.

## Development environment

- Windows 11
- VS Code with AI coding extensions
- Node.js 22.13 or newer
- Expo / EAS cloud build
- GitHub Actions for automated checks and manually triggered iOS builds

Windows cannot run Apple's iOS Simulator. During development, use an iPhone with Expo Go when the selected SDK is supported, or use EAS development/preview builds on a registered iPhone. Final iOS compilation runs on EAS Build.

## Stage 1

- [x] Expo SDK 57 project skeleton
- [x] React Native and TypeScript configuration
- [x] iOS application configuration
- [x] Existing Zustand timer store connected to the app entry
- [x] GitHub Actions quality-check workflow definition
- [x] Manually triggered EAS iOS build workflow definition
- [x] Automated EAS project ID and `EXPO_TOKEN` preflight
- [x] Install dependencies and generate package-lock.json
- [x] Pass TypeScript validation
- [x] Pass all Expo Doctor checks
- [x] Initialize this folder as a Git repository and publish it to GitHub
- [x] Confirm the GitHub Actions quality job passes in the published repository
- [ ] Link the project to EAS and replace the temporary project ID
- [ ] Register the test iPhone/iPad and provision the first preview build
- [ ] Add `EXPO_TOKEN` to the GitHub repository secrets
- [ ] Trigger and pass the GitHub Actions EAS preview-build job
- [ ] Install and verify the preview build on an iPhone and iPad

## Stage 2

- [x] Timer state machine with prepare, work, rest, and completion states
- [x] iOS control surface with start, pause, reset, and preset selection
- [x] Default session loaded automatically on app launch
- [x] Responsive portrait and landscape layouts that switch automatically on rotation
- [x] Adaptive iPad portrait and landscape layouts
- [x] Persist workout history or session state between launches
- [x] Link the app to a real iPhone preview or EAS preview build

## Local setup

From Git Bash:

```bash
cd "/c/JHT/02 VS Code/HIITTimer"
npm install
npm run typecheck
npm run doctor
npm start
```

## Working from another machine

The heavy setup is already done and stored remotely, so a second computer does
**not** repeat certificate/device/project setup:

| Already done, portable | Where it lives |
| --- | --- |
| Distribution certificate + provisioning profile | EAS servers (remote credentials) |
| Registered test iPhone (UDID) | Apple account, not the machine |
| Project link (`owner`, `extra.eas.projectId`) | `app.json`, tracked in git |
| Bundle identifier | Apple Developer portal |

On a fresh machine (needs Node + Git installed):

```bash
git clone <repo-url>
cd HIITTimer
npm install
export EXPO_TOKEN=<your Expo access token>   # or add the line to ~/.bashrc
```

Create the token at expo.dev → Account settings → Access tokens. **Never commit
the token value.** This machine (Windows) has no PowerShell access, so use
token auth instead of the browser login flow.

Then:

- Iterate on JS/UI (no build needed): `npx expo start --dev-client`, open the
  existing dev client on the iPhone.
- Rebuild only when native code changes (new native module, `app.json`
  plugins/permissions, bundle id, icon/splash, SDK upgrade):
  `npx eas-cli@latest build -p ios --profile development`. It reuses the remote
  credentials — you may be asked for Apple ID + 2FA to re-authenticate, but no
  certificate/device re-setup.
- A *different* iPhone must be registered once (`eas device:create`) and needs a
  fresh build; the same iPhone does not.

## EAS initialization

This must be completed once before GitHub Actions can trigger non-interactive builds. The first iOS preview build also provisions signing credentials and requires a paid Apple Developer account:

```bash
npx eas-cli@latest login
npx eas-cli@latest project:init
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
npm run stage1:preflight
```

After EAS initialization, confirm that `app.json` contains the real `extra.eas.projectId`. Add an Expo personal access token to the GitHub repository secret named `EXPO_TOKEN`.

## Dependency advisories

`npm audit` reports moderate advisories against `@expo/cli`, `@expo/config-plugins`,
`xcode` and `uuid`. These are left in place deliberately:

- The whole chain is Expo build tooling. None of it is bundled into the app.
- npm's only offered remedy is downgrading `expo` to 46.0.21, eleven SDK versions
  back from the 57 this project targets.

Do not run `npm audit fix --force` here. Re-check when Expo ships an SDK that
bumps `@expo/config-plugins` past the affected `xcode`/`uuid` releases.

## CI behavior

- Pull requests and pushes to `main`: install, TypeScript check, and Expo Doctor.
- Manual workflow dispatch: quality checks followed by an EAS iOS preview or production build.
- App Store submission is intentionally deferred until the release stage.
