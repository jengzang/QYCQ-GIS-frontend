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
  ...Array.from({ length: 5 }, (_, index) => ({
    city: '梅州市',
    dialectGroup: '客家话',
    economy: `扩展经济${index + 1}`,
    ethnicity: '汉族',
    geometry: { coordinates: [116.1 + index * 0.01, 24.3 + index * 0.01], type: 'Point' as const },
    name: `扩展地名村${index + 1}`,
    primaryId: `vlg-topo-${index + 1}`,
    raw: {
      居民民族: '汉族',
      村俗或传统民居或村特色产品: `扩展内容${index + 1}`,
      村经济情况: `扩展经济${index + 1}`,
      村名来源: `扩展地名来源${index + 1}`,
    },
    searchText: `扩展地名村${index + 1}`,
    timeline: { rawLabel: '清代', sortYear: 1710 + index },
    town: '扩展镇',
  })),
];

vi.mock('@/shared/lib/orientation', () => ({
  useOrientationMode: () => 'landscape',
}));

vi.mock('@/entities/village/api/hooks', () => ({
  useVillagesQuery: () => ({ data: villages }),
}));

import { ToponymyPage } from './ToponymyPage';

describe('ToponymyPage', () => {
  test('uses full matched count for metrics while only rendering six featured cards', () => {
    render(
      <MemoryRouter>
        <ToponymyPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('地名村落').length).toBeGreaterThan(0);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getAllByText('命名线索').length).toBeGreaterThan(0);
    const villageLink = screen.getByRole('link', { name: /双合村/i });
    expect(villageLink).toHaveAttribute('href', '/map?mode=search&primaryId=vlg-dual');
    expect(screen.getByText('因村旁平坦田垌而得名。')).toBeInTheDocument();
    expect(screen.getByText('两水汇合而得名。')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /扩展地名村4/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /扩展地名村5/i })).not.toBeInTheDocument();
  });
});
