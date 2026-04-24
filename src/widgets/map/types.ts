import type { VillageFacets } from '@/entities/village/api/types';
import type { VillageRecord } from '@/entities/village/model/types';
import type { OrientationMode } from '@/shared/lib/orientation';
import type { MapModeKey } from '@/shared/mappings/nav-mapping';

export interface MapFilters {
  city: string;
  dialect: string;
  economy: string;
  ethnicity: string;
  q: string;
  town: string;
  year: number | null;
}

export type MapFilterUpdates = Partial<MapFilters>;

export interface MapWorkspaceProps {
  activeMode: MapModeKey;
  facets?: VillageFacets;
  filters: MapFilters;
  hasInvalidSelection?: boolean;
  isLoading?: boolean;
  onFiltersChange: (updates: MapFilterUpdates) => void;
  onModeChange: (mode: MapModeKey) => void;
  onSelectVillage: (primaryId: string) => void;
  orientation: OrientationMode;
  selectedPrimaryId: string;
  villages: VillageRecord[];
}
