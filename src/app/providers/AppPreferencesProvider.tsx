import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { runtimeConfig } from '@/shared/config/runtime';
import {
  type MapStyleKey,
  mapStyleStorageKey,
  resolveAvailableMapStyleKey,
} from '@/shared/lib/map-style';

export type ThemeMode = 'light' | 'dark';
export type VillagePointSizeMode = 'fixed' | 'population';

const themeStorageKey = 'qycq-map-theme';
const villagePointSizeModeStorageKey = 'qycq-village-point-size-mode';

interface AppPreferencesContextValue {
  mapStyleKey: MapStyleKey;
  setMapStyleKey: (value: MapStyleKey) => void;
  setThemeMode: (value: ThemeMode) => void;
  setVillagePointSizeMode: (value: VillagePointSizeMode) => void;
  themeMode: ThemeMode;
  villagePointSizeMode: VillagePointSizeMode;
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

function getStoredVillagePointSizeMode(): VillagePointSizeMode {
  if (typeof window === 'undefined') {
    return 'fixed';
  }

  return window.localStorage.getItem(villagePointSizeModeStorageKey) === 'population' ? 'population' : 'fixed';
}

export function AppPreferencesProvider({ children }: PropsWithChildren) {
  const [mapStyleKey, setMapStyleKey] = useState<MapStyleKey>(getStoredMapStyleKey);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);
  const [villagePointSizeMode, setVillagePointSizeMode] = useState<VillagePointSizeMode>(getStoredVillagePointSizeMode);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(villagePointSizeModeStorageKey, villagePointSizeMode);
    }
  }, [villagePointSizeMode]);

  const value = useMemo(
    () => ({
      mapStyleKey,
      setMapStyleKey,
      setThemeMode,
      setVillagePointSizeMode,
      themeMode,
      villagePointSizeMode,
    }),
    [mapStyleKey, themeMode, villagePointSizeMode],
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

export { themeStorageKey, villagePointSizeModeStorageKey };
