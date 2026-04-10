import type { VillageRecord } from '@/entities/village/model/types';

export interface VillageQuery {
  city?: string;
  dialectGroup?: string;
  q?: string;
  timelineEnd?: number | null;
  town?: string;
}

export interface VillageFacets {
  cities: string[];
  dialectGroups: string[];
  timelineRange: { max: number | null; min: number | null };
  towns: string[];
}

export interface VillageRepository {
  getByPrimaryId(primaryId: string): Promise<VillageRecord | null>;
  getFacets(): Promise<VillageFacets>;
  list(params?: VillageQuery): Promise<VillageRecord[]>;
}

