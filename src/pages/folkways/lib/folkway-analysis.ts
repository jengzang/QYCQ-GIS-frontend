import type { VillageRecord } from '@/entities/village/model/types';

export type FolkwayThemeKey = 'festival' | 'dwelling' | 'product' | 'livelihood' | 'belief';

export interface FolkwayThemeDefinition {
  description: string;
  keywords: string[];
  key: FolkwayThemeKey;
  label: string;
  summaryTemplate: string;
}

export interface FolkwayThemeItem extends FolkwayThemeDefinition {
  count: number;
}

export interface FolkwayAnalyzedVillage {
  city?: string;
  excerpt: string;
  matchedKeywords: string[];
  name: string;
  primaryId: string;
  themeKey: FolkwayThemeKey;
  town?: string;
}

export const folkwayThemeDefinitions: FolkwayThemeDefinition[] = [
  {
    description: '查看祭祀、年节、庙会与仪式性活动。',
    key: 'festival',
    keywords: ['节', '祭', '庙会', '舞', '仪式', '龙舟', '火龙', '盘王', '迎神'],
    label: '节庆仪式',
    summaryTemplate: '主要记录祭祀、节庆、庙会和集体仪式等公共活动线索。',
  },
  {
    description: '查看古屋、祠堂、围屋与聚落空间形态。',
    key: 'dwelling',
    keywords: ['屋', '居', '祠堂', '古屋', '围屋', '民居', '镬耳', '院落'],
    label: '传统民居',
    summaryTemplate: '主要记录宗祠、围屋、古屋和居住空间格局等内容。',
  },
  {
    description: '查看地方物产、手工业与可识别的风物特产。',
    key: 'product',
    keywords: ['产品', '特产', '茶', '果', '糖', '橘', '竹编', '陶', '渔产', '山茶'],
    label: '地方产品',
    summaryTemplate: '主要记录果品、手工业、渔产与地方风物等可识别产出。',
  },
  {
    description: '查看农耕、渔猎、商贸等生产生活方式。',
    key: 'livelihood',
    keywords: ['耕', '渔', '商', '种植', '养殖', '农', '采', '制茶'],
    label: '生计方式',
    summaryTemplate: '主要记录农耕、渔猎、贸易及日常生产方式。',
  },
  {
    description: '查看宗族、庙宇与族群认同等线索。',
    key: 'belief',
    keywords: ['族', '宗', '庙', '信仰', '盘王', '祖', '祠'],
    label: '信仰与族群',
    summaryTemplate: '主要记录宗族组织、庙宇信仰和族群认同相关内容。',
  },
];

function splitSentences(text: string) {
  return text
    .split(/[。！？；\n]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function getMatchedThemeKeywords(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword));
}

export function buildFolkwayExcerpt(text: string, keywords: string[]) {
  if (!text) {
    return '暂无可提取的民俗内容';
  }

  const sentences = splitSentences(text);
  const matchedSentence = sentences.find((sentence) => keywords.some((keyword) => sentence.includes(keyword)));
  if (matchedSentence) {
    return matchedSentence;
  }

  return sentences[0] ?? text;
}

export function buildFolkwayThemes(villages: VillageRecord[], folkwayField: keyof VillageRecord['raw']) {
  return folkwayThemeDefinitions.map<FolkwayThemeItem>((theme) => ({
    ...theme,
    count: villages.filter((village) => getMatchedThemeKeywords(village.raw[folkwayField] ?? '', theme.keywords).length > 0).length,
  }));
}

export function getDefaultFolkwayTheme(themes: FolkwayThemeItem[]) {
  return themes.find((theme) => theme.count > 0)?.key ?? folkwayThemeDefinitions[0].key;
}

export function analyzeFolkwayVillages(
  villages: VillageRecord[],
  folkwayField: keyof VillageRecord['raw'],
  themeKey: FolkwayThemeKey,
) {
  const theme = folkwayThemeDefinitions.find((item) => item.key === themeKey) ?? folkwayThemeDefinitions[0];

  const matchedVillages = villages
    .map<FolkwayAnalyzedVillage | null>((village) => {
      const sourceText = village.raw[folkwayField] ?? '';
      const matchedKeywords = getMatchedThemeKeywords(sourceText, theme.keywords);
      if (!matchedKeywords.length) {
        return null;
      }

      return {
        city: village.city,
        excerpt: buildFolkwayExcerpt(sourceText, matchedKeywords),
        matchedKeywords,
        name: village.name,
        primaryId: village.primaryId,
        themeKey,
        town: village.town,
      };
    })
    .filter((village): village is FolkwayAnalyzedVillage => Boolean(village))
    .sort((left, right) => right.matchedKeywords.length - left.matchedKeywords.length || left.name.localeCompare(right.name, 'zh-Hans-CN'));

  const keywordCounter = new Map<string, number>();
  matchedVillages.forEach((village) => {
    village.matchedKeywords.forEach((keyword) => {
      keywordCounter.set(keyword, (keywordCounter.get(keyword) ?? 0) + 1);
    });
  });

  return {
    leadingKeywords: [...keywordCounter.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-Hans-CN'))
      .slice(0, 3)
      .map(([keyword]) => keyword),
    theme,
    villages: matchedVillages,
  };
}
