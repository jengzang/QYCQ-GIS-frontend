import type { VillageRecord } from '@/entities/village/model/types';

export type ToponymyMatchType = 'contains' | 'prefix' | 'suffix';

export type ToponymySemanticCategory =
  | '全部'
  | '地形'
  | '水系'
  | '方位'
  | '聚落'
  | '姓氏/族群'
  | '植被/物产'
  | '吉祥愿景'
  | '历史记忆'
  | '待确认';

export interface ToponymySemanticOption {
  description: string;
  label: ToponymySemanticCategory;
}

export interface ToponymyQuickCharItem {
  count: number;
  value: string;
}

export interface ToponymyAnalyzedVillage {
  category: Exclude<ToponymySemanticCategory, '全部'>;
  city?: string;
  excerpt: string;
  matchType: ToponymyMatchType;
  name: string;
  primaryId: string;
  reason: string;
  sourceText: string;
  town?: string;
}

export interface ToponymyAnalysisSummary {
  dominantCategory: Exclude<ToponymySemanticCategory, '全部'>;
  matchCount: number;
  matchTypeCount: number;
  topCollocations: string[];
}

const semanticRuleMapping: Array<{
  category: Exclude<ToponymySemanticCategory, '全部'>;
  keywords: string[];
  label: string;
  sourceKeywords?: string[];
}> = [
  {
    category: '地形',
    keywords: ['山', '岭', '岗', '坡', '坪', '坳', '坑', '陂', '高', '崖', '岽', '峰', '岩'],
    label: '名称中含有地形字词',
    sourceKeywords: ['高地', '山脚', '山麓', '岭下', '山冈', '坡地', '岗地'],
  },
  {
    category: '水系',
    keywords: ['江', '河', '溪', '潭', '塘', '涌', '沥', '湖', '港', '湾', '浦', '泉', '桥'],
    label: '名称中含有水系字词',
    sourceKeywords: ['临江', '河边', '溪旁', '水口', '汇流', '汇合', '合流', '塘边', '桥侧'],
  },
  {
    category: '方位',
    keywords: ['东', '西', '南', '北', '上', '下', '前', '后', '中', '里', '外'],
    label: '名称中含有方位字词',
    sourceKeywords: ['东侧', '西侧', '南面', '北面', '上游', '下游'],
  },
  {
    category: '聚落',
    keywords: ['村', '庄', '寨', '围', '坊', '里', '门', '屋', '社', '墟'],
    label: '名称中含有聚落形态字词',
    sourceKeywords: ['聚居', '围屋', '村场', '墟市'],
  },
  {
    category: '姓氏/族群',
    keywords: ['陈', '李', '黄', '张', '何', '林', '赖', '吴', '郑', '谢', '许', '梁'],
    label: '名称中含有姓氏或族群字词',
    sourceKeywords: ['某姓', '开基', '聚族', '宗族', '氏族', '祖居'],
  },
  {
    category: '植被/物产',
    keywords: ['梅', '竹', '莲', '榕', '茶', '桑', '果', '花', '木', '柑', '荷'],
    label: '名称中含有植被或物产字词',
    sourceKeywords: ['古榕', '梅林', '竹林', '茶园', '果园'],
  },
  {
    category: '吉祥愿景',
    keywords: ['安', '宁', '福', '昌', '兴', '新', '永', '和', '盛', '泰', '康', '德'],
    label: '名称中含有吉祥愿景字词',
    sourceKeywords: ['求吉', '祈福', '兴旺', '安居', '和顺'],
  },
  {
    category: '历史记忆',
    keywords: ['古', '旧', '官', '驿', '屯', '营', '堡', '城', '台'],
    label: '名称中含有历史记忆字词',
    sourceKeywords: ['旧址', '古驿', '屯兵', '驻营', '设堡'],
  },
];

export const toponymySemanticOptions: ToponymySemanticOption[] = [
  { description: '不过滤命名语义。', label: '全部' },
  { description: '山岭、高地、坡岗等地形特征。', label: '地形' },
  { description: '江河、溪塘、桥港等水系线索。', label: '水系' },
  { description: '东南西北、上下前后等方位指称。', label: '方位' },
  { description: '村、围、寨、墟等聚落形态。', label: '聚落' },
  { description: '姓氏开基、族群聚居等来源。', label: '姓氏/族群' },
  { description: '梅竹茶果等植被与物产。', label: '植被/物产' },
  { description: '安宁福昌等吉祥命名。', label: '吉祥愿景' },
  { description: '古驿、屯营、旧址等历史记忆。', label: '历史记忆' },
  { description: '暂无法明确归类的命名。', label: '待确认' },
];

const quickCharCandidates = ['高', '山', '水', '龙', '石', '田', '坪', '江', '下', '新', '梅', '岭', '塘', '岗', '溪', '安'];
const quickCharCandidateOrder = new Map(quickCharCandidates.map((value, index) => [value, index]));

export function normalizeToponymyKeyword(keyword: string) {
  return keyword.trim().slice(0, 4);
}

export function matchesVillageName(name: string, keyword: string, matchType: ToponymyMatchType) {
  if (!keyword) {
    return true;
  }

  if (matchType === 'prefix') {
    return name.startsWith(keyword);
  }

  if (matchType === 'suffix') {
    return name.endsWith(keyword);
  }

  return name.includes(keyword);
}

const genericSettlementKeywords = new Set(['村', '庄', '里', '社']);

export function classifyToponymySemantic(name: string, sourceText: string): {
  category: Exclude<ToponymySemanticCategory, '全部'>;
  reason: string;
} {
  for (const rule of semanticRuleMapping) {
    const nameKeyword = rule.keywords.find((keyword) => name.includes(keyword) && !genericSettlementKeywords.has(keyword));
    if (nameKeyword) {
      return { category: rule.category, reason: `${rule.label}：${nameKeyword}` };
    }
  }

  for (const rule of semanticRuleMapping) {
    const sourceHintKeyword = rule.sourceKeywords?.find((keyword) => sourceText.includes(keyword));
    if (sourceHintKeyword) {
      return { category: rule.category, reason: `来源说明涉及“${sourceHintKeyword}”` };
    }

    const sourceKeyword = rule.keywords.find((keyword) => sourceText.includes(keyword) && !genericSettlementKeywords.has(keyword));
    if (sourceKeyword) {
      return { category: rule.category, reason: `来源说明出现${rule.category}字词：${sourceKeyword}` };
    }
  }

  const genericSettlementMatch = semanticRuleMapping
    .find((rule) => rule.category === '聚落')
    ?.keywords.find((keyword) => name.includes(keyword));
  if (genericSettlementMatch) {
    return { category: '聚落', reason: `名称中含有聚落形态字词：${genericSettlementMatch}` };
  }

  return { category: '待确认', reason: '当前字面与来源说明未命中预设规则' };
}

function splitSourceSentences(sourceText: string) {
  return sourceText
    .split(/[。！？；\n]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function buildToponymyExcerpt(sourceText: string, keyword: string) {
  if (!sourceText) {
    return '暂无命名来源说明';
  }

  const sentences = splitSourceSentences(sourceText);
  if (!sentences.length) {
    return sourceText;
  }

  const matchedSentence = keyword ? sentences.find((sentence) => sentence.includes(keyword)) : undefined;
  if (matchedSentence) {
    return matchedSentence;
  }

  const sourceHintSentence = sentences.find((sentence) => /得名|因此|因其|相传|聚居|临江|山/.test(sentence));
  return sourceHintSentence ?? sentences[0];
}

function buildCollocations(keyword: string, villages: ToponymyAnalyzedVillage[]) {
  if (!keyword) {
    return [];
  }

  const counter = new Map<string, number>();

  villages.forEach((village) => {
    const strippedName = village.name.replaceAll(keyword, '');
    [...strippedName].forEach((char) => {
      if (!char.trim() || char === '村') {
        return;
      }

      counter.set(char, (counter.get(char) ?? 0) + 1);
    });
  });

  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-Hans-CN'))
    .slice(0, 3)
    .map(([char]) => char);
}

export function getToponymyQuickChars(villages: VillageRecord[]) {
  return quickCharCandidates
    .map((value) => ({
      count: villages.filter((village) => village.name.includes(value)).length,
      value,
    }))
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count || (quickCharCandidateOrder.get(left.value) ?? 0) - (quickCharCandidateOrder.get(right.value) ?? 0));
}

export function getDefaultToponymyKeyword(villages: VillageRecord[]) {
  return getToponymyQuickChars(villages)[0]?.value ?? '';
}

export function analyzeToponymyVillages(
  villages: VillageRecord[],
  toponymyField: keyof VillageRecord['raw'],
  options: {
    keyword: string;
    matchType: ToponymyMatchType;
    semanticCategory: ToponymySemanticCategory;
  },
) {
  const keyword = normalizeToponymyKeyword(options.keyword);

  const matchedVillages = villages
    .filter((village) => matchesVillageName(village.name, keyword, options.matchType))
    .map<ToponymyAnalyzedVillage>((village) => {
      const sourceText = village.raw[toponymyField] ?? '';
      const semantic = classifyToponymySemantic(village.name, sourceText);

      return {
        category: semantic.category,
        city: village.city,
        excerpt: buildToponymyExcerpt(sourceText, keyword),
        matchType: options.matchType,
        name: village.name,
        primaryId: village.primaryId,
        reason: semantic.reason,
        sourceText,
        town: village.town,
      };
    })
    .filter((village) => options.semanticCategory === '全部' || village.category === options.semanticCategory)
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-Hans-CN'));

  const categoryCounter = new Map<Exclude<ToponymySemanticCategory, '全部'>, number>();
  matchedVillages.forEach((village) => {
    categoryCounter.set(village.category, (categoryCounter.get(village.category) ?? 0) + 1);
  });

  const dominantCategory =
    [...categoryCounter.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? '待确认';

  const summary: ToponymyAnalysisSummary = {
    dominantCategory,
    matchCount: matchedVillages.length,
    matchTypeCount: matchedVillages.filter((village) => village.matchType === options.matchType).length,
    topCollocations: buildCollocations(keyword, matchedVillages),
  };

  return {
    keyword,
    villages: matchedVillages,
    summary,
  };
}
