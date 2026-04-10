import { existsSync } from 'node:fs';

type SupportedPlatform = 'darwin' | 'linux' | 'win32';

interface BrowserResolverInput {
  env?: Record<string, string | undefined>;
  fileExists?: (path: string) => boolean;
  platform?: SupportedPlatform;
}

function getPlatformChromeCandidates(platform: SupportedPlatform): string[] {
  if (platform === 'darwin') {
    return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  }

  if (platform === 'win32') {
    return [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];
  }

  return ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];
}

export function resolveLocalChromeBrowserConfig(input: BrowserResolverInput = {}) {
  const env = input.env ?? process.env;
  const platform = (input.platform ?? process.platform) as SupportedPlatform;
  const fileExists = input.fileExists ?? existsSync;

  const explicitCandidates = [env.PLAYWRIGHT_CHROME_PATH, env.CHROME_PATH].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  const candidates = [...explicitCandidates, ...getPlatformChromeCandidates(platform)];
  const executablePath = candidates.find((candidate) => fileExists(candidate));

  if (executablePath) {
    return {
      browserName: 'chromium' as const,
      launchOptions: {
        executablePath,
      },
    };
  }

  return {
    browserName: 'chromium' as const,
    channel: 'chrome' as const,
  };
}
