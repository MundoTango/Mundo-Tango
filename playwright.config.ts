import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'child_process';

// Dynamically find system Chromium path (NixOS compatible)
const getChromiumPath = (): string => {
  try {
    const path = execSync('which chromium', { encoding: 'utf-8' }).trim();
    console.log('[Playwright Config] ✅ Using system Chromium:', path);
    return path;
  } catch (error) {
    console.log('[Playwright Config] ⚠️  System Chromium not found, using bundled browser');
    return '';
  }
};

const CHROMIUM_PATH = getChromiumPath();

// GPU-disabled args for headless mode in Replit/NixOS
const HEADLESS_ARGS = [
  '--disable-gpu',                 // Disable GPU hardware acceleration
  '--no-sandbox',                  // Required for containerized environments
  '--disable-setuid-sandbox',      // Additional sandbox bypass
  '--disable-dev-shm-usage',       // Prevents /dev/shm memory issues
  '--disable-gpu-compositing',     // Force CPU rendering
  '--disable-gpu-rasterization',   // Force CPU rasterization
  '--disable-software-rasterizer', // Disable software rasterizer
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 180000,
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:5000',
    headless: true, // Always use headless mode in Replit
    trace: 'on',
    screenshot: 'on',
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 },
    
    // Use system Chromium if available (NixOS compatible)
    ...(CHROMIUM_PATH && {
      launchOptions: {
        executablePath: CHROMIUM_PATH,
        args: HEADLESS_ARGS,
      },
    }),
  },

  outputDir: 'test-videos',

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        
        // Per-project Chromium configuration
        ...(CHROMIUM_PATH && {
          launchOptions: {
            executablePath: CHROMIUM_PATH,
            args: HEADLESS_ARGS,
          },
        }),
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
