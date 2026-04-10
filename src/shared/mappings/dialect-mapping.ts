export const dialectLegendMapping = {
  客家方言: {
    colorToken: '--color-map-dialect-2',
    label: '客家方言',
    mapColor: '#2563eb',
    order: 2,
  },
  广宁话: {
    colorToken: '--color-map-dialect-1',
    label: '广宁话',
    mapColor: '#1d4ed8',
    order: 1,
  },
  德庆话: {
    colorToken: '--color-map-dialect-3',
    label: '德庆话',
    mapColor: '#0ea5e9',
    order: 3,
  },
  高要话: {
    colorToken: '--color-map-dialect-4',
    label: '高要话',
    mapColor: '#0284c7',
    order: 4,
  },
  封川话: {
    colorToken: '--color-map-dialect-5',
    label: '封川话',
    mapColor: '#38bdf8',
    order: 5,
  },
  开建话: {
    colorToken: '--color-map-dialect-6',
    label: '开建话',
    mapColor: '#60a5fa',
    order: 6,
  },
  粤方言其他: {
    colorToken: '--color-map-dialect-7',
    label: '粤方言其他',
    mapColor: '#7dd3fc',
    order: 7,
  },
  '未填写/其他': {
    colorToken: '--color-map-dialect-8',
    label: '未填写/其他',
    mapColor: '#93c5fd',
    order: 99,
  },
} as const;

const dialectKeywordMapping = [
  { group: '客家方言', keywords: ['客家'] },
  { group: '广宁话', keywords: ['广宁'] },
  { group: '德庆话', keywords: ['德庆'] },
  { group: '高要话', keywords: ['高要'] },
  { group: '封川话', keywords: ['封川'] },
  { group: '开建话', keywords: ['开建'] },
  { group: '粤方言其他', keywords: ['粤'] },
] as const;

export function resolveDialectGroup(value?: string | null): string {
  const normalized = (value ?? '').trim();

  if (!normalized) {
    return '未填写/其他';
  }

  const matched = dialectKeywordMapping.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );

  return matched?.group ?? '未填写/其他';
}
