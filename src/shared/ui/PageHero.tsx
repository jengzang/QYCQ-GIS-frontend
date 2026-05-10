import type { PropsWithChildren } from 'react';

import { useOrientationMode } from '@/shared/lib/orientation';
import { MetricCard } from '@/shared/ui/MetricCard';

import type { MetricItem } from '@/shared/lib/demo-content';

interface PageHeroProps extends PropsWithChildren {
  description: string;
  eyebrow: string;
  metrics?: MetricItem[];
  title: string;
}

export function PageHero({ children, description, eyebrow, metrics, title }: PageHeroProps) {
  const orientation = useOrientationMode();
  const isPortrait = orientation === 'portrait';

  return (
    <section className={['relative overflow-hidden rounded-[2.25rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(242,247,255,0.78)_58%,rgba(255,245,237,0.72))] shadow-[var(--shadow-stage)] backdrop-blur-xl', isPortrait ? 'p-5' : 'p-7'].join(' ')}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(112,170,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,236,222,0.72),transparent_34%)]" />
      <div className={['relative gap-5', isPortrait ? 'grid' : 'grid items-start [grid-template-columns:minmax(0,1fr)_19rem]'].join(' ')}>
        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[color:var(--color-text-tertiary)]">{eyebrow}</p>
          <h2 className={['max-w-4xl font-semibold tracking-[-0.05em] text-[color:var(--color-text-primary)]', isPortrait ? 'text-[2rem] leading-[1.12]' : 'text-[3rem] leading-[1.02]'].join(' ')}>{title}</h2>
          <p className={['max-w-3xl leading-7 text-[color:var(--color-text-secondary)]', isPortrait ? 'text-sm' : 'text-base'].join(' ')}>{description}</p>
          {children ? <div className="pt-2">{children}</div> : null}
        </div>

        {metrics && metrics.length > 0 ? (
          <div className="grid gap-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
