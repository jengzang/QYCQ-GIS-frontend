import maplibregl, { type GeoJSONSource, type Map } from 'maplibre-gl';
import { useEffect, useEffectEvent, useRef } from 'react';

import type { Feature, FeatureCollection, Point } from 'geojson';

import type { VillageRecord } from '@/entities/village/model/types';
import { runtimeConfig } from '@/shared/config/runtime';
import { getMapStyle } from '@/shared/lib/map-style';
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
    activeMode === 'timeline' ? ['case', ['==', ['get', 'sortYear'], null], 0.36, 0.88] : 0.88,
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
