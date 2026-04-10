import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';

describe('villageFieldMapping', () => {
  test('keeps detail sections and highlight fields centralized', () => {
    expect(villageFieldMapping.detailSections).toHaveLength(4);
    expect(villageFieldMapping.highlightFields.folkways).toBe('村俗或传统民居或村特色产品');
    expect(villageFieldMapping.metrics.map((metric) => metric.key)).toEqual([
      '居民总人数',
      '男性人数',
      '女性人数',
    ]);
  });
});
