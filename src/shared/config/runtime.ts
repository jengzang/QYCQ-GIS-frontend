import { z } from 'zod';

import type { MapStyleKey } from '@/shared/lib/map-style';
import { resolveMapStyleKey, runtimeMapStyleKey } from '@/shared/lib/map-style';
import { runtimeSourceMapping } from '@/shared/mappings/runtime-source-mapping';

const runtimeSchema = z.object({
  VITE_API_BASE_URL: z.string().optional(),
  VITE_DATA_MODE: z.enum(['mock', 'api']).optional(),
  VITE_MAP_STYLE_KEY: z.string().optional(),
  VITE_MAP_STYLE_URL: z.string().optional(),
  MODE: z.enum(['development', 'test', 'serve', 'production']).optional(),
});

export type RuntimeProfile = keyof typeof runtimeSourceMapping.profiles;
export type RuntimeMode = 'development' | 'test' | 'serve';

export interface RuntimeConfig {
  apiBaseUrl: string;
  mode: RuntimeMode;
  dataMode: 'mock' | 'api';
  mapStyleKey: MapStyleKey;
  mapStyleUrl: string | null;
  runtimeProfile: RuntimeProfile;
  sources: typeof runtimeSourceMapping;
}

function resolveRuntimeMode(mode?: string): RuntimeMode {
  return mode === 'test' || mode === 'serve' ? mode : 'development';
}

function resolveRuntimeProfile(mode: RuntimeMode, dataMode: 'mock' | 'api'): RuntimeProfile {
  if (dataMode === 'mock') {
    return 'mock';
  }

  return mode === 'serve' ? 'remote-api' : 'local-api';
}

export function getRuntimeConfig(env: Record<string, string | undefined>): RuntimeConfig {
  const parsed = runtimeSchema.parse(env);
  const mode = resolveRuntimeMode(parsed.MODE);
  const dataMode = parsed.VITE_DATA_MODE ?? 'mock';
  const mapStyleUrl = parsed.VITE_MAP_STYLE_URL?.trim() || null;
  const mapStyleKey = mapStyleUrl && !parsed.VITE_MAP_STYLE_KEY ? runtimeMapStyleKey : resolveMapStyleKey(parsed.VITE_MAP_STYLE_KEY);

  return {
    apiBaseUrl: (parsed.VITE_API_BASE_URL ?? '').replace(/\/$/, ''),
    dataMode,
    mapStyleKey,
    mapStyleUrl,
    mode,
    runtimeProfile: resolveRuntimeProfile(mode, dataMode),
    sources: runtimeSourceMapping,
  };
}

export const runtimeConfig = getRuntimeConfig(import.meta.env);
