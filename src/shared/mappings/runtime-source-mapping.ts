export const runtimeSourceMapping = {
  api: {
    facetsPath: '/api/v1/villages/facets',
    villageDetailPath: '/api/v1/villages',
    villagesPath: '/api/v1/villages',
  },
  mock: {
    facetsPath: 'mock/facets.json',
    villagesPath: 'mock/villages.json',
  },
  profiles: {
    'local-api': {
      dataMode: 'api',
      mode: 'test',
    },
    mock: {
      dataMode: 'mock',
      mode: 'development',
    },
    'remote-api': {
      dataMode: 'api',
      mode: 'serve',
    },
  },
} as const;
