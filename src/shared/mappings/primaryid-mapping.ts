export interface PrimaryIdSource {
  city?: string | null;
  town?: string | null;
  name?: string | null;
}

export const primaryIdMapping = {
  prefix: 'vlg',
  separator: '|',
} as const;

function normalizeSegment(value?: string | null): string {
  return (value ?? '').trim();
}

function fnv1a32(value: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  let hash = 0x811c9dc5;

  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
}

export function buildPrimaryIdSeed(source: PrimaryIdSource): string {
  return [
    normalizeSegment(source.city),
    normalizeSegment(source.town),
    normalizeSegment(source.name),
  ].join(primaryIdMapping.separator);
}

export function buildPrimaryId(source: PrimaryIdSource): string {
  return `${primaryIdMapping.prefix}-${fnv1a32(buildPrimaryIdSeed(source))}`;
}
