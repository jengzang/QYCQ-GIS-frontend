import { resolveVillageSelection } from '@/pages/map/selection';

import type { VillageRecord } from '@/entities/village/model/types';

const villageFixture: VillageRecord[] = [
  {
    city: '肇庆市',
    dialectGroup: '德庆话',
    geometry: { coordinates: [111.9, 23.1], type: 'Point' },
    name: '平治村',
    primaryId: 'vlg-fb354cdb',
    raw: {
      归属市: '肇庆市',
      归属镇: '高良镇',
      村名: '平治村',
    },
    searchText: '肇庆市 高良镇 平治村',
    timeline: { rawLabel: '明代', sortYear: 1500 },
    town: '高良镇',
  },
];

describe('resolveVillageSelection', () => {
  test('keeps selection empty when there is no requested primaryId', () => {
    expect(resolveVillageSelection(null, villageFixture)).toEqual({
      hasInvalidRequestedPrimaryId: false,
      selectedPrimaryId: '',
    });
  });

  test('keeps the requested primaryId when it exists in the current result set', () => {
    expect(resolveVillageSelection('vlg-fb354cdb', villageFixture)).toEqual({
      hasInvalidRequestedPrimaryId: false,
      selectedPrimaryId: 'vlg-fb354cdb',
    });
  });

  test('marks stale primaryId values as invalid instead of silently selecting another village', () => {
    expect(resolveVillageSelection('vlg-missing', villageFixture)).toEqual({
      hasInvalidRequestedPrimaryId: true,
      selectedPrimaryId: '',
    });
  });
});
