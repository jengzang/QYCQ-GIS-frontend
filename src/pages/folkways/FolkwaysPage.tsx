import { Link } from 'react-router-dom';

import { useVillagesQuery } from '@/entities/village/api/hooks';
import { folkwaysHighlights } from '@/shared/lib/demo-content';
import { useOrientationMode } from '@/shared/lib/orientation';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { routeMapping } from '@/shared/mappings/route-mapping';
import { villageFieldMapping } from '@/shared/mappings/village-field-mapping';
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

  return (
    <SiteShell>
      <div className="grid gap-4">
        <SurfaceCard title="民俗内容" description="从节庆、民居与地方产品等线索浏览当前可见的村落文化内容。">
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

        <SurfaceCard title="精选村庄" description="页面展示 6 个村庄样本，可继续跳转地图查看对应村庄位置与相关信息。">
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
