import { createVillageRepository } from '@/entities/village/api/VillageRepository';
import { runtimeConfig } from '@/shared/config/runtime';

export const villageRepository = createVillageRepository(runtimeConfig);

