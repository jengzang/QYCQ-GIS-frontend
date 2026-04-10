import type { VillageRecord } from '@/entities/village/model/types';

export interface VillageSelectionState {
  hasInvalidRequestedPrimaryId: boolean;
  selectedPrimaryId: string;
}

export function resolveVillageSelection(
  requestedPrimaryId: string | null,
  villages: VillageRecord[],
): VillageSelectionState {
  if (requestedPrimaryId) {
    const hasRequestedVillage = villages.some((village) => village.primaryId === requestedPrimaryId);

    return {
      hasInvalidRequestedPrimaryId: villages.length > 0 && !hasRequestedVillage,
      selectedPrimaryId: hasRequestedVillage ? requestedPrimaryId : '',
    };
  }

  return {
    hasInvalidRequestedPrimaryId: false,
    selectedPrimaryId: '',
  };
}
