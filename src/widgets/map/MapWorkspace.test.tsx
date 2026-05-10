import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { MapWorkspace } from './MapWorkspace';

import type { VillageFacets } from '@/entities/village/api/types';
import type { VillageRecord } from '@/entities/village/model/types';

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

describe('MapWorkspace', () => {
  test('falls back to the default registry style when stale runtime selection is stored', () => {
    window.localStorage.clear();
    window.localStorage.setItem('qycq-map-style', 'runtime');

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

    expect(screen.getByRole('button', { name: '切换底图：高德地图' })).toBeInTheDocument();
  });

  test('renders map source switcher and persists the selected style', () => {
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

    expect(screen.getByRole('button', { name: '切换底图：高德地图' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '切换底图：高德地图' }));
    fireEvent.click(screen.getByRole('button', { name: '切换到底图：ArcGIS 卫星图' }));

    expect(window.localStorage.getItem('qycq-map-style')).toBe('arcgis_satellite');
    expect(screen.getByRole('button', { name: '切换底图：ArcGIS 卫星图' })).toBeInTheDocument();
  });

  test('renders extended filters and clears them in one action', () => {
    const onFiltersChange = vi.fn();

    render(
      <MapWorkspace
        activeMode="search"
        facets={facets}
        filters={{
          city: '肇庆市',
          dialect: '',
          economy: '种植砂糖橘',
          ethnicity: '汉族',
          q: '平治村',
          town: '高良镇',
          year: null,
        }}
        onFiltersChange={onFiltersChange}
        onModeChange={vi.fn()}
        onSelectVillage={vi.fn()}
        orientation="landscape"
        selectedPrimaryId="vlg-fb354cdb"
        villages={[village]}
      />,
    );

    expect(screen.getByRole('heading', { name: '精筛控制台' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '地图主舞台' })).toBeInTheDocument();
    expect(screen.getByLabelText('居民民族')).toHaveValue('汉族');
    expect(screen.getByLabelText('经济情况')).toHaveValue('种植砂糖橘');

    fireEvent.click(screen.getByRole('button', { name: '一键清空筛选' }));

    expect(onFiltersChange).toHaveBeenCalledWith({
      city: '',
      dialect: '',
      economy: '',
      ethnicity: '',
      q: '',
      town: '',
      year: null,
    });
  });

  test('shows ethnicity and economy in both the result list and detail panel', () => {
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

    expect(screen.getByText('在场村庄')).toBeInTheDocument();
    expect(screen.getByText('叙事详情')).toBeInTheDocument();
    expect(screen.getByText('汉族 / 种植砂糖橘')).toBeInTheDocument();
    expect(screen.getAllByText('居民民族').length).toBeGreaterThan(0);
    expect(screen.getAllByText('汉族').length).toBeGreaterThan(0);
    expect(screen.getAllByText('经济情况').length).toBeGreaterThan(0);
    expect(screen.getAllByText('种植砂糖橘').length).toBeGreaterThan(0);
  });
});
