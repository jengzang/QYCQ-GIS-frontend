import maplibregl, { type GeoJSONSource, type Map } from 'maplibre-gl';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

import type { Feature, FeatureCollection, Point } from 'geojson';

import type { VillageRecord } from '@/entities/village/model/types';
import { runtimeConfig } from '@/shared/config/runtime';
import {
  type MapStyleKey,
  getAvailableMapStyleOptions,
  getMapStyle,
  getMapStyleLabel,
  mapStyleStorageKey,
  resolveAvailableMapStyleKey,
} from '@/shared/lib/map-style';
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

function getStoredMapStyleKey() {
  if (typeof window === 'undefined') {
    return runtimeConfig.mapStyleKey;
  }

  const storedMapStyleKey = window.localStorage.getItem(mapStyleStorageKey);
  if (storedMapStyleKey === null) {
    return resolveAvailableMapStyleKey(runtimeConfig.mapStyleKey, runtimeConfig.mapStyleUrl, runtimeConfig.mapStyleKey);
  }

  return resolveAvailableMapStyleKey(storedMapStyleKey, runtimeConfig.mapStyleUrl, runtimeConfig.mapStyleKey);
}

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

function MapStyleSwitcher({
  onMapStyleChange,
  selectedMapStyle,
}: {
  onMapStyleChange: (styleKey: MapStyleKey) => void;
  selectedMapStyle: MapStyleKey;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-[1.6rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(240,247,255,0.82))] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">底图来源</p>
          <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">统一 MapLibre 底图源，切换后村庄图层会自动重挂。</p>
        </div>
        <button
          aria-expanded={isOpen}
          aria-label={`切换底图：${getMapStyleLabel(selectedMapStyle)}`}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-subtle)] bg-white/90 px-4 py-2 text-sm font-semibold text-[color:var(--color-primary-strong)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-white"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          <span>{getMapStyleLabel(selectedMapStyle)}</span>
          <span className="text-xs text-[color:var(--color-text-tertiary)]">{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {getAvailableMapStyleOptions(runtimeConfig.mapStyleUrl).map((option) => {
            const isActive = option.key === selectedMapStyle;

            return (
              <button
                key={option.key}
                aria-pressed={isActive}
                aria-label={`切换到底图：${option.label}`}
                className={[
                  'rounded-[1.2rem] border px-4 py-3 text-left text-sm font-semibold transition',
                  'border-[color:var(--color-border-subtle)] bg-white/80 text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-white',
                  isActive
                    ? 'border-[color:var(--color-border-strong)] bg-[linear-gradient(135deg,#ffffff,#eaf3ff)] text-[color:var(--color-primary-strong)] shadow-[0_16px_32px_rgba(59,130,246,0.16)]'
                    : '',
                ].join(' ')}
                onClick={() => {
                  onMapStyleChange(option.key);
                  setIsOpen(false);
                }}
                type="button"
              >
                <span className="block">{option.label}</span>
                <span className="mt-1 block text-xs font-medium text-[color:var(--color-text-tertiary)]">
                  {isActive ? '当前使用中' : '点击切换'}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
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
      <div className="flex min-h-[30rem] items-center justify-center rounded-[2rem] bg-[linear-gradient(160deg,#eef6ff,#f8fbff)] p-6 text-center text-sm leading-7 text-[color:var(--color-text-secondary)]">
        当前环境未启用 WebGL，测试和无图形环境下会回退到静态地图占位。浏览器里将自动切换到 MapLibre。
      </div>
    );
  }

  return <div className="min-h-[30rem] overflow-hidden rounded-[2rem]" ref={containerRef} />;
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

function StageIntro({
  activeMode,
  isLoading,
  selectedMapStyle,
  villagesLength,
}: {
  activeMode: MapModeKey;
  isLoading?: boolean;
  selectedMapStyle: MapStyleKey;
  villagesLength: number;
}) {
  const descriptions: Record<MapModeKey, string> = {
    dialect: '把语言分布直接投到地图上，用图例和点位把差异读出来。',
    search: '先定向检索，再从列表或地图点选进入单村叙事。',
    timeline: '把建村时间推进成一条可浏览的空间时间线。',
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="rounded-[1.6rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(244,248,255,0.74))] p-5 shadow-[var(--shadow-soft)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-tertiary)]">地图主舞台</p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">{mapModeMapping.find((item) => item.key === activeMode)?.label}</p>
        <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">{descriptions[activeMode]}</p>
      </div>
      <div className="grid gap-3">
        <div className="rounded-[1.4rem] border border-[color:var(--color-border-subtle)] bg-white/76 p-4 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">当前结果</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">{villagesLength}</p>
        </div>
        <div className="rounded-[1.4rem] border border-[color:var(--color-border-subtle)] bg-white/76 p-4 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">运行状态</p>
          <p className="mt-2 text-sm font-semibold text-[color:var(--color-primary-strong)]">{isLoading ? '正在加载数据…' : 'MapLibre 已接入'}</p>
          <p className="mt-2 text-xs leading-5 text-[color:var(--color-text-secondary)]">当前底图：{getMapStyleLabel(selectedMapStyle)}</p>
        </div>
      </div>
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
  const [selectedMapStyle, setSelectedMapStyle] = useState<MapStyleKey>(getStoredMapStyleKey);
  const selectedVillage = getSelectedVillage(villages, selectedPrimaryId);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(mapStyleStorageKey, selectedMapStyle);
    }
  }, [selectedMapStyle]);

  const filterContent = (
    <div className="space-y-4">
      <ModeTabs activeMode={activeMode} onModeChange={onModeChange} />
      <FilterPanel activeMode={activeMode} facets={facets} filters={filters} onFiltersChange={onFiltersChange} orientation={orientation} />
      <VillageList activeMode={activeMode} onSelectVillage={onSelectVillage} selectedPrimaryId={selectedPrimaryId} villages={villages} />
    </div>
  );

  const mapContent = (
    <div className="space-y-4">
      <StageIntro activeMode={activeMode} isLoading={isLoading} selectedMapStyle={selectedMapStyle} villagesLength={villages.length} />
      <MapStyleSwitcher onMapStyleChange={setSelectedMapStyle} selectedMapStyle={selectedMapStyle} />
      {activeMode === 'dialect' ? <DialectLegend /> : null}
      <MapCanvas
        activeMode={activeMode}
        mapStyleKey={selectedMapStyle}
        onSelectVillage={onSelectVillage}
        selectedPrimaryId={selectedPrimaryId}
        villages={villages}
      />
    </div>
  );

  if (orientation === 'portrait') {
    return (
      <div className="grid gap-4" data-testid="map-portrait-layout">
        <SurfaceCard title="精筛控制台" description="先切模式、再筛选、再快速浏览结果。" eyebrow="控制面板">
          {filterContent}
        </SurfaceCard>

        <SurfaceCard title="地图主舞台" description="点选地图或列表，详情都通过 primaryId 联动。" eyebrow="Map stage">
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
    <div className="grid gap-4 [grid-template-columns:22rem_minmax(0,1fr)_24rem]" data-testid="map-landscape-layout">
      <aside className="space-y-4" data-testid="map-landscape-sidebar">
        <SurfaceCard title="精筛控制台" description="横屏下把筛选与列表固定在左侧，保持连续操作手感。" eyebrow="Control deck">
          {filterContent}
        </SurfaceCard>
      </aside>

      <section className="space-y-4">
        <SurfaceCard title="地图主舞台" description="当前接入统一底图库，所有 MapLibre 实例都可复用同一套底图来源与切换逻辑。" eyebrow="Main stage">
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
