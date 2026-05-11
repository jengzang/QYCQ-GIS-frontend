import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl';
import type { ReactNode } from 'react';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import type { Feature, FeatureCollection, Point } from 'geojson';

import { useAppPreferences } from '@/app/providers/AppPreferencesProvider';
import { useVillagesQuery } from '@/entities/village/api/hooks';
import type { VillageRecord } from '@/entities/village/model/types';
import { runtimeConfig } from '@/shared/config/runtime';
import {
  type MapStyleKey,
  getMapStyle,
} from '@/shared/lib/map-style';
import { useOrientationMode } from '@/shared/lib/orientation';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';
import { buttonClassName } from '@/shared/ui/button-style';

import {
  analyzeToponymyVillages,
  getDefaultToponymyKeyword,
  getToponymyQuickChars,
  normalizeToponymyKeyword,
  toponymySemanticOptions,
  type ToponymyMatchType,
  type ToponymySemanticCategory,
  type ToponymyAnalyzedVillage,
} from './lib/toponymy-analysis';

type ToponymyVillageFeature = Feature<
  Point,
  {
    category: string;
    city: string;
    name: string;
    primaryId: string;
    town: string;
  }
>;

const mapBounds: [[number, number], [number, number]] = [
  [109.6, 20.2],
  [117.3, 25.6],
];

const toponymyMapSourceId = 'toponymy-villages';
const toponymyMapLayerId = 'toponymy-village-points';
const toponymyMapHighlightLayerId = 'toponymy-village-highlight';

const toponymyCategoryColorMapping: Record<Exclude<ToponymySemanticCategory, '全部'>, string> = {
  地形: '#16a34a',
  水系: '#0284c7',
  方位: '#9333ea',
  聚落: '#f97316',
  '姓氏/族群': '#dc2626',
  '植被/物产': '#65a30d',
  吉祥愿景: '#d97706',
  历史记忆: '#4f46e5',
  待确认: '#64748b',
};

function buildToponymyFeatureCollection(
  villages: ToponymyAnalyzedVillage[],
  villagesByPrimaryId: globalThis.Map<string, VillageRecord>,
): FeatureCollection<Point> {
  const features = villages.reduce<ToponymyVillageFeature[]>((items, village) => {
    const sourceVillage = villagesByPrimaryId.get(village.primaryId);
    if (!sourceVillage || sourceVillage.geometry.type !== 'Point') {
      return items;
    }

    items.push({
      geometry: sourceVillage.geometry,
      properties: {
        category: village.category,
        city: sourceVillage.city ?? '',
        name: village.name,
        primaryId: village.primaryId,
        town: sourceVillage.town ?? '',
      },
      type: 'Feature',
    });

    return items;
  }, []);

  return { features, type: 'FeatureCollection' };
}

const matchTypeOptions: Array<{ description: string; key: ToponymyMatchType; label: string }> = [
  { description: '村名以关键词开头，如“高车村”。', key: 'prefix', label: '前缀' },
  { description: '村名以关键词结尾，如“石高”。', key: 'suffix', label: '后缀' },
  { description: '村名任意位置出现关键词。', key: 'contains', label: '包含' },
];

function ensureToponymyMapLayers(map: MapLibreMap) {
  if (!map.getSource(toponymyMapSourceId)) {
    map.addSource(toponymyMapSourceId, {
      data: { features: [], type: 'FeatureCollection' },
      type: 'geojson',
    });
  }

  if (!map.getLayer(toponymyMapLayerId)) {
    map.addLayer({
      id: toponymyMapLayerId,
      paint: {
        'circle-color': [
          'match',
          ['get', 'category'],
          '地形',
          toponymyCategoryColorMapping.地形,
          '水系',
          toponymyCategoryColorMapping.水系,
          '方位',
          toponymyCategoryColorMapping.方位,
          '聚落',
          toponymyCategoryColorMapping.聚落,
          '姓氏/族群',
          toponymyCategoryColorMapping['姓氏/族群'],
          '植被/物产',
          toponymyCategoryColorMapping['植被/物产'],
          '吉祥愿景',
          toponymyCategoryColorMapping.吉祥愿景,
          '历史记忆',
          toponymyCategoryColorMapping.历史记忆,
          '待确认',
          toponymyCategoryColorMapping.待确认,
          '#64748b',
        ],
        'circle-opacity': 0.9,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 4.2, 8, 7.2, 11, 10],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.4,
      },
      source: toponymyMapSourceId,
      type: 'circle',
    });
  }

  if (!map.getLayer(toponymyMapHighlightLayerId)) {
    map.addLayer({
      filter: ['==', ['get', 'primaryId'], ''],
      id: toponymyMapHighlightLayerId,
      paint: {
        'circle-color': '#0f172a',
        'circle-opacity': 0.12,
        'circle-radius': 20,
        'circle-stroke-color': '#0f172a',
        'circle-stroke-width': 1.6,
      },
      source: toponymyMapSourceId,
      type: 'circle',
    });
  }
}

function ToponymyMapCanvas({
  mapStyleKey,
  matchedVillages,
  onSelectVillage,
  selectedPrimaryId,
  villagesByPrimaryId,
}: {
  mapStyleKey: MapStyleKey;
  matchedVillages: ToponymyAnalyzedVillage[];
  onSelectVillage: (primaryId: string) => void;
  selectedPrimaryId: string;
  villagesByPrimaryId: globalThis.Map<string, VillageRecord>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const appliedMapStyleKeyRef = useRef<MapStyleKey>(mapStyleKey);
  const handleSelectVillage = useEffectEvent(onSelectVillage);
  const syncMapState = useEffectEvent((map: MapLibreMap) => {
    ensureToponymyMapLayers(map);
    const source = map.getSource(toponymyMapSourceId) as GeoJSONSource | undefined;
    source?.setData(buildToponymyFeatureCollection(matchedVillages, villagesByPrimaryId));
    map.setFilter(toponymyMapHighlightLayerId, ['==', ['get', 'primaryId'], selectedPrimaryId]);

    const selectedVillage = villagesByPrimaryId.get(selectedPrimaryId);
    if (selectedVillage?.geometry.type === 'Point') {
      map.easeTo({
        center: [selectedVillage.geometry.coordinates[0], selectedVillage.geometry.coordinates[1]],
        duration: 420,
        zoom: Math.max(map.getZoom(), 7.1),
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
      fitBoundsOptions: { padding: 34 },
      style: getMapStyle(mapStyleKey, runtimeConfig.mapStyleUrl),
    });

    appliedMapStyleKeyRef.current = mapStyleKey;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    const handleClick = (event: maplibregl.MapLayerMouseEvent) => {
      const primaryId = event.features?.[0]?.properties?.primaryId;
      if (typeof primaryId === 'string' && primaryId) {
        handleSelectVillage(primaryId);
      }
    };
    map.on('load', () => syncMapState(map));
    map.on('style.load', () => syncMapState(map));
    map.on('click', toponymyMapLayerId, handleClick);
    map.on('mouseenter', toponymyMapLayerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', toponymyMapLayerId, () => {
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
  }, [matchedVillages, selectedPrimaryId, villagesByPrimaryId]);

  if (typeof window === 'undefined' || !('WebGLRenderingContext' in window)) {
    return (
      <div className="flex min-h-[26rem] items-center justify-center rounded-[1.7rem] bg-[linear-gradient(160deg,#e8f1fb,#f5f8fc)] p-6 text-center text-sm leading-7 text-[color:var(--color-text-secondary)]">
        当前测试/无图形环境下回退为静态地图占位；浏览器中会显示命名结果的真实空间分布。
      </div>
    );
  }

  return <div className="min-h-[26rem] overflow-hidden rounded-[1.7rem] border border-[color:var(--color-border-subtle)] bg-[#edf4fa]" ref={containerRef} />;
}

function ToponymyMapLegend({ categories }: { categories: Array<Exclude<ToponymySemanticCategory, '全部'>> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <span
          key={category}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-subtle)] bg-white/82 px-3 py-1 text-xs text-[color:var(--color-text-secondary)]"
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: toponymyCategoryColorMapping[category] }} />
          {category}
        </span>
      ))}
    </div>
  );
}

function highlightText(text: string, keyword: string) {
  if (!keyword || !text.includes(keyword)) {
    return text;
  }

  const segments = text.split(keyword);
  return segments.flatMap((segment, index) => {
    const nodes: Array<string | ReactNode> = [segment];
    if (index < segments.length - 1) {
      nodes.push(
        <mark
          key={`${text}-${index}`}
          className="rounded bg-[color:var(--color-primary-soft)] px-1 text-[color:var(--color-primary-strong)]"
        >
          {keyword}
        </mark>,
      );
    }

    return nodes;
  });
}

export function ToponymyPage() {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';
  const { data: villages = [] } = useVillagesQuery({});
  const toponymyField = villageFieldMapping.highlightFields.toponymy;
  const toponymyVillages = useMemo(
    () => villages.filter((village) => Boolean(village.name && village.raw[toponymyField])),
    [toponymyField, villages],
  );
  const quickChars = useMemo(() => getToponymyQuickChars(toponymyVillages), [toponymyVillages]);
  const [keyword, setKeyword] = useState('');
  const [matchType, setMatchType] = useState<ToponymyMatchType>('contains');
  const [semanticCategory, setSemanticCategory] = useState<ToponymySemanticCategory>('全部');
  const [selectedPrimaryId, setSelectedPrimaryId] = useState('');
  const { mapStyleKey } = useAppPreferences();

  useEffect(() => {
    if (!keyword && toponymyVillages.length) {
      setKeyword(getDefaultToponymyKeyword(toponymyVillages));
    }
  }, [keyword, toponymyVillages]);

  const analysis = useMemo(
    () => analyzeToponymyVillages(toponymyVillages, toponymyField, { keyword, matchType, semanticCategory }),
    [keyword, matchType, semanticCategory, toponymyField, toponymyVillages],
  );

  const activeSemanticOption = toponymySemanticOptions.find((option) => option.label === semanticCategory);
  const activeMatchOption = matchTypeOptions.find((option) => option.key === matchType);
  const villagesByPrimaryId = useMemo(
    () => new Map(toponymyVillages.map((village) => [village.primaryId, village])),
    [toponymyVillages],
  );
  const selectedVillage = analysis.villages.find((village) => village.primaryId === selectedPrimaryId) ?? analysis.villages[0] ?? null;
  const mapLegendCategories = useMemo(
    () => [...new Set(analysis.villages.map((village) => village.category))],
    [analysis.villages],
  );

  useEffect(() => {
    const firstPrimaryId = analysis.villages[0]?.primaryId ?? '';
    if (!selectedPrimaryId || !analysis.villages.some((village) => village.primaryId === selectedPrimaryId)) {
      setSelectedPrimaryId(firstPrimaryId);
    }
  }, [analysis.villages, selectedPrimaryId]);

  return (
    <SiteShell>
      <div className="grid gap-4">
        <SurfaceCard
          title="村名地理"
          description="从村名字形、词位和命名语义中观察地理文化线索；可按关键词、前后缀和语义类别筛选。"
          headerActions={
            <button
              className="rounded-full border border-[color:var(--color-border-subtle)] px-4 py-2 text-sm text-[color:var(--color-text-secondary)] transition hover:bg-white"
              onClick={() => {
                setKeyword(getDefaultToponymyKeyword(toponymyVillages));
                setMatchType('contains');
                setSemanticCategory('全部');
              }}
              type="button"
            >
              重置
            </button>
          }
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
            <div className="space-y-4">
              <div className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-white/84 p-4">
                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">检索条件</p>
                <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.2fr)_auto_auto] md:items-end">
                  <label className="space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                    <span className="block font-medium text-[color:var(--color-text-primary)]">关键词</span>
                    <input
                      className="w-full rounded-[1rem] border border-[color:var(--color-border-subtle)] bg-white px-4 py-3 text-sm text-[color:var(--color-text-primary)] outline-none transition focus:border-[color:var(--color-border-strong)]"
                      onChange={(event) => setKeyword(normalizeToponymyKeyword(event.target.value))}
                      placeholder="输入村名字词，如“高”“龙”“田”“水”"
                      type="text"
                      value={keyword}
                    />
                  </label>

                  <label className="space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                    <span className="block font-medium text-[color:var(--color-text-primary)]">匹配方式</span>
                    <select
                      className="w-full rounded-[1rem] border border-[color:var(--color-border-subtle)] bg-white px-4 py-3 text-sm text-[color:var(--color-text-primary)] outline-none transition focus:border-[color:var(--color-border-strong)]"
                      onChange={(event) => setMatchType(event.target.value as ToponymyMatchType)}
                      value={matchType}
                    >
                      {matchTypeOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                    <span className="block font-medium text-[color:var(--color-text-primary)]">语义类别</span>
                    <select
                      className="w-full rounded-[1rem] border border-[color:var(--color-border-subtle)] bg-white px-4 py-3 text-sm text-[color:var(--color-text-primary)] outline-none transition focus:border-[color:var(--color-border-strong)]"
                      onChange={(event) => setSemanticCategory(event.target.value as ToponymySemanticCategory)}
                      value={semanticCategory}
                    >
                      {toponymySemanticOptions.map((option) => (
                        <option key={option.label} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-white/84 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mr-2 text-sm font-semibold text-[color:var(--color-text-primary)]">高频字入口</p>
                  {quickChars.map((item) => {
                    const isActive = keyword === item.value;
                    return (
                      <button
                        key={item.value}
                        className={[
                          'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition',
                          isActive
                            ? 'border-[color:var(--color-border-strong)] bg-[color:var(--color-primary-soft)] text-[color:var(--color-primary-strong)]'
                            : 'border-[color:var(--color-border-subtle)] bg-white text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-soft)]',
                        ].join(' ')}
                        onClick={() => setKeyword(item.value)}
                        type="button"
                      >
                        <span>{item.value}</span>
                        <span className="text-xs text-[color:var(--color-text-secondary)]">{item.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-soft)] p-4">
              <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">当前分析</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                {analysis.keyword
                  ? `当前查看“${analysis.keyword}”：共命中 ${analysis.summary.matchCount} 个村庄，当前按“${activeMatchOption?.label ?? '包含'}”方式检索，语义上以“${analysis.summary.dominantCategory}”为主。`
                  : '当前展示默认高频村名样本，可点击上方常见字开始分析。'}
              </p>
              <div className={['mt-4 grid gap-3', isPortrait ? 'grid-cols-2' : 'grid-cols-2'].join(' ')}>
                <div className="rounded-[1.15rem] bg-white/90 p-3">
                  <p className="text-xs text-[color:var(--color-text-tertiary)]">命中村庄</p>
                  <p className="mt-2 text-xl font-semibold text-[color:var(--color-text-primary)]">{analysis.summary.matchCount}</p>
                </div>
                <div className="rounded-[1.15rem] bg-white/90 p-3">
                  <p className="text-xs text-[color:var(--color-text-tertiary)]">主导语义</p>
                  <p className="mt-2 text-xl font-semibold text-[color:var(--color-text-primary)]">{analysis.summary.dominantCategory}</p>
                </div>
                <div className="rounded-[1.15rem] bg-white/90 p-3">
                  <p className="text-xs text-[color:var(--color-text-tertiary)]">当前匹配</p>
                  <p className="mt-2 text-xl font-semibold text-[color:var(--color-text-primary)]">{activeMatchOption?.label ?? '包含'}</p>
                </div>
                <div className="rounded-[1.15rem] bg-white/90 p-3">
                  <p className="text-xs text-[color:var(--color-text-tertiary)]">常见搭配字</p>
                  <p className="mt-2 text-base font-semibold text-[color:var(--color-text-primary)]">
                    {analysis.summary.topCollocations.length ? analysis.summary.topCollocations.join(' / ') : '暂无'}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-6 text-[color:var(--color-text-tertiary)]">
                {activeSemanticOption?.description ?? '用于辅助观察命名规律，不代表最终学术定类。'}
              </p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="命名分布地图"
          description={
            analysis.keyword
              ? `当前地图展示“${analysis.keyword}”命名条件命中的 ${analysis.summary.matchCount} 个村庄，颜色表示命名语义类别。`
              : '地图展示当前命名样本的空间分布，输入关键词后会同步更新。'
          }
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.78fr)_minmax(9rem,0.38fr)]">
            <div className="space-y-3">
              <ToponymyMapCanvas
                mapStyleKey={mapStyleKey}
                matchedVillages={analysis.villages}
                onSelectVillage={setSelectedPrimaryId}
                selectedPrimaryId={selectedVillage?.primaryId ?? ''}
                villagesByPrimaryId={villagesByPrimaryId}
              />
              <ToponymyMapLegend categories={mapLegendCategories} />
              <p className="text-xs leading-6 text-[color:var(--color-text-tertiary)]">
                底图与日间/夜间模式由“设置”页统一控制；本页只展示村名分布，不提供底图切换入口。
              </p>
            </div>
            <div className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-soft)] p-4">
              <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">地图解读</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                {selectedVillage
                  ? `当前定位到“${selectedVillage.name}”，位于${selectedVillage.city || '城市未填'} · ${selectedVillage.town || '乡镇未填'}，命名语义判为“${selectedVillage.category}”。`
                  : '当前筛选没有可定位村庄，请调整关键词或语义类别。'}
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-[1.15rem] bg-white/90 p-3">
                  <p className="text-xs text-[color:var(--color-text-tertiary)]">地图点位</p>
                  <p className="mt-2 text-xl font-semibold text-[color:var(--color-text-primary)]">{analysis.summary.matchCount}</p>
                </div>
                <div className="rounded-[1.15rem] bg-white/90 p-3">
                  <p className="text-xs text-[color:var(--color-text-tertiary)]">语义类别</p>
                  <p className="mt-2 text-xl font-semibold text-[color:var(--color-text-primary)]">{mapLegendCategories.length}</p>
                </div>
              </div>
              {selectedVillage ? (
                <Link
                  className={buttonClassName.primary}
                  to={`${routeMapping.map}?${queryParamMapping.mode}=search&${queryParamMapping.primaryId}=${selectedVillage.primaryId}`}
                >
                  在村庄地图查看
                </Link>
              ) : null}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="命名结果"
          description={
            analysis.keyword
              ? `展示所有符合“${analysis.keyword}”检索条件的村庄，可继续跳转地图对照空间分布。`
              : '展示当前可分析的默认样本，可点击高频字或输入关键词更新结果。'
          }
        >
          {analysis.villages.length ? (
            <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-2'].join(' ')}>
              {analysis.villages.map((village) => (
                <article
                  key={village.primaryId}
                  className={[
                    'rounded-[1.55rem] border bg-white/88 p-5 transition',
                    selectedVillage?.primaryId === village.primaryId
                      ? 'border-[color:var(--color-border-strong)] shadow-[var(--shadow-soft)]'
                      : 'border-[color:var(--color-border-subtle)]',
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                        {highlightText(village.name, analysis.keyword)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                        {village.city || '城市未填'} · {village.town || '乡镇未填'}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <span className="rounded-full bg-[color:var(--color-bg-soft)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-secondary)]">
                        {activeMatchOption?.label ?? '包含'}匹配
                      </span>
                      <span className="rounded-full bg-[color:var(--color-primary-soft)] px-3 py-1 text-xs font-medium text-[color:var(--color-primary-strong)]">
                        {village.category}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">{highlightText(village.excerpt, analysis.keyword)}</p>
                  {/* <p className="mt-3 text-xs leading-6 text-[color:var(--color-text-tertiary)]">判读依据：{village.reason}</p> */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className={buttonClassName.secondary}
                      onClick={() => setSelectedPrimaryId(village.primaryId)}
                      type="button"
                    >
                      地图定位
                    </button>
                    <Link
                      className={buttonClassName.primary}
                      to={`${routeMapping.map}?${queryParamMapping.mode}=search&${queryParamMapping.primaryId}=${village.primaryId}`}
                    >
                      去村庄地图
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.45rem] border border-dashed border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-soft)] p-6 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              未找到符合当前条件的村庄，请尝试切换匹配方式或更换关键词。
            </div>
          )}
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
