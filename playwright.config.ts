import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.test.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  outputDir: './test-results',
  preserveOutput: 'never',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5000',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    headless: true,
    viewport: { width: 1280, height: 720 },
    channel: 'chromium',
    launchOptions: {
      executablePath: '/home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1200/chrome-headless-shell-linux64/chrome-headless-shell',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
    },
  ],
  webServer: undefined,
});
