import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const useVillageFacetsQueryMock = vi.fn(() => ({
  data: {
    cities: ['肇庆市'],
    dialectGroups: ['德庆话', '广宁话'],
    economies: ['种植砂糖橘', '外出务工'],
    ethnicities: ['汉族', '壮族'],
    timelineRange: { max: 1912, min: 1500 },
    towns: ['高良镇', '白土镇'],
  },
  isLoading: false,
}));

const useVillagesQueryMock = vi.fn((params?: unknown) => ({
  data: [
    {
      city: '肇庆市',
      dialectGroup: '德庆话',
      economy: '种植砂糖橘',
      ethnicity: '汉族',
      geometry: { coordinates: [111.9, 23.1], type: 'Point' },
      name: '平治村',
      primaryId: 'vlg-fb354cdb',
      raw: {
        位置: '位于高良镇中部',
        归属市: '肇庆市',
        归属镇: '高良镇',
        村名: '平治村',
        村名来源: '因平安而得名',
        村居民使用语言情况: '通用粤方言德庆话',
        村经济情况: '种植砂糖橘',
        居民民族: '汉族',
      },
      searchText: '肇庆市 高良镇 平治村 汉族 种植砂糖橘',
      timeline: { rawLabel: '明代', sortYear: 1500 },
      town: '高良镇',
    },
  ],
  isLoading: false,
}));

vi.mock('@/entities/village/api/hooks', () => ({
  useVillageFacetsQuery: () => useVillageFacetsQueryMock(),
  useVillagesQuery: (params: unknown) => useVillagesQueryMock(params),
}));

import { App } from '@/app/App';

function setOrientation(portrait: boolean) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: portrait ? 768 : 1280,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: portrait ? 1280 : 768,
  });

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) =>
      ({
        addEventListener: () => undefined,
        addListener: () => undefined,
        dispatchEvent: () => false,
        matches: query.includes('portrait') ? portrait : !portrait,
        media: query,
        onchange: null,
        removeEventListener: () => undefined,
        removeListener: () => undefined,
      }) as unknown as MediaQueryList,
  });
}

describe('MapPage layout', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/map');
    useVillageFacetsQueryMock.mockClear();
    useVillagesQueryMock.mockClear();
  });

  test('switches to the portrait drawer layout', () => {
    setOrientation(true);

    render(<App />);

    expect(screen.getByRole('tab', { name: '村庄检索' })).toBeInTheDocument();
    expect(screen.getByTestId('map-portrait-layout')).toBeInTheDocument();
    expect(screen.getByTestId('map-drawer')).toBeInTheDocument();
    expect(screen.queryByTestId('map-landscape-sidebar')).not.toBeInTheDocument();
  });

  test('keeps an invalid primaryId visible as an invalid selection instead of silently swapping villages', () => {
    setOrientation(true);
    window.history.pushState({}, '', '/map?primaryId=vlg-missing');

    render(<App />);

    expect(screen.getByText('当前 URL 中的 primaryId 不在筛选结果里，请重新选择村庄。')).toBeInTheDocument();
  });

  test('pushes browser history entries when switching map mode', () => {
    setOrientation(true);
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    render(<App />);
    pushStateSpy.mockClear();

    fireEvent.click(screen.getByRole('tab', { name: '方言分布' }));

    expect(window.location.search).toContain('mode=dialect');
    expect(pushStateSpy).toHaveBeenCalled();
  });

  test('pushes discrete filter changes but replaces free-text search history', () => {
    setOrientation(true);
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    render(<App />);
    pushStateSpy.mockClear();
    replaceStateSpy.mockClear();

    fireEvent.change(screen.getByLabelText('归属市'), {
      target: { value: '肇庆市' },
    });

    expect(window.location.search).toContain('city=%E8%82%87%E5%BA%86%E5%B8%82');
    expect(pushStateSpy).toHaveBeenCalled();

    pushStateSpy.mockClear();
    replaceStateSpy.mockClear();

    fireEvent.change(screen.getByLabelText('关键词检索'), {
      target: { value: '平治村' },
    });

    expect(window.location.search).toContain('q=%E5%B9%B3%E6%B2%BB%E6%9D%91');
    expect(replaceStateSpy).toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  test('restores ethnicity and economy filters from URL and passes them into villages query', () => {
    setOrientation(true);
    window.history.pushState(
      {},
      '',
      '/map?city=%E8%82%87%E5%BA%86%E5%B8%82&town=%E9%AB%98%E8%89%AF%E9%95%87&q=%E5%B9%B3%E6%B2%BB%E6%9D%91&ethnicity=%E6%B1%89%E6%97%8F&economy=%E7%A7%8D%E6%A4%8D%E7%A0%82%E7%B3%96%E6%A9%98',
    );

    render(<App />);

    expect(screen.getByLabelText('归属市')).toHaveValue('肇庆市');
    expect(screen.getByLabelText('归属镇')).toHaveValue('高良镇');
    expect(screen.getByLabelText('关键词检索')).toHaveValue('平治村');
    expect(screen.getByLabelText('居民民族')).toHaveValue('汉族');
    expect(screen.getByLabelText('经济情况')).toHaveValue('种植砂糖橘');
    expect(useVillagesQueryMock).toHaveBeenLastCalledWith({
      city: '肇庆市',
      dialectGroup: undefined,
      economy: '种植砂糖橘',
      ethnicity: '汉族',
      q: '平治村',
      timelineEnd: null,
      town: '高良镇',
    });
  });

  test('clears primaryId when ethnicity filter changes', () => {
    setOrientation(true);
    window.history.pushState({}, '', '/map?primaryId=vlg-fb354cdb');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    render(<App />);
    pushStateSpy.mockClear();

    fireEvent.change(screen.getByLabelText('居民民族'), {
      target: { value: '汉族' },
    });

    expect(window.location.search).toContain('ethnicity=%E6%B1%89%E6%97%8F');
    expect(window.location.search).not.toContain('primaryId=');
    expect(pushStateSpy).toHaveBeenCalled();
  });
});
