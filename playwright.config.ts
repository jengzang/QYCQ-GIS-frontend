import { defineConfig } from '@playwright/test';

import { resolveLocalChromeBrowserConfig } from './playwright.browser';

const previewPort = Number(process.env.PLAYWRIGHT_PREVIEW_PORT ?? '41731');

export default defineConfig({
  testDir: './src/test/e2e',
  use: {
    baseURL: `http://127.0.0.1:${previewPort}`,
    trace: 'retain-on-failure',
    ...resolveLocalChromeBrowserConfig(),
  },
  webServer: {
    command: `npm run build && npm run serve -- --host 127.0.0.1 --port ${previewPort}`,
    port: previewPort,
    reuseExistingServer: false,
  },
});
