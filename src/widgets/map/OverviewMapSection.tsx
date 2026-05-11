import maplibregl, { type GeoJSONSource, type Map } from 'maplibre-gl';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import type { Feature, FeatureCollection, Point } from 'geojson';

import { useAppPreferences } from '@/app/providers/AppPreferencesProvider';
import type { VillageRecord } from '@/entities/village/model/types';
import { runtimeConfig } from '@/shared/config/runtime';
import {
  type MapStyleKey,
  getMapStyle,
} from '@/shared/lib/map-style';
import { dialectLegendMapping } from '@/shared/mappings/dialect-mapping';
import { mapLayerMapping } from '@/shared/mappings/map-layer-mapping';
import { mapModeMapping, type MapModeKey } from '@/shared/mappings/nav-mapping';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

type VillageFeature = Feature<
  Point,
  {
    dialectGroup: string;
    name: string;
    primaryId: string;
    sortYear: number | null;
  }
>;

const mapBounds: [[number, number], [number, number]] = [
  [109.6, 20.2],
  [117.3, 25.6],
];

function buildFeatureCollection(villages: VillageRecord[]): FeatureCollection<Point> {
  const features: VillageFeature[] = villages
    .filter((village): village is VillageRecord & { geometry: Point } => village.geometry.type === 'Point')
    .map((village) => ({
      geometry: village.geometry,
      properties: {
        dialectGroup: village.dialectGroup,
        name: village.name,
        primaryId: village.primaryId,
        sortYear: village.timeline.sortYear,
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

  expression.push('#557a95');
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
        'circle-color': '#557a95',
        'circle-opacity': 0.92,
        'circle-radius': 5.5,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.2,
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
        'circle-color': '#38556d',
        'circle-opacity': 0.12,
        'circle-radius': 18,
        'circle-stroke-color': '#38556d',
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
    activeMode === 'dialect' ? buildDialectExpression() : '#557a95',
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-opacity',
    activeMode === 'timeline' ? ['case', ['==', ['get', 'sortYear'], null], 0.32, 0.88] : 0.92,
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-radius',
    ['case', ['==', ['get', 'primaryId'], selectedPrimaryId], 8, 5.5],
  );
  map.setPaintProperty(
    mapLayerMapping.symbolLayerId,
    'circle-stroke-width',
    ['case', ['==', ['get', 'primaryId'], selectedPrimaryId], 2.2, 1.2],
  );
  map.setFilter(mapLayerMapping.detailHighlightLayerId, ['==', ['get', 'primaryId'], selectedPrimaryId]);
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

function MapPreviewCanvas({
  activeMode,
  mapStyleKey,
  onSelectVillage,
  selectedPrimaryId,
  villages,
}: {
  activeMode: MapModeKey;
  mapStyleKey: MapStyleKey;
  onSelectVillage: (primaryId: string) => void;
  selectedPrimaryId: string;
  villages: VillageRecord[];
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
        duration: 400,
        zoom: Math.max(map.getZoom(), 7.2),
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
      fitBoundsOptions: { padding: 28 },
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
      <div className="flex min-h-[24rem] items-center justify-center rounded-[1.7rem] bg-[color:var(--color-bg-soft)] p-6 text-center text-sm leading-7 text-[color:var(--color-text-secondary)]">
        当前测试/无图形环境下回退为静态占位；浏览器中会显示真实 MapLibre 地图，并支持切换图源。
      </div>
    );
  }

  return <div className="min-h-[24rem] overflow-hidden rounded-[1.7rem]" ref={containerRef} />;
}

export function OverviewMapSection({ villages }: { villages: VillageRecord[] }) {
  const [activeMode, setActiveMode] = useState<MapModeKey>('search');
  const { mapStyleKey } = useAppPreferences();
  const [selectedPrimaryId, setSelectedPrimaryId] = useState(() => villages[0]?.primaryId ?? '');

  useEffect(() => {
    if (!selectedPrimaryId && villages[0]?.primaryId) {
      setSelectedPrimaryId(villages[0].primaryId);
      return;
    }

    if (selectedPrimaryId && !villages.some((village) => village.primaryId === selectedPrimaryId) && villages[0]?.primaryId) {
      setSelectedPrimaryId(villages[0].primaryId);
    }
  }, [selectedPrimaryId, villages]);

  return (
    <SurfaceCard
      title="地图总览"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="首页地图模式">
          {mapModeMapping.map((mode) => {
            const isActive = activeMode === mode.key;
            return (
              <button
                key={mode.key}
                aria-selected={isActive}
                className={[
                  'rounded-full border px-4 py-2 text-sm font-semibold transition',
                  'border-[color:var(--color-border-subtle)] bg-white/86 text-[color:var(--color-text-primary)] hover:bg-white',
                  isActive ? 'border-[color:var(--color-border-strong)] text-[color:var(--color-primary-strong)]' : '',
                ].join(' ')}
                onClick={() => setActiveMode(mode.key)}
                role="tab"
                type="button"
              >
                {mode.label}
              </button>
            );
          })}
        </div>
        <div className="space-y-4">
          {activeMode === 'dialect' ? <DialectLegend /> : null}
          <MapPreviewCanvas
            activeMode={activeMode}
            mapStyleKey={mapStyleKey}
            onSelectVillage={setSelectedPrimaryId}
            selectedPrimaryId={selectedPrimaryId}
            villages={villages}
          />

          <div className="flex flex-col gap-3 rounded-[1.4rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-soft)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
              地图底图与明暗主题可在“设置”页统一调整；点击地图中的村庄后，可进入完整地图继续查看。
            </p>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary-strong)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-92"
              to={
                selectedPrimaryId
                  ? `${routeMapping.map}?${queryParamMapping.mode}=search&${queryParamMapping.primaryId}=${selectedPrimaryId}`
                  : routeMapping.map
              }
            >
              进入村庄地图
            </Link>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
