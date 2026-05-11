import { fireEvent, render, screen } from '@testing-library/react';
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
      居民民族: '汉族',
      村俗或传统民居或村特色产品: '舞火龙、灰塑镬耳屋、砂糖橘。',
      村经济情况: '种植砂糖橘',
      村名来源: '因村旁平坦田垌而得名。',
    },
    searchText: '平治村',
    timeline: { rawLabel: '明成化十七年', sortYear: 1481 },
    town: '高良镇',
  },
  {
    city: '云浮市',
    dialectGroup: '涯话',
    economy: '茶叶种植',
    ethnicity: '瑶族',
    geometry: { coordinates: [112.1, 22.9], type: 'Point' },
    name: '双合村',
    primaryId: 'vlg-dual',
    raw: {
      居民民族: '瑶族',
      村俗或传统民居或村特色产品: '盘王节、竹编、山茶。',
      村经济情况: '茶叶种植',
      村名来源: '两水汇合而得名。',
    },
    searchText: '双合村',
    timeline: { rawLabel: '清代', sortYear: 1680 },
    town: '双合镇',
  },
  {
    city: '揭阳市',
    dialectGroup: '客家话',
    economy: '水稻种植',
    ethnicity: '汉族',
    geometry: { coordinates: [116.2, 23.5], type: 'Point' },
    name: '稻田村',
    primaryId: 'vlg-farm',
    raw: {
      居民民族: '汉族',
      村俗或传统民居或村特色产品: '农耕、晒谷、制茶。',
      村经济情况: '水稻种植',
      村名来源: '村前良田成片。',
    },
    searchText: '稻田村',
    timeline: { rawLabel: '清代', sortYear: 1710 },
    town: '榕城镇',
  },
];

vi.mock('@/shared/lib/orientation', () => ({
  useOrientationMode: () => 'landscape',
}));

vi.mock('@/entities/village/api/hooks', () => ({
  useVillagesQuery: () => ({ data: villages }),
}));

import { FolkwaysPage } from './FolkwaysPage';

describe('FolkwaysPage', () => {
  test('renders theme-based folkway browsing and updates results by theme', () => {
    render(
      <MemoryRouter>
        <FolkwaysPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '特色民俗' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '民俗内容' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '精选村庄' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /节庆仪式/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /传统民居/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /地方产品/ })).toBeInTheDocument();
    expect(screen.getByText(/按主题浏览广东村落的节庆、民居、物产与生活方式线索/)).toBeInTheDocument();
    const mapLinks = screen.getAllByRole('link', { name: '去地图查看' });
    expect(mapLinks[0]).toHaveAttribute('href', '/map?mode=search&primaryId=vlg-fb354cdb');

    fireEvent.click(screen.getByRole('button', { name: /生计方式/ }));
    expect(document.body.textContent).toContain('稻田村');
    expect(document.body.textContent).toContain('命中关键词：耕 / 农 / 制茶');

    fireEvent.click(screen.getByRole('button', { name: /信仰与族群/ }));
    expect(document.body.textContent).toContain('双合村');
    expect(document.body.textContent).toContain('命中关键词：盘王');
  });
});
