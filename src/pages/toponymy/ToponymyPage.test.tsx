import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

const villages = [
  {
    city: '揭阳市',
    dialectGroup: '客家话',
    economy: '茶叶种植',
    ethnicity: '汉族',
    geometry: { coordinates: [116.1, 23.1], type: 'Point' },
    name: '高车村',
    primaryId: 'vlg-gaoche',
    raw: {
      居民民族: '汉族',
      村俗或传统民居或村特色产品: '古屋、茶园。',
      村经济情况: '茶叶种植',
      村名来源: '因村处高地，旧时车道穿村而过，故名。',
    },
    searchText: '高车村',
    timeline: { rawLabel: '清代', sortYear: 1700 },
    town: '玉湖镇',
  },
  {
    city: '潮州市',
    dialectGroup: '潮州话',
    economy: '水产养殖',
    ethnicity: '汉族',
    geometry: { coordinates: [116.7, 23.7], type: 'Point' },
    name: '石高',
    primaryId: 'vlg-shigao',
    raw: {
      居民民族: '汉族',
      村俗或传统民居或村特色产品: '渔产。',
      村经济情况: '水产养殖',
      村名来源: '村前巨石耸立，高处可望海。',
    },
    searchText: '石高',
    timeline: { rawLabel: '民国', sortYear: 1920 },
    town: '海滨镇',
  },
  {
    city: '云浮市',
    dialectGroup: '白话',
    economy: '商贸往来',
    ethnicity: '汉族',
    geometry: { coordinates: [112.1, 22.9], type: 'Point' },
    name: '江口村',
    primaryId: 'vlg-jiangkou',
    raw: {
      居民民族: '汉族',
      村俗或传统民居或村特色产品: '商贸、集市。',
      村经济情况: '商贸往来',
      村名来源: '因两江汇流于村口而得名。',
    },
    searchText: '江口村',
    timeline: { rawLabel: '清代', sortYear: 1760 },
    town: '江口镇',
  },
  {
    city: '梅州市',
    dialectGroup: '客家话',
    economy: '果园种植',
    ethnicity: '汉族',
    geometry: { coordinates: [116.4, 24.3], type: 'Point' },
    name: '梅林村',
    primaryId: 'vlg-meilin',
    raw: {
      居民民族: '汉族',
      村俗或传统民居或村特色产品: '梅果、古祠。',
      村经济情况: '果园种植',
      村名来源: '昔时梅树成林，故名。',
    },
    searchText: '梅林村',
    timeline: { rawLabel: '清代', sortYear: 1740 },
    town: '梅林镇',
  },
];

vi.mock('@/shared/lib/orientation', () => ({
  useOrientationMode: () => 'landscape',
}));

vi.mock('@/entities/village/api/hooks', () => ({
  useVillagesQuery: () => ({ data: villages }),
}));

import { ToponymyPage } from './ToponymyPage';

describe('ToponymyPage', () => {
  test('renders analysis-oriented toponymy page and filters by match type and semantics', () => {
    render(
      <MemoryRouter>
        <ToponymyPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '村名地理' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '命名线索' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '精选村庄' })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('高')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /高2/ })).toBeInTheDocument();
    const initialMapLinks = screen.getAllByRole('link', { name: '去地图查看' });
    expect(initialMapLinks).toHaveLength(2);
    expect(initialMapLinks[0]).toHaveAttribute('href', '/map?mode=search&primaryId=vlg-gaoche');
    expect(initialMapLinks[1]).toHaveAttribute('href', '/map?mode=search&primaryId=vlg-shigao');

    fireEvent.change(screen.getByLabelText('匹配方式'), { target: { value: 'suffix' } });
    expect(document.body.textContent).not.toContain('高车村');
    expect(document.body.textContent).toContain('石高');

    fireEvent.change(screen.getByLabelText('关键词'), { target: { value: '江' } });
    fireEvent.change(screen.getByLabelText('匹配方式'), { target: { value: 'contains' } });
    fireEvent.change(screen.getByLabelText('语义类别'), { target: { value: '水系' } });
    expect(document.body.textContent).toContain('江口村');
    expect(document.body.textContent).toContain('判读依据：名称中含有水系字词：江');
    const filteredMapLink = screen.getByRole('link', { name: '去地图查看' });
    expect(filteredMapLink).toHaveAttribute('href', '/map?mode=search&primaryId=vlg-jiangkou');
  });
});
