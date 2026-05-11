import maplibregl, { type GeoJSONSource, type Map } from 'maplibre-gl';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';

import type { Feature, FeatureCollection, Point } from 'geojson';

import { useAppPreferences } from '@/app/providers/AppPreferencesProvider';
import type { VillageRecord } from '@/entities/village/model/types';
import { runtimeConfig } from '@/shared/config/runtime';
import { type MapStyleKey, getMapStyle } from '@/shared/lib/map-style';
import { dialectLegendMapping } from '@/shared/mappings/dialect-mapping';
import { mapLayerMapping } from '@/shared/mappings/map-layer-mapping';
import { mapModeMapping, type MapModeKey } from '@/shared/mappings/nav-mapping';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

import { DetailPanel } from './components/DetailPanel';
import { FilterPanel, hasActiveFilters } from './components/FilterPanel';
import { VillageList } from './components/VillageList';
import type { MapWorkspaceProps } from './types';

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

const mapModeDescriptionMapping: Record<MapModeKey, string> = {
  dialect: '按方言分组观察村庄空间分布，快速对比不同方言片区。',
  search: '按地区、民族、经济与关键词查找村庄，再从列表或地图进入详情。',
  timeline: '按时间线查看村庄形成与迁徙脉络，理解空间分布的先后变化。',
};

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

  return { features, type: 'FeatureCollection' };
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
        'circle-color': '#3b82f6',
        'circle-opacity': 0.9,
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
        'circle-color': '#1d4ed8',
        'circle-opacity': 0.14,
        'circle-radius': 18,
        'circle-stroke-color': '#1d4ed8',
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
    activeMode === 'dialect' ? buildDialectExpression() : '#3b82f6',
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-opacity',
    activeMode === 'timeline' ? ['case', ['==', ['get', 'sortYear'], null], 0.36, 0.9] : 0.9,
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-radius',
    ['case', ['==', ['get', 'primaryId'], selectedPrimaryId], 8.5, 6],
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-stroke-color',
    ['case', ['==', ['get', 'primaryId'], selectedPrimaryId], '#1d4ed8', '#ffffff'],
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-stroke-width',
    ['case', ['==', ['get', 'primaryId'], selectedPrimaryId], 2.5, 1.5],
  );
  map.setFilter(mapLayerMapping.detailHighlightLayerId, ['==', ['get', 'primaryId'], selectedPrimaryId]);
}

function ModeTabs({ activeMode, onModeChange }: Pick<MapWorkspaceProps, 'activeMode' | 'onModeChange'>) {
  const activeModeMeta = mapModeMapping.find((mode) => mode.key === activeMode) ?? mapModeMapping[0];

  return (
    <div className="space-y-3" data-testid="map-mode-strip">
      <div className="flex flex-col gap-3 border-b border-[color:var(--color-border-subtle)] pb-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-[0.08em] text-[color:var(--color-text-primary)]">地图模式</h2>
          <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">{mapModeDescriptionMapping[activeModeMeta.key]}</p>
        </div>

        <div aria-label="村庄地图模式" className="flex flex-wrap gap-2" role="tablist">
          {mapModeMapping.map((mode) => {
            const isActive = activeMode === mode.key;

            return (
              <button
                key={mode.key}
                aria-selected={isActive}
                className={[
                  'rounded-[1.05rem] border px-4 py-2 text-sm font-semibold transition duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-nav-active-border)] focus-visible:ring-offset-2',
                  isActive
                    ? 'border-[color:var(--color-map-mode-active-border)] bg-[linear-gradient(180deg,var(--color-map-mode-active-bg),var(--color-map-mode-active-bg-strong))] text-[color:var(--color-map-mode-active-text)] shadow-[0_10px_24px_rgba(82,88,77,0.12),inset_0_1px_0_rgba(255,255,255,0.48)]'
                    : 'border-[color:var(--color-border-subtle)] bg-white/72 text-[color:var(--color-text-secondary)] hover:-translate-y-[1px] hover:border-[color:var(--color-map-mode-hover-border)] hover:bg-[color:var(--color-map-mode-hover-bg)] hover:text-[color:var(--color-map-mode-hover-text)] hover:shadow-[0_8px_18px_rgba(86,88,79,0.08)]',
                ].join(' ')}
                data-state={isActive ? 'active' : 'inactive'}
                onClick={() => onModeChange(mode.key)}
                role="tab"
                type="button"
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DialectLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(dialectLegendMapping).map(([label, meta]) => (
        <div
          key={label}
          className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-[var(--shadow-soft)]"
          style={{ backgroundColor: meta.mapColor }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function MapCanvas({
  activeMode,
  mapStyleKey,
  onSelectVillage,
  selectedPrimaryId,
  villages,
}: Pick<MapWorkspaceProps, 'activeMode' | 'onSelectVillage' | 'selectedPrimaryId' | 'villages'> & {
  mapStyleKey: MapStyleKey;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const appliedMapStyleKeyRef = useRef<MapStyleKey>(mapStyleKey);
  const handleSelectVillage = useEffectEvent(onSelectVillage);
  const syncMapState = useEffectEvent((map: Map) => {
    ensureVillageLayers(map);
    const source = map.getSource(mapLayerMapping.sourceId) as GeoJSONSource | undefined;
    source?.setData(buildFeatureCollection(villages));
    applyVillageStyle(map, activeMode, selectedPrimaryId);

    const selectedVillage = villages.find((village) => village.primaryId === selectedPrimaryId);
    if (selectedVillage?.geometry.type === 'Point') {
      map.easeTo({
        center: [selectedVillage.geometry.coordinates[0], selectedVillage.geometry.coordinates[1]],
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
      fitBoundsOptions: { padding: 36 },
      style: getMapStyle(mapStyleKey, runtimeConfig.mapStyleUrl),
    });

    appliedMapStyleKeyRef.current = mapStyleKey;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const handleLoad = () => syncMapState(map);
    const handleStyleLoad = () => syncMapState(map);
    const handleClick = (event: maplibregl.MapLayerMouseEvent) => {
      const primaryId = event.features?.[0]?.properties?.primaryId;
      if (typeof primaryId === 'string' && primaryId) {
        handleSelectVillage(primaryId);
      }
    };

    map.on('load', handleLoad);
    map.on('style.load', handleStyleLoad);
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
    if (!map || appliedMapStyleKeyRef.current === mapStyleKey) {
      return;
    }

    appliedMapStyleKeyRef.current = mapStyleKey;
    map.setStyle(getMapStyle(mapStyleKey, runtimeConfig.mapStyleUrl));
  }, [mapStyleKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }
    syncMapState(map);
  }, [activeMode, selectedPrimaryId, villages]);

  if (typeof window === 'undefined' || !('WebGLRenderingContext' in window)) {
    return (
      <div className="flex h-[38rem] items-center justify-center rounded-[2rem] bg-[linear-gradient(160deg,#e8f1fb,#f5f8fc)] p-6 text-center text-sm leading-7 text-[color:var(--color-text-secondary)] md:h-[44rem]">
        当前环境未启用 WebGL，测试和无图形环境下会回退到静态地图占位。浏览器里将自动切换到 MapLibre。
      </div>
    );
  }

  return (
    <div className="relative h-[38rem] overflow-hidden rounded-[2rem] border border-[color:var(--color-border-subtle)] bg-[#edf4fa] shadow-[var(--shadow-stage)] md:h-[44rem]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_24%),linear-gradient(180deg,rgba(209,228,244,0.72),rgba(236,243,248,0.82))]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(rgba(84,110,135,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(84,110,135,0.08) 1px, transparent 1px)',
          backgroundPosition: '0 0, 0 0',
          backgroundSize: '72px 72px, 72px 72px',
        }}
      />
      <div className="absolute inset-0 z-10 h-full w-full" ref={containerRef} />
    </div>
  );
}

export function MapWorkspace({
  activeMode,
  facets,
  filters,
  hasInvalidSelection = false,
  onFiltersChange,
  onModeChange,
  onSelectVillage,
  orientation,
  selectedPrimaryId,
  townOptions,
  villages,
}: MapWorkspaceProps) {
  const { mapStyleKey } = useAppPreferences();
  const selectedVillage = getSelectedVillage(villages, selectedPrimaryId);
  const canClearFilters = hasActiveFilters(filters);
  const clearFiltersButton = (
    <button
      aria-label="一键清空筛选"
      className="rounded-full border border-[color:var(--color-border-subtle)] bg-white/80 px-2.5 py-1 text-[11px] font-medium leading-none text-[color:var(--color-primary-strong)] shadow-[var(--shadow-soft)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      disabled={!canClearFilters}
      onClick={() =>
        onFiltersChange({
          city: '',
          dialect: '',
          economy: '',
          ethnicity: '',
          fulltext: false,
          q: '',
          town: '',
          year: null,
        })
      }
      type="button"
    >
      清空
    </button>
  );

  const filterContent = useMemo(
    () => (
      <div className="flex h-full min-h-0 flex-col space-y-4">
        <FilterPanel
          activeMode={activeMode}
          facets={facets}
          filters={filters}
          onFiltersChange={onFiltersChange}
          orientation={orientation}
          townOptions={townOptions}
        />
        <VillageList
          activeMode={activeMode}
          onSelectVillage={onSelectVillage}
          selectedPrimaryId={selectedPrimaryId}
          villages={villages}
        />
      </div>
    ),
    [activeMode, facets, filters, onFiltersChange, onModeChange, onSelectVillage, orientation, selectedPrimaryId, townOptions, villages],
  );

  const detailPanel = (
    <div data-testid="map-detail-panel">
      <DetailPanel
        activeMode={activeMode}
        hasInvalidSelection={hasInvalidSelection}
        hasVillages={villages.length > 0}
        selectedVillage={selectedVillage}
      />
    </div>
  );

  const mapContent = (
    <div className="flex h-full min-h-0 flex-col gap-4" data-testid="map-stage-content">
      {activeMode === 'dialect' ? <DialectLegend /> : null}
      <MapCanvas
        activeMode={activeMode}
        mapStyleKey={mapStyleKey}
        onSelectVillage={onSelectVillage}
        selectedPrimaryId={selectedPrimaryId}
        villages={villages}
      />
    </div>
  );

  if (orientation === 'portrait') {
    return (
      <div className="grid gap-4" data-testid="map-portrait-layout">
        <ModeTabs activeMode={activeMode} onModeChange={onModeChange} />

        <SurfaceCard
          description="先切模式，再筛选，再从结果列表或地图点位进入详情。"
          headerActions={clearFiltersButton}
          title="筛选与村庄列表"
        >
          {filterContent}
        </SurfaceCard>

        <SurfaceCard title="村庄地图" description="地图保持在主视线位置，详情在下部展开连续阅读。">
          {mapContent}
        </SurfaceCard>

        {detailPanel}
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 [grid-template-columns:22rem_minmax(0,1fr)] [grid-template-rows:auto_minmax(0,80dvh)_auto]"
      data-testid="map-landscape-layout"
    >
      <div className="col-span-2">
        <ModeTabs activeMode={activeMode} onModeChange={onModeChange} />
      </div>

      <aside className="h-full min-h-0">
        <SurfaceCard
          className="h-full overflow-hidden"
          contentClassName="flex h-full min-h-0 flex-col"
          headerActions={clearFiltersButton}
          title="筛选与村庄列表"
          // description="筛选、列表、点选保持在左侧，减少来回扫视成本。"
        >
          {filterContent}
        </SurfaceCard>
      </aside>

      <section className="h-full min-h-0">
        <SurfaceCard
          className="h-full"
          contentClassName="flex h-full min-h-0 flex-col"
          title="村庄地图"
          // description="地图单独承担定位与分布阅读，详情拆到整行下方单独展开。"
        >
          {mapContent}
        </SurfaceCard>
      </section>

      <section className="col-span-2" data-testid="map-detail-full-width-row">
        {detailPanel}
      </section>
    </div>
  );
}
