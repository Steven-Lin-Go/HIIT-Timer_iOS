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
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { EXPO_OFFLINE: '1', CI: '1' },
  },
});
