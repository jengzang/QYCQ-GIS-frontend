import { describe, expect, test } from 'vitest';

import { getRuntimeConfig } from './runtime';

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
      mapStyleKey: 'gaode',
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
      mapStyleKey: 'runtime',
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
      mapStyleKey: 'gaode',
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
      mapStyleKey: 'gaode',
      mode: 'development',
      runtimeProfile: 'mock',
    });
  });

  test('falls back to runtime map style when only VITE_MAP_STYLE_URL is provided', () => {
    const runtimeConfig = getRuntimeConfig({
      MODE: 'development',
      VITE_MAP_STYLE_URL: 'https://example.com/runtime-style.json',
    });

    expect(runtimeConfig.mapStyleKey).toBe('runtime');
    expect(runtimeConfig.mapStyleUrl).toBe('https://example.com/runtime-style.json');
  });

  test('prefers explicit VITE_MAP_STYLE_KEY when both key and url are provided', () => {
    const runtimeConfig = getRuntimeConfig({
      MODE: 'development',
      VITE_MAP_STYLE_KEY: 'arcgis_satellite',
      VITE_MAP_STYLE_URL: 'https://example.com/runtime-style.json',
    });

    expect(runtimeConfig.mapStyleKey).toBe('arcgis_satellite');
    expect(runtimeConfig.mapStyleUrl).toBe('https://example.com/runtime-style.json');
  });
});
