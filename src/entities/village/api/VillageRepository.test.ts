import { createVillageRepository } from '@/entities/village/api/VillageRepository';
import { getRuntimeConfig } from '@/shared/config/runtime';

describe('createVillageRepository', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('loads mock villages and adapts primaryid into primaryId', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => [
        {
          city: '肇庆市',
          geometry: { coordinates: [111.9, 23.1], type: 'Point' },
          name: '平治村',
          primaryid: 'vlg-fb354cdb',
          raw: {
            建村时间: '明代',
            归属市: '肇庆市',
            归属镇: '高良镇',
            村名: '平治村',
            村居民使用语言情况: '通用粤方言德庆话',
            村经济情况: '种植砂糖橘',
            居民民族: '汉族',
          },
          town: '高良镇',
        },
      ],
      ok: true,
    });

    const repository = createVillageRepository(
      getRuntimeConfig({
        VITE_DATA_MODE: 'mock',
      }),
    );

    const result = await repository.list({ economy: '种植砂糖橘', ethnicity: '汉族', q: '平治' });

    expect(fetchMock).toHaveBeenCalledWith('/mock/villages.json');
    expect(result[0]?.primaryId).toBe('vlg-fb354cdb');
    expect(result[0]?.dialectGroup).toBe('德庆话');
    expect(result[0]?.ethnicity).toBe('汉族');
    expect(result[0]?.economy).toBe('种植砂糖橘');
  });

  test('normalizes missing facet arrays to empty arrays', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        cities: ['肇庆市'],
        dialectGroups: ['德庆话'],
        timelineRange: { max: 1912, min: 1500 },
        towns: ['高良镇'],
      }),
      ok: true,
    });

    const repository = createVillageRepository(
      getRuntimeConfig({
        VITE_DATA_MODE: 'mock',
      }),
    );

    await expect(repository.getFacets()).resolves.toEqual({
      cities: ['肇庆市'],
      dialectGroups: ['德庆话'],
      economies: [],
      ethnicities: [],
      timelineRange: { max: 1912, min: 1500 },
      towns: ['高良镇'],
    });
  });

  test('builds API detail requests with the primaryId in the path', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        city: '肇庆市',
        geometry: { coordinates: [111.9, 23.1], type: 'Point' },
        name: '平治村',
        primaryid: 'vlg-fb354cdb',
        raw: {
          建村时间: '明代',
          归属市: '肇庆市',
          归属镇: '高良镇',
          村名: '平治村',
        },
        town: '高良镇',
      }),
      ok: true,
    });

    const repository = createVillageRepository(
      getRuntimeConfig({
        VITE_API_BASE_URL: 'http://localhost:8080',
        VITE_DATA_MODE: 'api',
      }),
    );

    const result = await repository.getByPrimaryId('vlg-fb354cdb');

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/v1/villages/vlg-fb354cdb');
    expect(result?.primaryId).toBe('vlg-fb354cdb');
  });

  test('builds API list requests with ethnicity and economy query params', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => [],
      ok: true,
    });

    const repository = createVillageRepository(
      getRuntimeConfig({
        VITE_API_BASE_URL: 'http://localhost:8080',
        VITE_DATA_MODE: 'api',
      }),
    );

    await repository.list({
      city: '肇庆市',
      economy: '种植砂糖橘',
      ethnicity: '汉族',
      q: '平治',
      timelineEnd: 1600,
      town: '高良镇',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/villages?q=%E5%B9%B3%E6%B2%BB&city=%E8%82%87%E5%BA%86%E5%B8%82&town=%E9%AB%98%E8%89%AF%E9%95%87&ethnicity=%E6%B1%89%E6%97%8F&economy=%E7%A7%8D%E6%A4%8D%E7%A0%82%E7%B3%96%E6%A9%98&timelineEnd=1600',
    );
  });
});

