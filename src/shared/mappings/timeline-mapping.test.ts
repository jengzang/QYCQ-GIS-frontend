import { parseTimelineSortYear, timelineEraMapping } from '@/shared/mappings/timeline-mapping';

describe('timeline mapping', () => {
  test('keeps explicit era mappings centralized', () => {
    expect(timelineEraMapping['明代']).toBe(1500);
    expect(timelineEraMapping['清代']).toBe(1700);
  });

  test('parses explicit years and common era labels into sortable years', () => {
    expect(parseTimelineSortYear('1907')).toBe(1907);
    expect(parseTimelineSortYear('清代')).toBe(1700);
    expect(parseTimelineSortYear('民国初期')).toBe(1912);
    expect(parseTimelineSortYear('')).toBeNull();
  });
});

