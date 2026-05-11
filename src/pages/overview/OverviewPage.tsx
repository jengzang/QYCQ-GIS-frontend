import { Link } from 'react-router-dom';

import { useVillageFacetsQuery, useVillagesQuery } from '@/entities/village/api/hooks';
import { overviewCards, overviewPageCopy } from '@/shared/lib/demo-content';
import { useOrientationMode } from '@/shared/lib/orientation';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { PageHero } from '@/shared/ui/PageHero';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';
import { OverviewMapSection } from '@/widgets/map/OverviewMapSection';

const overviewEntryCards = [
  {
    description: '从地图中检索村庄、切换源流迁徙与方言分布模式，查看不同地理线索。',
    href: routeMapping.map,
    label: '进入村庄地图',
    title: '村庄地图',
  },
  {
    description: '浏览村俗、传统民居与地方产品，了解村落生活风貌。',
    href: routeMapping.folkways,
    label: '查看特色民俗',
    title: '特色民俗',
  },
  {
    description: '从村名来源、地理特征与历史记忆切入，查看各地命名线索。',
    href: routeMapping.toponymy,
    label: '查看村名地理',
    title: '村名地理',
  },
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
              hint: '可用于查看方言分布的分组数量。',
              label: '方言分组',
              value: String(facets?.dialectGroups.length ?? 0),
            },
          ]}
          title={overviewPageCopy.title}
        >
          <div className={['gap-3', isPortrait ? 'grid' : 'flex flex-wrap items-center'].join(' ')}>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary-strong)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-92"
              to={routeMapping.map}
            >
              进入村庄地图
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white/86 px-5 py-3 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:bg-white"
              to={routeMapping.folkways}
            >
              查看特色民俗
            </Link>
          </div>
        </PageHero>

        <SurfaceCard title="栏目导览" description="从首页进入地图与专题栏目，按不同主题浏览广东村落信息。">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {overviewEntryCards.map((card) => (
              <Link
                key={card.title}
                className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-white/86 p-5 transition hover:-translate-y-0.5 hover:bg-white"
                to={card.href}
              >
                <p className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">{card.description}</p>
                <span className="mt-5 inline-flex text-sm font-medium text-[color:var(--color-primary-strong)]">{card.label}</span>
              </Link>
            ))}
          </div>
        </SurfaceCard>

        <OverviewMapSection villages={villages} />

        <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
          {overviewCards.map((card) => (
            <SurfaceCard key={card.title} description={card.description} title={card.title}>
              <ul className="space-y-2.5 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-primary)]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          ))}
        </div>

        <SurfaceCard
          title="代表村落"
          description="以下样本来自当前村庄数据，可直接进入地图继续查看对应村庄的位置与相关信息。"
        >
          <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {villages.slice(0, 3).map((village) => (
              <Link
                key={village.primaryId}
                className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-white/88 p-4 transition hover:-translate-y-0.5 hover:bg-white"
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
      </div>
    </SiteShell>
  );
}
