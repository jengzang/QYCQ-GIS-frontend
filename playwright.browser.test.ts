import { describe, expect, test } from 'vitest';

import { resolveLocalChromeBrowserConfig } from './playwright.browser';

describe('resolveLocalChromeBrowserConfig', () => {
  test('prefers an explicit chrome path from env when it exists', () => {
    const result = resolveLocalChromeBrowserConfig({
      env: {
        CHROME_PATH: '/custom/chrome',
      },
      fileExists: (path) => path === '/custom/chrome',
      platform: 'darwin',
    });

    expect(result).toEqual({
      browserName: 'chromium',
      launchOptions: {
        executablePath: '/custom/chrome',
      },
    });
  });

  test('uses the macOS system chrome path when available', () => {
    const result = resolveLocalChromeBrowserConfig({
      env: {},
      fileExists: (path) => path === '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      platform: 'darwin',
    });

    expect(result).toEqual({
      browserName: 'chromium',
      launchOptions: {
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      },
    });
  });

  test('falls back to the chrome channel when no local executable is found', () => {
    const result = resolveLocalChromeBrowserConfig({
      env: {},
      fileExists: () => false,
      platform: 'linux',
    });

    expect(result).toEqual({
      browserName: 'chromium',
      channel: 'chrome',
    });
  });
});
