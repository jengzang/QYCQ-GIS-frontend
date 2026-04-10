import type { Point } from 'geojson';

import type { VillageApiRecord, VillageRecord } from '@/entities/village/model/types';
import { resolveDialectGroup } from '@/shared/mappings/dialect-mapping';
import { buildPrimaryId } from '@/shared/mappings/primaryid-mapping';
import { parseTimelineSortYear } from '@/shared/mappings/timeline-mapping';

const fallbackGeometry: Point = {
  coordinates: [112, 23],
  type: 'Point',
};

function buildSearchText(record: VillageApiRecord): string {
  const fields = [
    record.name,
    record.city,
    record.town,
    record.raw?.位置,
    record.raw?.村名来源,
    record.raw?.村居民使用语言情况,
  ];

  return fields
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' ');
}

export function adaptVillageRecord(record: VillageApiRecord): VillageRecord {
  const name = record.name ?? record.raw?.村名 ?? '';
  const city = record.city ?? record.raw?.归属市;
  const town = record.town ?? record.raw?.归属镇;
  const rawLabel = record.timeline?.rawLabel ?? record.raw?.建村时间;
  const primaryId =
    record.primaryid ??
    buildPrimaryId({
      city,
      name,
      town,
    });

  return {
    city,
    dialectGroup: record.dialectGroup ?? resolveDialectGroup(record.raw?.村居民使用语言情况),
    geometry: (record.geometry as VillageRecord['geometry']) ?? fallbackGeometry,
    name,
    primaryId,
    raw: record.raw ?? {},
    searchText: record.searchText ?? buildSearchText(record),
    timeline: {
      rawLabel,
      sortYear: record.timeline?.sortYear ?? parseTimelineSortYear(rawLabel),
    },
    town,
  };
}
