import { Link } from 'react-router-dom';

import { useVillagesQuery } from '@/entities/village/api/hooks';
import { useOrientationMode } from '@/shared/lib/orientation';
import { toponymyHighlights, toponymyPageCopy } from '@/shared/lib/demo-content';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import { MetricCard } from '@/shared/ui/MetricCard';
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
            { hint: '具备村名来源原文、可直接阅读的村庄数量。', label: '地名村落', value: String(toponymyVillages.length) },
            { hint: '当前村名来源里能归纳出的解释类型。', label: '命名线索', value: String(clueCount) },
            { hint: '所有内容都能回跳到地图页。', label: '联动方式', value: 'primaryId' },
          ]}
          title={toponymyPageCopy.title}
        >
          <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {['按命名语义重组信息层次', '保留地图回跳，不丢主线', '像专题栏目而不是普通说明页'].map((item) => (
              <div key={item} className="rounded-full border border-[color:var(--color-border-subtle)] bg-white/76 px-4 py-2 text-sm text-[color:var(--color-text-secondary)] shadow-[var(--shadow-soft)]">
                {item}
              </div>
            ))}
          </div>
        </PageHero>

        <SurfaceCard title="专题导览" description="把地名页升级成更有解释力的产品专题页。" eyebrow="Narrative entry">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]'].join(' ')}>
            <div className="rounded-[1.6rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(243,247,255,0.8))] p-5 shadow-[var(--shadow-soft)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-tertiary)]">专题导览</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">把“为什么这样命名”讲成一套更高级的空间叙事</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">从命名来源、地理形态到族群迁徙，把原始描述重新组织成更适合阅读和汇报的页面结构。</p>
            </div>
            <div className="grid gap-3">
              <MetricCard hint="全量统计，不受 featured 数量截断。" label="地名村落" value={String(toponymyVillages.length)} />
              <MetricCard hint="当前专题可读出的命名解释类型数量。" label="命名线索" value={String(clueCount)} />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="命名洞察" description="将原本的地名解释页升级为更整洁、更像高端产品的 insight section。" eyebrow="Insight cards">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {toponymyHighlights.map((card) => (
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

        <SurfaceCard title="精选村庄" description="精选 6 张卡做节奏控制，但指标仍按全量口径统计。" eyebrow="Featured villages">
          <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {featuredVillages.map((village) => (
              <Link
                key={village.primaryId}
                className="rounded-[1.75rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,250,255,0.8))] p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-white"
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

        <SurfaceCard title="地名村落" description="保留原本业务命名，方便和既有讲法对齐。" eyebrow="Business label">
          <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">当前地名专题页已经具备命名解释、地图回跳与精选展示的完整 demo 能力。</p>
        </SurfaceCard>
      </div>
    </SiteShell>
  );
}
