import { describe, expect, test } from 'vitest';

import {
  analyzeToponymyVillages,
  classifyToponymySemantic,
  getDefaultToponymyKeyword,
  getToponymyQuickChars,
  matchesVillageName,
} from './toponymy-analysis';

const villages = [
  {
    city: '揭阳市',
    dialectGroup: '客家话',
    economy: '茶叶种植',
    ethnicity: '汉族',
    geometry: { coordinates: [116.1, 23.1], type: 'Point' as const },
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
    city: '云浮市',
    dialectGroup: '白话',
    economy: '商贸往来',
    ethnicity: '汉族',
    geometry: { coordinates: [112.1, 22.9], type: 'Point' as const },
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
];

describe('toponymy-analysis', () => {
  test('matches village names by prefix/suffix/contains and selects a default quick char', () => {
    expect(matchesVillageName('高车村', '高', 'prefix')).toBe(true);
    expect(matchesVillageName('石高', '高', 'suffix')).toBe(true);
    expect(matchesVillageName('江口村', '江', 'contains')).toBe(true);

    const quickCharVillages = [
      ...villages,
      { ...villages[0], name: '江南村', primaryId: 'vlg-extra-1' },
      { ...villages[0], name: '江北村', primaryId: 'vlg-extra-2' },
      { ...villages[0], name: '梅岭村', primaryId: 'vlg-extra-3' },
    ];
    const quickChars = getToponymyQuickChars(quickCharVillages);
    expect(getDefaultToponymyKeyword(quickCharVillages)).toBe('江');
    expect(quickChars.map((item) => `${item.value}:${item.count}`)).toEqual(['江:3', '高:1', '梅:1', '岭:1']);
  });

  test('classifies semantic categories and analyzes filtered results', () => {
    expect(classifyToponymySemantic('江口村', '因两江汇流于村口而得名。').category).toBe('水系');
    expect(classifyToponymySemantic('双合村', '两水汇合而得名。')).toMatchObject({
      category: '水系',
      reason: '来源说明涉及“汇合”',
    });

    const analysis = analyzeToponymyVillages(villages, '村名来源', {
      keyword: '江',
      matchType: 'contains',
      semanticCategory: '水系',
    });
    expect(analysis.villages).toHaveLength(1);
    expect(analysis.villages[0]?.name).toBe('江口村');
    expect(analysis.summary.dominantCategory).toBe('水系');
  });
});
