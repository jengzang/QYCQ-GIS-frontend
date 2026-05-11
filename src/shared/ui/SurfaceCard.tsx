import type { PropsWithChildren, ReactNode } from 'react';

interface SurfaceCardProps extends PropsWithChildren {
  className?: string;
  contentClassName?: string;
  description?: string;
  eyebrow?: string;
  headerActions?: ReactNode;
  title: string;
}

export function SurfaceCard({ children, className, contentClassName, description, eyebrow, headerActions, title }: SurfaceCardProps) {
  return (
    <section
      className={[
        'rounded-[1.7rem] border border-[color:var(--color-border-subtle)] bg-[image:var(--color-surface-elevated)] p-5 shadow-[var(--shadow-card)]',
        className ?? '',
      ].join(' ')}
    >
      <div className={['space-y-4', contentClassName ?? ''].join(' ')}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">{eyebrow}</p>
            ) : null}
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">{title}</h2>
            {description ? <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">{description}</p> : null}
          </div>
          {headerActions ? <div className="shrink-0">{headerActions}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
