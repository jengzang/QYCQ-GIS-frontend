import { buildPrimaryId, buildPrimaryIdSeed } from '@/shared/mappings/primaryid-mapping';

describe('primaryid mapping', () => {
  test('builds a stable seed from city town and village name', () => {
    expect(
      buildPrimaryIdSeed({
        city: '肇庆市',
        name: '平治村',
        town: '高良镇',
      }),
    ).toBe('肇庆市|高良镇|平治村');
  });

  test('builds a stable short primaryId with a vlg prefix', () => {
    expect(
      buildPrimaryId({
        city: '肇庆市',
        name: '平治村',
        town: '高良镇',
      }),
    ).toBe('vlg-fb354cdb');
  });
});
