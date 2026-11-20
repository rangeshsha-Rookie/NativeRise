// client/playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    channel: 'msedge',
    headless: true
  },
  projects: [
    {
      name: 'msedge',
      use: {
        channel: 'msedge',
        viewport: { width: 1280, height: 720 },
        permissions: ['geolocation'],
        geolocation: { latitude: 18.5204, longitude: 73.8567 } // Pune coordinates
      }
    }
  ],
  webServer: [
    {
      command: 'npm start',
      cwd: '../server',
      url: 'http://127.0.0.1:5000/health',
      timeout: 30 * 1000,
      reuseExistingServer: true
    },
    {
      command: 'npm run dev -- --port 5173',
      cwd: '.',
      url: 'http://127.0.0.1:5173',
      timeout: 30 * 1000,
      reuseExistingServer: true
    }
  ]
});
