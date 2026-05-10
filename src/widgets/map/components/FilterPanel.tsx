import type { ReactNode } from 'react';

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
  townOptions?: string[];
}

export function hasActiveFilters(filters: MapFilters) {
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

function FieldShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[color:var(--color-text-primary)]">
      <span>{title}</span>
      {children}
    </label>
  );
}

const inputClassName =
  'rounded-[1.2rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface-strong)] px-4 py-3 text-[color:var(--color-text-primary)] outline-none transition focus:border-[color:var(--color-border-strong)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]';

export function FilterPanel({ activeMode, facets, filters, onFiltersChange, orientation, townOptions }: FilterPanelProps) {
  const timelineMin = facets?.timelineRange.min ?? 1400;
  const timelineMax = facets?.timelineRange.max ?? 2000;
  const isTownDisabled = !filters.city;
  const resolvedTownOptions = isTownDisabled ? [] : townOptions ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <FieldShell title="关键词检索">
          <input
            className={inputClassName}
            onChange={(event) => onFiltersChange({ q: event.currentTarget.value })}
            placeholder="按村名、位置、语言搜索"
            type="search"
            value={filters.q}
          />
        </FieldShell>

        <div className={['grid gap-3', orientation === 'portrait' ? 'grid-cols-1' : 'grid-cols-2'].join(' ')}>
          <FieldShell title="归属市">
            <select className={inputClassName} onChange={(event) => onFiltersChange({ city: event.currentTarget.value })} value={filters.city}>
              <option value="">全部城市</option>
              {facets?.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </FieldShell>

          <FieldShell title="归属镇">
            <select
              className={inputClassName}
              disabled={isTownDisabled}
              onChange={(event) => onFiltersChange({ town: event.currentTarget.value })}
              value={filters.town}
            >
              <option value="">{isTownDisabled ? '请先选择归属市' : '全部乡镇'}</option>
              {resolvedTownOptions.map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
          </FieldShell>
        </div>

        <div className={['grid gap-3', orientation === 'portrait' ? 'grid-cols-1' : 'grid-cols-2'].join(' ')}>
          <FieldShell title="居民民族">
            <select className={inputClassName} onChange={(event) => onFiltersChange({ ethnicity: event.currentTarget.value })} value={filters.ethnicity}>
              <option value="">全部民族</option>
              {facets?.ethnicities.map((ethnicity) => (
                <option key={ethnicity} value={ethnicity}>
                  {ethnicity}
                </option>
              ))}
            </select>
          </FieldShell>

          <FieldShell title="经济情况">
            <select className={inputClassName} onChange={(event) => onFiltersChange({ economy: event.currentTarget.value })} value={filters.economy}>
              <option value="">全部经济情况</option>
              {facets?.economies.map((economy) => (
                <option key={economy} value={economy}>
                  {economy}
                </option>
              ))}
            </select>
          </FieldShell>
        </div>

        {activeMode === 'dialect' ? (
          <FieldShell title="方言分组">
            <select className={inputClassName} onChange={(event) => onFiltersChange({ dialect: event.currentTarget.value })} value={filters.dialect}>
              <option value="">全部方言</option>
              {facets?.dialectGroups.map((dialectGroup) => (
                <option key={dialectGroup} value={dialectGroup}>
                  {dialectGroup}
                </option>
              ))}
            </select>
          </FieldShell>
        ) : null}

        {activeMode === 'timeline' ? (
          <div className="rounded-[1.35rem] border border-[color:var(--color-border-subtle)] bg-white/72 p-4 shadow-[var(--shadow-soft)]">
            <FieldShell title="时间轴">
              <input
                className="accent-[color:var(--color-primary)]"
                max={timelineMax}
                min={timelineMin}
                onChange={(event) => onFiltersChange({ year: Number(event.currentTarget.value) })}
                type="range"
                value={filters.year ?? timelineMax}
              />
            </FieldShell>
            <span className="mt-2 block text-sm text-[color:var(--color-text-secondary)]">已展示至 {filters.year ?? timelineMax} 年</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
