import { render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AppPreferencesProvider } from '@/app/providers/AppPreferencesProvider';
import type { VillageFacets } from '@/entities/village/api/types';
import type { VillageRecord } from '@/entities/village/model/types';
import { getMapStyle } from '@/shared/lib/map-style';

const { MockMap } = vi.hoisted(() => {
  class HoistedMockMap {
    static instances: HoistedMockMap[] = [];

    options: { style: unknown };
    handlers: Record<string, Array<(...args: unknown[]) => void>> = {};
    sources = new Map<string, { setData: ReturnType<typeof vi.fn> }>();
    layers = new Map<string, unknown>();
    addControl = vi.fn();
    addLayer = vi.fn((layer: { id: string }) => {
      this.layers.set(layer.id, layer);
    });
    addSource = vi.fn((id: string) => {
      this.sources.set(id, { setData: vi.fn() });
    });
    easeTo = vi.fn();
    getCanvas = vi.fn(() => ({ style: {} }));
    getLayer = vi.fn((id: string) => this.layers.get(id) ?? null);
    getSource = vi.fn((id: string) => this.sources.get(id));
    getZoom = vi.fn(() => 6);
    isStyleLoaded = vi.fn(() => true);
    remove = vi.fn();
    setFilter = vi.fn();
    setPaintProperty = vi.fn();
    setStyle = vi.fn((style: unknown) => {
      this.options.style = style;
      this.emit('style.load');
    });

    constructor(options: { style: unknown }) {
      this.options = options;
      HoistedMockMap.instances.push(this);
    }

    emit(event: string, ...args: unknown[]) {
      for (const handler of this.handlers[event] ?? []) {
        handler(...args);
      }
    }

    on(event: string, layerOrHandler: unknown, maybeHandler?: unknown) {
      const handler = typeof layerOrHandler === 'function' ? layerOrHandler : maybeHandler;
      if (typeof handler === 'function') {
        this.handlers[event] ??= [];
        this.handlers[event].push(handler as (...args: unknown[]) => void);
      }
      return this;
    }
  }

  return { MockMap: HoistedMockMap };
});

vi.mock('maplibre-gl', () => ({
  default: {
    Map: MockMap,
    NavigationControl: class MockNavigationControl {},
  },
  NavigationControl: class MockNavigationControl {},
}));

import { MapWorkspace } from './MapWorkspace';

const village: VillageRecord = {
  city: '肇庆市',
  dialectGroup: '德庆话',
  economy: '种植砂糖橘',
  ethnicity: '汉族',
  geometry: { coordinates: [111.9, 23.1], type: 'Point' },
  name: '平治村',
  primaryId: 'vlg-fb354cdb',
  raw: {
    位置: '高良镇西南侧',
    居民民族: '汉族',
    村俗或传统民居或村特色产品: '舞火龙、灰塑镬耳屋、砂糖橘。',
    村经济情况: '种植砂糖橘',
    村名来源: '因村旁平坦田垌而得名。',
  },
  searchText: '平治村 高良镇西南侧 汉族 种植砂糖橘',
  timeline: { rawLabel: '明成化十七年', sortYear: 1481 },
  town: '高良镇',
};

const facets: VillageFacets = {
  cities: ['肇庆市'],
  dialectGroups: ['德庆话'],
  economies: ['种植砂糖橘'],
  ethnicities: ['汉族'],
  timelineRange: { max: 1950, min: 1400 },
  towns: ['高良镇'],
};

function renderWorkspace(overrides: Partial<ComponentProps<typeof MapWorkspace>> = {}) {
  return render(
    <AppPreferencesProvider>
      <MapWorkspace
        activeMode="search"
        facets={facets}
        filters={{
          city: '',
          dialect: '',
          economy: '',
          ethnicity: '',
          q: '',
          town: '',
          year: null,
        }}
        onFiltersChange={vi.fn()}
        onModeChange={vi.fn()}
        onSelectVillage={vi.fn()}
        orientation="landscape"
        selectedPrimaryId="vlg-fb354cdb"
        villages={[village]}
        {...overrides}
      />
    </AppPreferencesProvider>,
  );
}

describe('MapWorkspace MapLibre integration', () => {
  beforeEach(() => {
    MockMap.instances.length = 0;
    window.localStorage.clear();
    Object.defineProperty(window, 'WebGLRenderingContext', {
      configurable: true,
      value: class MockWebGLRenderingContext {},
    });
  });

  test('creates the map with the globally selected style and binds village layers on load', () => {
    window.localStorage.setItem('qycq-map-style', 'arcgis_satellite');

    renderWorkspace();

    const mapInstance = MockMap.instances[0];
    expect(mapInstance).toBeDefined();
    expect(mapInstance.options.style).toEqual(getMapStyle('arcgis_satellite'));

    mapInstance.emit('load');

    expect(mapInstance.addSource).toHaveBeenCalled();
    expect(mapInstance.addLayer).toHaveBeenCalled();

    const villageSource = mapInstance.sources.get('villages');
    expect(villageSource?.setData).toHaveBeenCalled();
  });

  test('updates map source data when villages prop shrinks after keyword filtering', () => {
    const { rerender } = render(
      <AppPreferencesProvider>
        <MapWorkspace
          activeMode="search"
          facets={facets}
          filters={{
            city: '',
            dialect: '',
            economy: '',
            ethnicity: '',
            q: '',
            town: '',
            year: null,
          }}
          onFiltersChange={vi.fn()}
          onModeChange={vi.fn()}
          onSelectVillage={vi.fn()}
          orientation="landscape"
          selectedPrimaryId="vlg-fb354cdb"
          villages={[
            village,
            {
              ...village,
              name: '白土村',
              primaryId: 'vlg-baitu',
              geometry: { coordinates: [112.1, 23.2], type: 'Point' },
              searchText: '白土村 白土镇',
              town: '白土镇',
            },
          ]}
        />
      </AppPreferencesProvider>,
    );

    const mapInstance = MockMap.instances[0];
    mapInstance.emit('load');

    const villageSource = mapInstance.sources.get('villages');
    const setData = villageSource?.setData;
    expect(setData).toBeDefined();
    expect(setData).toHaveBeenLastCalledWith(
      expect.objectContaining({
        features: expect.arrayContaining([
          expect.objectContaining({ properties: expect.objectContaining({ primaryId: 'vlg-fb354cdb' }) }),
          expect.objectContaining({ properties: expect.objectContaining({ primaryId: 'vlg-baitu' }) }),
        ]),
      }),
    );

    rerender(
      <AppPreferencesProvider>
        <MapWorkspace
          activeMode="search"
          facets={facets}
          filters={{
            city: '',
            dialect: '',
            economy: '',
            ethnicity: '',
            q: '平治村',
            town: '',
            year: null,
          }}
          onFiltersChange={vi.fn()}
          onModeChange={vi.fn()}
          onSelectVillage={vi.fn()}
          orientation="landscape"
          selectedPrimaryId="vlg-fb354cdb"
          villages={[village]}
        />
      </AppPreferencesProvider>,
    );

    expect(setData).toHaveBeenLastCalledWith(
      expect.objectContaining({
        features: [expect.objectContaining({ properties: expect.objectContaining({ primaryId: 'vlg-fb354cdb' }) })],
      }),
    );
  });
});
