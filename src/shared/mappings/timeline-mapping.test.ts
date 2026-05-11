import {
  getTimelineDisplayLabel,
  parseTimelineSortYear,
  parseVillageTimeline,
  timelineEraMapping,
} from '@/shared/mappings/timeline-mapping';

describe('timeline mapping', () => {
  test('keeps explicit era ranges centralized', () => {
    expect(timelineEraMapping['明代']).toEqual({ endYear: 1644, precision: 'period', startYear: 1368 });
    expect(timelineEraMapping['清代']).toEqual({ endYear: 1911, precision: 'period', startYear: 1644 });
  });

  test('parses exact years and reign-year labels into exact timeline points', () => {
    expect(parseTimelineSortYear('1907')).toBe(1907);
    expect(parseVillageTimeline('明成化十七年')).toMatchObject({
      displayLabel: '明成化十七年',
      endYear: 1481,
      precision: 'exact',
      sortYear: 1481,
      startYear: 1481,
    });
    expect(parseVillageTimeline('西晋太康元年(280年)')).toMatchObject({
      endYear: 280,
      precision: 'exact',
      sortYear: 280,
      startYear: 280,
    });
  });

  test('parses named reigns and decades into ranges', () => {
    expect(parseVillageTimeline('清雍正年间')).toMatchObject({
      endYear: 1735,
      precision: 'period',
      sortYear: 1723,
      startYear: 1723,
    });
    expect(parseVillageTimeline('20世纪30年代')).toMatchObject({
      endYear: 1939,
      precision: 'range',
      sortYear: 1930,
      startYear: 1930,
    });
    expect(parseVillageTimeline('民国')).toMatchObject({
      endYear: 1949,
      precision: 'period',
      sortYear: 1912,
      startYear: 1912,
    });
  });

  test('treats unknown labels as unknown but preserves original text for display', () => {
    expect(parseVillageTimeline('村落始建年代不详')).toMatchObject({
      displayLabel: '村落始建年代不详',
      endYear: null,
      precision: 'unknown',
      sortYear: null,
      startYear: null,
    });
    expect(getTimelineDisplayLabel(parseVillageTimeline('村落始建年代不详'))).toBe('村落始建年代不详');
    expect(getTimelineDisplayLabel(parseVillageTimeline(''))).toBeNull();
  });
});
