import maplibregl, { type GeoJSONSource, type Map } from 'maplibre-gl';
import { useEffect, useEffectEvent, useRef } from 'react';

import type { Feature, FeatureCollection, Point } from 'geojson';

import type { VillageFacets } from '@/entities/village/api/types';
import type { VillageRecord } from '@/entities/village/model/types';
import { mapLayerMapping } from '@/shared/mappings/map-layer-mapping';
import { mapModeMapping, type MapModeKey } from '@/shared/mappings/nav-mapping';
import { dialectLegendMapping } from '@/shared/mappings/dialect-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import type { OrientationMode } from '@/shared/lib/orientation';
import { getMapStyle } from '@/shared/lib/map-style';
import { runtimeConfig } from '@/shared/config/runtime';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

interface MapWorkspaceProps {
  activeMode: MapModeKey;
  filters: {
    city: string;
    dialect: string;
    q: string;
    town: string;
    year: number | null;
  };
  facets?: VillageFacets;
  hasInvalidSelection?: boolean;
  isLoading?: boolean;
  onFiltersChange: (
    updates: Partial<{
      city: string;
      dialect: string;
      q: string;
      town: string;
      year: number | null;
    }>,
  ) => void;
  onModeChange: (mode: MapModeKey) => void;
  onSelectVillage: (primaryId: string) => void;
  orientation: OrientationMode;
  selectedPrimaryId: string;
  villages: VillageRecord[];
}

type VillageFeature = Feature<
  Point,
  {
    city: string;
    dialectGroup: string;
    name: string;
    primaryId: string;
    sortYear: number | null;
    town: string;
  }
>;

const mapBounds: [[number, number], [number, number]] = [
  [109.6, 20.2],
  [117.3, 25.6],
];

function getSelectedVillage(villages: VillageRecord[], selectedPrimaryId: string) {
  return villages.find((village) => village.primaryId === selectedPrimaryId) ?? null;
}

function buildFeatureCollection(villages: VillageRecord[]): FeatureCollection<Point> {
  const features: VillageFeature[] = villages
    .filter((village): village is VillageRecord & { geometry: Point } => village.geometry.type === 'Point')
    .map((village) => ({
      geometry: village.geometry,
      properties: {
        city: village.city ?? '',
        dialectGroup: village.dialectGroup,
        name: village.name,
        primaryId: village.primaryId,
        sortYear: village.timeline.sortYear,
        town: village.town ?? '',
      },
      type: 'Feature',
    }));

  return {
    features,
    type: 'FeatureCollection',
  };
}

function buildDialectExpression() {
  const expression: unknown[] = ['match', ['get', 'dialectGroup']];

  Object.entries(dialectLegendMapping).forEach(([dialectGroup, meta]) => {
    expression.push(dialectGroup, meta.mapColor);
  });

  expression.push('#1d4ed8');
  return expression;
}

function ensureVillageLayers(map: Map) {
  if (!map.getSource(mapLayerMapping.sourceId)) {
    map.addSource(mapLayerMapping.sourceId, {
      data: buildFeatureCollection([]),
      type: 'geojson',
    });
  }

  if (!map.getLayer(mapLayerMapping.symbolLayerId)) {
    map.addLayer({
      id: mapLayerMapping.symbolLayerId,
      paint: {
        'circle-color': '#2274f0',
        'circle-opacity': 0.88,
        'circle-radius': 6,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5,
      },
      source: mapLayerMapping.sourceId,
      type: 'circle',
    });
  }

  if (!map.getLayer(mapLayerMapping.detailHighlightLayerId)) {
    map.addLayer({
      filter: ['==', ['get', 'primaryId'], ''],
      id: mapLayerMapping.detailHighlightLayerId,
      paint: {
        'circle-color': '#0d4db5',
        'circle-opacity': 0.16,
        'circle-radius': 16,
        'circle-stroke-color': '#0d4db5',
        'circle-stroke-width': 1.5,
      },
      source: mapLayerMapping.sourceId,
      type: 'circle',
    });
  }
}

function applyVillageStyle(map: Map, activeMode: MapModeKey, selectedPrimaryId: string) {
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-color',
    activeMode === 'dialect' ? buildDialectExpression() : '#2274f0',
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-opacity',
    activeMode === 'timeline'
      ? ['case', ['==', ['get', 'sortYear'], null], 0.36, 0.88]
      : 0.88,
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-radius',
    ['case', ['==', ['get', 'primaryId'], selectedPrimaryId], 8, 6],
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-stroke-color',
    ['case', ['==', ['get', 'primaryId'], selectedPrimaryId], '#0d4db5', '#ffffff'],
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-stroke-width',
    ['case', ['==', ['get', 'primaryId'], selectedPrimaryId], 2.5, 1.5],
  );
  map.setFilter(mapLayerMapping.detailHighlightLayerId, ['==', ['get', 'primaryId'], selectedPrimaryId]);
}

function renderFieldValue(value?: string) {
  if (!value) {
    return null;
  }

  return <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">{value}</p>;
}

function ModeTabs({ activeMode, onModeChange }: Pick<MapWorkspaceProps, 'activeMode' | 'onModeChange'>) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="村庄地图模式">
      {mapModeMapping.map((mode) => {
        const isActive = activeMode === mode.key;

        return (
          <button
            key={mode.key}
            className={[
              'rounded-full border px-4 py-2 text-sm font-semibold transition',
              'border-[color:var(--color-border-subtle)] bg-white/80 text-[color:var(--color-text-primary)] hover:bg-white',
              isActive
                ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-[0_12px_28px_rgba(34,116,240,0.24)]'
                : '',
            ].join(' ')}
            onClick={() => onModeChange(mode.key)}
            role="tab"
            aria-selected={isActive}
            type="button"
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterPanel({
  activeMode,
  facets,
  filters,
  onFiltersChange,
  orientation,
}: Pick<MapWorkspaceProps, 'activeMode' | 'facets' | 'filters' | 'onFiltersChange' | 'orientation'>) {
  const timelineMin = facets?.timelineRange.min ?? 1400;
  const timelineMax = facets?.timelineRange.max ?? 2000;

  return (
    <div className="space-y-4">
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
            <span className="text-sm text-[color:var(--color-text-secondary)]">
              已展示至 {filters.year ?? timelineMax} 年
            </span>
          </label>
        ) : null}
      </div>
    </div>
  );
}

function VillageList({
  activeMode,
  onSelectVillage,
  selectedPrimaryId,
  villages,
}: Pick<MapWorkspaceProps, 'activeMode' | 'onSelectVillage' | 'selectedPrimaryId' | 'villages'>) {
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
                    <span className="rounded-full border border-current/20 px-2 py-0.5 text-[11px]">
                      时间不详
                    </span>
                  ) : null}
                  <span className="rounded-full border border-current/20 px-2 py-0.5 text-[11px]">
                    {village.dialectGroup}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 opacity-80">
                {village.city || '城市未填'} · {village.town || '乡镇未填'}
              </p>
              <p className="mt-1 text-xs leading-5 opacity-70">primaryId: {village.primaryId}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MapCanvas({
  activeMode,
  onSelectVillage,
  selectedPrimaryId,
  villages,
}: Pick<MapWorkspaceProps, 'activeMode' | 'onSelectVillage' | 'selectedPrimaryId' | 'villages'>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const handleSelectVillage = useEffectEvent(onSelectVillage);
  const syncMapState = useEffectEvent((map: Map) => {
    ensureVillageLayers(map);
    const source = map.getSource(mapLayerMapping.sourceId) as GeoJSONSource | undefined;
    source?.setData(buildFeatureCollection(villages));
    applyVillageStyle(map, activeMode, selectedPrimaryId);

    const selectedVillage = villages.find((village) => village.primaryId === selectedPrimaryId);

    if (selectedVillage?.geometry.type === 'Point') {
      map.easeTo({
        center: [
          selectedVillage.geometry.coordinates[0],
          selectedVillage.geometry.coordinates[1],
        ],
        duration: 600,
        zoom: Math.max(map.getZoom(), 7.4),
      });
    }
  });

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined' || !('WebGLRenderingContext' in window)) {
      return undefined;
    }

    const map = new maplibregl.Map({
      attributionControl: false,
      bounds: mapBounds,
      container: containerRef.current,
      fitBoundsOptions: {
        padding: 36,
      },
      style: getMapStyle(runtimeConfig.mapStyleUrl),
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const handleLoad = () => {
      syncMapState(map);
    };

    const handleClick = (event: maplibregl.MapLayerMouseEvent) => {
      const primaryId = event.features?.[0]?.properties?.primaryId;

      if (typeof primaryId === 'string' && primaryId) {
        handleSelectVillage(primaryId);
      }
    };

    map.on('load', handleLoad);
    map.on('click', mapLayerMapping.symbolLayerId, handleClick);
    map.on('mouseenter', mapLayerMapping.symbolLayerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', mapLayerMapping.symbolLayerId, () => {
      map.getCanvas().style.cursor = '';
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !map.isStyleLoaded()) {
      return;
    }

    syncMapState(map);
  }, [activeMode, selectedPrimaryId, villages]);

  if (typeof window === 'undefined' || !('WebGLRenderingContext' in window)) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center rounded-[2rem] bg-[linear-gradient(160deg,#eef6ff,#f8fbff)] p-6 text-center text-sm leading-7 text-[color:var(--color-text-secondary)]">
        当前环境未启用 WebGL，测试和无图形环境下会回退到静态地图占位。浏览器里将自动切换到 MapLibre。
      </div>
    );
  }

  return <div className="min-h-[24rem] overflow-hidden rounded-[2rem]" ref={containerRef} />;
}

function DetailPanel({
  activeMode,
  hasInvalidSelection,
  hasVillages,
  selectedVillage,
}: {
  activeMode: MapModeKey;
  hasInvalidSelection: boolean;
  hasVillages: boolean;
  selectedVillage: VillageRecord | null;
}) {
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

  return (
    <div className="space-y-4">
      <SurfaceCard
        title={selectedVillage.name}
        description={`${selectedVillage.city || '城市未填'} · ${selectedVillage.town || '乡镇未填'}`}
        eyebrow="当前选中村庄"
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[color:var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
              {selectedVillage.dialectGroup}
            </span>
            <span className="rounded-full border border-[color:var(--color-border-subtle)] px-3 py-1 text-xs text-[color:var(--color-text-secondary)]">
              {selectedVillage.timeline.rawLabel || '时间不详'}
            </span>
          </div>
          <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
            primaryId:
            <span className="ml-2 font-mono text-[color:var(--color-primary-strong)]">
              {selectedVillage.primaryId}
            </span>
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
                <h3 className="text-sm font-semibold text-[color:var(--color-primary-strong)]">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {rows.map((row) => (
                    <div key={row.field} className="rounded-2xl bg-white/70 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                        {row.field}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                        {row.value}
                      </p>
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

function DialectLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(dialectLegendMapping).map(([label, meta]) => (
        <div
          key={label}
          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: meta.mapColor }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

export function MapWorkspace({
  activeMode,
  facets,
  filters,
  hasInvalidSelection = false,
  isLoading,
  onFiltersChange,
  onModeChange,
  onSelectVillage,
  orientation,
  selectedPrimaryId,
  villages,
}: MapWorkspaceProps) {
  const selectedVillage = getSelectedVillage(villages, selectedPrimaryId);

  const filterContent = (
    <div className="space-y-4">
      <ModeTabs activeMode={activeMode} onModeChange={onModeChange} />
      <FilterPanel
        activeMode={activeMode}
        facets={facets}
        filters={filters}
        onFiltersChange={onFiltersChange}
        orientation={orientation}
      />
      <VillageList
        activeMode={activeMode}
        onSelectVillage={onSelectVillage}
        selectedPrimaryId={selectedPrimaryId}
        villages={villages}
      />
    </div>
  );

  const mapContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-[color:var(--color-text-secondary)]">
        <span>当前结果 {villages.length} 条</span>
        <span>{isLoading ? '正在加载数据…' : 'MapLibre 已接入'}</span>
      </div>
      {activeMode === 'dialect' ? <DialectLegend /> : null}
      <MapCanvas
        activeMode={activeMode}
        onSelectVillage={onSelectVillage}
        selectedPrimaryId={selectedPrimaryId}
        villages={villages}
      />
    </div>
  );

  if (orientation === 'portrait') {
    return (
      <div data-testid="map-portrait-layout" className="grid gap-4">
        <SurfaceCard title="地图模式与筛选" description="竖屏下先给模式切换和筛选，再看地图。">
          {filterContent}
        </SurfaceCard>

        <SurfaceCard title="地图画布" description="点选地图或列表，详情都通过 primaryId 联动。">
          {mapContent}
        </SurfaceCard>

        <div data-testid="map-drawer">
          <DetailPanel
            activeMode={activeMode}
            hasInvalidSelection={hasInvalidSelection}
            hasVillages={villages.length > 0}
            selectedVillage={selectedVillage}
          />
        </div>
      </div>
    );
  }

  return (
    <div data-testid="map-landscape-layout" className="grid gap-4 [grid-template-columns:20rem_minmax(0,1fr)_22rem]">
      <aside data-testid="map-landscape-sidebar" className="space-y-4">
        <SurfaceCard title="筛选与列表" description="横屏下把结果列表固定在左侧，方便一边看地图一边切村庄。">
          {filterContent}
        </SurfaceCard>
      </aside>

      <section className="space-y-4">
        <SurfaceCard title="地图画布" description="当前接入 MapLibre，后续只需替换底图样式与真实后端。">
          {mapContent}
        </SurfaceCard>
      </section>

      <aside className="space-y-4">
        <DetailPanel
          activeMode={activeMode}
          hasInvalidSelection={hasInvalidSelection}
          hasVillages={villages.length > 0}
          selectedVillage={selectedVillage}
        />
      </aside>
    </div>
  );
}
