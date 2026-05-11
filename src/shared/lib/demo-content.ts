import { buildPrimaryId } from '@/shared/mappings/primaryid-mapping';
import { dialectLegendMapping } from '@/shared/mappings/dialect-mapping';

export type MapModeKey = 'search' | 'timeline' | 'dialect';

export interface SiteNavigationItem {
  hint: string;
  label: string;
  path: string;
}

export interface ContentCard {
  bullets: string[];
  description: string;
  title: string;
}

export interface MetricItem {
  hint: string;
  label: string;
  value: string;
}

export interface MapDemoVillageSeed {
  anchor: {
    left: string;
    top: string;
  };
  city: string;
  dialectGroup: keyof typeof dialectLegendMapping;
  highlight: string;
  name: string;
  story: string;
  timelineLabel: string;
  town: string;
}

export interface MapDemoVillage extends MapDemoVillageSeed {
  primaryId: string;
  sortYear: number;
}

export const siteNavigation: SiteNavigationItem[] = [
  {
    hint: '课题背景与站点导览',
    label: '课题简介',
    path: '/overview',
  },
  {
    hint: '地图检索与村庄浏览',
    label: '村庄地图',
    path: '/map',
  },
  {
    hint: '民俗风貌与村落日常',
    label: '特色民俗',
    path: '/folkways',
  },
  {
    hint: '村名来源与地理线索',
    label: '村名地理',
    path: '/toponymy',
  },
];

const mapVillageSeeds: MapDemoVillageSeed[] = [
  {
    anchor: { left: '18%', top: '24%' },
    city: '肇庆市',
    dialectGroup: '德庆话',
    highlight: '适合浏览开村时间与聚落演变线索。',
    name: '平治村',
    story: '山水相间的示意村庄，可用于查看检索结果与详情联动。',
    timelineLabel: '明代',
    town: '高良镇',
  },
  {
    anchor: { left: '46%', top: '34%' },
    city: '肇庆市',
    dialectGroup: '广宁话',
    highlight: '适合查看方言分布与村落区位。',
    name: '围边村',
    story: '村落沿河网展开，便于对比语言与空间分布关系。',
    timelineLabel: '清代',
    town: '白土镇',
  },
  {
    anchor: { left: '68%', top: '58%' },
    city: '广州市',
    dialectGroup: '客家方言',
    highlight: '适合浏览村名来源与迁徙记忆。',
    name: '德盛村',
    story: '以移民记忆为线索，呈现村名地理与源流迁徙脉络。',
    timelineLabel: '民国初期',
    town: '石井街道',
  },
  {
    anchor: { left: '33%', top: '72%' },
    city: '清远市',
    dialectGroup: '封川话',
    highlight: '适合浏览地名故事和村落民俗。',
    name: '石桥村',
    story: '以古桥与民居为线索，补充村落文化信息。',
    timelineLabel: '清道光年间',
    town: '龙塘镇',
  },
];

export const mapModeOptions: Array<{
  description: string;
  key: MapModeKey;
  label: string;
}> = [
  {
    description: '按村名、归属市和归属镇检索并联动结果列表。',
    key: 'search',
    label: '村庄检索',
  },
  {
    description: '通过时间轴逐步展示各村建立与扩展节奏。',
    key: 'timeline',
    label: '源流迁徙',
  },
  {
    description: '按方言分组上色，并通过图例解释差异。',
    key: 'dialect',
    label: '方言分布',
  },
];

export const mapDemoVillages: MapDemoVillage[] = mapVillageSeeds.map((seed) => ({
  ...seed,
  primaryId: buildPrimaryId(seed),
  sortYear:
    seed.timelineLabel === '明代'
      ? 1500
      : seed.timelineLabel === '清代'
        ? 1700
        : seed.timelineLabel === '民国初期'
          ? 1912
          : 1830,
}));

export const mapOverviewMetrics: MetricItem[] = [
  {
    hint: '所有交互都围绕唯一村庄键联动。',
    label: '村庄唯一键',
    value: 'primaryId',
  },
  {
    hint: '页面按横竖屏切换主要布局。',
    label: '浏览方式',
    value: '横屏 / 竖屏',
  },
  {
    hint: '当前使用示意数据，便于后续替换真实来源。',
    label: '数据来源',
    value: 'Mock Ready',
  },
];

export const overviewCards: ContentCard[] = [
  {
    bullets: ['围绕广东村落分布、聚落信息与文化线索组织内容。', '兼顾课题介绍、地图浏览与专题栏目入口。'],
    description: '从村庄点位、归属区划到地理背景，形成一套面向村落研究与展示的基础框架。',
    title: '研究对象',
  },
  {
    bullets: ['汇集村名来源、民俗内容、族群与经济等信息。', '保持结构稳定，便于后续替换或补充真实数据。'],
    description: '页面既展示村庄空间位置，也整理村落文化与命名信息，方便连续浏览。',
    title: '数据内容',
  },
  {
    bullets: ['从课题简介进入地图，再延伸到民俗与村名栏目。', '各栏目都可回到地图查看对应村庄。'],
    description: '通过统一导航和村庄链接，把首页、地图与专题内容串成一条清晰浏览路径。',
    title: '浏览方式',
  },
];

export const folkwaysHighlights: ContentCard[] = [
  {
    bullets: ['从节庆活动、传统民居和村中特产切入。', '帮助快速了解各村具有代表性的生活风貌。'],
    description: '把零散民俗信息整理成更适合浏览的栏目内容，突出村落日常与地方特色。',
    title: '节庆与日常',
  },
  {
    bullets: ['结合民族与经济信息，补充村落生活背景。', '让民俗内容不只停留在单条描述。'],
    description: '通过人物、生产与风物线索，把村落文化放回真实生活场景中理解。',
    title: '村落风貌',
  },
  {
    bullets: ['每个村庄卡片都可回到地图页继续查看。', '便于在空间位置与文化内容之间来回切换。'],
    description: '栏目内容与地图入口保持联动，浏览文化信息时也能快速定位到对应村庄。',
    title: '地图联动',
  },
];

export const toponymyHighlights: ContentCard[] = [
  {
    bullets: ['从山、水、桥、田等地理线索理解命名来源。', '把村名与地形、环境特征联系起来阅读。'],
    description: '许多村名保留了对地貌、水系和聚落格局的直接描述，是理解地方环境的重要入口。',
    title: '地貌线索',
  },
  {
    bullets: ['结合迁徙、祖居和聚族而居的叙述。', '帮助理解村名背后的历史记忆。'],
    description: '部分村名记录了族群迁徙、定居与开村过程，可作为观察地方历史的切口。',
    title: '历史记忆',
  },
  {
    bullets: ['保留进入地图页的链接，便于对照空间位置。', '让文字解释与村庄区位能够互相印证。'],
    description: '在阅读命名来源时，可以继续回到地图查看对应村庄的分布与周边环境。',
    title: '空间对照',
  },
];

export const overviewPageCopy = {
  description:
    '围绕广东村落信息整理课题背景、数据内容与栏目入口，帮助快速了解村庄地图、特色民俗与村名地理三类内容。',
  eyebrow: '课题导览',
  title: '课题简介',
};
