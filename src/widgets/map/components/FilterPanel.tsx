import type { VillageFacets } from '@/entities/village/api/types';
import type { MapModeKey } from '@/shared/mappings/nav-mapping';
import type { OrientationMode } from '@/shared/lib/orientation';

import type { MapFilters, MapFilterUpdates } from '../types';

interface FilterPanelProps {
  activeMode: MapModeKey;
  facets?: VillageFacets;
  filters: MapFilters;
  onFiltersChange: (updates: MapFilterUpdates) => void;
  orientation: OrientationMode;
}

function hasActiveFilters(filters: MapFilters) {
  return Boolean(
    filters.city ||
      filters.dialect ||
      filters.economy ||
      filters.ethnicity ||
      filters.q ||
      filters.town ||
      filters.year !== null,
  );
}

export function FilterPanel({ activeMode, facets, filters, onFiltersChange, orientation }: FilterPanelProps) {
  const timelineMin = facets?.timelineRange.min ?? 1400;
  const timelineMax = facets?.timelineRange.max ?? 2000;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--color-text-secondary)]">按地域、民族、经济与关键词组合筛选。</p>
        <button
          className="rounded-full border border-[color:var(--color-border-subtle)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-primary-strong)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasActiveFilters(filters)}
          onClick={() =>
            onFiltersChange({
              city: '',
              dialect: '',
              economy: '',
              ethnicity: '',
              q: '',
              town: '',
              year: null,
            })
          }
          type="button"
        >
          一键清空筛选
        </button>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-2 text-sm font-medium">
          <span>关键词检索</span>
          <input
            className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white px-4 py-3 outline-none transition focus:border-[color:var(--color-primary)]"
            onChange={(event) => onFiltersChange({ q: event.currentTarget.value })}
            placeholder="按村名、位置、语言搜索"
            type="search"
            value={filters.q}
          />
        </label>

        <div className={['grid gap-3', orientation === 'portrait' ? 'grid-cols-1' : 'grid-cols-2'].join(' ')}>
          <label className="grid gap-2 text-sm font-medium">
            <span>归属市</span>
            <select
              className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white px-4 py-3 outline-none"
              onChange={(event) => onFiltersChange({ city: event.currentTarget.value })}
              value={filters.city}
            >
              <option value="">全部城市</option>
              {facets?.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            <span>归属镇</span>
            <select
              className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white px-4 py-3 outline-none"
              onChange={(event) => onFiltersChange({ town: event.currentTarget.value })}
              value={filters.town}
            >
              <option value="">全部乡镇</option>
              {facets?.towns.map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={['grid gap-3', orientation === 'portrait' ? 'grid-cols-1' : 'grid-cols-2'].join(' ')}>
          <label className="grid gap-2 text-sm font-medium">
            <span>居民民族</span>
            <select
              className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white px-4 py-3 outline-none"
              onChange={(event) => onFiltersChange({ ethnicity: event.currentTarget.value })}
              value={filters.ethnicity}
            >
              <option value="">全部民族</option>
              {facets?.ethnicities.map((ethnicity) => (
                <option key={ethnicity} value={ethnicity}>
                  {ethnicity}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            <span>经济情况</span>
            <select
              className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white px-4 py-3 outline-none"
              onChange={(event) => onFiltersChange({ economy: event.currentTarget.value })}
              value={filters.economy}
            >
              <option value="">全部经济情况</option>
              {facets?.economies.map((economy) => (
                <option key={economy} value={economy}>
                  {economy}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeMode === 'dialect' ? (
          <label className="grid gap-2 text-sm font-medium">
            <span>方言分组</span>
            <select
              className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white px-4 py-3 outline-none"
              onChange={(event) => onFiltersChange({ dialect: event.currentTarget.value })}
              value={filters.dialect}
            >
              <option value="">全部方言</option>
              {facets?.dialectGroups.map((dialectGroup) => (
                <option key={dialectGroup} value={dialectGroup}>
                  {dialectGroup}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {activeMode === 'timeline' ? (
          <label className="grid gap-2 text-sm font-medium">
            <span>时间轴</span>
            <input
              className="accent-[color:var(--color-primary)]"
              max={timelineMax}
              min={timelineMin}
              onChange={(event) => onFiltersChange({ year: Number(event.currentTarget.value) })}
              type="range"
              value={filters.year ?? timelineMax}
            />
            <span className="text-sm text-[color:var(--color-text-secondary)]">已展示至 {filters.year ?? timelineMax} 年</span>
          </label>
        ) : null}
      </div>
    </div>
  );
}
