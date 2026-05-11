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
    <section className={['rounded-[1.9rem] border border-[color:var(--color-border-subtle)] bg-[image:var(--color-surface-hero)] shadow-[var(--shadow-soft)]', isPortrait ? 'p-5' : 'p-7'].join(' ')}>
      <div className="space-y-5">
        <div className={['gap-5', metrics && metrics.length > 0 && !isPortrait ? 'grid items-start [grid-template-columns:minmax(0,1fr)_minmax(16rem,21rem)]' : 'grid'].join(' ')}>
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">{eyebrow}</p>
            <div className="space-y-2">
              <h2 className={['font-semibold tracking-[-0.05em] text-[color:var(--color-text-primary)]', isPortrait ? 'text-[1.9rem] leading-[1.14]' : 'text-[2.6rem] leading-[1.06]'].join(' ')}>{title}</h2>
              <p className={['max-w-3xl text-[color:var(--color-text-secondary)]', isPortrait ? 'text-sm leading-7' : 'text-base leading-8'].join(' ')}>{description}</p>
            </div>
          </div>

          {metrics && metrics.length > 0 ? (
            <div className={['grid gap-3', isPortrait ? 'grid-cols-1' : 'grid-cols-1'].join(' ')}>
              {metrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>
          ) : null}
        </div>

        {children ? <div>{children}</div> : null}
      </div>
    </section>
  );
}
