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
        'rounded-[1.7rem] border border-[color:var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,248,244,0.82))] p-5 shadow-[var(--shadow-card)]',
        className ?? '',
      ].join(' ')}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">{eyebrow}</p>
          ) : null}
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">{title}</h2>
          {description ? <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">{description}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
