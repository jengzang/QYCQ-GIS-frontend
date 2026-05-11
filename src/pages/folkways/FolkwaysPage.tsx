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
  analyzeFolkwayVillages,
  buildFolkwayThemes,
  getDefaultFolkwayTheme,
  type FolkwayThemeKey,
} from './lib/folkway-analysis';

function highlightKeywords(text: string, keywords: string[]) {
  const activeKeyword = keywords.find((keyword) => text.includes(keyword));
  if (!activeKeyword) {
    return text;
  }

  const segments = text.split(activeKeyword);
  return segments.flatMap((segment, index) => {
    const nodes: Array<string | ReactNode> = [segment];
    if (index < segments.length - 1) {
      nodes.push(
        <mark
          key={`${text}-${activeKeyword}-${index}`}
          className="rounded bg-[color:var(--color-primary-soft)] px-1 text-[color:var(--color-primary-strong)]"
        >
          {activeKeyword}
        </mark>,
      );
    }

    return nodes;
  });
}

export function FolkwaysPage() {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';
  const { data: villages = [] } = useVillagesQuery({});
  const folkwayField = villageFieldMapping.highlightFields.folkways;
  const folkwayVillages = useMemo(
    () => villages.filter((village) => Boolean(village.raw[folkwayField])),
    [folkwayField, villages],
  );
  const themes = useMemo(() => buildFolkwayThemes(folkwayVillages, folkwayField), [folkwayField, folkwayVillages]);
  const [activeThemeKey, setActiveThemeKey] = useState<FolkwayThemeKey>('festival');

  useEffect(() => {
    if (!themes.some((theme) => theme.key === activeThemeKey && theme.count > 0)) {
      setActiveThemeKey(getDefaultFolkwayTheme(themes));
    }
  }, [activeThemeKey, themes]);

  const activeTheme = themes.find((theme) => theme.key === activeThemeKey) ?? themes[0];
  const analysis = useMemo(() => analyzeFolkwayVillages(folkwayVillages, folkwayField, activeThemeKey), [activeThemeKey, folkwayField, folkwayVillages]);

  return (
    <SiteShell>
      <div className="grid gap-4">
        <SurfaceCard
          title="特色民俗"
          description="按主题浏览广东村落的节庆、民居、物产与生活方式线索，快速定位最有代表性的村庄内容。"
        >
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]'].join(' ')}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {themes.map((theme) => {
                const isActive = theme.key === activeThemeKey;
                return (
                  <button
                    key={theme.key}
                    className={[
                      'rounded-[1.45rem] border p-4 text-left transition',
                      isActive
                        ? 'border-[color:var(--color-border-strong)] bg-[color:var(--color-primary-soft)]'
                        : 'border-[color:var(--color-border-subtle)] bg-white/86 hover:bg-white',
                    ].join(' ')}
                    onClick={() => setActiveThemeKey(theme.key)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">{theme.label}</p>
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[color:var(--color-primary-strong)]">{theme.count}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{theme.description}</p>
                    <p className="mt-3 text-xs leading-6 text-[color:var(--color-text-tertiary)]">关键词：{theme.keywords.slice(0, 4).join(' / ')}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-soft)] p-4">
              <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">当前主题</p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">{activeTheme?.label ?? '节庆仪式'}</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">{activeTheme?.summaryTemplate ?? '从主题切换中浏览村落文化样本。'}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[1.15rem] bg-white/90 p-3">
                  <p className="text-xs text-[color:var(--color-text-tertiary)]">命中村庄</p>
                  <p className="mt-2 text-xl font-semibold text-[color:var(--color-text-primary)]">{analysis.villages.length}</p>
                </div>
                <div className="rounded-[1.15rem] bg-white/90 p-3">
                  <p className="text-xs text-[color:var(--color-text-tertiary)]">高频关键词</p>
                  <p className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                    {analysis.leadingKeywords.length ? analysis.leadingKeywords.join(' / ') : '暂无'}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-6 text-[color:var(--color-text-tertiary)]">当前主题下的村庄卡片可直接跳转地图页，继续对照空间位置。</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="主题结果"
          description={
            activeTheme
              ? `按“${activeTheme.label}”聚合当前可见村庄内容，优先展示与主题关键词最相关的民俗片段。`
              : '按主题聚合当前可见村庄内容。'
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
                      <p className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">{village.name}</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                        {village.city || '城市未填'} · {village.town || '乡镇未填'}
                      </p>
                    </div>
                    <span className="rounded-full bg-[color:var(--color-primary-soft)] px-3 py-1 text-xs font-medium text-[color:var(--color-primary-strong)]">
                      {activeTheme?.label ?? '主题'}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">{highlightKeywords(village.excerpt, village.matchedKeywords)}</p>
                  <p className="mt-3 text-xs leading-6 text-[color:var(--color-text-tertiary)]">命中关键词：{village.matchedKeywords.join(' / ')}</p>
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
              当前主题下暂无可提取的民俗内容，请切换其他主题继续浏览。
            </div>
          )}
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
