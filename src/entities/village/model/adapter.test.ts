import { adaptVillageRecord } from '@/entities/village/model/adapter';

describe('adaptVillageRecord', () => {
  test('maps backend-style primaryid to the primaryId field and preserves raw data', () => {
    const village = adaptVillageRecord({
      city: '肇庆市',
      dialectGroup: '德庆话',
      geometry: {
        coordinates: [111.9, 23.1],
        type: 'Point',
      },
      name: '平治村',
      primaryid: 'vlg-fb354cdb',
      raw: {
        建村时间: '明代',
        归属市: '肇庆市',
        归属镇: '高良镇',
        村名: '平治村',
      },
      searchText: '肇庆市 高良镇 平治村',
      timeline: {
        rawLabel: '明代',
        sortYear: 1500,
      },
      town: '高良镇',
    });

    expect(village.primaryId).toBe('vlg-fb354cdb');
    expect(village.raw.村名).toBe('平治村');
    expect(village.timeline.sortYear).toBe(1500);
  });
});
