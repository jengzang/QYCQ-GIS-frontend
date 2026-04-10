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
        'rounded-[1.75rem] border border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-surface)] p-5 shadow-[0_18px_45px_rgba(34,116,240,0.1)] backdrop-blur',
        className ?? '',
      ].join(' ')}
    >
      <div className="mb-4 space-y-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
