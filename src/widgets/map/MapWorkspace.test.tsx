import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { AppPreferencesProvider } from '@/app/providers/AppPreferencesProvider';
import type { VillageFacets } from '@/entities/village/api/types';
import type { VillageRecord } from '@/entities/village/model/types';
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

describe('MapWorkspace', () => {
  function renderWorkspace(ui: ReactElement) {
    return render(<AppPreferencesProvider>{ui}</AppPreferencesProvider>);
  }

  test('uses the stored/runtime style silently without rendering map source controls', () => {
    window.localStorage.clear();
    window.localStorage.setItem('qycq-map-style', 'runtime');

    renderWorkspace(
      <MapWorkspace
        activeMode="search"
        facets={facets}
        filters={{
          city: '',
          dialect: '',
          economy: '',
          ethnicity: '',
          fulltext: false,
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

    expect(screen.queryByText('底图来源')).not.toBeInTheDocument();
    expect(screen.queryByText('运行状态')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '村庄地图' })).toBeInTheDocument();
  });

  test('renders extended filters and clears them in one action', () => {
    const onFiltersChange = vi.fn();

    renderWorkspace(
      <MapWorkspace
        activeMode="search"
        facets={facets}
        filters={{
          city: '肇庆市',
          dialect: '',
          economy: '种植砂糖橘',
          ethnicity: '汉族',
          fulltext: false,
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

    expect(screen.getByRole('heading', { name: '筛选与村庄列表' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '村庄地图' })).toBeInTheDocument();
    expect(screen.getByLabelText('居民民族')).toHaveValue('汉族');
    expect(screen.getByLabelText('经济情况')).toHaveValue('种植砂糖橘');
    expect(screen.getByRole('heading', { name: '筛选与村庄列表' }).parentElement?.parentElement).toContainElement(
      screen.getByRole('button', { name: '一键清空筛选' }),
    );

    fireEvent.click(screen.getByRole('button', { name: '一键清空筛选' }));

    expect(onFiltersChange).toHaveBeenCalledWith({
      city: '',
      dialect: '',
      economy: '',
      ethnicity: '',
      fulltext: false,
      q: '',
      town: '',
      year: null,
    });
  });

  test('renders the merged bottom detail card outside the map stage and across the full landscape row', () => {
    renderWorkspace(
      <MapWorkspace
        activeMode="search"
        facets={facets}
        filters={{
          city: '',
          dialect: '',
          economy: '',
          ethnicity: '',
          fulltext: false,
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

    expect(screen.getByText('显示村庄')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '村庄详情' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '模式解读' })).not.toBeInTheDocument();
    expect(screen.getByText('汉族 / 种植砂糖橘')).toBeInTheDocument();
    expect(screen.getByText('村庄叙事')).toBeInTheDocument();
    expect(screen.getByText('阅读提示')).toBeInTheDocument();
    expect(screen.getAllByText('居民民族').length).toBeGreaterThan(0);
    expect(screen.getAllByText('汉族').length).toBeGreaterThan(0);
    expect(screen.getAllByText('经济情况').length).toBeGreaterThan(0);
    expect(screen.getAllByText('种植砂糖橘').length).toBeGreaterThan(0);
    expect(screen.queryByText(/primaryId:/)).not.toBeInTheDocument();
    expect(screen.getByTestId('village-list-scroll-region')).toHaveClass('flex-1');
    expect(screen.getByTestId('village-list-scroll-region')).toHaveClass('overflow-auto');
    expect(screen.getByTestId('map-stage-content')).not.toContainElement(screen.getByRole('heading', { name: '村庄详情' }));
    expect(screen.getByTestId('map-detail-full-width-row')).toContainElement(screen.getByTestId('map-detail-panel'));
    expect(screen.getByTestId('map-landscape-layout')).toHaveClass('[grid-template-rows:auto_minmax(0,80dvh)_auto]');
    expect(screen.getByRole('heading', { name: '筛选与村庄列表' }).closest('section')).toHaveClass('overflow-hidden');
    expect(screen.getByRole('heading', { name: '筛选与村庄列表' }).closest('section')).toHaveClass('h-full');
    expect(screen.getByRole('heading', { name: '村庄地图' }).closest('section')).toHaveClass('h-full');
  });
});
