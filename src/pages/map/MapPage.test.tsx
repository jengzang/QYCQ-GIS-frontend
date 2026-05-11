import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const useVillageFacetsQueryMock = vi.fn(() => ({
  data: {
    cities: ['肇庆市', '云浮市'],
    dialectGroups: ['德庆话', '广宁话'],
    economies: ['种植砂糖橘', '外出务工'],
    ethnicities: ['汉族', '壮族'],
    timelineRange: { max: 1912, min: 1500 },
    towns: ['高良镇', '白土镇', '河口镇'],
  },
  isLoading: false,
}));

const mockVillages = [
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
    timeline: { endYear: 1644, precision: 'period', rawLabel: '明代', sortYear: 1368, startYear: 1368 },
    town: '高良镇',
  },
  {
    city: '肇庆市',
    dialectGroup: '广宁话',
    economy: '外出务工',
    ethnicity: '壮族',
    geometry: { coordinates: [112.1, 23.2], type: 'Point' },
    name: '白土村',
    primaryId: 'vlg-baitu',
    raw: {
      位置: '位于白土镇北部',
      归属市: '肇庆市',
      归属镇: '白土镇',
      村名: '白土村',
      村名来源: '因白色土壤而得名',
      村居民使用语言情况: '通用粤方言广宁话',
      村经济情况: '外出务工',
      居民民族: '壮族',
    },
    searchText: '肇庆市 白土镇 白土村 壮族 外出务工',
    timeline: { endYear: 1911, precision: 'period', rawLabel: '清代', sortYear: 1644, startYear: 1644 },
    town: '白土镇',
  },
  {
    city: '云浮市',
    dialectGroup: '德庆话',
    economy: '外出务工',
    ethnicity: '汉族',
    geometry: { coordinates: [111.4, 22.9], type: 'Point' },
    name: '河口村',
    primaryId: 'vlg-hekou',
    raw: {
      位置: '位于河口镇东侧',
      归属市: '云浮市',
      归属镇: '河口镇',
      村名: '河口村',
      村名来源: '位于河口而得名',
      村居民使用语言情况: '通用粤方言德庆话',
      村经济情况: '外出务工',
      居民民族: '汉族',
    },
    searchText: '云浮市 河口镇 河口村 汉族 外出务工',
    timeline: { endYear: 1949, precision: 'period', rawLabel: '民国', sortYear: 1912, startYear: 1912 },
    town: '河口镇',
  },
  {
    city: '肇庆市',
    dialectGroup: '广宁话',
    economy: '手工业',
    ethnicity: '汉族',
    geometry: { coordinates: [112.0, 23.3], type: 'Point' },
    name: '跨段村',
    primaryId: 'vlg-range',
    raw: {
      位置: '位于白土镇南侧',
      归属市: '肇庆市',
      归属镇: '白土镇',
      村名: '跨段村',
      村名来源: '因跨涧道路得名',
      村居民使用语言情况: '通用粤方言广宁话',
      村经济情况: '手工业',
      居民民族: '汉族',
    },
    searchText: '肇庆市 白土镇 跨段村 汉族 手工业',
    timeline: { endYear: 1610, precision: 'range', rawLabel: '1590—1610年', sortYear: 1605, startYear: 1590 },
    town: '白土镇',
  },
];

const matchesTimelineEnd = (
  timeline: { endYear?: number | null; sortYear: number | null; startYear?: number | null },
  timelineEnd?: number | null,
) => {
  if (timelineEnd === undefined || timelineEnd === null) {
    return true;
  }

  const rangeStart = timeline.startYear ?? timeline.sortYear ?? timeline.endYear ?? null;
  const rangeEnd = timeline.endYear ?? timeline.sortYear ?? timeline.startYear ?? null;

  if (rangeStart === null && rangeEnd === null) {
    return true;
  }

  if (rangeStart !== null) {
    return rangeStart <= timelineEnd;
  }

  return (rangeEnd ?? timelineEnd) <= timelineEnd;
};

const useVillagesQueryMock = vi.fn(
  (params?: {
    city?: string;
    dialectGroup?: string;
    economy?: string;
    ethnicity?: string;
    fulltext?: boolean;
    q?: string;
    timelineEnd?: number | null;
    town?: string;
  }) => ({
    data: mockVillages.filter((village) => {
      if (params?.city && village.city !== params.city) {
        return false;
      }
      if (params?.town && village.town !== params.town) {
        return false;
      }
      if (params?.q) {
        const candidate = params.fulltext ? village.searchText : village.name;
        if (!candidate.includes(params.q)) {
          return false;
        }
      }
      if (params?.ethnicity && village.ethnicity !== params.ethnicity) {
        return false;
      }
      if (params?.economy && village.economy !== params.economy) {
        return false;
      }
      if (params?.dialectGroup && village.dialectGroup !== params.dialectGroup) {
        return false;
      }
      if (!matchesTimelineEnd(village.timeline, params?.timelineEnd)) {
        return false;
      }

      return true;
    }),
    isLoading: false,
  }),
);

vi.mock('@/entities/village/api/hooks', () => ({
  useVillageFacetsQuery: () => useVillageFacetsQueryMock(),
  useVillagesQuery: (params: Parameters<typeof useVillagesQueryMock>[0]) => useVillagesQueryMock(params),
}));

import { App } from '@/app/App';

function setHashRoute(path: string) {
  window.history.pushState({}, '', `/#${path}`);
}

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
  test('uses a two-column landscape layout instead of the old three-column split', () => {
    setOrientation(false);
    setHashRoute('/map');

    render(<App />);

    expect(screen.getByTestId('map-landscape-layout')).toBeInTheDocument();
    expect(screen.queryByText('运行状态')).not.toBeInTheDocument();
    expect(screen.queryByText('底图来源')).not.toBeInTheDocument();
  });

  beforeEach(() => {
    setHashRoute('/map');
    useVillageFacetsQueryMock.mockClear();
    useVillagesQueryMock.mockClear();
  });

  test('switches to the portrait stacked layout', () => {
    setOrientation(true);

    render(<App />);

    expect(screen.getByRole('tab', { name: '村庄检索' })).toBeInTheDocument();
    expect(screen.getByTestId('map-mode-strip')).toBeInTheDocument();
    expect(screen.getByText('地图模式')).toBeInTheDocument();
    expect(screen.getByText('按地区、民族、经济与关键词查找村庄，再从列表或地图进入详情。')).toBeInTheDocument();
    expect(screen.getByTestId('map-portrait-layout')).toBeInTheDocument();
    expect(screen.getByTestId('map-detail-panel')).toBeInTheDocument();
    expect(screen.queryByText('运行状态')).not.toBeInTheDocument();
    expect(screen.queryByText('底图来源')).not.toBeInTheDocument();
  });

  test('keeps an invalid primaryId visible as an invalid selection instead of silently swapping villages', () => {
    setOrientation(true);
    setHashRoute('/map?primaryId=vlg-missing');

    render(<App />);

    expect(screen.getByText('当前 URL 中的村庄选择已失效，请重新从列表或地图中选择。')).toBeInTheDocument();
  });

  test('pushes browser history entries when switching map mode', () => {
    setOrientation(true);
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    render(<App />);
    pushStateSpy.mockClear();

    fireEvent.click(screen.getByRole('tab', { name: '方言分布' }));

    expect(window.location.hash).toContain('mode=dialect');
    expect(pushStateSpy).toHaveBeenCalled();
    expect(screen.getByText('按方言分组观察村庄空间分布，快速对比不同方言片区。')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '方言分布' })).toHaveAttribute('data-state', 'active');
    expect(screen.getByRole('tab', { name: '村庄检索' })).toHaveAttribute('data-state', 'inactive');
    expect(screen.getByLabelText('民系')).toBeInTheDocument();
    expect(screen.getByLabelText('方言分布')).toBeInTheDocument();
    expect(screen.queryByLabelText('方言分组')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('经济情况')).not.toBeInTheDocument();
  });

  test('pushes discrete filter changes but debounces free-text search before replacing history', () => {
    vi.useFakeTimers();
    try {
      setOrientation(true);
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

      render(<App />);
      pushStateSpy.mockClear();
      replaceStateSpy.mockClear();

      fireEvent.change(screen.getByLabelText('归属市'), {
        target: { value: '肇庆市' },
      });

      expect(window.location.hash).toContain('city=%E8%82%87%E5%BA%86%E5%B8%82');
      expect(pushStateSpy).toHaveBeenCalled();

      pushStateSpy.mockClear();
      replaceStateSpy.mockClear();
      useVillagesQueryMock.mockClear();

      fireEvent.change(screen.getByLabelText('关键词检索'), {
        target: { value: '平治村' },
      });

      expect(window.location.hash).not.toContain('q=%E5%B9%B3%E6%B2%BB%E6%9D%91');
      expect(replaceStateSpy).not.toHaveBeenCalled();
      expect(useVillagesQueryMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ q: '平治村' }),
      );

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(window.location.hash).toContain('q=%E5%B9%B3%E6%B2%BB%E6%9D%91');
      expect(replaceStateSpy).toHaveBeenCalled();
      expect(pushStateSpy).not.toHaveBeenCalled();
      expect(useVillagesQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({ fulltext: false, q: '平治村' }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  test('defaults keyword search to village name and can opt into fulltext mode', () => {
    vi.useFakeTimers();
    try {
      setOrientation(true);

      render(<App />);

      expect(screen.getByPlaceholderText('仅按村名搜索')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /平治村/i })).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('关键词检索'), {
        target: { value: '高良镇' },
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('button', { name: /平治村/i })).not.toBeInTheDocument();
      expect(useVillagesQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({ fulltext: false, q: '高良镇' }),
      );

      fireEvent.click(screen.getByLabelText('全文搜索'));

      expect(window.location.hash).toContain('fulltext=1');
      expect(screen.getByPlaceholderText('按村名、位置、语言搜索')).toBeInTheDocument();
      expect(useVillagesQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({ fulltext: true, q: '高良镇' }),
      );
      expect(screen.getByRole('button', { name: /平治村/i })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  test('does not commit free-text search during IME composition and only searches after composition ends', () => {
    vi.useFakeTimers();
    try {
      setOrientation(true);

      render(<App />);
      const keywordInput = screen.getByLabelText('关键词检索');
      useVillagesQueryMock.mockClear();

      fireEvent.compositionStart(keywordInput);
      fireEvent.change(keywordInput, {
        target: { value: 'p' },
      });

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(window.location.hash).not.toContain('q=');
      expect(useVillagesQueryMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ q: 'p' }),
      );

      fireEvent.compositionEnd(keywordInput, {
        data: '平',
        target: { value: '平' },
      });

      expect(window.location.hash).not.toContain('q=%E5%B9%B3');

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(window.location.hash).toContain('q=%E5%B9%B3');
      expect(useVillagesQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({ q: '平' }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  test('disables town select until a city is chosen, then narrows town options to that city', () => {
    setOrientation(true);

    render(<App />);

    const townSelect = screen.getByLabelText('归属镇');
    expect(townSelect).toBeDisabled();
    expect(screen.getByRole('option', { name: '请先选择归属市' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('归属市'), {
      target: { value: '肇庆市' },
    });

    expect(screen.getByLabelText('归属镇')).not.toBeDisabled();
    expect(screen.getByRole('option', { name: '全部乡镇' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '高良镇' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '白土镇' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '河口镇' })).not.toBeInTheDocument();
  });

  test('clears incompatible town from URL when it does not belong to the chosen city', () => {
    setOrientation(true);
    setHashRoute('/map?city=%E8%82%87%E5%BA%86%E5%B8%82&town=%E6%B2%B3%E5%8F%A3%E9%95%87');

    render(<App />);

    expect(screen.getByLabelText('归属市')).toHaveValue('肇庆市');
    expect(screen.getByLabelText('归属镇')).toHaveValue('');
    expect(window.location.hash).toContain('city=%E8%82%87%E5%BA%86%E5%B8%82');
    expect(window.location.hash).not.toContain('town=');
  });

  test('restores ethnicity and economy filters from URL and passes them into villages query', () => {
    setOrientation(true);
    setHashRoute(
      '/map?city=%E8%82%87%E5%BA%86%E5%B8%82&town=%E9%AB%98%E8%89%AF%E9%95%87&q=%E5%B9%B3%E6%B2%BB%E6%9D%91&ethnicity=%E6%B1%89%E6%97%8F&economy=%E7%A7%8D%E6%A4%8D%E7%A0%82%E7%B3%96%E6%A9%98',
    );

    render(<App />);

    expect(screen.getByLabelText('归属市')).toHaveValue('肇庆市');
    expect(screen.getByLabelText('归属镇')).toHaveValue('高良镇');
    expect(screen.getByLabelText('关键词检索')).toHaveValue('平治村');
    expect(screen.getByLabelText('民系')).toHaveValue('汉族');
    expect(screen.getByLabelText('经济情况')).toHaveValue('种植砂糖橘');
    expect(useVillagesQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        city: '肇庆市',
        dialectGroup: undefined,
        economy: '种植砂糖橘',
        ethnicity: '汉族',
        fulltext: false,
        q: '平治村',
        timelineEnd: null,
        town: '高良镇',
      }),
    );
    expect(useVillagesQueryMock).toHaveBeenCalledWith(expect.objectContaining({ city: '肇庆市' }));
  });

  test('removes economy filter from dialect mode URL and query', () => {
    setOrientation(true);
    setHashRoute('/map?mode=dialect&economy=%E7%A7%8D%E6%A4%8D%E7%A0%82%E7%B3%96%E6%A9%98');

    render(<App />);

    expect(screen.queryByLabelText('经济情况')).not.toBeInTheDocument();
    expect(window.location.hash).toContain('mode=dialect');
    expect(window.location.hash).not.toContain('economy=');
    expect(useVillagesQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        city: undefined,
        dialectGroup: undefined,
        economy: undefined,
        ethnicity: undefined,
        fulltext: false,
        q: undefined,
        timelineEnd: null,
        town: undefined,
      }),
    );
  });

  test('clears primaryId when ethnicity filter changes', () => {
    setOrientation(true);
    setHashRoute('/map?primaryId=vlg-fb354cdb');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    render(<App />);
    pushStateSpy.mockClear();

    fireEvent.change(screen.getByLabelText('民系'), {
      target: { value: '汉族' },
    });

    expect(window.location.hash).toContain('ethnicity=%E6%B1%89%E6%97%8F');
    expect(window.location.hash).not.toContain('primaryId=');
    expect(pushStateSpy).toHaveBeenCalled();
  });

  test('timeline mode ignores persisted keyword/fulltext/ethnicity filters and always targets the full village set under the cutoff', () => {
    setOrientation(true);
    setHashRoute('/map?mode=timeline&year=1600&q=%E9%AB%98%E8%89%AF%E9%95%87&fulltext=1&ethnicity=%E6%B1%89%E6%97%8F');

    render(<App />);

    expect(screen.queryByLabelText('关键词检索')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('全文搜索')).not.toBeInTheDocument();
    expect(useVillagesQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        city: undefined,
        dialectGroup: undefined,
        economy: undefined,
        ethnicity: undefined,
        fulltext: undefined,
        q: undefined,
        timelineEnd: 1600,
        town: undefined,
      }),
    );
    expect(screen.getByRole('button', { name: /平治村/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /跨段村/i })).toBeInTheDocument();
  });

  test('passes timeline mode cutoff into villages query while preserving range-based village matches', () => {
    setOrientation(true);
    setHashRoute('/map?mode=timeline&year=1600');

    render(<App />);

    expect(screen.queryByLabelText('民系')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('经济情况')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('关键词检索')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('全文搜索')).not.toBeInTheDocument();
    expect(screen.getByLabelText('源流迁徙时间轴')).toBeInTheDocument();
    expect(screen.getByText('已展示至 1600 年')).toBeInTheDocument();
    expect(useVillagesQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        city: undefined,
        dialectGroup: undefined,
        economy: undefined,
        ethnicity: undefined,
        fulltext: undefined,
        q: undefined,
        timelineEnd: 1600,
        town: undefined,
      }),
    );
    expect(screen.getByRole('button', { name: /平治村/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /跨段村/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /白土村/i })).not.toBeInTheDocument();
  });

  test('settings page is the only place that changes global map style and theme', () => {
    setOrientation(false);
    window.localStorage.clear();
    setHashRoute('/settings');

    render(<App />);

    fireEvent.change(screen.getByLabelText('主题模式'), {
      target: { value: 'dark' },
    });
    fireEvent.change(screen.getByLabelText('底图方案'), {
      target: { value: 'arcgis_satellite' },
    });

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('qycq-map-theme')).toBe('dark');
    expect(window.localStorage.getItem('qycq-map-style')).toBe('arcgis_satellite');
  });
});
