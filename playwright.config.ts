import { defineConfig, devices } from '@playwright/test';

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:3000';
const apiURL =
  process.env.PLAYWRIGHT_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_NO_WEB_SERVER
    ? undefined
    : {
        command: 'pnpm --filter @ai-video-studio/web dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  metadata: { apiURL },
});