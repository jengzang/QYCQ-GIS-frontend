import type { VillageRecord } from '@/entities/village/model/types';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import type { MapModeKey } from '@/shared/mappings/nav-mapping';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

interface DetailPanelProps {
  activeMode: MapModeKey;
  hasInvalidSelection: boolean;
  hasVillages: boolean;
  selectedVillage: VillageRecord | null;
}

function renderFieldValue(value?: string) {
  if (!value) {
    return null;
  }

  return <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">{value}</p>;
}

function buildSummaryItems(village: VillageRecord) {
  return [
    { label: '居民民族', value: village.ethnicity || village.raw.居民民族 || '未填' },
    { label: '经济情况', value: village.economy || village.raw.村经济情况 || '未填' },
    { label: '方言分组', value: village.dialectGroup || '未填' },
  ];
}

export function DetailPanel({ activeMode, hasInvalidSelection, hasVillages, selectedVillage }: DetailPanelProps) {
  if (!selectedVillage) {
    return (
      <SurfaceCard title="村庄详情" description="选择一个村庄后，这里会展示详情。">
        <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
          {hasInvalidSelection
            ? '当前 URL 中的 primaryId 不在筛选结果里，请重新选择村庄。'
            : hasVillages
              ? '当前还没有选中村庄，请从列表或地图中选择。'
              : '当前筛选结果为空，请调整检索条件。'}
        </p>
      </SurfaceCard>
    );
  }

  const summaryItems = buildSummaryItems(selectedVillage);

  return (
    <div className="space-y-4">
      <SurfaceCard
        title={selectedVillage.name}
        description={`${selectedVillage.city || '城市未填'} · ${selectedVillage.town || '乡镇未填'}`}
        eyebrow="当前选中村庄"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[color:var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">{selectedVillage.dialectGroup}</span>
            <span className="rounded-full border border-[color:var(--color-border-subtle)] px-3 py-1 text-xs text-[color:var(--color-text-secondary)]">{selectedVillage.timeline.rawLabel || '时间不详'}</span>
            {selectedVillage.ethnicity ? <span className="rounded-full border border-[color:var(--color-border-subtle)] px-3 py-1 text-xs text-[color:var(--color-text-secondary)]">{selectedVillage.ethnicity}</span> : null}
            {selectedVillage.economy ? <span className="rounded-full border border-[color:var(--color-border-subtle)] px-3 py-1 text-xs text-[color:var(--color-text-secondary)]">{selectedVillage.economy}</span> : null}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {summaryItems.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)]">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
            primaryId:
            <span className="ml-2 font-mono text-[color:var(--color-primary-strong)]">{selectedVillage.primaryId}</span>
          </p>
          {renderFieldValue(selectedVillage.raw.位置)}
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="模式说明"
        description={
          activeMode === 'search'
            ? '检索模式优先强调“从关键词到村庄详情”的闭环。'
            : activeMode === 'timeline'
              ? '迁徙模式优先强调时间推进与聚落形成节奏。'
              : '方言模式优先强调颜色图例与空间分布。'
        }
      >
        <div className="space-y-4">
          {villageFieldMapping.detailSections.map((section) => {
            const rows = section.fields
              .map((field) => ({
                field,
                value: selectedVillage.raw[field],
              }))
              .filter((item) => item.value);

            if (!rows.length) {
              return null;
            }

            return (
              <div key={section.key} className="space-y-2">
                <h3 className="text-sm font-semibold text-[color:var(--color-primary-strong)]">{section.title}</h3>
                <div className="space-y-2">
                  {rows.map((row) => (
                    <div key={row.field} className="rounded-2xl bg-white/70 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">{row.field}</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SurfaceCard>
    </div>
  );
}
