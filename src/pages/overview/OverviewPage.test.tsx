import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

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
];

vi.mock('@/shared/lib/orientation', () => ({
  useOrientationMode: () => 'landscape',
}));

vi.mock('@/widgets/map/OverviewMapSection', () => ({
  OverviewMapSection: () => <div>地图总览</div>,
}));

vi.mock('@/entities/village/api/hooks', () => ({
  useVillageFacetsQuery: () => ({
    data: {
      cities: ['肇庆市'],
      dialectGroups: ['德庆话', '广宁话'],
      economies: ['种植砂糖橘'],
      ethnicities: ['汉族'],
      timelineRange: { max: 1912, min: 1500 },
      towns: ['高良镇', '白土镇'],
    },
    isLoading: false,
  }),
  useVillagesQuery: () => ({ data: villages, isLoading: false }),
}));

import { OverviewPage } from './OverviewPage';

describe('OverviewPage', () => {
  test('renders the portal-style project intro and section navigation', () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '课题简介' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /进入村庄地图/i })[0]).toHaveAttribute('href', '/map');
    expect(screen.getAllByRole('link', { name: /查看特色民俗/i })[0]).toHaveAttribute('href', '/folkways');
    expect(screen.getAllByRole('link', { name: /查看村名地理/i })[0]).toHaveAttribute('href', '/toponymy');
    expect(screen.getByText('地图总览')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '栏目入口' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '从这些村落开始' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '课题说明' })).toBeInTheDocument();
    expect(screen.queryByText('研究对象')).not.toBeInTheDocument();
    expect(screen.queryByText('代表村落')).not.toBeInTheDocument();
    expect(screen.queryByText('演示节奏')).not.toBeInTheDocument();
  });
});
