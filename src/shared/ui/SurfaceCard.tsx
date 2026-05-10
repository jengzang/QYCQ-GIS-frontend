import type { PropsWithChildren } from 'react';

interface SurfaceCardProps extends PropsWithChildren {
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
}

export function SurfaceCard({ children, className, description, eyebrow, title }: SurfaceCardProps) {
  return (
    <section
      className={[
        'relative overflow-hidden rounded-[1.85rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,251,255,0.78))] p-5 shadow-[var(--shadow-card)] backdrop-blur-xl',
        className ?? '',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),transparent)]" />
      <div className="relative">
        <div className="mb-4 space-y-1.5">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-tertiary)]">{eyebrow}</p>
          ) : null}
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">{title}</h2>
          {description ? <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">{description}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
