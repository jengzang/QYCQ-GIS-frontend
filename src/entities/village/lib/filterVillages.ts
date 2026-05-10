import type { VillageRecord } from '@/entities/village/model/types';

export interface VillageQuery {
  city?: string;
  dialectGroup?: string;
  economy?: string;
  ethnicity?: string;
  q?: string;
  timelineEnd?: number | null;
  town?: string;
}

function includesText(value: string | undefined, query: string): boolean {
  return (value ?? '').toLocaleLowerCase().includes(query);
}

const economyKeywordMapping: Record<string, string[]> = {
  外出务工: ['务工', '打工'],
  建筑营生: ['建筑', '工程'],
  林业经营: ['林木', '林业', '桉树', '杉树', '采松脂', '松脂', '竹木', '木材'],
  水果种植: ['果', '柑', '橘', '柑橘', '贡柑', '沙糖橘', '香蕉', '龙眼', '荔枝', '黄皮', '油栗', '青梅', '枣', '梨', '桃', '李', '百香果'],
  渔业捕捞: ['捕鱼', '捕捞', '渔'],
  养殖业: ['养鱼', '养牛', '养猪', '养羊', '养鸭', '养鸡', '养殖', '鱼塘', '养蜂'],
  商业经营: ['经商', '商店', '饭馆', '商业', '贸易', '做生意'],
  茶叶种植: ['茶叶', '种茶', '山茶', '茶'],
  运输贸易: ['运输', '货运'],
};

function matchesFacetTag(value: string | undefined, selectedTag: string | undefined): boolean {
  if (!selectedTag) {
    return true;
  }

  const normalizedValue = value?.trim().toLocaleLowerCase();
  if (!normalizedValue) {
    return false;
  }

  const normalizedTag = selectedTag.trim().toLocaleLowerCase();
  if (normalizedValue.includes(normalizedTag)) {
    return true;
  }

  const mappedKeywords = economyKeywordMapping[selectedTag] ?? [];
  return mappedKeywords.some((keyword) => normalizedValue.includes(keyword.toLocaleLowerCase()));
}

export function filterVillages(villages: VillageRecord[], query: VillageQuery): VillageRecord[] {
  const normalizedQuery = query.q?.trim().toLocaleLowerCase();

  return villages.filter((village) => {
    if (query.city && village.city !== query.city) {
      return false;
    }

    if (query.town && village.town !== query.town) {
      return false;
    }

    if (query.dialectGroup && village.dialectGroup !== query.dialectGroup) {
      return false;
    }

    if (!matchesFacetTag(village.ethnicity, query.ethnicity)) {
      return false;
    }

    if (!matchesFacetTag(village.economy, query.economy)) {
      return false;
    }

    if (
      query.timelineEnd !== undefined &&
      query.timelineEnd !== null &&
      village.timeline.sortYear !== null &&
      village.timeline.sortYear > query.timelineEnd
    ) {
      return false;
    }

    if (normalizedQuery && !includesText(village.searchText, normalizedQuery)) {
      return false;
    }

    return true;
  });
}
