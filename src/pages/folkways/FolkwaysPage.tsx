import { Link } from 'react-router-dom';

import { useVillagesQuery } from '@/entities/village/api/hooks';
import { folkwaysHighlights, folkwaysPageCopy } from '@/shared/lib/demo-content';
import { useOrientationMode } from '@/shared/lib/orientation';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import { PageHero } from '@/shared/ui/PageHero';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

function buildPeopleEconomyText(ethnicity?: string, economy?: string) {
  const parts = [ethnicity, economy].filter(Boolean);
  return parts.length ? parts.join(' / ') : '民族与经济信息待补充';
}

export function FolkwaysPage() {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';
  const { data: villages = [] } = useVillagesQuery({});
  const folkwayField = villageFieldMapping.highlightFields.folkways;
  const folkwayVillages = villages.filter((village) => village.raw[folkwayField]);
  const featuredVillages = folkwayVillages.slice(0, 6);
  const ethnicityCount = new Set(folkwayVillages.map((village) => village.ethnicity).filter(Boolean)).size;

  return (
    <SiteShell>
      <div className="grid gap-4">
        <PageHero
          description={folkwaysPageCopy.description}
          eyebrow={folkwaysPageCopy.eyebrow}
          metrics={[
            { hint: '具有民俗相关正文的村庄数量。', label: '民俗村落', value: String(folkwayVillages.length) },
            { hint: '当前页面中可见的民族线索数量。', label: '民族线索', value: String(ethnicityCount) },
          ]}
          title={folkwaysPageCopy.title}
        />

        <SurfaceCard title="栏目导语" description="从村俗、民居与地方产品切入，浏览具有代表性的村落文化内容。" eyebrow="Column intro">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'].join(' ')}>
            <div className="rounded-[1.5rem] border border-[color:var(--color-border-subtle)] bg-white/84 p-5">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">通过村落日常与风物线索了解地方文化</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">这里汇集节庆活动、传统民居与地方产品等信息，并结合民族与经济线索，帮助快速浏览各地村落的生活风貌。</p>
            </div>
            <div className="rounded-[1.5rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-soft)] p-5">
              <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">浏览提示</p>
              <ul className="mt-3 space-y-2.5 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                <li>先从栏目内容了解不同村落的民俗侧重点。</li>
                <li>再进入精选村庄，对照具体村落信息继续查看。</li>
                <li>需要定位位置时，可直接跳转到地图页。</li>
              </ul>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="民俗内容" description="把当前可见的村落文化信息整理成几组便于浏览的线索。" eyebrow="Cultural themes">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {folkwaysHighlights.map((card) => (
              <div key={card.title} className="rounded-[1.45rem] border border-[color:var(--color-border-subtle)] bg-white/86 p-5">
                <p className="text-sm font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)]">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{card.description}</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                  {card.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-primary)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="精选村庄" description="页面展示 6 个村庄样本，指标仍按全量口径统计。" eyebrow="Featured villages">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {featuredVillages.map((village) => (
              <Link
                key={village.primaryId}
                className="rounded-[1.6rem] border border-[color:var(--color-border-subtle)] bg-white/88 p-5 transition hover:-translate-y-0.5 hover:bg-white"
                to={`${routeMapping.map}?${queryParamMapping.mode}=search&${queryParamMapping.primaryId}=${village.primaryId}`}
              >
                <p className="text-sm font-semibold text-[color:var(--color-primary-strong)]">{village.name}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{village.city || '城市未填'} · {village.town || '乡镇未填'}</p>
                <p className="mt-2 text-xs leading-5 text-[color:var(--color-text-secondary)]">{buildPeopleEconomyText(village.ethnicity, village.economy)}</p>
                <p className="mt-3 line-clamp-5 text-sm leading-7 text-[color:var(--color-text-secondary)]">{village.raw[folkwayField]}</p>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
