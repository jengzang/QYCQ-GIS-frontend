interface MetricCardProps {
  hint: string;
  label: string;
  value: string;
}

export function MetricCard({ hint, label, value }: MetricCardProps) {
  return (
    <div className="rounded-[1.6rem] border border-[color:var(--color-border-subtle)] bg-[image:var(--color-surface-panel)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-tertiary)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{hint}</p>
    </div>
  );
}
