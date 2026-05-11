export type TimelinePrecision = 'exact' | 'range' | 'period' | 'unknown';

export interface TimelineRangeDescriptor {
  endYear: number;
  precision?: Exclude<TimelinePrecision, 'unknown'>;
  startYear: number;
}

export interface ParsedTimeline {
  displayLabel: string | null;
  endYear: number | null;
  precision: TimelinePrecision;
  rawLabel?: string;
  sortYear: number | null;
  startYear: number | null;
}

export const timelineEraMapping: Record<string, TimelineRangeDescriptor> = {
  唐朝: { startYear: 618, endYear: 907, precision: 'period' },
  唐朝年间: { startYear: 618, endYear: 907, precision: 'period' },
  唐代后期: { startYear: 766, endYear: 907, precision: 'period' },
  宋代: { startYear: 960, endYear: 1279, precision: 'period' },
  宋朝: { startYear: 960, endYear: 1279, precision: 'period' },
  宋初: { startYear: 960, endYear: 1020, precision: 'period' },
  宋末: { startYear: 1220, endYear: 1279, precision: 'period' },
  宋末元初: { startYear: 1271, endYear: 1285, precision: 'period' },
  北宋: { startYear: 960, endYear: 1127, precision: 'period' },
  南宋: { startYear: 1127, endYear: 1279, precision: 'period' },
  南宋时期: { startYear: 1127, endYear: 1279, precision: 'period' },
  南宋年间: { startYear: 1127, endYear: 1279, precision: 'period' },
  元初: { startYear: 1271, endYear: 1300, precision: 'period' },
  元代: { startYear: 1271, endYear: 1368, precision: 'period' },
  元朝: { startYear: 1271, endYear: 1368, precision: 'period' },
  元朝时期: { startYear: 1271, endYear: 1368, precision: 'period' },
  元代晚期: { startYear: 1330, endYear: 1368, precision: 'period' },
  元末: { startYear: 1350, endYear: 1368, precision: 'period' },
  元末明初: { startYear: 1360, endYear: 1380, precision: 'period' },
  明初: { startYear: 1368, endYear: 1435, precision: 'period' },
  明代: { startYear: 1368, endYear: 1644, precision: 'period' },
  明朝: { startYear: 1368, endYear: 1644, precision: 'period' },
  明末: { startYear: 1573, endYear: 1644, precision: 'period' },
  明末清初: { startYear: 1600, endYear: 1680, precision: 'period' },
  清初: { startYear: 1644, endYear: 1722, precision: 'period' },
  清代: { startYear: 1644, endYear: 1911, precision: 'period' },
  清朝: { startYear: 1644, endYear: 1911, precision: 'period' },
  清朝中期: { startYear: 1736, endYear: 1820, precision: 'period' },
  清代中期: { startYear: 1736, endYear: 1820, precision: 'period' },
  清中后期: { startYear: 1796, endYear: 1911, precision: 'period' },
  清朝末年: { startYear: 1875, endYear: 1911, precision: 'period' },
  清末: { startYear: 1875, endYear: 1911, precision: 'period' },
  民国初年: { startYear: 1912, endYear: 1920, precision: 'period' },
  民国初期: { startYear: 1912, endYear: 1920, precision: 'period' },
  民国时期: { startYear: 1912, endYear: 1949, precision: 'period' },
  民国年间: { startYear: 1912, endYear: 1949, precision: 'period' },
  民国末年: { startYear: 1945, endYear: 1949, precision: 'period' },
  民国: { startYear: 1912, endYear: 1949, precision: 'period' },
  中华人民共和国成立前后: { startYear: 1947, endYear: 1951, precision: 'range' },
  中华人民共和国成立初: { startYear: 1949, endYear: 1954, precision: 'period' },
  中华人民共和国成立初期: { startYear: 1949, endYear: 1954, precision: 'period' },
};

const reignYearMapping: Record<string, TimelineRangeDescriptor> = {
  太康: { startYear: 280, endYear: 289, precision: 'period' },
  垂拱: { startYear: 685, endYear: 688, precision: 'period' },
  天宝: { startYear: 742, endYear: 756, precision: 'period' },
  泰定: { startYear: 1324, endYear: 1328, precision: 'period' },
  至正: { startYear: 1341, endYear: 1370, precision: 'period' },
  洪武: { startYear: 1368, endYear: 1398, precision: 'period' },
  建文: { startYear: 1399, endYear: 1402, precision: 'period' },
  永乐: { startYear: 1403, endYear: 1424, precision: 'period' },
  洪熙: { startYear: 1425, endYear: 1425, precision: 'period' },
  宣德: { startYear: 1426, endYear: 1435, precision: 'period' },
  正统: { startYear: 1436, endYear: 1449, precision: 'period' },
  景泰: { startYear: 1450, endYear: 1456, precision: 'period' },
  天顺: { startYear: 1457, endYear: 1464, precision: 'period' },
  成化: { startYear: 1465, endYear: 1487, precision: 'period' },
  弘治: { startYear: 1488, endYear: 1505, precision: 'period' },
  正德: { startYear: 1506, endYear: 1521, precision: 'period' },
  嘉靖: { startYear: 1522, endYear: 1566, precision: 'period' },
  隆庆: { startYear: 1567, endYear: 1572, precision: 'period' },
  万历: { startYear: 1573, endYear: 1620, precision: 'period' },
  泰昌: { startYear: 1620, endYear: 1620, precision: 'period' },
  天启: { startYear: 1621, endYear: 1627, precision: 'period' },
  崇祯: { startYear: 1628, endYear: 1644, precision: 'period' },
  顺治: { startYear: 1644, endYear: 1661, precision: 'period' },
  康熙: { startYear: 1662, endYear: 1722, precision: 'period' },
  雍正: { startYear: 1723, endYear: 1735, precision: 'period' },
  乾隆: { startYear: 1736, endYear: 1795, precision: 'period' },
  嘉庆: { startYear: 1796, endYear: 1820, precision: 'period' },
  道光: { startYear: 1821, endYear: 1850, precision: 'period' },
  咸丰: { startYear: 1851, endYear: 1861, precision: 'period' },
  同治: { startYear: 1862, endYear: 1874, precision: 'period' },
  光绪: { startYear: 1875, endYear: 1908, precision: 'period' },
  宣统: { startYear: 1909, endYear: 1911, precision: 'period' },
};

const unknownTimelineLabels = ['不详', '无明确记载', '未提及'];
const timelineEraEntries = Object.entries(timelineEraMapping).sort((left, right) => right[0].length - left[0].length);
const reignEntries = Object.entries(reignYearMapping).sort((left, right) => right[0].length - left[0].length);
const chineseDigitMapping: Record<string, number> = {
  〇: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  两: 2,
};
const chineseUnitMapping: Record<string, number> = { 十: 10, 百: 100, 千: 1000 };

function normalizeTimelineLabel(rawLabel?: string | null): string {
  return (rawLabel ?? '').trim().replace(/崇桢/g, '崇祯');
}

function buildParsedTimeline(
  rawLabel: string | undefined,
  startYear: number | null,
  endYear: number | null,
  precision: TimelinePrecision,
): ParsedTimeline {
  const normalizedRawLabel = rawLabel?.trim();

  return {
    displayLabel: normalizedRawLabel || formatTimelineRange(startYear, endYear),
    endYear,
    precision,
    rawLabel: normalizedRawLabel || undefined,
    sortYear: startYear,
    startYear,
  };
}

function formatTimelineRange(startYear: number | null, endYear: number | null): string | null {
  if (startYear === null) {
    return null;
  }

  if (endYear !== null && endYear !== startYear) {
    return `${startYear}—${endYear}年`;
  }

  return `${startYear}年`;
}

function parseExplicitYear(normalized: string): number | null {
  const parenthesizedYearMatch = normalized.match(/[（(]([1-9]\d{2}|1\d{3}|20\d{2})年[）)]/);
  if (parenthesizedYearMatch) {
    return Number(parenthesizedYearMatch[1]);
  }

  const explicitYearMatch = normalized.match(/(?<!\d)(1\d{3}|20\d{2})(?!\d)/);
  if (explicitYearMatch) {
    return Number(explicitYearMatch[1]);
  }

  return null;
}

function parseChineseNumeral(value: string): number | null {
  if (!value) {
    return null;
  }

  if (value === '元') {
    return 1;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  let total = 0;
  let current = 0;

  for (const character of value.replace(/廿/g, '二十').replace(/卅/g, '三十')) {
    if (character in chineseDigitMapping) {
      current = chineseDigitMapping[character];
      continue;
    }

    const unit = chineseUnitMapping[character];
    if (unit) {
      total += (current || 1) * unit;
      current = 0;
      continue;
    }

    return null;
  }

  return total + current;
}

function parseReignYear(normalized: string): ParsedTimeline | null {
  const reignNamesPattern = reignEntries.map(([name]) => name).join('|');
  const reignYearMatch = normalized.match(new RegExp(`(${reignNamesPattern})([元〇一二三四五六七八九十百千两廿卅\\d]+)年`));

  if (!reignYearMatch) {
    return null;
  }

  const descriptor = reignYearMapping[reignYearMatch[1]];
  const offsetYear = parseChineseNumeral(reignYearMatch[2]);
  if (!descriptor || offsetYear === null) {
    return null;
  }

  const exactYear = descriptor.startYear + offsetYear - 1;
  if (exactYear > descriptor.endYear) {
    return null;
  }

  return buildParsedTimeline(normalized, exactYear, exactYear, 'exact');
}

function parseReignPeriod(normalized: string): ParsedTimeline | null {
  const match = reignEntries.find(([name]) => normalized.includes(name));
  if (!match) {
    return null;
  }

  const [, descriptor] = match;
  return buildParsedTimeline(normalized, descriptor.startYear, descriptor.endYear, descriptor.precision ?? 'period');
}

function parseCenturyDecade(normalized: string): ParsedTimeline | null {
  const decadeMatch = normalized.match(/(\d{2})世纪(\d{1,2})年代(?:(初|中|末|晚)(?:期)?)?/);
  if (!decadeMatch) {
    return null;
  }

  const century = Number(decadeMatch[1]);
  const decade = Number(decadeMatch[2]);
  const qualifier = decadeMatch[3];
  const baseYear = (century - 1) * 100 + decade;

  if (qualifier === '初') {
    return buildParsedTimeline(normalized, baseYear, baseYear + 3, 'range');
  }

  if (qualifier === '中') {
    return buildParsedTimeline(normalized, baseYear + 4, baseYear + 6, 'range');
  }

  if (qualifier === '末' || qualifier === '晚') {
    return buildParsedTimeline(normalized, baseYear + 7, baseYear + 9, 'range');
  }

  return buildParsedTimeline(normalized, baseYear, baseYear + 9, 'range');
}

function parseNamedEra(normalized: string): ParsedTimeline | null {
  const matchedEntry = timelineEraEntries.find(([era]) => normalized.includes(era));
  if (!matchedEntry) {
    return null;
  }

  const [, descriptor] = matchedEntry;
  return buildParsedTimeline(normalized, descriptor.startYear, descriptor.endYear, descriptor.precision ?? 'period');
}

export function parseVillageTimeline(rawLabel?: string | null): ParsedTimeline {
  const normalized = normalizeTimelineLabel(rawLabel);

  if (!normalized) {
    return buildParsedTimeline(undefined, null, null, 'unknown');
  }

  if (unknownTimelineLabels.some((label) => normalized.includes(label))) {
    return buildParsedTimeline(normalized, null, null, 'unknown');
  }

  const explicitYear = parseExplicitYear(normalized);
  if (explicitYear !== null) {
    return buildParsedTimeline(normalized, explicitYear, explicitYear, 'exact');
  }

  const reignYear = parseReignYear(normalized);
  if (reignYear) {
    return reignYear;
  }

  const centuryDecade = parseCenturyDecade(normalized);
  if (centuryDecade) {
    return centuryDecade;
  }

  const namedEra = parseNamedEra(normalized);
  if (namedEra) {
    return namedEra;
  }

  const reignPeriod = parseReignPeriod(normalized);
  if (reignPeriod) {
    return reignPeriod;
  }

  return buildParsedTimeline(normalized, null, null, 'unknown');
}

export function parseTimelineSortYear(rawLabel?: string | null): number | null {
  return parseVillageTimeline(rawLabel).sortYear;
}

export function getTimelineDisplayLabel(timeline: {
  displayLabel?: string | null;
  endYear?: number | null;
  rawLabel?: string;
  startYear?: number | null;
}): string | null {
  return timeline.rawLabel?.trim() || timeline.displayLabel || formatTimelineRange(timeline.startYear ?? null, timeline.endYear ?? null);
}
