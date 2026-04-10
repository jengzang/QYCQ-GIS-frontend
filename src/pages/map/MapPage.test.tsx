import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/entities/village/api/hooks', () => ({
  useVillageFacetsQuery: () => ({
    data: {
      cities: ['肇庆市'],
      dialectGroups: ['德庆话', '广宁话'],
      timelineRange: { max: 1912, min: 1500 },
      towns: ['高良镇', '白土镇'],
    },
    isLoading: false,
  }),
  useVillagesQuery: () => ({
    data: [
      {
        city: '肇庆市',
        dialectGroup: '德庆话',
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
        },
        searchText: '肇庆市 高良镇 平治村',
        timeline: { rawLabel: '明代', sortYear: 1500 },
        town: '高良镇',
      },
    ],
    isLoading: false,
  }),
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
});
