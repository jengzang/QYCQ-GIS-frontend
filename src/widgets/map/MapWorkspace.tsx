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
import { FilterPanel } from './components/FilterPanel';
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
  return (
    <div aria-label="村庄地图模式" className="flex flex-wrap gap-2" role="tablist">
      {mapModeMapping.map((mode) => {
        const isActive = activeMode === mode.key;

        return (
          <button
            key={mode.key}
            aria-selected={isActive}
            className={[
              'rounded-full border px-4 py-2 text-sm font-semibold transition',
              'border-[color:var(--color-border-subtle)] bg-white/82 text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-white',
              isActive
                ? 'border-[color:var(--color-border-strong)] bg-[linear-gradient(135deg,#ffffff,#eef5ff)] text-[color:var(--color-primary-strong)] shadow-[0_18px_36px_rgba(59,130,246,0.16)]'
                : '',
            ].join(' ')}
            onClick={() => onModeChange(mode.key)}
            role="tab"
            type="button"
          >
            {mode.label}
          </button>
        );
      })}
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
  villages,
}: MapWorkspaceProps) {
  const { mapStyleKey } = useAppPreferences();
  const selectedVillage = getSelectedVillage(villages, selectedPrimaryId);

  const filterContent = useMemo(
    () => (
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
    ),
    [activeMode, facets, filters, onFiltersChange, onModeChange, onSelectVillage, orientation, selectedPrimaryId, villages],
  );

  const mapContent = (
    <div className="space-y-4">
      {activeMode === 'dialect' ? <DialectLegend /> : null}
      <MapCanvas
        activeMode={activeMode}
        mapStyleKey={mapStyleKey}
        onSelectVillage={onSelectVillage}
        selectedPrimaryId={selectedPrimaryId}
        villages={villages}
      />
      <div data-testid="map-detail-panel">
        <DetailPanel
          activeMode={activeMode}
          hasInvalidSelection={hasInvalidSelection}
          hasVillages={villages.length > 0}
          selectedVillage={selectedVillage}
        />
      </div>
    </div>
  );

  if (orientation === 'portrait') {
    return (
      <div className="grid gap-4" data-testid="map-portrait-layout">
        <SurfaceCard title="筛选与村庄列表" description="先切模式，再筛选，再从结果列表或地图点位进入详情。" eyebrow="Control deck">
          {filterContent}
        </SurfaceCard>

        <SurfaceCard title="村庄地图" description="地图区域放到主视线位置，详情放在下方连续阅读。" eyebrow="Map stage">
          {mapContent}
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="grid gap-4 [grid-template-columns:22rem_minmax(0,1fr)]" data-testid="map-landscape-layout">
      <aside className="space-y-4">
        <SurfaceCard title="筛选与村庄列表" description="筛选、列表、点选保持在左侧，减少来回扫视成本。" eyebrow="Control deck">
          {filterContent}
        </SurfaceCard>
      </aside>

      <section className="space-y-4">
        <SurfaceCard title="村庄地图" description="地图放大为主内容区，详情改为下方承接，不再拆成第三栏。" eyebrow="Map stage">
          {mapContent}
        </SurfaceCard>
      </section>
    </div>
  );
}
