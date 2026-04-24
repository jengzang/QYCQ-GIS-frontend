import type { VillageRecord } from '@/entities/village/model/types';
import type { MapModeKey } from '@/shared/mappings/nav-mapping';

interface VillageListProps {
  activeMode: MapModeKey;
  onSelectVillage: (primaryId: string) => void;
  selectedPrimaryId: string;
  villages: VillageRecord[];
}

function buildSecondaryMeta(village: VillageRecord) {
  const parts = [village.ethnicity, village.economy].filter(Boolean);
  return parts.length ? parts.join(' / ') : '民族与经济信息待补充';
}

export function VillageList({ activeMode, onSelectVillage, selectedPrimaryId, villages }: VillageListProps) {
  const visibleVillages = villages.slice(0, 80);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-[color:var(--color-text-secondary)]">
        <span>结果列表</span>
        <span>显示 {visibleVillages.length} / {villages.length}</span>
      </div>

      <div className="max-h-[24rem] space-y-2 overflow-auto pr-1">
        {visibleVillages.map((village) => {
          const isSelected = village.primaryId === selectedPrimaryId;

          return (
            <button
              key={village.primaryId}
              className={[
                'w-full rounded-2xl border px-4 py-3 text-left transition',
                'border-[color:var(--color-border-subtle)] bg-white/85 hover:-translate-y-0.5 hover:bg-white',
                isSelected
                  ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-[0_16px_30px_rgba(34,116,240,0.24)]'
                  : '',
              ].join(' ')}
              onClick={() => onSelectVillage(village.primaryId)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{village.name}</span>
                <div className="flex flex-wrap justify-end gap-2">
                  {activeMode === 'timeline' && village.timeline.sortYear === null ? (
                    <span className="rounded-full border border-current/20 px-2 py-0.5 text-[11px]">时间不详</span>
                  ) : null}
                  <span className="rounded-full border border-current/20 px-2 py-0.5 text-[11px]">{village.dialectGroup}</span>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 opacity-80">{village.city || '城市未填'} · {village.town || '乡镇未填'}</p>
              <p className="mt-1 text-xs leading-5 opacity-70">{buildSecondaryMeta(village)}</p>
              <p className="mt-1 text-xs leading-5 opacity-70">primaryId: {village.primaryId}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
