import { useQuery } from '@tanstack/react-query';

import { villageRepository } from '@/entities/village/api/repositoryInstance';
import type { VillageQuery } from '@/entities/village/api/types';

export function useVillagesQuery(params: VillageQuery) {
  return useQuery({
    queryFn: () => villageRepository.list(params),
    queryKey: ['villages', params],
  });
}

export function useVillageFacetsQuery() {
  return useQuery({
    queryFn: () => villageRepository.getFacets(),
    queryKey: ['village-facets'],
  });
}

export function useVillageByPrimaryIdQuery(primaryId?: string | null) {
  return useQuery({
    enabled: Boolean(primaryId),
    queryFn: () => villageRepository.getByPrimaryId(primaryId!),
    queryKey: ['village-detail', primaryId],
  });
}

