import { dialectLegendMapping, resolveDialectGroup } from '@/shared/mappings/dialect-mapping';

describe('dialect mapping', () => {
  test('maps known keywords into a stable dialect group', () => {
    expect(resolveDialectGroup('粤方言广宁话')).toBe('广宁话');
    expect(resolveDialectGroup('通用粤方言德庆话')).toBe('德庆话');
    expect(resolveDialectGroup('客家方言和粤方言广宁话')).toBe('客家方言');
  });

  test('exposes legend metadata for configured groups', () => {
    expect(dialectLegendMapping['广宁话'].colorToken).toBe('--color-map-dialect-1');
    expect(dialectLegendMapping['未填写/其他'].order).toBeGreaterThan(
      dialectLegendMapping['广宁话'].order,
    );
  });
});

