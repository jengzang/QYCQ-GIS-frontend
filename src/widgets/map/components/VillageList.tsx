import type { VillageRecord } from '@/entities/village/model/types';
import { getTimelineDisplayLabel } from '@/shared/mappings/timeline-mapping';
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
    <div className="flex min-h-0 flex-1 flex-col space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-tertiary)]">显示村庄</p>
          {/* <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">结果列表保持短摘要，便于快速切村庄。</p> */}
        </div>
        <span className="rounded-full border border-[color:var(--color-border-subtle)] bg-white/75 px-3 py-1 text-xs font-semibold text-[color:var(--color-text-secondary)]">
          {visibleVillages.length} / {villages.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1" data-testid="village-list-scroll-region">
        {visibleVillages.map((village) => {
          const isSelected = village.primaryId === selectedPrimaryId;
          const timelineLabel = getTimelineDisplayLabel(village.timeline);

          return (
            <button
              key={village.primaryId}
              className={[
                'w-full rounded-[1.4rem] border px-4 py-4 text-left transition',
                'border-[color:var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,250,255,0.76))] shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-white',
                isSelected
                  ? 'border-[color:var(--color-border-strong)] bg-[linear-gradient(135deg,#ffffff,#edf5ff)] shadow-[0_22px_46px_rgba(59,130,246,0.18)]'
                  : '',
              ].join(' ')}
              onClick={() => onSelectVillage(village.primaryId)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)]">{village.name}</span>
                <div className="flex flex-wrap justify-end gap-2">
                  {activeMode === 'timeline' && timelineLabel ? (
                    <span className="rounded-full border border-[color:var(--color-border-subtle)] px-2 py-0.5 text-[11px] text-[color:var(--color-text-secondary)]">{timelineLabel}</span>
                  ) : null}
                  <span className="rounded-full bg-[color:var(--color-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--color-primary-strong)]">{village.dialectGroup}</span>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{village.city || '城市未填'} · {village.town || '乡镇未填'}</p>
              <p className="mt-1 text-xs leading-5 text-[color:var(--color-text-secondary)]">{buildSecondaryMeta(village)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
