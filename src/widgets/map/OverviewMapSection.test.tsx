import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

import { AppPreferencesProvider } from '@/app/providers/AppPreferencesProvider';
import type { VillageRecord } from '@/entities/village/model/types';

vi.mock('@/shared/config/runtime', () => ({
  runtimeConfig: {
    mapStyleKey: 'gaode',
    mapStyleUrl: null,
  },
}));

import { OverviewMapSection } from './OverviewMapSection';

const villages = [
  {
    city: '肇庆市',
    dialectGroup: '德庆话',
    economy: '种植砂糖橘',
    ethnicity: '汉族',
    geometry: { coordinates: [111.9, 23.1], type: 'Point' },
    name: '平治村',
    primaryId: 'vlg-fb354cdb',
    raw: {
      位置: '位于高良镇中部',
      归属市: '肇庆市',
      归属镇: '高良镇',
      村名来源: '因村旁平坦田垌而得名。',
    },
    searchText: '平治村',
    timeline: { rawLabel: '明代', sortYear: 1500 },
    town: '高良镇',
  },
] satisfies VillageRecord[];

describe('OverviewMapSection', () => {
  test('renders homepage map section without local source switcher and points users to settings', () => {
    render(
      <AppPreferencesProvider>
        <MemoryRouter>
          <OverviewMapSection villages={villages} />
        </MemoryRouter>
      </AppPreferencesProvider>,
    );

    expect(screen.getByRole('heading', { name: '地图总览' })).toBeInTheDocument();
    expect(screen.queryByText('底图来源')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /切换底图：/i })).not.toBeInTheDocument();
    expect(screen.getByText('当前底图')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '前往设置修改' })).toHaveAttribute('href', '/settings');
    expect(screen.getByText(/当前测试\/无图形环境下回退为静态占位/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '进入完整地图' })).toHaveAttribute(
      'href',
      '/map?mode=search&primaryId=vlg-fb354cdb',
    );
  });
});
