export const buttonClassName = {
  primary:
    'inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary-button)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-92',
  primaryLarge:
    'inline-flex items-center justify-center rounded-full bg-[color:var(--color-primary-button)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-92',
  secondary:
    'inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-subtle)] bg-[color:var(--color-chip-bg-strong)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-field-bg-strong)]',
  secondaryLarge:
    'inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-chip-bg)] px-5 py-3 text-sm font-medium text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-field-bg-strong)]',
} as const;
