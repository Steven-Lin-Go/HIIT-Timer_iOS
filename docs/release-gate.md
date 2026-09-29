# iOS build budget and release gate

EAS iOS builds are a limited release resource. Local checks must establish the
intended behavior before a cloud build is requested. A cloud build validates
native packaging and enables final TestFlight verification; it is not an
iteration loop for UI behavior.

## 0. Choose the cheapest valid feedback loop

| Change | First phone check | New EAS build? |
| --- | --- | --- |
| JavaScript/TypeScript, layout, colors, copy, timer logic | `npm run preview:phone`, then scan the Expo Go QR code | No |
| Compatible JS/UI snapshot that must remain available remotely | Publish to the `preview` EAS Update channel after authorization | No, once an update-capable binary is installed |
| Native dependency, Expo SDK, plugin, permission, entitlement, bundle ID, icon/splash, native config | Development/preview build after the full gate | Yes |
| Final App Store/TestFlight candidate | Production build after acceptance and the full gate | Yes, once per accepted batch |

`@expo/ngrok` is a project dev dependency. Do not rely on Expo CLI's interactive
global install prompt on Windows; the newly installed global module may not be
visible to the already running CLI process.

The current TestFlight Build 8 predates `expo-updates` and cannot receive OTA
updates. Use Expo Go QR previews now. The next accepted production binary will
include the update runtime and channel configuration; compatible JS/UI changes
after that can be delivered to a preview channel without another binary.

## 1. Acceptance criteria before implementation

For every visual or interaction change, write the observable result first and
check all mechanisms that can create the same symptom.

Example from the timer-ring correction:

- Requirement: the base track remains a complete closed circle; the colored
  arc starts full, shrinks with the remaining seconds, and disappears at zero.
  Its color follows the current phase.
- Related mechanisms: theme-specific arc length, progress dash patterns,
  decorative inner strokes, phase color, home state, running state, paused
  state, and phase transitions.
- A check that covers only the initial frame is insufficient. Tests must prove
  the partial arc after a tick, the frozen arc while paused, the full reset at
  a phase boundary, and the absent colored arc at completion.

If two interpretations would create different runtime behavior, resolve that
choice before starting an EAS build.

## 2. UI state matrix

The applicable rows must pass locally before a cloud build. The timer ring is
the example invariant; use the same state-based method for future changes.

| Area | Required states | Expected result |
| --- | --- | --- |
| Timer lifecycle | Home, full interval, middle, 1 second, 0, phase transition, complete | Requested visual invariant holds in every state |
| Controls | Running, paused, resumed, previous/next phase | State and controls remain consistent |
| Phases | Prepare, work, rest, cooldown | Correct label, color, time, and layout |
| Themes | Fitness, Bohemia, Zen, Natural | Same functional behavior; only documented styling differs |
| Layout | Portrait, landscape, supported phone widths | No overlap, clipping, unsafe-area intrusion, or inaccessible controls |
| Content | Traditional Chinese, English, long names, large values | Text remains readable and controls remain reachable |
| Accessibility | Larger text and Display Zoom equivalents | Layout adapts or scrolls without hiding actions |
| Native-only | TestFlight on an actual iPhone | Safe areas, native text sizing, alerts, audio, haptics, and photo picker work |

## 3. Automated gate

Run from the project root:

```sh
npm ci
npx playwright install chromium webkit
npm run release:verify
```

`release:verify` runs, in order:

1. EAS configuration preflight.
2. TypeScript checking.
3. Unit tests.
4. Expo Doctor.
5. iOS Hermes bundle export.
6. The complete responsive suite in Chromium and WebKit.

Coverage targets:

- 100% of business-critical timer schedule transitions in unit tests.
- 100% of supported themes for shared timer visual invariants.
- Both browser engines, both languages, portrait and landscape, all configured
  phone sizes, and text-stress cases for responsive behavior.
- A focused regression assertion for every review rejection or user-reported
  visual defect.

## 4. Human gate before EAS

Before the one production build, confirm:

- The written acceptance criteria match the user's intended behavior.
- Every relevant row in the state matrix was exercised.
- No related rendering branch or caller remains unreviewed.
- `npm run release:verify` passed on the final source.
- Known native-only checks are listed for TestFlight.
- The build number and App Review reply will reference the same final build.
- JS/UI behavior was accepted through Expo Go or the preview update channel;
  the production build is not being used as a visual iteration.

GitHub Actions requires the `production_ready` confirmation for a production
build and still runs both quality jobs before EAS.

## 5. Remaining platform gap

Browser rendering and an iOS JavaScript bundle cannot prove UIKit safe areas,
native Dynamic Type, Display Zoom, system dialogs, audio, haptics, or photo
picker behavior. Verify these once on the final TestFlight build. If an issue
is found, collect the complete native test results and fix them as one batch
before spending another build.

## Verification record

On 2026-09-19 the new `release:verify` command completed successfully without
requesting an EAS build: configuration preflight passed, TypeScript passed,
54 unit tests passed, Expo Doctor passed 21/21 checks, the iOS Hermes bundle
exported successfully, and the full responsive suite passed 120/120 tests.

After the preview workflow was added, its configuration preflight, TypeScript
check, 54 unit tests, Expo Doctor 21/21 checks, and an iOS Metro bundle request
also passed. Metro served the iOS bundle successfully without creating a new
EAS build.
