import type { Geometry, MultiPolygon, Point, Polygon } from 'geojson';

export type VillageGeometry = Point | Polygon | MultiPolygon;

export interface RawVillageFields {
  归属市?: string;
  归属镇?: string;
  村名?: string;
  位置?: string;
  村名来源?: string;
  建村时间?: string;
  居民总人数?: string;
  男性人数?: string;
  女性人数?: string;
  村经济情况?: string;
  居民民族?: string;
  世居村民姓氏?: string;
  村居民使用语言情况?: string;
  村历史沿革?: string;
  村俗或传统民居或村特色产品?: string;
  村里名人?: string;
  村规民约?: string;
}

export type TimelinePrecision = 'exact' | 'range' | 'period' | 'unknown';

export interface VillageTimeline {
  displayLabel?: string | null;
  endYear?: number | null;
  precision?: TimelinePrecision;
  rawLabel?: string;
  sortYear: number | null;
  startYear?: number | null;
}

export interface VillageRecord {
  city?: string;
  dialectGroup: string;
  economy?: string;
  ethnicity?: string;
  geometry: VillageGeometry;
  name: string;
  primaryId: string;
  raw: RawVillageFields;
  searchText: string;
  timeline: VillageTimeline;
  town?: string;
}

export interface VillageApiRecord {
  city?: string;
  dialectGroup?: string;
  economy?: string;
  ethnicity?: string;
  geometry?: Geometry;
  name?: string;
  primaryid?: string;
  raw?: RawVillageFields;
  searchText?: string;
  timeline?: VillageTimeline;
  town?: string;
}

