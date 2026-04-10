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

    const result = await repository.list({ q: '平治' });

    expect(fetchMock).toHaveBeenCalledWith('/mock/villages.json');
    expect(result[0]?.primaryId).toBe('vlg-fb354cdb');
    expect(result[0]?.dialectGroup).toBe('德庆话');
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
});

