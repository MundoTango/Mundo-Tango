import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './scripts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000, // 60s per test
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5000',
    trace: 'off',
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 }
    },
    screenshot: 'off', // We handle screenshots manually
    viewport: { width: 1280, height: 720 },
  },
  outputDir: './test-results/',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
