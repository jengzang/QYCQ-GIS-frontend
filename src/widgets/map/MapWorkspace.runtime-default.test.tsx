import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import type { VillageFacets } from '@/entities/village/api/types';
import type { VillageRecord } from '@/entities/village/model/types';

vi.mock('@/shared/config/runtime', () => ({
  runtimeConfig: {
    apiBaseUrl: '',
    dataMode: 'mock',
    mapStyleKey: 'arcgis_satellite',
    mapStyleUrl: null,
    mode: 'test',
    runtimeProfile: 'mock',
    sources: {},
  },
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

describe('MapWorkspace runtime defaults', () => {
  test('uses runtimeConfig.mapStyleKey when localStorage is empty', () => {
    window.localStorage.clear();

    render(
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
      />,
    );

    expect(screen.getByRole('button', { name: '切换底图：ArcGIS 卫星图' })).toBeInTheDocument();
  });
});
