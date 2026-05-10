import { routeMapping } from '@/shared/mappings/route-mapping';

export const navMapping = [
  { hint: '项目目标与展示口径', key: 'overview', label: '课题简介', path: routeMapping.overview },
  { hint: '检索、迁徙、方言三种模式', key: 'map', label: '村庄地图', path: routeMapping.map },
  { hint: '村俗、民居与特色产品', key: 'folkways', label: '特色民俗', path: routeMapping.folkways },
  { hint: '村名来源与地理故事', key: 'toponymy', label: '村名地理', path: routeMapping.toponymy },
  { hint: '统一控制底图与日夜主题', key: 'settings', label: '设置', path: routeMapping.settings },
] as const;

export const mapModeMapping = [
  { key: 'search', label: '村庄检索' },
  { key: 'timeline', label: '源流迁徙' },
  { key: 'dialect', label: '方言分布' },
] as const;

export type MapModeKey = (typeof mapModeMapping)[number]['key'];
