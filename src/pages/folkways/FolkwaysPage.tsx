import { Link } from 'react-router-dom';

import { useVillagesQuery } from '@/entities/village/api/hooks';
import { useOrientationMode } from '@/shared/lib/orientation';
import { folkwaysHighlights, folkwaysPageCopy } from '@/shared/lib/demo-content';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import { PageHero } from '@/shared/ui/PageHero';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

export function FolkwaysPage() {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';
  const { data: villages = [] } = useVillagesQuery({});
  const folkwayField = villageFieldMapping.highlightFields.folkways;
  const featuredVillages = villages.filter((village) => village.raw[folkwayField]).slice(0, 6);

  return (
    <SiteShell>
      <div className="grid gap-4">
        <PageHero
          description={folkwaysPageCopy.description}
          eyebrow={folkwaysPageCopy.eyebrow}
          metrics={[
            {
              hint: '三种故事线都围绕同一村庄键。',
              label: '内容线索',
              value: '3',
            },
            {
              hint: '既能讲民俗，也能回到地图。',
              label: '联动方向',
              value: '双向',
            },
            {
              hint: '先做领导可读的展示卡。',
              label: '展示目标',
              value: '清晰',
            },
          ]}
          title={folkwaysPageCopy.title}
        />

        <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
          {folkwaysHighlights.map((card) => (
            <SurfaceCard key={card.title} description={card.description} title={card.title}>
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
          title="民俗展示框架"
          description="卡片式排版适合把村俗、民居和特色产品拆开讲，也方便后续直接接详情页。"
        >
          <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-4'].join(' ')}>
            {[
              ['村俗', '节庆、仪式与公共记忆。'],
              ['民居', '建筑形制与空间组织。'],
              ['产品', '农特产与手工艺。'],
              ['回链', '每个卡片都可跳回地图看点位。'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white/75 p-4">
                <p className="text-sm font-semibold text-[color:var(--color-primary-strong)]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{text}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
          {featuredVillages.map((village) => (
            <Link
              key={village.primaryId}
              className="rounded-[1.75rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)] p-5 shadow-[0_18px_45px_rgba(34,116,240,0.1)] transition hover:-translate-y-0.5 hover:bg-white"
              to={`${routeMapping.map}?${queryParamMapping.mode}=search&${queryParamMapping.primaryId}=${village.primaryId}`}
            >
              <p className="text-sm font-semibold text-[color:var(--color-primary-strong)]">{village.name}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                {village.city || '城市未填'} · {village.town || '乡镇未填'}
              </p>
              <p className="mt-3 line-clamp-5 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                {village.raw[folkwayField]}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
