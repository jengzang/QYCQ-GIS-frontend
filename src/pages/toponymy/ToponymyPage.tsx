import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useVillagesQuery } from '@/entities/village/api/hooks';
import { useOrientationMode } from '@/shared/lib/orientation';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

import {
  analyzeToponymyVillages,
  getDefaultToponymyKeyword,
  getToponymyQuickChars,
  normalizeToponymyKeyword,
  toponymySemanticOptions,
  type ToponymyMatchType,
  type ToponymySemanticCategory,
} from './lib/toponymy-analysis';

const matchTypeOptions: Array<{ description: string; key: ToponymyMatchType; label: string }> = [
  { description: '村名以关键词开头，如“高车村”。', key: 'prefix', label: '前缀' },
  { description: '村名以关键词结尾，如“石高”。', key: 'suffix', label: '后缀' },
  { description: '村名任意位置出现关键词。', key: 'contains', label: '包含' },
];

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
                  className="rounded-[1.55rem] border border-[color:var(--color-border-subtle)] bg-white/88 p-5"
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
                  <p className="mt-3 text-xs leading-6 text-[color:var(--color-text-tertiary)]">判读依据：{village.reason}</p>
                  <Link
                    className="mt-4 inline-flex rounded-full bg-[color:var(--color-primary-strong)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-92"
                    to={`${routeMapping.map}?${queryParamMapping.mode}=search&${queryParamMapping.primaryId}=${village.primaryId}`}
                  >
                    去地图查看
                  </Link>
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
