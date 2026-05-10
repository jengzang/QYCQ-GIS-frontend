import { Link } from 'react-router-dom';

import { useVillagesQuery } from '@/entities/village/api/hooks';
import { useOrientationMode } from '@/shared/lib/orientation';
import { folkwaysHighlights, folkwaysPageCopy } from '@/shared/lib/demo-content';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import { MetricCard } from '@/shared/ui/MetricCard';
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
            { hint: '有民俗正文、能直接展开内容卡的村庄数量。', label: '民俗村落', value: String(folkwayVillages.length) },
            { hint: '能在民俗页同时讲族群与生计结构。', label: '民族线索', value: String(ethnicityCount) },
            { hint: '每张卡片都可回到地图主舞台。', label: '联动方式', value: 'primaryId' },
          ]}
          title={folkwaysPageCopy.title}
        >
          <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {['村俗、民居、产品三线并置', '保留地图回跳，避免内容页孤岛', '用更高端的产品语言做专题叙事'].map((item) => (
              <div key={item} className="rounded-full border border-[color:var(--color-border-subtle)] bg-white/76 px-4 py-2 text-sm text-[color:var(--color-text-secondary)] shadow-[var(--shadow-soft)]">
                {item}
              </div>
            ))}
          </div>
        </PageHero>

        <SurfaceCard title="专题导览" description="把民俗页从普通补充页升级成可以单独讲解的专题首页。" eyebrow="Narrative entry">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'].join(' ')}>
            <div className="rounded-[1.6rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(249,244,239,0.8))] p-5 shadow-[var(--shadow-soft)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-tertiary)]">专题导览</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">把村落文化做成可浏览、可回跳、可讲述的产品化栏目</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">这一页不再只是堆卡片，而是把民俗内容压成“开场说明 → 洞察面板 → 精选村庄”的完整阅读路径，适合演示时连续讲述。</p>
            </div>
            <div className="grid gap-3">
              <MetricCard hint="全量统计，不受 featured 数量截断。" label="民俗村落" value={String(folkwayVillages.length)} />
              <MetricCard hint="当前专题中可讲族群/经济复合线索的数量。" label="民族线索" value={String(ethnicityCount)} />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="民俗洞察" description="保留原本的业务内容，但用更像产品专题页的 section 编排来承载。" eyebrow="Insight cards">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {folkwaysHighlights.map((card) => (
              <div key={card.title} className="rounded-[1.55rem] border border-[color:var(--color-border-subtle)] bg-white/76 p-5 shadow-[var(--shadow-soft)]">
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

        <SurfaceCard title="精选村庄" description="页面只展示 6 张主卡，用来维持节奏；指标仍按全量统计。" eyebrow="Featured villages">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {featuredVillages.map((village) => (
              <Link
                key={village.primaryId}
                className="rounded-[1.75rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,250,255,0.8))] p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-white"
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

        <SurfaceCard title="民俗村落" description="保留原本业务命名，方便和既有讲法对齐。" eyebrow="Business label">
          <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">当前民俗专题页已经具备可讲故事、可回跳地图、可汇报展示的完整闭环。</p>
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
