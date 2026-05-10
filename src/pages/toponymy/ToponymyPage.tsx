import { Link } from 'react-router-dom';

import { useVillagesQuery } from '@/entities/village/api/hooks';
import { toponymyHighlights, toponymyPageCopy } from '@/shared/lib/demo-content';
import { useOrientationMode } from '@/shared/lib/orientation';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import { PageHero } from '@/shared/ui/PageHero';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

function classifyToponymy(text: string) {
  if (text.includes('山') || text.includes('水') || text.includes('塘') || text.includes('岭')) {
    return '地形命名';
  }
  if (text.includes('姓') || text.includes('祖') || text.includes('迁')) {
    return '族群迁徙';
  }
  return '历史记忆';
}

export function ToponymyPage() {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';
  const { data: villages = [] } = useVillagesQuery({});
  const toponymyField = villageFieldMapping.highlightFields.toponymy;
  const toponymyVillages = villages.filter((village) => village.raw[toponymyField]);
  const featuredVillages = toponymyVillages.slice(0, 6);
  const clueCount = new Set(toponymyVillages.map((village) => classifyToponymy(village.raw[toponymyField] ?? ''))).size;

  return (
    <SiteShell>
      <div className="grid gap-4">
        <PageHero
          description={toponymyPageCopy.description}
          eyebrow={toponymyPageCopy.eyebrow}
          metrics={[
            { hint: '具有村名来源原文的村庄数量。', label: '地名村落', value: String(toponymyVillages.length) },
            { hint: '当前页面可归纳出的命名线索数量。', label: '命名线索', value: String(clueCount) },
          ]}
          title={toponymyPageCopy.title}
        />

        <SurfaceCard title="栏目导语" description="从村名来源、地理环境与历史记忆切入，查看不同地区的命名脉络。" eyebrow="Column intro">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'].join(' ')}>
            <div className="rounded-[1.5rem] border border-[color:var(--color-border-subtle)] bg-white/84 p-5">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">通过村名理解地貌、聚落与地方记忆</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">许多村名保留了对水系、桥梁、山岭、迁徙与祖居线索的记录。结合原始文字描述，可以快速梳理不同村落的命名逻辑。</p>
            </div>
            <div className="rounded-[1.5rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-soft)] p-5">
              <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">阅读方式</p>
              <ul className="mt-3 space-y-2.5 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                <li>先看命名线索，了解不同类别的解释方式。</li>
                <li>再进入精选村庄，对照具体文字描述浏览。</li>
                <li>需要结合区位时，可回到地图页继续查看。</li>
              </ul>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="命名线索" description="将当前村名来源信息整理为几类便于理解的阅读线索。" eyebrow="Naming themes">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {toponymyHighlights.map((card) => (
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
                <p className="mt-2 text-xs leading-5 text-[color:var(--color-text-secondary)]">{classifyToponymy(village.raw[toponymyField] ?? '')}</p>
                <p className="mt-3 line-clamp-5 text-sm leading-7 text-[color:var(--color-text-secondary)]">{village.raw[toponymyField]}</p>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
