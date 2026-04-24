import { useDeferredValue } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useVillageFacetsQuery, useVillagesQuery } from '@/entities/village/api/hooks';
import { queryParamMapping } from '@/shared/mappings/query-param-mapping';
import { mapModeMapping, type MapModeKey } from '@/shared/mappings/nav-mapping';
import { mapPageCopy } from '@/shared/lib/demo-content';
import { PageHero } from '@/shared/ui/PageHero';
import { SiteShell } from '@/shared/ui/SiteShell';
import { useOrientationMode } from '@/shared/lib/orientation';
import { MapWorkspace } from '@/widgets/map/MapWorkspace';
import { resolveVillageSelection } from '@/pages/map/selection';

const fallbackMode: MapModeKey = 'search';

function resolveMode(value: string | null): MapModeKey {
  return mapModeMapping.some((option) => option.key === value) ? (value as MapModeKey) : fallbackMode;
}

function parseTimelineYear(value: string | null, fallbackValue: number | null) {
  if (!value) {
    return fallbackValue;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
}

export function MapPage() {
  const orientation = useOrientationMode();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeMode = resolveMode(searchParams.get(queryParamMapping.mode));
  const q = searchParams.get(queryParamMapping.q) ?? '';
  const city = searchParams.get(queryParamMapping.city) ?? '';
  const town = searchParams.get(queryParamMapping.town) ?? '';
  const dialect = searchParams.get(queryParamMapping.dialect) ?? '';
  const ethnicity = searchParams.get(queryParamMapping.ethnicity) ?? '';
  const economy = searchParams.get(queryParamMapping.economy) ?? '';
  const deferredQ = useDeferredValue(q);
  const { data: facets, isLoading: isFacetsLoading } = useVillageFacetsQuery();
  const timelineYear = parseTimelineYear(
    searchParams.get(queryParamMapping.year),
    facets?.timelineRange.max ?? null,
  );
  const { data: villages = [], isLoading: isVillagesLoading } = useVillagesQuery({
    city: city || undefined,
    dialectGroup: activeMode === 'dialect' && dialect ? dialect : undefined,
    economy: economy || undefined,
    ethnicity: ethnicity || undefined,
    q: deferredQ || undefined,
    timelineEnd: activeMode === 'timeline' ? timelineYear : null,
    town: town || undefined,
  });
  const requestedPrimaryId = searchParams.get(queryParamMapping.primaryId);
  const { hasInvalidRequestedPrimaryId, selectedPrimaryId } = resolveVillageSelection(
    requestedPrimaryId,
    villages,
  );

  const updateParams = (
    updates: Record<string, string | null>,
    options?: {
      replace?: boolean;
    },
  ) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next, { replace: options?.replace ?? true });
  };

  return (
    <SiteShell>
      <div className="grid gap-4">
        <PageHero
          description={mapPageCopy.description}
          eyebrow={mapPageCopy.eyebrow}
          metrics={[
            {
              hint: '当前展示的是检索、迁徙、方言三模式。',
              label: '当前模式',
              value: mapModeMapping.find((item) => item.key === activeMode)?.label ?? '村庄检索',
            },
            {
              hint: '当前筛选结果已直接来自 mock 数据。',
              label: '筛选结果',
              value: String(villages.length),
            },
            {
              hint: '只按方向变化页面骨架。',
              label: '布局',
              value: orientation === 'portrait' ? '竖屏' : '横屏',
            },
          ]}
          title={mapPageCopy.title}
        />

        <MapWorkspace
          activeMode={activeMode}
          facets={facets}
          filters={{
            city,
            dialect,
            economy,
            ethnicity,
            q,
            town,
            year: timelineYear,
          }}
          isLoading={isFacetsLoading || isVillagesLoading}
          orientation={orientation}
          onFiltersChange={(updates) =>
            updateParams({
              [queryParamMapping.city]: updates.city ?? city,
              [queryParamMapping.dialect]: updates.dialect ?? dialect,
              [queryParamMapping.economy]: updates.economy ?? economy,
              [queryParamMapping.ethnicity]: updates.ethnicity ?? ethnicity,
              [queryParamMapping.primaryId]:
                updates.city !== undefined ||
                updates.dialect !== undefined ||
                updates.economy !== undefined ||
                updates.ethnicity !== undefined ||
                updates.q !== undefined ||
                updates.town !== undefined ||
                updates.year !== undefined
                  ? null
                  : selectedPrimaryId,
              [queryParamMapping.q]: updates.q ?? q,
              [queryParamMapping.town]: updates.town ?? town,
              [queryParamMapping.year]:
                updates.year === null || updates.year === undefined ? null : String(updates.year),
            }, {
              replace: updates.q !== undefined || updates.year !== undefined,
            })
          }
          onModeChange={(mode) =>
            updateParams({
              [queryParamMapping.dialect]: mode === 'dialect' ? dialect : null,
              [queryParamMapping.mode]: mode,
              [queryParamMapping.year]:
                mode === 'timeline' ? String(timelineYear ?? facets?.timelineRange.max ?? '') : null,
            }, { replace: false })
          }
          onSelectVillage={(primaryId) =>
            updateParams({ [queryParamMapping.primaryId]: primaryId }, { replace: false })
          }
          hasInvalidSelection={hasInvalidRequestedPrimaryId}
          selectedPrimaryId={selectedPrimaryId}
          villages={villages}
        />
      </div>
    </SiteShell>
  );
}
