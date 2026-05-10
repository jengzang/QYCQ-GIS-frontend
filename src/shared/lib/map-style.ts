import type { StyleSpecification } from 'maplibre-gl';

interface RasterMapStyleDefinition {
  kind: 'raster';
  label: string;
  tileSize?: number;
  tiles: string[];
  maxzoom?: number;
  minzoom?: number;
}

interface HostedMapStyleDefinition {
  kind: 'hosted';
  label: string;
  url: string;
}

type MapStyleDefinition = RasterMapStyleDefinition | HostedMapStyleDefinition;

const fallbackGlyphs = 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf';
const tiandituToken = '9a516b0f2a8179bb68f73172cff4bd22';

const mapStyleRegistry = {
  gaode: {
    kind: 'raster',
    label: '高德地图',
    tiles: ['https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'],
  },
  gaode_satellite: {
    kind: 'raster',
    label: '高德卫星图',
    tiles: ['https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'],
  },
  tianditu: {
    kind: 'raster',
    label: '天地图',
    tiles: [
      `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituToken}`,
    ],
  },
  tianditu_img: {
    kind: 'raster',
    label: '天地图卫星图',
    tiles: [
      `https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tiandituToken}`,
    ],
  },
  stadiamaps: {
    kind: 'hosted',
    label: 'Stadia Maps',
    url: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
  },
  arcgis: {
    kind: 'raster',
    label: 'ArcGIS 街道图',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'],
  },
  arcgis_light_gray: {
    kind: 'raster',
    label: 'ArcGIS 灰底图',
    tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
  },
  arcgis_satellite: {
    kind: 'raster',
    label: 'ArcGIS 卫星图',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
  },
  opentopomap: {
    kind: 'raster',
    label: 'OpenTopoMap 地形图',
    tiles: ['https://c.tile.opentopomap.org/{z}/{x}/{y}.png'],
  },
} satisfies Record<string, MapStyleDefinition>;

type RegistryMapStyleKey = keyof typeof mapStyleRegistry;

export const runtimeMapStyleKey = 'runtime';
export type MapStyleKey = RegistryMapStyleKey | typeof runtimeMapStyleKey;

export const mapStyleStorageKey = 'qycq-map-style';
export const defaultMapStyleKey: MapStyleKey = 'gaode';

function buildRasterStyle(styleKey: RegistryMapStyleKey, styleDefinition: RasterMapStyleDefinition): StyleSpecification {
  return {
    glyphs: fallbackGlyphs,
    layers: [
      {
        id: `${styleKey}-layer`,
        paint: {
          'raster-opacity': 1,
        },
        source: styleKey,
        type: 'raster',
      },
    ],
    name: styleKey,
    sources: {
      [styleKey]: {
        maxzoom: styleDefinition.maxzoom ?? 18,
        minzoom: styleDefinition.minzoom ?? 0,
        tileSize: styleDefinition.tileSize ?? 256,
        tiles: styleDefinition.tiles,
        type: 'raster',
      },
    },
    version: 8,
  };
}

export function isMapStyleKey(value: string | null | undefined): value is MapStyleKey {
  return value === runtimeMapStyleKey || (typeof value === 'string' && value in mapStyleRegistry);
}

export const mapStyleOptions = (Object.entries(mapStyleRegistry) as Array<[RegistryMapStyleKey, MapStyleDefinition]>).map(
  ([key, definition]) => ({
    key,
    label: definition.label,
  }),
);

export function getAvailableMapStyleOptions(runtimeStyleUrl?: string | null) {
  return runtimeStyleUrl
    ? [{ key: runtimeMapStyleKey as MapStyleKey, label: '项目指定底图' }, ...mapStyleOptions]
    : mapStyleOptions;
}

export function getMapStyleLabel(styleKey: MapStyleKey): string {
  if (styleKey === runtimeMapStyleKey) {
    return '项目指定底图';
  }

  return mapStyleRegistry[styleKey].label;
}

export function resolveMapStyleKey(value: string | null | undefined): MapStyleKey {
  return isMapStyleKey(value) ? value : defaultMapStyleKey;
}

export function resolveAvailableMapStyleKey(
  value: string | null | undefined,
  runtimeStyleUrl?: string | null,
  fallbackStyleKey: MapStyleKey = defaultMapStyleKey,
): MapStyleKey {
  const resolvedStyleKey = resolveMapStyleKey(value);

  if (resolvedStyleKey === runtimeMapStyleKey && !runtimeStyleUrl?.trim()) {
    return fallbackStyleKey === runtimeMapStyleKey ? defaultMapStyleKey : fallbackStyleKey;
  }

  return resolvedStyleKey;
}

export function getMapStyle(styleKey: MapStyleKey, runtimeStyleUrl?: string | null): string | StyleSpecification {
  if (styleKey === runtimeMapStyleKey) {
    return runtimeStyleUrl?.trim() || buildRasterStyle('gaode', mapStyleRegistry.gaode);
  }

  const styleDefinition = mapStyleRegistry[styleKey];

  if (styleDefinition.kind === 'hosted') {
    return styleDefinition.url;
  }

  return buildRasterStyle(styleKey, styleDefinition);
}
