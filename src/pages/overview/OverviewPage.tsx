import { Link } from 'react-router-dom';

import { useVillageFacetsQuery, useVillagesQuery } from '@/entities/village/api/hooks';
import { overviewPageCopy } from '@/shared/lib/demo-content';
import { useOrientationMode } from '@/shared/lib/orientation';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { PageHero } from '@/shared/ui/PageHero';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';
import { buttonClassName } from '@/shared/ui/button-style';
import { OverviewMapSection } from '@/widgets/map/OverviewMapSection';

const overviewEntryCards = [
  {
    description: '看村庄分布、切换方言分布与源流迁徙模式，并继续进入详情。',
    href: routeMapping.map,
    label: '进入地图',
    title: '村庄地图',
  },
  {
    description: '按村俗、传统民居和地方产品浏览村落生活风貌。',
    href: routeMapping.folkways,
    label: '查看民俗',
    title: '特色民俗',
  },
  {
    description: '从村名来源、地理特征和历史记忆理解地方命名线索。',
    href: routeMapping.toponymy,
    label: '查看村名',
    title: '村名地理',
  },
] as const;

const overviewHighlights = [
  '围绕广东村落分布、聚落信息与文化线索组织内容。',
  '首页可快速进入地图、民俗与村名地理三类核心浏览路径。',
  '地图与专题栏目通过同一批村庄数据互相联通，便于连续阅读。',
] as const;

export function OverviewPage() {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';
  const { data: villages = [] } = useVillagesQuery({});
  const { data: facets } = useVillageFacetsQuery();

  return (
    <SiteShell>
      <div className="grid gap-4">
        <PageHero
          description={overviewPageCopy.description}
          eyebrow={overviewPageCopy.eyebrow}
          metrics={[
            {
              hint: '当前已整理的村庄基础信息。',
              label: '村庄数量',
              value: String(villages.length || 0),
            },
            {
              hint: '当前覆盖到的乡镇范围。',
              label: '乡镇数量',
              value: String(facets?.towns.length ?? 0),
            },
            {
              hint: '当前可切换观察的方言种类数量。',
              label: '方言分布',
              value: String(facets?.dialectGroups.length ?? 0),
            },
          ]}
          title={overviewPageCopy.title}
        >
          <div className={['gap-3', isPortrait ? 'grid' : 'flex flex-wrap items-center'].join(' ')}>
            <Link className={buttonClassName.primaryLarge} to={routeMapping.map}>
              进入村庄地图
            </Link>
            <Link className={buttonClassName.secondaryLarge} to={routeMapping.folkways}>
              查看特色民俗
            </Link>
            <Link className={buttonClassName.secondaryLarge} to={routeMapping.toponymy}>
              查看村名地理
            </Link>
          </div>
        </PageHero>

        <OverviewMapSection villages={villages} />

        <SurfaceCard title="栏目入口" description="先看地图，再按兴趣进入专题内容。">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {overviewEntryCards.map((card) => (
              <Link
                key={card.title}
                className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-subtle-card)] p-5 transition hover:-translate-y-0.5 hover:bg-[color:var(--color-field-bg-strong)]"
                to={card.href}
              >
                <p className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">{card.description}</p>
                <span className="mt-5 inline-flex text-sm font-medium text-[color:var(--color-primary-strong)]">{card.label}</span>
              </Link>
            ))}
          </div>
        </SurfaceCard>

        <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]'].join(' ')}>
          <SurfaceCard title="从这些村落开始" description="可直接进入地图并定位到对应村庄。">
            <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
              {villages.slice(0, 3).map((village) => (
                <Link
                  key={village.primaryId}
                  className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-subtle-card)] p-4 transition hover:-translate-y-0.5 hover:bg-[color:var(--color-field-bg-strong)]"
                  to={`${routeMapping.map}?${queryParamMapping.mode}=search&${queryParamMapping.primaryId}=${village.primaryId}`}
                >
                  <p className="text-sm font-semibold text-[color:var(--color-primary-strong)]">{village.name}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                    {village.city || '城市未填'} · {village.town || '乡镇未填'}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[color:var(--color-text-secondary)]">
                    {village.raw.村名来源 || village.raw.位置 || '进入地图查看该村详情'}
                  </p>
                </Link>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard title="课题说明" description="用最短路径理解这个站点在看什么、怎么用。">
            <ul className="space-y-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              {overviewHighlights.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-primary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        </div>
      </div>
    </SiteShell>
  );
}
