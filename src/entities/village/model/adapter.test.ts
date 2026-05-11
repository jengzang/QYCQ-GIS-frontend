import { adaptVillageRecord } from '@/entities/village/model/adapter';

describe('adaptVillageRecord', () => {
  test('maps backend-style primaryid to the primaryId field and derives structured timeline data', () => {
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
        村经济情况: '种植砂糖橘',
        居民民族: '汉族',
      },
      searchText: '肇庆市 高良镇 平治村',
      town: '高良镇',
    });

    expect(village.primaryId).toBe('vlg-fb354cdb');
    expect(village.raw.村名).toBe('平治村');
    expect(village.timeline).toMatchObject({
      displayLabel: '明代',
      endYear: 1644,
      precision: 'period',
      rawLabel: '明代',
      sortYear: 1368,
      startYear: 1368,
    });
    expect(village.ethnicity).toBe('汉族');
    expect(village.economy).toBe('种植砂糖橘');
  });

  test('keeps ethnicity and economy undefined when the raw values are blank', () => {
    const village = adaptVillageRecord({
      name: '空值村',
      raw: {
        归属市: '肇庆市',
        归属镇: '高良镇',
        居民民族: '   ',
        村经济情况: '',
        村名: '空值村',
      },
    });

    expect(village.ethnicity).toBeUndefined();
    expect(village.economy).toBeUndefined();
  });

  test('preserves original raw text when the label cannot be converted into a concrete year range', () => {
    const village = adaptVillageRecord({
      name: '未详村',
      raw: {
        建村时间: '村落始建年代不详',
        村名: '未详村',
      },
    });

    expect(village.timeline).toMatchObject({
      displayLabel: '村落始建年代不详',
      endYear: null,
      precision: 'unknown',
      rawLabel: '村落始建年代不详',
      sortYear: null,
      startYear: null,
    });
  });
});
