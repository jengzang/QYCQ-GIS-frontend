import type { VillageRecord } from '@/entities/village/model/types';

export interface VillageQuery {
  city?: string;
  dialectGroup?: string;
  q?: string;
  timelineEnd?: number | null;
  town?: string;
}

function includesText(value: string | undefined, query: string): boolean {
  return (value ?? '').toLocaleLowerCase().includes(query);
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
