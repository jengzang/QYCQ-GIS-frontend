import { describe, expect, test } from 'vitest';

import type { VillageRecord } from '@/entities/village/model/types';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';

import { analyzeFolkwayVillages, buildFolkwayAnalysisIndex, buildFolkwayThemes } from './folkway-analysis';

const folkwayField = villageFieldMapping.highlightFields.folkways;

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
      村俗或传统民居或村特色产品: '舞火龙、灰塑镬耳屋、砂糖橘。',
      村经济情况: '种植砂糖橘',
      村名来源: '因村旁平坦田垌而得名。',
    },
    searchText: '平治村',
    timeline: { rawLabel: '明成化十七年', sortYear: 1481 },
    town: '高良镇',
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
      村俗或传统民居或村特色产品: '农耕、晒谷、制茶。',
      村经济情况: '水稻种植',
      村名来源: '村前良田成片。',
    },
    searchText: '稻田村',
    timeline: { rawLabel: '清代', sortYear: 1710 },
    town: '榕城镇',
  },
] satisfies VillageRecord[];

describe('folkway-analysis', () => {
  test('builds one reusable index for theme counts and analysis results', () => {
    const index = buildFolkwayAnalysisIndex(villages, folkwayField);

    expect(index.themes.find((theme) => theme.key === 'festival')?.count).toBe(1);
    expect(index.themes.find((theme) => theme.key === 'dwelling')?.count).toBe(1);
    expect(index.themes.find((theme) => theme.key === 'livelihood')?.count).toBe(1);
    expect(index.byTheme.festival.villages.map((village) => village.name)).toEqual(['平治村']);
    expect(index.byTheme.livelihood.villages.map((village) => village.name)).toEqual(['稻田村']);
    expect(index.byTheme.festival.leadingKeywords).toContain('舞');
  });

  test('keeps legacy helpers compatible with index output', () => {
    const index = buildFolkwayAnalysisIndex(villages, folkwayField);

    expect(buildFolkwayThemes(villages, folkwayField)).toEqual(index.themes);
    expect(analyzeFolkwayVillages(villages, folkwayField, 'product')).toEqual(index.byTheme.product);
  });
});
