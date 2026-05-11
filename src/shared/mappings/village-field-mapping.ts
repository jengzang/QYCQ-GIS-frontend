export const villageFieldDisplayLabelMapping = {
  居民民族: '民系',
} as const;

export const villageFieldMapping = {
  detailSections: [
    {
      fields: ['归属市', '归属镇', '位置', '建村时间'],
      key: 'overview',
      title: '基础信息',
    },
    {
      fields: ['村名来源', '村历史沿革', '村里名人'],
      key: 'history',
      title: '源流故事',
    },
    {
      fields: ['村居民使用语言情况', '居民民族', '世居村民姓氏'],
      key: 'people',
      title: '语言与民系',
    },
    {
      fields: ['村俗或传统民居或村特色产品', '村经济情况', '村规民约'],
      key: 'culture',
      title: '民俗与治理',
    },
  ],
  highlightFields: {
    folkways: '村俗或传统民居或村特色产品',
    overview: '位置',
    toponymy: '村名来源',
  },
  metrics: [
    { key: '居民总人数', label: '居民总人数' },
    { key: '男性人数', label: '男性人数' },
    { key: '女性人数', label: '女性人数' },
  ],
} as const;

