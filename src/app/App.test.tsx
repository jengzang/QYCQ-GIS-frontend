import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/entities/village/api/hooks', () => ({
  useVillageFacetsQuery: () => ({
    data: {
      cities: ['肇庆市'],
      dialectGroups: ['德庆话', '广宁话'],
      timelineRange: { max: 1912, min: 1500 },
      towns: ['高良镇', '白土镇'],
    },
  }),
  useVillagesQuery: () => ({
    data: [
      {
        city: '肇庆市',
        dialectGroup: '德庆话',
        geometry: { coordinates: [111.9, 23.1], type: 'Point' },
        name: '平治村',
        primaryId: 'vlg-fb354cdb',
        raw: {
          位置: '位于高良镇中部',
          归属市: '肇庆市',
          归属镇: '高良镇',
          村名: '平治村',
          村名来源: '因平安而得名',
        },
        searchText: '肇庆市 高良镇 平治村',
        timeline: { rawLabel: '明代', sortYear: 1500 },
        town: '高良镇',
      },
    ],
    isLoading: false,
  }),
}));

import { App } from '@/app/App';

describe('App shell', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/overview');
  });

  test('renders the leadership navigation across all five sections including settings', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: /^课题简介/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link', { name: /^村庄地图/ })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^特色民俗/ })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^村名地理/ })[0]).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^设置/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '课题简介' })).toBeInTheDocument();
  });
});
