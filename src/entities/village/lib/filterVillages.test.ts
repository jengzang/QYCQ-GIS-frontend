import { filterVillages } from '@/entities/village/lib/filterVillages';
import type { VillageRecord } from '@/entities/village/model/types';

const villages: VillageRecord[] = [
  {
    city: '肇庆市',
    dialectGroup: '德庆话',
    economy: '种植砂糖橘',
    ethnicity: '汉族',
    geometry: { coordinates: [111.9, 23.1], type: 'Point' },
    name: '平治村',
    primaryId: 'vlg-fb354cdb',
    raw: { 建村时间: '明代', 村名: '平治村', 归属市: '肇庆市', 归属镇: '高良镇' },
    searchText: '肇庆市 高良镇 平治村',
    timeline: { endYear: 1644, precision: 'period', rawLabel: '明代', sortYear: 1368, startYear: 1368 },
    town: '高良镇',
  },
  {
    city: '肇庆市',
    dialectGroup: '广宁话',
    economy: '外出务工',
    ethnicity: '壮族',
    geometry: { coordinates: [112.4, 23.7], type: 'Point' },
    name: '围边村',
    primaryId: 'vlg-e9154455',
    raw: { 建村时间: '清代', 村名: '围边村', 归属市: '肇庆市', 归属镇: '白土镇' },
    searchText: '肇庆市 白土镇 围边村',
    timeline: { endYear: 1911, precision: 'period', rawLabel: '清代', sortYear: 1644, startYear: 1644 },
    town: '白土镇',
  },
  {
    city: '云浮市',
    dialectGroup: '粤方言其他',
    geometry: { coordinates: [112.0, 22.9], type: 'Point' },
    name: '空值村',
    primaryId: 'vlg-empty',
    raw: { 建村时间: '民国时期', 村名: '空值村', 归属市: '云浮市', 归属镇: '石城镇' },
    searchText: '云浮市 石城镇 空值村',
    timeline: { endYear: 1949, precision: 'period', rawLabel: '民国时期', sortYear: 1912, startYear: 1912 },
    town: '石城镇',
  },
  {
    city: '肇庆市',
    dialectGroup: '广宁话',
    geometry: { coordinates: [112.3, 23.5], type: 'Point' },
    name: '跨段村',
    primaryId: 'vlg-range',
    raw: { 建村时间: '1590—1610年', 村名: '跨段村', 归属市: '肇庆市', 归属镇: '白土镇' },
    searchText: '肇庆市 白土镇 跨段村',
    timeline: { endYear: 1610, precision: 'range', rawLabel: '1590—1610年', sortYear: 1605, startYear: 1590 },
    town: '白土镇',
  },
  {
    city: '肇庆市',
    dialectGroup: '德庆话',
    geometry: { coordinates: [112.6, 23.4], type: 'Point' },
    name: '未知时间村',
    primaryId: 'vlg-unknown-time',
    raw: { 建村时间: '不详', 村名: '未知时间村', 归属市: '肇庆市', 归属镇: '高良镇' },
    searchText: '肇庆市 高良镇 未知时间村',
    timeline: { endYear: null, precision: 'unknown', rawLabel: '不详', sortYear: null, startYear: null },
    town: '高良镇',
  },
];

describe('filterVillages', () => {
  test('defaults keyword search to village name only', () => {
    const result = filterVillages(villages, {
      q: '高良镇',
    });

    expect(result).toHaveLength(0);
  });

  test('matches full search text when fulltext mode is enabled', () => {
    const result = filterVillages(villages, {
      fulltext: true,
      q: '高良镇',
    });

    expect(result.map((village) => village.primaryId)).toEqual(['vlg-fb354cdb', 'vlg-unknown-time']);
  });

  test('filters by free text, dialect group and timeline end', () => {
    const result = filterVillages(villages, {
      dialectGroup: '德庆话',
      q: '平治',
      timelineEnd: 1600,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.primaryId).toBe('vlg-fb354cdb');
  });

  test('keeps villages whose timeline range overlaps the selected cutoff year', () => {
    const result = filterVillages(villages, {
      timelineEnd: 1600,
    });

    expect(result.map((village) => village.primaryId)).toEqual(['vlg-fb354cdb', 'vlg-range']);
  });

  test('keeps unknown-time villages in non-timeline queries but excludes them from timeline cutoffs', () => {
    expect(filterVillages(villages, {}).map((village) => village.primaryId)).toContain('vlg-unknown-time');

    const timelineResult = filterVillages(villages, {
      timelineEnd: 1119,
    });

    expect(timelineResult.map((village) => village.primaryId)).not.toContain('vlg-unknown-time');
    expect(timelineResult).toHaveLength(0);
  });

  test('filters by city and town', () => {
    const result = filterVillages(villages, {
      city: '肇庆市',
      town: '白土镇',
    });

    expect(result).toHaveLength(2);
    expect(result.map((village) => village.name)).toEqual(['围边村', '跨段村']);
  });

  test('supports ethnicity and economy tag filters in combination with existing conditions', () => {
    const result = filterVillages(villages, {
      city: '肇庆市',
      economy: '水果种植',
      ethnicity: '汉族',
      q: '平治',
      timelineEnd: 1600,
      town: '高良镇',
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.primaryId).toBe('vlg-fb354cdb');
  });

  test('does not match blank ethnicity and economy fields by accident', () => {
    const result = filterVillages(villages, {
      economy: '水果种植',
      ethnicity: '汉族',
    });

    expect(result.map((village) => village.primaryId)).toEqual(['vlg-fb354cdb']);
  });

  test('matches ethnicity tags against ethnicity descriptions instead of exact equality only', () => {
    const result = filterVillages(
      [
        ...villages,
        {
          ...villages[0],
          economy: '茶叶种植',
          ethnicity: '汉族（客家民系）',
          name: '客家村',
          primaryId: 'vlg-hakka',
        },
      ],
      {
        ethnicity: '汉族',
      },
    );

    expect(result.map((village) => village.primaryId)).toEqual(['vlg-fb354cdb', 'vlg-hakka']);
  });
});
