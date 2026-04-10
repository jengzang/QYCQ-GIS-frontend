import { getRuntimeConfig } from '@/shared/config/runtime';

describe('getRuntimeConfig', () => {
  test('defaults to mock mode with normalized env values', () => {
    expect(
      getRuntimeConfig({
        VITE_API_BASE_URL: 'http://localhost:8080/',
        VITE_MAP_STYLE_URL: '',
      }),
    ).toMatchObject({
      apiBaseUrl: 'http://localhost:8080',
      dataMode: 'mock',
      mapStyleUrl: null,
      mode: 'development',
      runtimeProfile: 'mock',
    });
  });

  test('maps test mode api runtime to local api profile', () => {
    expect(
      getRuntimeConfig({
        MODE: 'test',
        VITE_API_BASE_URL: 'https://example.com',
        VITE_DATA_MODE: 'api',
        VITE_MAP_STYLE_URL: 'https://example.com/style.json',
      }),
    ).toMatchObject({
      apiBaseUrl: 'https://example.com',
      dataMode: 'api',
      mapStyleUrl: 'https://example.com/style.json',
      mode: 'test',
      runtimeProfile: 'local-api',
    });
  });

  test('maps serve mode api runtime to remote api profile', () => {
    expect(
      getRuntimeConfig({
        MODE: 'serve',
        VITE_API_BASE_URL: 'https://example.com',
        VITE_DATA_MODE: 'api',
      }),
    ).toMatchObject({
      apiBaseUrl: 'https://example.com',
      dataMode: 'api',
      mode: 'serve',
      runtimeProfile: 'remote-api',
    });
  });

  test('accepts vite production mode and treats it as the default mock runtime profile', () => {
    expect(
      getRuntimeConfig({
        MODE: 'production',
      }),
    ).toMatchObject({
      dataMode: 'mock',
      mode: 'development',
      runtimeProfile: 'mock',
    });
  });
});
