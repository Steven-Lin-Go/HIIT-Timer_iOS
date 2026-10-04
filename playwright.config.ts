import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/responsive',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  workers: 2,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:8081', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npx expo start --web --localhost --port 8081',
    // Waiting for the HTML shell is not sufficient after a cold Metro cache:
    // Expo can serve `/` before the application bundle has finished indexing.
    // Prewarming the exact bundle URL prevents the first browser workers from
    // receiving a transient JSON 404 in place of executable JavaScript.
    url: 'http://localhost:8081/node_modules/expo/AppEntry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app&unstable_transformProfile=hermes-stable',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { EXPO_OFFLINE: '1', CI: '1' },
  },
});
