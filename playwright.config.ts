import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.test.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: 'list',
  timeout: 90000,
  expect: {
    timeout: 15000,
  },
  outputDir: './test-results',
  preserveOutput: 'never',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5000',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    headless: true,
    viewport: { width: 1280, height: 720 },
    storageState: '.playwright-auth.json',
    launchOptions: {
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-translate',
        '--no-first-run',
        '--disable-features=TranslateUI',
        '--js-flags=--max-old-space-size=512',
        '--disable-site-isolation-trials',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        launchOptions: {
          executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        },
      },
    },
    {
      name: 'firefox',
      use: {
        launchOptions: {
          executablePath: '/home/runner/workspace/.cache/ms-playwright/firefox-1497/firefox/firefox',
        },
      },
    },
  ],
  webServer: undefined,
});
