import { describe, expect, test } from 'vitest';

import {
  defaultMapStyleKey,
  getAvailableMapStyleOptions,
  getMapStyle,
  getMapStyleLabel,
  mapStyleOptions,
  resolveAvailableMapStyleKey,
  runtimeMapStyleKey,
} from './map-style';

describe('map-style registry', () => {
  test('exposes gaode as the default selectable style', () => {
    expect(defaultMapStyleKey).toBe('gaode');
    expect(getMapStyleLabel(defaultMapStyleKey)).toBe('高德地图');
  });

  test('builds raster styles for custom tile sources', () => {
    expect(getMapStyle('gaode')).toMatchObject({
      sources: {
        gaode: {
          tiles: expect.arrayContaining([
            expect.stringContaining('autonavi.com'),
          ]),
          type: 'raster',
        },
      },
      version: 8,
    });
  });

  test('returns hosted style urls for non-custom providers', () => {
    expect(getMapStyle('stadiamaps')).toBe('https://tiles.stadiamaps.com/styles/osm_bright.json');
    expect(getMapStyle(runtimeMapStyleKey, 'https://example.com/runtime-style.json')).toBe(
      'https://example.com/runtime-style.json',
    );
  });

  test('lists switchable map options for the UI', () => {
    expect(mapStyleOptions.map((item) => item.key)).toContain('arcgis_satellite');
    expect(getAvailableMapStyleOptions('https://example.com/runtime-style.json')[0]).toEqual({
      key: runtimeMapStyleKey,
      label: '项目指定底图',
    });
    expect(resolveAvailableMapStyleKey(runtimeMapStyleKey, null, runtimeMapStyleKey)).toBe('gaode');
    expect(mapStyleOptions.length).toBeGreaterThanOrEqual(6);
  });
});
