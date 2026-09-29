import { readFileSync } from 'node:fs';

const readJson = (relativePath) =>
  JSON.parse(readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8'));

const appConfig = readJson('app.json');
const easConfig = readJson('eas.json');
const packageConfig = readJson('package.json');
const workflow = readFileSync(
  new URL('../.github/workflows/build-and-deploy.yml', import.meta.url),
  'utf8',
);

const expo = appConfig.expo ?? {};
const projectId = expo.extra?.eas?.projectId;
const previewProfile = easConfig.build?.preview;
const failures = [];
const releaseVerify = packageConfig.scripts?.['release:verify'] ?? '';
const projectUpdateUrl = `https://u.expo.dev/${projectId}`;

const requireValue = (condition, message) => {
  if (!condition) {
    failures.push(message);
  }
};

requireValue(
  typeof projectId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      projectId,
    ),
  'app.json must contain the real EAS UUID at expo.extra.eas.projectId.',
);
requireValue(
  typeof expo.ios?.bundleIdentifier === 'string' && expo.ios.bundleIdentifier.length > 0,
  'app.json must define expo.ios.bundleIdentifier.',
);
requireValue(
  expo.ios?.supportsTablet === false,
  'iPad support is off for 1.0. Turning it back on obliges the App Store submission ' +
    'to carry 13-inch iPad screenshots, and the layouts need checking on a tablet first.',
);
requireValue(
  previewProfile?.distribution === 'internal' && previewProfile?.ios?.simulator === false,
  'eas.json preview profile must create an internal build for physical iOS devices.',
);
requireValue(
  expo.runtimeVersion?.policy === 'appVersion' && expo.updates?.url === projectUpdateUrl,
  'app.json must use the appVersion runtime policy and the project EAS Update URL.',
);
requireValue(
  easConfig.build?.development?.channel === 'development' &&
    previewProfile?.channel === 'preview' &&
    easConfig.build?.production?.channel === 'production',
  'EAS build profiles must use isolated development, preview, and production update channels.',
);
requireValue(
  typeof packageConfig.dependencies?.['expo-updates'] === 'string' &&
    typeof packageConfig.devDependencies?.['@expo/ngrok'] === 'string' &&
    packageConfig.scripts?.['preview:phone']?.includes('expo start --go --lan') &&
    packageConfig.scripts?.['update:preview']?.includes('eas update --channel preview'),
  'The Expo Go phone preview, project-local tunnel adapter, and EAS preview update commands must remain configured.',
);
requireValue(
  easConfig.build?.simulator?.distribution === 'internal' &&
    easConfig.build?.simulator?.ios?.simulator === true,
  'eas.json simulator profile must target iOS Simulator.',
);
requireValue(
  easConfig.cli?.appVersionSource === 'remote' && easConfig.build?.production?.autoIncrement === true,
  'Production builds must use remote version management with autoIncrement enabled.',
);
requireValue(
  workflow.includes('secrets.EXPO_TOKEN'),
  'The GitHub Actions workflow must authenticate with the EXPO_TOKEN secret.',
);
requireValue(
  workflow.includes('production_ready') &&
    workflow.includes("inputs.profile == 'production'") &&
    workflow.includes('inputs.production_ready != true'),
  'The GitHub Actions workflow must block unconfirmed production builds.',
);
requireValue(
  ['stage1:preflight', 'typecheck', 'npm test', 'doctor', 'export:ios', 'test:responsive'].every(
    (step) => releaseVerify.includes(step),
  ),
  'package.json release:verify must include preflight, typecheck, unit, Doctor, iOS export, and responsive checks.',
);

if (process.env.CI) {
  requireValue(
    Boolean(process.env.EXPO_TOKEN),
    'GitHub Actions is missing the EXPO_TOKEN repository secret.',
  );
}

if (failures.length > 0) {
  console.error('Stage 1 EAS preflight failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    'Stage 1 EAS configuration preflight passed. Continue with every remaining ' +
      'release:verify check before requesting an iOS build.',
  );
}
