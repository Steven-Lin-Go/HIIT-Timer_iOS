import { readFileSync } from 'node:fs';

const readJson = (relativePath) =>
  JSON.parse(readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8'));

const appConfig = readJson('app.json');
const easConfig = readJson('eas.json');
const workflow = readFileSync(
  new URL('../.github/workflows/build-and-deploy.yml', import.meta.url),
  'utf8',
);

const expo = appConfig.expo ?? {};
const projectId = expo.extra?.eas?.projectId;
const previewProfile = easConfig.build?.preview;
const failures = [];

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
requireValue(expo.ios?.supportsTablet === true, 'iPad support must remain enabled.');
requireValue(
  previewProfile?.distribution === 'internal' && previewProfile?.ios?.simulator === false,
  'eas.json preview profile must create an internal build for physical iOS devices.',
);
requireValue(
  workflow.includes('secrets.EXPO_TOKEN'),
  'The GitHub Actions workflow must authenticate with the EXPO_TOKEN secret.',
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
  console.log('Stage 1 EAS preflight passed. The project is ready to request an iOS build.');
}
