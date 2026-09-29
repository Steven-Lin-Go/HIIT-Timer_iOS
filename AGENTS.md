# HIIT Timer project instructions

## Budgeted iOS cloud builds

Treat every EAS iOS build as a scarce, budgeted release action. Do not use an
EAS build to discover behavior that can be inspected or tested locally.

For JavaScript, TypeScript, styling, and bundled asset changes, use the phone
preview loop before considering a build:

1. Run `npm run preview:phone` and scan the Metro QR code with Expo Go on the
   test iPhone. Use `npm run preview:phone:tunnel` only when LAN access fails.
2. After an EAS Update capable development or preview binary is installed,
   publish compatible test bundles with `npm run update:preview -- --message
   "<description>"`. Publishing an update is a network release action and must
   be explicitly authorized.
3. Run a new EAS build only when native code or the native runtime changes, or
   when one final TestFlight binary is required for submission.

Native runtime changes include adding/removing a native module, Expo SDK or
React Native upgrades, config plugins, permissions, entitlements, bundle ID,
icons/splash screens, and native app configuration. Adding `expo-updates` is a
one-time native change; once the next binary contains it, compatible JS/UI
iterations can use the preview channel without another build.

Before invoking `eas build` with any profile after a code or design change:

1. Turn the user's latest request into observable acceptance criteria. Cover
   the behavior before, during, and after the interaction, including phase
   transitions, pause/resume, completion, themes, rotation, text scaling, and
   relevant edge values.
2. Trace every input and rendering branch that can produce the same symptom.
   Search callers, props, state calculations, theme variants, and decorative
   layers before deciding the change is complete.
3. Batch all related fixes. If the requested behavior is ambiguous in a way
   that could require a second build, resolve the ambiguity with the user
   before consuming a build.
4. Run `npm run release:verify` and inspect the results. This gate must pass on
   the exact source intended for the cloud build.
5. Review `docs/release-gate.md` and record any native-only gap. A native-only
   gap may be verified by one final TestFlight build; it is not a reason to
   skip the local gate.

Only request one cloud build for the accepted batch. If TestFlight reveals a
native-specific defect, collect all findings, make one new batch, and repeat
the full gate before requesting another build. Never submit an intermediate
build to App Review when a newer corrective build exists.
