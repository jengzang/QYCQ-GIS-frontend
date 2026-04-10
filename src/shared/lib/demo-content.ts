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
    hint: '项目目标与展示口径',
    label: '课题简介',
    path: '/overview',
  },
  {
    hint: '检索、迁徙、方言三种模式',
    label: '村庄地图',
    path: '/map',
  },
  {
    hint: '村俗、民居与特色产品',
    label: '特色民俗',
    path: '/folkways',
  },
  {
    hint: '村名来源与地理故事',
    label: '村名地理',
    path: '/toponymy',
  },
];

const mapVillageSeeds: MapDemoVillageSeed[] = [
  {
    anchor: { left: '18%', top: '24%' },
    city: '肇庆市',
    dialectGroup: '德庆话',
    highlight: '适合演示从明代开村到当代聚落的时间推进。',
    name: '平治村',
    story: '山水相间的示意村庄，展示村庄检索与详情联动。',
    timelineLabel: '明代',
    town: '高良镇',
  },
  {
    anchor: { left: '46%', top: '34%' },
    city: '肇庆市',
    dialectGroup: '广宁话',
    highlight: '适合演示方言分布与图例着色。',
    name: '围边村',
    story: '村落沿河网展开，突出村民语言与空间分布的关系。',
    timelineLabel: '清代',
    town: '白土镇',
  },
  {
    anchor: { left: '68%', top: '58%' },
    city: '广州市',
    dialectGroup: '客家方言',
    highlight: '适合演示村名来源与迁徙线索。',
    name: '德盛村',
    story: '以移民记忆为线索，呈现村名地理与源流迁徙叙事。',
    timelineLabel: '民国初期',
    town: '石井街道',
  },
  {
    anchor: { left: '33%', top: '72%' },
    city: '清远市',
    dialectGroup: '封川话',
    highlight: '适合演示地名故事和特色民俗卡片。',
    name: '石桥村',
    story: '以古桥与民居为符号，强化可视化讲述感。',
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
    hint: '所有交互都围绕唯一村庄键联动',
    label: '村庄唯一键',
    value: 'primaryId',
  },
  {
    hint: '仅按方向切布局，不按宽度切结构',
    label: '响应策略',
    value: '横屏 / 竖屏',
  },
  {
    hint: '当前用模拟数据，后续可平滑切后端',
    label: '数据模式',
    value: 'Mock Ready',
  },
];

export const overviewCards: ContentCard[] = [
  {
    bullets: ['面向领导做快速汇报，强调“这套系统能看什么”。', '顶部导航固定四个入口，降低讲解成本。'],
    description: '用一屏说清项目目标、演示重点和数据边界。',
    title: '项目目标',
  },
  {
    bullets: ['村庄地图作为主舞台，检索、迁徙、方言三种模式在同一页完成。', '后续接入真实地图源后不需要重构页面结构。'],
    description: '核心页面保持稳定，后端与地图源可以逐步替换。',
    title: '地图策略',
  },
  {
    bullets: ['前端所有点击、跳转、联动都基于 primaryId。', '模拟数据、后端数据和 URL 状态都对齐这一口径。'],
    description: '为后续 Go + PostgreSQL 接口保留足够稳定的边界。',
    title: '接口边界',
  },
];

export const folkwaysHighlights: ContentCard[] = [
  {
    bullets: ['突出村俗、传统民居和特色产品三条叙事线。', '每张卡都保留“点击去地图看对应村庄”的跳转口。'],
    description: '让民俗内容不是陈列，而是能引导回到地图主线。',
    title: '民俗展示',
  },
  {
    bullets: ['用节庆、建筑、工艺三类卡片做成汇报感内容。', '保持蓝白统一视觉，突出资料感和可信度。'],
    description: '适合给领导展示“一个村庄不只有点位，还有文化纹理”。',
    title: '视觉口径',
  },
  {
    bullets: ['每张卡都预留主键位，未来可直接接后端详情。', '页面结构保持和地图页相同的卡片节奏。'],
    description: '后续接真实内容时只需要替换数据，不需要推翻布局。',
    title: '跳转预留',
  },
];

export const toponymyHighlights: ContentCard[] = [
  {
    bullets: ['把村名来源、地形与迁徙故事放在同一张卡片里。', '帮助领导快速理解“名字为什么这样叫”。'],
    description: '强调地名背后的历史逻辑，而不是单纯列出文本。',
    title: '村名来源',
  },
  {
    bullets: ['给每种来源方式配一个清晰标签。', '后续可以接后端枚举或专题研究标签。'],
    description: '先把讲故事的框架搭起来，后续内容可以持续补充。',
    title: '地理标签',
  },
  {
    bullets: ['搭配地图页的 primaryId，可以一键回到对应村庄。', '展示“从名字看回地图”的闭环。'],
    description: '让村名地理不是孤立页面，而是和主地图互相导流。',
    title: '联动关系',
  },
];

export const overviewPageCopy = {
  description:
    '围绕村庄 GIS 建立一套领导演示型前端，先让人看懂“项目是什么、地图能看什么、后续怎么接后端”。',
  eyebrow: '领导演示首页',
  title: '课题简介',
};

export const mapPageCopy = {
  description:
    '村庄地图是整个产品的主舞台。当前先用可交互的布局与示意数据把检索、迁徙、方言三条线索串起来。',
  eyebrow: '核心演示页',
  title: '村庄地图',
};

export const folkwaysPageCopy = {
  description:
    '把村俗、传统民居和特色产品整理成更适合领导浏览的故事卡，保持和地图页一致的点击节奏。',
  eyebrow: '文化补充页',
  title: '特色民俗',
};

export const toponymyPageCopy = {
  description:
    '从村名来源、地理位置和空间语义解释“名字为何如此命名”，并预留回跳到地图页的入口。',
  eyebrow: '地名故事页',
  title: '村名地理',
};
