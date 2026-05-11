import type { VillageRecord } from '@/entities/village/model/types';
import { getTimelineDisplayLabel } from '@/shared/mappings/timeline-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import type { MapModeKey } from '@/shared/mappings/nav-mapping';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

interface DetailPanelProps {
  activeMode: MapModeKey;
  hasInvalidSelection: boolean;
  hasVillages: boolean;
  selectedVillage: VillageRecord | null;
}

const summaryFieldLabels = new Set(['归属市', '归属镇', '位置', '建村时间', '居民民族', '村经济情况']);

function buildPopulationItems(village: VillageRecord) {
  return villageFieldMapping.metrics
    .map((metric) => ({
      label: metric.label,
      value: village.raw[metric.key],
    }))
    .filter((item) => item.value);
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
    { label: '方言分布', value: village.dialectGroup || '未填' },
  ];
}

function getModeHint(activeMode: MapModeKey) {
  if (activeMode === 'search') {
    return '当前是检索模式，适合先用关键词和筛选缩小范围，再进入单村阅读。';
  }

  if (activeMode === 'timeline') {
    return '当前是迁徙模式，建议先看时间标签，再结合源流故事理解聚落形成过程。';
  }

  return '当前是方言模式，建议先看颜色图例与空间分布，再对照语言与族群信息阅读。';
}

function buildDetailSections(village: VillageRecord) {
  return villageFieldMapping.detailSections
    .map((section) => ({
      key: section.key,
      rows: section.fields
        .filter((field) => !summaryFieldLabels.has(field))
        .map((field) => ({ field, value: village.raw[field] }))
        .filter((item) => item.value),
      title: section.title,
    }))
    .filter((section) => section.rows.length > 0);
}

export function DetailPanel({ activeMode, hasInvalidSelection, hasVillages, selectedVillage }: DetailPanelProps) {
  if (!selectedVillage) {
    return (
      <SurfaceCard title="村庄详情">
        <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
          {hasInvalidSelection
            ? '当前 URL 中的村庄选择已失效，请重新从列表或地图中选择。'
            : hasVillages
              ? '当前还没有选中村庄，请从列表或地图中选择。'
              : '当前筛选结果为空，请调整检索条件。'}
        </p>
      </SurfaceCard>
    );
  }

  const summaryItems = buildSummaryItems(selectedVillage);
  const populationItems = buildPopulationItems(selectedVillage);
  const detailSections = buildDetailSections(selectedVillage);
  const timelineLabel = getTimelineDisplayLabel(selectedVillage.timeline);

  return (
    <SurfaceCard title="村庄详情" description={`${selectedVillage.city || '城市未填'} · ${selectedVillage.town || '乡镇未填'}`} >
      <div className="space-y-5">
        <div className="rounded-[1.5rem] border border-[color:var(--color-border-subtle)] bg-white/78 p-4">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">{selectedVillage.name}</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">以单村为单位，把时间、语言、族群与经济线索收束到同一块连续阅读区域。</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[color:var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">{selectedVillage.dialectGroup}</span>
            {timelineLabel ? <span className="rounded-full border border-[color:var(--color-border-subtle)] bg-white/70 px-3 py-1 text-xs text-[color:var(--color-text-secondary)]">{timelineLabel}</span> : null}
            {selectedVillage.ethnicity ? <span className="rounded-full border border-[color:var(--color-border-subtle)] bg-white/70 px-3 py-1 text-xs text-[color:var(--color-text-secondary)]">{selectedVillage.ethnicity}</span> : null}
            {selectedVillage.economy ? <span className="rounded-full border border-[color:var(--color-border-subtle)] bg-white/70 px-3 py-1 text-xs text-[color:var(--color-text-secondary)]">{selectedVillage.economy}</span> : null}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {summaryItems.map((item) => (
              <div key={item.label} className="rounded-[1.25rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-tertiary)]">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{item.value}</p>
              </div>
            ))}
          </div>
          {populationItems.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {populationItems.map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(238,244,252,0.92),rgba(255,255,255,0.76))] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-tertiary)]">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-[color:var(--color-text-primary)]">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}
          {selectedVillage.raw.位置 ? (
            <div className="mt-4 rounded-[1.25rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(238,244,252,0.92),rgba(255,255,255,0.7))] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-tertiary)]">位置概览</p>
              <div className="mt-2">{renderFieldValue(selectedVillage.raw.位置)}</div>
            </div>
          ) : null}
        </div>

        {detailSections.length ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">村庄叙事</h3>
              <p className="mt-1 text-sm leading-6 text-[color:var(--color-text-secondary)]">把源流、语言、民俗等长文本放到下部展开，避免挤占地图主视线。</p>
            </div>
            <div className="grid gap-3 xl:grid-cols-3">
              {detailSections.map((section) => (
                <div key={section.key} className="rounded-[1.5rem] border border-[color:var(--color-border-subtle)] bg-white/76 p-4">
                  <h4 className="text-sm font-semibold text-[color:var(--color-primary-strong)]">{section.title}</h4>
                  <div className="mt-3 space-y-3">
                    {section.rows.map((row) => (
                      <div key={row.field} className="rounded-[1.15rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)]/80 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-tertiary)]">{row.field}</p>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-[1.5rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(245,248,252,0.95),rgba(233,242,250,0.85))] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-tertiary)]">阅读提示</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{getModeHint(activeMode)}</p>
        </div>
      </div>
    </SurfaceCard>
  );
}
