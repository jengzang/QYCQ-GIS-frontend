interface MetricCardProps {
  hint: string;
  label: string;
  value: string;
}

export function MetricCard({ hint, label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-border-subtle)] bg-white/85 p-4 shadow-[0_14px_30px_rgba(34,116,240,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-primary-strong)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{hint}</p>
    </div>
  );
}
