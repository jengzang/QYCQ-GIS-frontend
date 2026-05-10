import { createVillageRepository } from '@/entities/village/api/VillageRepository';
import { getRuntimeConfig } from '@/shared/config/runtime';

describe('mock facet quality', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('keeps economy and ethnicity facets concise enough for select filters in mock mode', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        cities: ['肇庆市', '云浮市'],
        dialectGroups: ['德庆话'],
        economies: [' 水果种植 ', '外出务工', '茶叶种植', '水果种植'],
        ethnicities: ['汉族', '客家民系', '瑶族', '汉族'],
        timelineRange: { max: 1700, min: 1500 },
        towns: ['高良镇', '双合镇'],
      }),
      ok: true,
    });

    const repository = createVillageRepository(
      getRuntimeConfig({
        VITE_DATA_MODE: 'mock',
      }),
    );

    const facets = await repository.getFacets();

    expect(facets.economies).toEqual(['茶叶种植', '水果种植', '外出务工']);
    expect(facets.ethnicities).toEqual(['汉族', '客家民系', '瑶族']);
    expect(facets.economies.every((item) => item.length <= 12)).toBe(true);
  });
});
