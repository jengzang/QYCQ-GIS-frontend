import { adaptVillageRecord } from '@/entities/village/model/adapter';
import { filterVillages } from '@/entities/village/lib/filterVillages';
import type { VillageApiRecord } from '@/entities/village/model/types';
import type { RuntimeConfig } from '@/shared/config/runtime';

import type { VillageFacets, VillageQuery, VillageRepository } from '@/entities/village/api/types';

function buildQueryString(params?: VillageQuery): string {
  const query = new URLSearchParams();

  if (params?.q) {
    query.set('q', params.q);
  }
  if (params?.city) {
    query.set('city', params.city);
  }
  if (params?.town) {
    query.set('town', params.town);
  }
  if (params?.dialectGroup) {
    query.set('dialectGroup', params.dialectGroup);
  }
  if (params?.timelineEnd !== undefined && params.timelineEnd !== null) {
    query.set('timelineEnd', String(params.timelineEnd));
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return (await response.json()) as T;
}

function toVillageRecords(records: VillageApiRecord[]) {
  return records.map((record) => adaptVillageRecord(record));
}

export function createVillageRepository(runtime: RuntimeConfig): VillageRepository {
  const mockVillagesUrl = runtime.sources.mock.villagesPath;
  const mockFacetsUrl = runtime.sources.mock.facetsPath;
  const apiVillagesBaseUrl = `${runtime.apiBaseUrl}${runtime.sources.api.villagesPath}`;
  const apiFacetsUrl = `${runtime.apiBaseUrl}${runtime.sources.api.facetsPath}`;

  if (runtime.dataMode === 'mock') {
    return {
      async getByPrimaryId(primaryId) {
        const villages = await this.list();
        return villages.find((village) => village.primaryId === primaryId) ?? null;
      },
      async getFacets() {
        return fetchJson<VillageFacets>(mockFacetsUrl);
      },
      async list(params) {
        const records = await fetchJson<VillageApiRecord[]>(mockVillagesUrl);
        return filterVillages(toVillageRecords(records), params ?? {});
      },
    };
  }

  return {
    async getByPrimaryId(primaryId) {
      const record = await fetchJson<VillageApiRecord>(`${apiVillagesBaseUrl}/${primaryId}`);
      return adaptVillageRecord(record);
    },
    async getFacets() {
      return fetchJson<VillageFacets>(apiFacetsUrl);
    },
    async list(params) {
      const records = await fetchJson<VillageApiRecord[]>(
        `${apiVillagesBaseUrl}${buildQueryString(params)}`,
      );
      return toVillageRecords(records);
    },
  };
}

