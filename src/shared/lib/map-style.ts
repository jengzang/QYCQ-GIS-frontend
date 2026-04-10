import type { StyleSpecification } from 'maplibre-gl';

export function getMapStyle(styleUrl: string | null): string | StyleSpecification {
  if (styleUrl) {
    return styleUrl;
  }

  return {
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    layers: [
      {
        id: 'background',
        paint: {
          'background-color': '#eff6ff',
        },
        type: 'background',
      },
    ],
    name: 'qycq-fallback',
    sources: {},
    version: 8,
  };
}
