import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { runtimeConfig } from '@/shared/config/runtime';
import {
  type MapStyleKey,
  mapStyleStorageKey,
  resolveAvailableMapStyleKey,
} from '@/shared/lib/map-style';

export type ThemeMode = 'light' | 'dark';

const themeStorageKey = 'qycq-map-theme';

interface AppPreferencesContextValue {
  mapStyleKey: MapStyleKey;
  setMapStyleKey: (value: MapStyleKey) => void;
  setThemeMode: (value: ThemeMode) => void;
  themeMode: ThemeMode;
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

function getStoredMapStyleKey() {
  if (typeof window === 'undefined') {
    return runtimeConfig.mapStyleKey;
  }

  const storedMapStyleKey = window.localStorage.getItem(mapStyleStorageKey);
  if (storedMapStyleKey === null) {
    return resolveAvailableMapStyleKey(runtimeConfig.mapStyleKey, runtimeConfig.mapStyleUrl, runtimeConfig.mapStyleKey);
  }

  return resolveAvailableMapStyleKey(storedMapStyleKey, runtimeConfig.mapStyleUrl, runtimeConfig.mapStyleKey);
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem(themeStorageKey) === 'dark' ? 'dark' : 'light';
}

export function AppPreferencesProvider({ children }: PropsWithChildren) {
  const [mapStyleKey, setMapStyleKey] = useState<MapStyleKey>(getStoredMapStyleKey);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(mapStyleStorageKey, mapStyleKey);
    }
  }, [mapStyleKey]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = themeMode;
      document.documentElement.style.colorScheme = themeMode;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(themeStorageKey, themeMode);
    }
  }, [themeMode]);

  const value = useMemo(
    () => ({
      mapStyleKey,
      setMapStyleKey,
      setThemeMode,
      themeMode,
    }),
    [mapStyleKey, themeMode],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  }

  return context;
}

export { themeStorageKey };
