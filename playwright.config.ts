import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  reporter: [['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/e2e-junit.xml' }]],
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
    },
    {
      name: 'routine-manage',
      dependencies: ['auth'],
      testMatch: /routine\.manage\.spec\.ts/,
      use: {
        storageState: 'e2e/.auth/user.json',
      },
    },
    {
      name: 'workout',
      dependencies: ['auth', 'routine-manage'],
      testMatch: /workout\.spec\.ts/,
      use: {
        storageState: 'e2e/.auth/user.json',
      },
    },
    {
      name: 'sets-memo',
      dependencies: ['auth', 'workout'],
      testMatch: /sets-memo\.spec\.ts/,
      use: {
        storageState: 'e2e/.auth/user.json',
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_WEB_SERVER
    ? {
        command: 'pnpm dev --hostname 127.0.0.1 --port 3000',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
