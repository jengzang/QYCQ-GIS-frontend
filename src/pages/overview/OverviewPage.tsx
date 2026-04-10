import { Link } from 'react-router-dom';

import { useVillageFacetsQuery, useVillagesQuery } from '@/entities/village/api/hooks';
import { useOrientationMode } from '@/shared/lib/orientation';
import { PageHero } from '@/shared/ui/PageHero';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';
import { overviewCards, overviewPageCopy } from '@/shared/lib/demo-content';

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
              hint: '当前已导入的村庄总量。',
              label: '村庄数量',
              value: String(villages.length || 0),
            },
            {
              hint: '覆盖到的乡镇数量。',
              label: '乡镇数量',
              value: String(facets?.towns.length ?? 0),
            },
            {
              hint: '当前已识别的方言分组。',
              label: '方言分组',
              value: String(facets?.dialectGroups.length ?? 0),
            },
          ]}
          title={overviewPageCopy.title}
        >
          <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {overviewCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white/80 p-4"
              >
                <p className="text-sm font-semibold text-[color:var(--color-primary-strong)]">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </PageHero>

        <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
          {overviewCards.map((card) => (
            <SurfaceCard
              key={card.title}
              description={card.description}
              title={card.title}
            >
              <ul className="space-y-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-primary)]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          ))}
        </div>

        <SurfaceCard
          title="演示节奏"
          description="领导看 demo 时，先讲目标，再讲地图，最后讲数据口径，整条路径尽量短。"
        >
          <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {['先看项目目标和地图结构。', '再切换村庄地图的三种模式。', '最后通过 primaryId 说明后端对接边界。'].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white/75 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-secondary)]">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{step}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="数据快照"
          description="这里直接从 mock 数据中抽取样本，证明页面已经不是静态稿。"
        >
          <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {villages.slice(0, 3).map((village) => (
              <Link
                key={village.primaryId}
                className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white/80 p-4 transition hover:-translate-y-0.5 hover:bg-white"
                to={`${routeMapping.map}?${queryParamMapping.mode}=search&${queryParamMapping.primaryId}=${village.primaryId}`}
              >
                <p className="text-sm font-semibold text-[color:var(--color-primary-strong)]">{village.name}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                  {village.city || '城市未填'} · {village.town || '乡镇未填'}
                </p>
                <p className="mt-2 text-xs leading-5 text-[color:var(--color-text-secondary)]">
                  {village.raw.村名来源 || village.raw.位置 || '查看该村详情'}
                </p>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
