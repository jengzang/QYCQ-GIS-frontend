import { Link } from 'react-router-dom';

import { useVillagesQuery } from '@/entities/village/api/hooks';
import { useOrientationMode } from '@/shared/lib/orientation';
import { toponymyHighlights, toponymyPageCopy } from '@/shared/lib/demo-content';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
import { PageHero } from '@/shared/ui/PageHero';
import { SiteShell } from '@/shared/ui/SiteShell';
import { SurfaceCard } from '@/shared/ui/SurfaceCard';

export function ToponymyPage() {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';
  const { data: villages = [] } = useVillagesQuery({});
  const toponymyField = villageFieldMapping.highlightFields.toponymy;
  const featuredVillages = villages.filter((village) => village.raw[toponymyField]).slice(0, 6);

  return (
    <SiteShell>
      <div className="grid gap-4">
        <PageHero
          description={toponymyPageCopy.description}
          eyebrow={toponymyPageCopy.eyebrow}
          metrics={[
            {
              hint: '把名字、地形与迁徙记忆放在一页。',
              label: '叙事核心',
              value: '村名',
            },
            {
              hint: '后续可直接接 back-end 枚举。',
              label: '标签策略',
              value: '可扩展',
            },
            {
              hint: '所有内容都能回跳到地图。',
              label: '联动方式',
              value: 'primaryId',
            },
          ]}
          title={toponymyPageCopy.title}
        />

        <div className={['grid gap-4', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
          {toponymyHighlights.map((card) => (
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

        <SurfaceCard title="地名解释面板" description="把村名来源拆成几类，让领导能快速理解地理故事。">
          <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-3'].join(' ')}>
            {[
              ['地形命名', '山、岭、桥、塘等自然地貌。'],
              ['家族命名', '以姓氏、祖源或迁徙记忆命名。'],
              ['历史命名', '因旧地名、事件或功能而得名。'],
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
                {village.raw[toponymyField]}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
