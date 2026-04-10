import { filterVillages } from '@/entities/village/lib/filterVillages';
import type { VillageRecord } from '@/entities/village/model/types';

const villages: VillageRecord[] = [
  {
    city: '肇庆市',
    dialectGroup: '德庆话',
    geometry: { coordinates: [111.9, 23.1], type: 'Point' },
    name: '平治村',
    primaryId: 'vlg-fb354cdb',
    raw: { 建村时间: '明代', 村名: '平治村', 归属市: '肇庆市', 归属镇: '高良镇' },
    searchText: '肇庆市 高良镇 平治村',
    timeline: { rawLabel: '明代', sortYear: 1500 },
    town: '高良镇',
  },
  {
    city: '肇庆市',
    dialectGroup: '广宁话',
    geometry: { coordinates: [112.4, 23.7], type: 'Point' },
    name: '围边村',
    primaryId: 'vlg-e9154455',
    raw: { 建村时间: '清代', 村名: '围边村', 归属市: '肇庆市', 归属镇: '白土镇' },
    searchText: '肇庆市 白土镇 围边村',
    timeline: { rawLabel: '清代', sortYear: 1700 },
    town: '白土镇',
  },
];

describe('filterVillages', () => {
  test('filters by free text, dialect group and timeline end', () => {
    const result = filterVillages(villages, {
      dialectGroup: '德庆话',
      q: '平治',
      timelineEnd: 1600,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.primaryId).toBe('vlg-fb354cdb');
  });

  test('filters by city and town', () => {
    const result = filterVillages(villages, {
      city: '肇庆市',
      town: '白土镇',
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('围边村');
  });
});
