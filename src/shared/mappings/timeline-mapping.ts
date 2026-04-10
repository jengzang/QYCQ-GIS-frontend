export const timelineEraMapping: Record<string, number> = {
  明代: 1500,
  明朝: 1500,
  明末: 1630,
  '明末清初': 1644,
  民国初期: 1912,
  民国时期: 1912,
  清代: 1700,
  清初: 1650,
  清咸丰年间: 1851,
  清嘉庆年间: 1800,
  清康熙年间: 1680,
  清朝: 1700,
  清朝中期: 1750,
  清朝末年: 1900,
  清代中期: 1750,
  清乾隆年间: 1750,
  清光绪年间: 1880,
  清末: 1900,
  清道光年间: 1830,
};

export function parseTimelineSortYear(rawLabel?: string | null): number | null {
  const normalized = (rawLabel ?? '').trim();

  if (!normalized) {
    return null;
  }

  const yearMatch = normalized.match(/(1[0-9]{3}|20[0-9]{2})/);

  if (yearMatch) {
    return Number(yearMatch[1]);
  }

  const matchedEntry = Object.entries(timelineEraMapping).find(([era]) => normalized.includes(era));
  return matchedEntry?.[1] ?? null;
}
