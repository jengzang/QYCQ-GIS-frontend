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
    <section
      className={[
        'rounded-[2rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)] shadow-[0_24px_70px_rgba(34,116,240,0.12)] backdrop-blur',
        isPortrait ? 'p-5' : 'p-6',
      ].join(' ')}
    >
      <div
        className={[
          'gap-5',
          isPortrait ? 'grid' : 'grid items-start [grid-template-columns:minmax(0,1fr)_18rem]',
        ].join(' ')}
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[color:var(--color-text-secondary)]">
            {eyebrow}
          </p>
          <h2 className={['font-semibold tracking-tight', isPortrait ? 'text-2xl' : 'text-3xl'].join(' ')}>
            {title}
          </h2>
          <p
            className={[
              'max-w-3xl leading-7 text-[color:var(--color-text-secondary)]',
              isPortrait ? 'text-sm' : 'text-base',
            ].join(' ')}
          >
            {description}
          </p>
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
