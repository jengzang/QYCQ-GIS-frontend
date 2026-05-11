import { describe, expect, test } from 'vitest';

import { analyzeFolkwayVillages, buildFolkwayThemes, getDefaultFolkwayTheme } from './folkway-analysis';

const villages = [
  {
    city: '肇庆市',
    dialectGroup: '德庆话',
    economy: '种植砂糖橘',
    ethnicity: '汉族',
    geometry: { coordinates: [111.9, 23.1], type: 'Point' as const },
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
    geometry: { coordinates: [112.1, 22.9], type: 'Point' as const },
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
];

describe('folkway-analysis', () => {
  test('builds themes and returns default active theme from available data', () => {
    const themes = buildFolkwayThemes(villages, '村俗或传统民居或村特色产品');
    expect(themes.find((theme) => theme.key === 'festival')?.count).toBe(2);
    expect(themes.find((theme) => theme.key === 'product')?.count).toBe(2);
    expect(getDefaultFolkwayTheme(themes)).toBe('festival');
  });

  test('extracts villages and leading keywords for the selected theme', () => {
    const analysis = analyzeFolkwayVillages(villages, '村俗或传统民居或村特色产品', 'dwelling');
    expect(analysis.villages).toHaveLength(1);
    expect(analysis.villages[0]?.name).toBe('平治村');
    expect(analysis.villages[0]?.matchedKeywords).toContain('镬耳');
    expect(analysis.leadingKeywords).toContain('镬耳');
  });
});
